const axios = require('axios');
const logger = require('../utils/logger');

class ClaudeAIService {
    constructor() {
        this.claudeApiKey = process.env.ANTHROPIC_API_KEY;
        this.claudeApiUrl = 'https://api.anthropic.com/v1/messages';
        this.claudeModel = 'claude-sonnet-4-20250514';

        // Hugging Face configuration
        this.huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY;
        this.huggingfaceModel = 'mistralai/Mistral-7B-Instruct-v0.2';
        this.huggingfaceUrl = `https://api-inference.huggingface.co/models/${this.huggingfaceModel}`;

        this.useHuggingface = process.env.USE_HUGGINGFACE === 'true' || !this.claudeApiKey || this.claudeApiKey === 'your-anthropic-api-key-here';
    }

    /**
     * Generate bulk practice questions for a topic
     * @param {string} topic 
     * @param {string} difficulty 
     * @param {number} count 
     * @returns {Promise<Array>}
     */
    async generateBulkQuestions(topic, difficulty, count = 5) {
        // Limit max questions per batch to avoid token limits/timeouts
        const batchSize = Math.min(count, 10);

        const systemPrompt = `You are an expert professor creates high-quality practice questions. 
        Output ONLY valid JSON array. No conversational text.`;

        const userPrompt = `Create ${batchSize} ${difficulty} level Multiple Choice Questions (MCQ) for the topic "${topic}".
        
        The questions should coverage different aspects of the topic.
        
        Format the output as a JSON array of objects with these fields:
        1. question (string)
        2. options (array of 4 strings, e.g. ["A) Option 1", "B) Option 2"...])
        3. correctAnswer (string, full text matching one of the options)
        4. explanation (string, brief explanation of why the answer is correct)
        
        Example format:
        [
            {
                "question": "What is...",
                "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
                "correctAnswer": "A) ...",
                "explanation": "Because..."
            }
        ]`;

        try {
            const result = await this.sendMessage(userPrompt, { system: systemPrompt });

            // Parse the response
            let questions = [];
            try {
                // Clean markdown code blocks if present
                const cleanJson = result.response.replace(/```json/g, '').replace(/```/g, '').trim();
                questions = JSON.parse(cleanJson);

                // Validate structure
                if (!Array.isArray(questions)) {
                    logger.warn('AI response is not an array, trying to wrap');
                    questions = [questions];
                }

                // Add standardized correct answer format
                questions = questions.map(q => {
                    // Ensure correctAnswer matches an option fully
                    const correctOpt = q.options.find(opt =>
                        opt.trim() === q.correctAnswer.trim() ||
                        opt.startsWith(q.correctAnswer.trim()) ||
                        (q.correctAnswer.length === 1 && opt.startsWith(q.correctAnswer))
                    );

                    if (correctOpt) {
                        q.correctAnswer = correctOpt;
                    }
                    return q;
                });

            } catch (e) {
                logger.error('Failed to parse bulk questions JSON:', e);
                return this.getMockPracticeQuestions(topic, count);
            }

            return questions;

        } catch (error) {
            logger.error(`Error generating bulk questions for ${topic}:`, error);
            return this.getMockPracticeQuestions(topic, count);
        }
    }

    /**
     * Send a message to AI and get response
     */
    async sendMessage(userMessage, context = {}) {
        const startTime = Date.now();

        try {
            let result;

            // Try Hugging Face first if enabled or Claude API key is not available
            if (this.useHuggingface) {
                result = await this.sendMessageViaHuggingface(userMessage, context);
            } else {
                result = await this.sendMessageViaClaude(userMessage, context);
            }

            if (!result.response) {
                logger.warn('Empty AI response, using fallback');
                return this.getMockResponse(userMessage, context);
            }

            return result;

        } catch (error) {
            logger.error('AI Service Error:', error.message);
            logger.warn('Falling back to mock response');
            return this.getMockResponse(userMessage, context);
        }
    }

    /**
     * Send message via Claude API
     */
    async sendMessageViaClaude(userMessage, context = {}) {
        const startTime = Date.now();

        const systemPrompt = this.buildSystemPrompt(context);
        const userPrompt = this.buildUserPrompt(userMessage, context);

        try {
            const response = await axios.post(
                this.claudeApiUrl,
                {
                    model: this.claudeModel,
                    max_tokens: 2000,
                    system: systemPrompt,
                    messages: [
                        {
                            role: 'user',
                            content: userPrompt
                        }
                    ]
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': this.claudeApiKey,
                        'anthropic-version': '2023-06-01'
                    },
                    timeout: 30000
                }
            );

            const responseTime = Date.now() - startTime;
            const aiResponse = response.data.content[0].text;

            logger.info(`Claude AI Response generated in ${responseTime}ms`);

            return {
                response: aiResponse,
                metadata: {
                    model: 'Claude',
                    responseTime,
                    tokensUsed: response.data.usage?.total_tokens || 0,
                    confidence: this.calculateConfidence(aiResponse)
                }
            };

        } catch (error) {
            logger.error('Claude API Error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Send message via Hugging Face API (Free alternative)
     */
    async sendMessageViaHuggingface(userMessage, context = {}) {
        const startTime = Date.now();

        const systemPrompt = this.buildSystemPrompt(context);
        const userPrompt = this.buildUserPrompt(userMessage, context);

        // Format the prompt for the model
        const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

        try {
            const response = await axios.post(
                this.huggingfaceUrl,
                {
                    inputs: fullPrompt,
                    parameters: {
                        max_length: 1000,
                        temperature: 0.7,
                        top_p: 0.95
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.huggingfaceApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 60000
                }
            );

            const responseTime = Date.now() - startTime;
            let aiResponse = '';

            // Handle different response formats
            if (Array.isArray(response.data) && response.data[0]) {
                aiResponse = response.data[0].generated_text || '';
                // Remove the prompt from the response
                if (aiResponse.includes(fullPrompt)) {
                    aiResponse = aiResponse.replace(fullPrompt, '').trim();
                }
            } else if (response.data.generated_text) {
                aiResponse = response.data.generated_text;
            }

            if (!aiResponse) {
                throw new Error('Empty response from Hugging Face');
            }

            logger.info(`Hugging Face AI Response generated in ${responseTime}ms`);

            return {
                response: aiResponse,
                metadata: {
                    model: 'Mistral-7B',
                    responseTime,
                    tokensUsed: 0,
                    confidence: this.calculateConfidence(aiResponse),
                    provider: 'HuggingFace'
                }
            };

        } catch (error) {
            logger.error('Hugging Face API Error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Build system prompt with Anna University context
     */
    buildSystemPrompt(context) {
        const { studentProfile, subjectInfo } = context;

        return `You are TamilEdu AI, an expert tutor for Anna University R2021 Computer Science Engineering curriculum.

**Your Role:**
- Provide clear, accurate explanations for CSE concepts
- Support Tamil-English code-mixing (Tanglish)
- Adapt to student's learning level
- Reference Anna University syllabus when relevant

**Student Context:**
${studentProfile ? `
- Name: ${studentProfile.name}
- Semester: ${studentProfile.semester}
- Department: ${studentProfile.department}
- Preferred Language: ${studentProfile.preferredLanguage}
- Current Progress: ${studentProfile.learningStats?.syllabusProgress || 0}%
` : 'New student'}

**Current Subject:**
${subjectInfo ? `
- Code: ${subjectInfo.subjectCode}
- Name: ${subjectInfo.subjectName}
- Regulation: ${subjectInfo.regulation}
` : 'General inquiry'}

**Guidelines:**
1. Be encouraging and supportive
2. Break down complex concepts simply
3. Use examples relevant to Anna University exams
4. Provide step-by-step explanations when needed
5. Suggest practice problems when appropriate
6. Use Tamil words naturally when speaking with Tamil students
7. Always maintain academic accuracy

**Response Format:**
- Start with a brief direct answer
- Provide detailed explanation
- Include examples if helpful
- End with a practice tip or next step suggestion`;
    }

    /**
     * Build user prompt with question context
     */
    buildUserPrompt(userMessage, context) {
        const { conversationHistory, relatedTopics } = context;

        let prompt = userMessage;

        // Add conversation history if available
        if (conversationHistory && conversationHistory.length > 0) {
            prompt = `**Previous Context:**
${conversationHistory.slice(-3).map(msg =>
                `Student: ${msg.userMessage}\nAI: ${msg.aiResponse}`
            ).join('\n\n')}

**Current Question:**
${userMessage}`;
        }

        // Add related topics for context
        if (relatedTopics && relatedTopics.length > 0) {
            prompt += `\n\n**Related Topics:** ${relatedTopics.join(', ')}`;
        }

        return prompt;
    }

    /**
     * Classify the intent of the user's message
     */
    classifyIntent(message) {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('explain') || lowerMessage.includes('what is') ||
            lowerMessage.includes('செய்யலாம்') || lowerMessage.includes('என்ன')) {
            return 'explanation';
        }

        if (lowerMessage.includes('practice') || lowerMessage.includes('question') ||
            lowerMessage.includes('test')) {
            return 'practice';
        }

        if (lowerMessage.includes('exam') || lowerMessage.includes('prepare')) {
            return 'exam_prep';
        }

        return 'doubt';
    }

    /**
     * Detect language of the message
     */
    detectLanguage(message) {
        const tamilPattern = /[\u0B80-\u0BFF]/;
        const hasTamil = tamilPattern.test(message);
        const hasEnglish = /[a-zA-Z]/.test(message);

        if (hasTamil && hasEnglish) return 'mixed';
        if (hasTamil) return 'ta';
        return 'en';
    }

    /**
     * Extract subject information from message
     */
    extractSubject(message) {
        const subjectPatterns = {
            'CS3452': ['oop', 'object oriented', 'java', 'c++'],
            'CS3491': ['dbms', 'database', 'sql', 'mongodb'],
            'CS3492': ['os', 'operating system', 'process', 'thread'],
            'CS3401': ['data structure', 'array', 'linked list', 'tree', 'graph'],
            'CS3551': ['distributed', 'cloud'],
            'CS3591': ['network', 'tcp', 'ip', 'protocol']
        };

        const lowerMessage = message.toLowerCase();

        for (const [code, keywords] of Object.entries(subjectPatterns)) {
            if (lowerMessage.includes(code.toLowerCase()) ||
                keywords.some(keyword => lowerMessage.includes(keyword))) {
                return code;
            }
        }

        return null;
    }

    /**
     * Generate practice questions using AI
     */
    async generatePracticeQuestions(topic, difficulty = 'medium', count = 5) {
        try {
            const prompt = `Generate ${count} ${difficulty} level practice questions on the topic: "${topic}" for Anna University CSE students.

For each question, provide:
1. The question
2. Four options (for MCQ)
3. Correct answer
4. Brief explanation

Format as JSON array with structure:
[{
  "question": "...",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "correctAnswer": "A",
  "explanation": "..."
}]`;

            const response = await this.sendMessage(prompt, {});

            // Parse JSON from response
            const jsonMatch = response.response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                let questions = JSON.parse(jsonMatch[0]);

                // Post-process questions to standardize correctAnswer format
                questions = questions.map(q => {
                    // If correctAnswer is just "A", "B", etc., map it to the full option text
                    if (q.correctAnswer && q.correctAnswer.length === 1 && q.options) {
                        const correctOption = q.options.find(opt => opt.startsWith(q.correctAnswer + ')'));
                        if (correctOption) {
                            q.correctAnswer = correctOption;
                        }
                    }
                    return q;
                });

                return questions;
            }

            // Fallback if parsing fails
            logger.warn('Failed to parse AI response, using fallback');
            return this.getMockPracticeQuestions(topic, count);

        } catch (error) {
            logger.error('Error generating practice questions:', error);
            return this.getMockPracticeQuestions(topic, count);
        }
    }

    /**
     * Get mock practice questions when AI is unavailable
     */
    getMockPracticeQuestions(topic, count = 5) {
        const lowerTopic = topic.toLowerCase();
        let questions = [];

        // Define question bank
        const questionBank = {
            'c programming': [
                {
                    question: "Which of the following is the correct syntax to declare a pointer in C?",
                    options: ["A) int *ptr;", "B) int ptr*;", "C) pointer int ptr;", "D) new int ptr;"],
                    correctAnswer: "A) int *ptr;",
                    explanation: "In C, a pointer is declared using the asterisk (*) symbol before the variable name."
                },
                {
                    question: "What is the size of an int data type in a 32-bit compiler?",
                    options: ["A) 2 bytes", "B) 4 bytes", "C) 8 bytes", "D) 1 byte"],
                    correctAnswer: "B) 4 bytes",
                    explanation: "In a 32-bit compiler, the standard size of an integer is 4 bytes."
                },
                {
                    question: "Which function is used to read a string with spaces in C?",
                    options: ["A) scanf()", "B) gets()", "C) getch()", "D) printf()"],
                    correctAnswer: "B) gets()",
                    explanation: "gets() reads a line from stdin into the buffer pointed to, until a terminating newline or EOF."
                }
            ],
            'structure': [
                {
                    question: "How do you access a member of a structure using a structure variable?",
                    options: ["A) .", "B) ->", "C) *", "D) &"],
                    correctAnswer: "A) .",
                    explanation: "The dot (.) operator is used to access members of a structure variable."
                },
                {
                    question: "What is the size of an empty structure in C?",
                    options: ["A) 0", "B) 1", "C) 2", "D) Compressor dependent"],
                    correctAnswer: "A) 0",
                    explanation: "In C, an empty structure has a size of 0 (though in C++ it is 1 due to unique address rule)."
                }
            ],
            'pointer': [
                {
                    question: "What does the & operator do in C?",
                    options: ["A) Returns the value", "B) Returns the address", "C) Multiplies values", "D) Divides values"],
                    correctAnswer: "B) Returns the address",
                    explanation: "The & (address-of) operator returns the memory address of a variable."
                },
                {
                    question: "Which of the following is an invalid pointer declaration?",
                    options: ["A) int *ptr;", "B) void *ptr;", "C) int ptr;", "D) char *ptr;"],
                    correctAnswer: "C) int ptr;",
                    explanation: "int ptr; declares a normal integer variable, not a pointer."
                }
            ],
            'array': [
                {
                    question: "Array index starts from?",
                    options: ["A) 0", "B) 1", "C) -1", "D) Null"],
                    correctAnswer: "A) 0",
                    explanation: "In C and most programming languages, array indexing assumes 0-based indexing."
                }
            ],
            'loop': [
                {
                    question: "Which loop is guaranteed to execute at least once?",
                    options: ["A) for", "B) while", "C) do-while", "D) none"],
                    correctAnswer: "C) do-while",
                    explanation: "The do-while loop evaluates the condition at the end, ensuring the code block runs at least once."
                }
            ],
            'variable': [
                {
                    question: "Which of the following is a valid variable name in C?",
                    options: ["A) int", "B) 1var", "C) var_1", "D) var-1"],
                    correctAnswer: "C) var_1",
                    explanation: "Variable names can contain letters, digits, and underscores, but cannot start with a digit or be a keyword."
                },
                {
                    question: "How do you declare a constant variable in C?",
                    options: ["A) const int x = 10;", "B) constant int x = 10;", "C) int const x = 10;", "D) Both A and C"],
                    correctAnswer: "D) Both A and C",
                    explanation: "Both 'const int x' and 'int const x' are valid ways to declare a constant integer in C."
                }
            ],
            'data type': [
                {
                    question: "What is the format specifier for a float data type in C?",
                    options: ["A) %d", "B) %c", "C) %f", "D) %s"],
                    correctAnswer: "C) %f",
                    explanation: "%f is the standard format specifier for floating-point numbers in C."
                },
                {
                    question: "Which data type has the largest range in C?",
                    options: ["A) int", "B) double", "C) long double", "D) float"],
                    correctAnswer: "C) long double",
                    explanation: "long double typically provides the highest precision and range among standard floating-point types."
                }
            ],
            'operator': [
                {
                    question: "Which of the following is a ternary operator?",
                    options: ["A) ?:", "B) &&", "C) ||", "D) !"],
                    correctAnswer: "A) ?:",
                    explanation: "The conditional operator (?:) is the only ternary operator in C, taking three operands."
                },
                {
                    question: "What is the precedence of * vs +?",
                    options: ["A) + is higher", "B) * is higher", "C) Same", "D) Depends on compiler"],
                    correctAnswer: "B) * is higher",
                    explanation: "Multiplication (*) has higher precedence than addition (+) in C."
                }
            ]
        };

        // Find relevant questions
        for (const [key, qList] of Object.entries(questionBank)) {
            if (lowerTopic.includes(key) || (key === 'c programming' && lowerTopic.includes('c'))) {
                questions = [...questions, ...qList];
            }
        }

        // Generic fallback if no specific topic match
        if (questions.length === 0) {
            questions = [
                {
                    question: `Explain the concept of ${topic} in detail.`,
                    options: ["A) Concept A", "B) Concept B", "C) Concept C", "D) Concept D"],
                    correctAnswer: "A) Concept A",
                    explanation: `This is a placeholder question for ${topic}. Please refer to the textbook.`
                },
                {
                    question: `What is the primary application of ${topic}?`,
                    options: ["A) Application A", "B) Application B", "C) Application C", "D) Application D"],
                    correctAnswer: "A) Application A",
                    explanation: `This is a placeholder question for ${topic}.`
                }
            ];
        }

        // Shuffle and slice
        const shuffled = questions.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    /**
     * Provide feedback on student's answer
     */
    async provideFeedback(question, userAnswer, correctAnswer, topic) {
        const prompt = `A student answered the following question:

**Question:** ${question}
**Student's Answer:** ${userAnswer}
**Correct Answer:** ${correctAnswer}
**Topic:** ${topic}

Provide constructive feedback:
1. Is the answer correct? If not, what's wrong?
2. Explain the correct approach
3. Provide 2-3 helpful hints
4. Suggest related topics to study

Be encouraging and supportive.`;

        const response = await this.sendMessage(prompt, {});
        return response.response;
    }

    /**
     * Calculate confidence score based on response
     */
    calculateConfidence(response) {
        // Simple heuristic: longer, more detailed responses = higher confidence
        const wordCount = response.split(' ').length;
        const hasExamples = response.includes('example') || response.includes('for instance');
        const hasReferences = response.includes('according to') || response.includes('as per');

        let confidence = 0.5;

        if (wordCount > 100) confidence += 0.2;
        if (hasExamples) confidence += 0.15;
        if (hasReferences) confidence += 0.15;

        return Math.min(confidence, 1.0);
    }

    /**
     * Generate comprehensive mock response when API is not available
     */
    getMockResponse(userMessage, context = {}) {
        const startTime = Date.now();
        const responseTime = Date.now() - startTime;
        const student = context.studentProfile || {};

        // Analyze question to provide relevant responses
        const lowerMessage = userMessage.toLowerCase();

        let response = `Hello ${student.name}! 👋\n\n`;
        response += `Thank you for asking about this topic. Let me provide you with a comprehensive explanation.\n\n`;

        // Check what topic they're asking about and provide relevant answers
        if (lowerMessage.includes('loop') || lowerMessage.includes('for') || lowerMessage.includes('while')) {
            response += this.getLoopExplanation();
        } else if (lowerMessage.includes('array') || lowerMessage.includes('list')) {
            response += this.getArrayExplanation();
        } else if (lowerMessage.includes('function') || lowerMessage.includes('method')) {
            response += this.getFunctionExplanation();
        } else if (lowerMessage.includes('oop') || lowerMessage.includes('class') || lowerMessage.includes('object')) {
            response += this.getOOPExplanation();
        } else if (lowerMessage.includes('algorithm') || lowerMessage.includes('search') || lowerMessage.includes('sort')) {
            response += this.getAlgorithmExplanation();
        } else if (lowerMessage.includes('database') || lowerMessage.includes('sql')) {
            response += this.getDatabaseExplanation();
        } else {
            response += this.getGenericExplanation(student);
        }

        response += `\n\n📌 **Note**: This is currently using an optimized response engine. For real-time Claude AI responses, please configure your Hugging Face API key or Anthropic API key in the .env file.\n`;
        response += `💡 **Tip**: Keep practicing these concepts with different examples to master them!`;

        return {
            response,
            metadata: {
                model: 'Enhanced Mock',
                responseTime,
                tokensUsed: 0,
                confidence: 0.85,
                isMockResponse: true
            }
        };
    }

    getLoopExplanation() {
        return `**📚 Understanding Loops**

A loop is a programming construct that allows you to repeat a block of code multiple times without writing it repeatedly.

**Types of Loops:**

1. **FOR Loop** - When you know exact number of iterations
\`\`\`
for (let i = 0; i < 5; i++) {
    console.log("Number: " + i);
}
// Output: 0, 1, 2, 3, 4
\`\`\`

2. **WHILE Loop** - When condition needs to be checked
\`\`\`
let count = 0;
while (count < 5) {
    console.log("Count: " + count);
    count++;
}
\`\`\`

3. **DO-WHILE Loop** - Executes at least once
\`\`\`
let i = 0;
do {
    console.log("Value: " + i);
    i++;
} while (i < 5);
\`\`\`

**Real-World Example:**
- Printing 1 to 100 numbers
- Summing array elements
- Processing database records
- Game loops that keep running

**Exam Tips:**
- FOR loops are best for known iterations
- Use WHILE for unknown iteration count
- DO-WHILE when you need at least one execution
- Always prevent infinite loops!`;
    }

    getArrayExplanation() {
        return `**📊 Understanding Arrays**

An array is a collection of elements stored in contiguous memory locations, accessed by index.

**Array Basics:**

1. **Declaration & Initialization**
\`\`\`
// JavaScript
let arr = [10, 20, 30, 40];
let arr2 = new Array(5);

// Accessing elements
console.log(arr[0]); // 10
console.log(arr.length); // 4
\`\`\`

2. **Common Array Operations**
\`\`\`
arr.push(50);           // Add at end
arr.pop();              // Remove from end
arr.unshift(5);         // Add at start
arr.shift();            // Remove from start
arr.map(x => x * 2);    // Transform
arr.filter(x => x > 20); // Filter
arr.reduce((a,b) => a+b); // Combine
\`\`\`

**Real-World Examples:**
- Student records: [name, roll, marks]
- Shopping list: [item1, item2, item3]
- Temperature readings: [23, 24, 22, 25]

**Exam Questions Often Include:**
- Array traversal
- Finding max/min/sum
- Searching elements (linear/binary)
- Sorting arrays
- 2D arrays (matrices)

**Time Complexity:**
- Access: O(1)
- Search: O(n)
- Insert/Delete: O(n)`;
    }

    getFunctionExplanation() {
        return `**⚙️ Understanding Functions**

A function is a reusable block of code that performs a specific task.

**Function Syntax:**

1. **Function Declaration**
\`\`\`
function greet(name) {
    return "Hello, " + name;
}
console.log(greet("Student")); // Hello, Student
\`\`\`

2. **Arrow Function**
\`\`\`
const add = (a, b) => a + b;
console.log(add(5, 3)); // 8
\`\`\`

3. **Function with Multiple Parameters**
\`\`\`
function calculateGrade(marks) {
    if (marks >= 90) return 'A';
    else if (marks >= 75) return 'B';
    else return 'C';
}
\`\`\`

**Key Concepts:**
- Parameters: Inputs to function
- Return value: Output from function
- Scope: Where variable is accessible
- Recursion: Function calling itself

**Real-World Examples:**
- Payment calculation function
- Email validation function
- Grade computation function

**Exam Tips:**
- Functions prevent code duplication
- Use meaningful function names
- Keep functions single-purpose
- Always handle edge cases`;
    }

    getOOPExplanation() {
        return `**🏗️ Object-Oriented Programming (OOP)**

OOP is a programming paradigm based on objects and classes.

**Core Concepts:**

1. **Classes & Objects**
\`\`\`
class Student {
    constructor(name, roll) {
        this.name = name;
        this.roll = roll;
    }
    
    displayInfo() {
        return this.name + " - " + this.roll;
    }
}

let student1 = new Student("Dheventhiran", "123");
console.log(student1.displayInfo());
\`\`\`

2. **Encapsulation** - Bundling data and methods
\`\`\`
class BankAccount {
    #balance = 0; // Private variable
    
    deposit(amount) {
        this.#balance += amount;
    }
}
\`\`\`

3. **Inheritance** - Child gets parent properties
\`\`\`
class Animal {
    speak() { return "Sound"; }
}

class Dog extends Animal {
    speak() { return "Woof"; }
}
\`\`\`

4. **Polymorphism** - Same method, different behavior
5. **Abstraction** - Hide complex details

**Advantages:**
- Code reusability
- Better organization
- Easier maintenance

**Exam Focus:**
- Class definition
- Constructor
- Inheritance syntax
- Method overriding`;
    }

    getAlgorithmExplanation() {
        return `**🎯 Algorithms & Sorting**

An algorithm is a step-by-step procedure to solve a problem.

**Popular Sorting Algorithms:**

1. **Bubble Sort** - Simple but slow O(n²)
\`\`\`
for (let i = 0; i < n; i++) {
    for (let j = 0; j < n-i-1; j++) {
        if (arr[j] > arr[j+1]) {
            [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
        }
    }
}
\`\`\`

2. **Quick Sort** - Fast O(n log n)
3. **Merge Sort** - Stable O(n log n)

**Searching Algorithms:**

1. **Linear Search** - O(n)
\`\`\`
for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
}
\`\`\`

2. **Binary Search** - O(log n) - requires sorted array
\`\`\`
left = 0, right = arr.length - 1
while (left <= right) {
    mid = (left + right) / 2;
    // Check arr[mid]...
}
\`\`\`

**Exam Tips:**
- Know time and space complexity
- Practice implementation
- Understand when to use which
- Trace through examples

**Real-World Usage:**
- Database indexing
- Search engines
- Recommendation systems`;
    }

    getDatabaseExplanation() {
        return `**🗄️ Databases & SQL**

A database stores and retrieves data efficiently.

**Basic SQL Commands:**

1. **SELECT** - Retrieve data
\`\`\`
SELECT name, roll FROM students WHERE marks > 80;
\`\`\`

2. **INSERT** - Add new data
\`\`\`
INSERT INTO students (name, roll, marks)
VALUES ('Dheventhiran', '123', 85);
\`\`\`

3. **UPDATE** - Modify existing data
\`\`\`
UPDATE students SET marks = 90 WHERE roll = '123';
\`\`\`

4. **DELETE** - Remove data
\`\`\`
DELETE FROM students WHERE marks < 40;
\`\`\`

**Join Types:**
- INNER JOIN: Common records
- LEFT JOIN: All from left table
- RIGHT JOIN: All from right table
- FULL JOIN: All records

**Indexing:**
- Speeds up queries
- Slows down insert/update
- Use on frequently searched columns

**Normalization:**
- 1NF: No duplicate columns
- 2NF: No partial dependencies
- 3NF: No transitive dependencies

**Exam Focus:**
- Complex queries with JOINs
- Normalization concepts
- Query optimization`;
    }

    getGenericExplanation(student) {
        return `**📖 Computer Science Concepts**

That's an excellent question for your ${student.semester}th semester studies in ${student.department}!

**Key Learning Areas in CSE:**

1. **Data Structures**
   - Arrays, Linked Lists, Stacks, Queues
   - Trees, Graphs, Hash Tables

2. **Algorithms**
   - Sorting and Searching
   - Dynamic Programming
   - Graph Algorithms

3. **Programming Concepts**
   - Variables, Loops, Functions
   - OOP Principles
   - Exception Handling

4. **Web Development**
   - Frontend (HTML, CSS, JavaScript)
   - Backend (Databases, APIs)
   - Frameworks (React, Node.js)

5. **System Design**
   - Databases and Indexing
   - Caching and Performance
   - Scalability

**For Better Learning:**
- Practice coding daily
- Understand concepts deeply
- Solve past exam papers
- Debug your code
- Join peer study groups

**Your Current Progress**: ${student.learningStats?.syllabusProgress || 0}% completion - Keep it up! 🚀

Would you like me to dive deeper into any specific topic?`;
    }
}

module.exports = new ClaudeAIService();
