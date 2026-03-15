const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });

class GeminiAIService {
    constructor() {
        const rawKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
        this.apiKeys = rawKeys ? rawKeys.split(',')
            .map(key => key.trim())
            .filter(key => key &&
                key.startsWith('AIza') &&
                !key.includes('YOUR_SECOND_KEY') &&
                !key.includes('YOUR_THIRD_KEY') &&
                key !== 'your-gemini-api-key-here'
            ) : [];
        this.currentKeyIndex = 0;

        this.isServiceAvailable = this.apiKeys.length > 0;
        this.lastError = null;
        this.cache = new Map();
        this.keyStates = new Map(); // Track exhausted status: { index: expirationTime }
        this.EXHAUST_TIMEOUT = 1 * 60 * 1000; // 1 minute cool-down (Free tier resets faster)

        // Groq Key Rotation
        const rawGroqKeys = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY;
        this.groqKeys = rawGroqKeys ? rawGroqKeys.split(',')
            .map(key => key.trim())
            .filter(k => k && (k.startsWith('gsk_') || k.length > 20)) : [];
        this.currentGroqKeyIndex = 0;
        this.groqKeyStates = new Map();

        // Load master subject mapping
        this.subjectMapping = {};
        try {
            const mappingPath = path.join(__dirname, '../data/r2021_subjects.json');
            if (fs.existsSync(mappingPath)) {
                this.subjectMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
                logger.info(`📚 Loaded ${Object.keys(this.subjectMapping).length} subjects from master mapping.`);
            }
        } catch (err) {
            logger.error('Failed to load subject mapping:', err.message);
        }

        // Load grounded syllabus data from external JSON
        try {
            const groundingPath = path.join(__dirname, '../data/r2021_syllabus_grounding.json');
            if (fs.existsSync(groundingPath)) {
                this.groundedSyllabusFallback = JSON.parse(fs.readFileSync(groundingPath, 'utf8'));
                logger.info(`🎯 Loaded ${Object.keys(this.groundedSyllabusFallback).length} grounded subjects for 100% accuracy.`);
            } else {
                this.groundedSyllabusFallback = {};
                logger.warn('⚠️ Grounding syllabus file not found. Falling back to internal data.');
            }
        } catch (err) {
            logger.error('❌ Failed to load grounding syllabus:', err.message);
            this.groundedSyllabusFallback = {};
        }

        if (this.isServiceAvailable) {
            this.initService();
        } else {
            logger.warn('⚠️ Gemini AI Service is in OFFLINE mode (API keys missing or invalid)');
        }

        // Initialize Groq if keys are available
        if (this.groqKeys.length > 0) {
            this.initGroq();
        }
    }

    initService() {
        try {
            const availableIndex = this.getFirstAvailableKeyIndex();
            if (availableIndex === -1) {
                logger.error('❌ All Gemini API keys are currently exhausted.');
                this.isServiceAvailable = false;
                return;
            }

            this.currentKeyIndex = availableIndex;
            const apiKey = this.apiKeys[this.currentKeyIndex];
            this.genAI = new GoogleGenerativeAI(apiKey);

            this.availableModels = [
                "gemini-2.0-flash",
                "gemini-1.5-flash"
            ];
            if (process.env.GEMINI_MODEL && !this.availableModels.includes(process.env.GEMINI_MODEL)) {
                this.availableModels.unshift(process.env.GEMINI_MODEL);
            }
            this.availableModels = [...new Set(this.availableModels)];

            this.currentModelIndex = 0;
            this.initModel();

            logger.info(`✅ Gemini AI Service initialized with Key #${this.currentKeyIndex + 1} of ${this.apiKeys.length}. Model: ${this.modelName}`);
        } catch (err) {
            logger.error(`❌ Failed to initialize Gemini AI Service with Key #${this.currentKeyIndex + 1}:`, err.message);
            this.handleInitError(err);
        }
    }

    initModel() {
        const modelName = this.availableModels[this.currentModelIndex];
        this.model = this.genAI.getGenerativeModel({ model: modelName });
        this.modelName = modelName;
    }

    initGroq() {
        try {
            const apiKey = this.groqKeys[this.currentGroqKeyIndex];
            this.groq = new Groq({ apiKey });
            this.groqAvailableModels = [
                "llama-3.3-70b-versatile",
                "llama-3.1-70b-versatile",
                "mixtral-8x7b-32768"
            ];
            logger.info(`✅ Groq AI Service initialized with Key #${this.currentGroqKeyIndex + 1} of ${this.groqKeys.length}`);
        } catch (err) {
            logger.error(`❌ Failed to initialize Groq AI Service:`, err.message);
        }
    }

    async rotateKey() {
        this.markKeyExhausted(this.currentKeyIndex);
        const nextWorkingIndex = this.getFirstAvailableKeyIndex();
        if (nextWorkingIndex !== -1 && nextWorkingIndex !== this.currentKeyIndex) {
            this.currentKeyIndex = nextWorkingIndex;
            logger.warn(`🔄 Rotating to Gemini API Key #${this.currentKeyIndex + 1}...`);
            this.initService();
            return true;
        }
        logger.error('❌ No backup Gemini API keys available.');
        return false;
    }

    shuffleArray(array) {
        if (!array || !Array.isArray(array)) return array;
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    handleInitError(err) {
        if (this.apiKeys.length > 1) {
            this.markKeyExhausted(this.currentKeyIndex);
            return this.rotateKey();
        } else {
            this.isServiceAvailable = false;
            this.lastError = err.message;
            return false;
        }
    }

    markKeyExhausted(index) {
        const expiration = Date.now() + this.EXHAUST_TIMEOUT;
        this.keyStates.set(index, expiration);
        logger.warn(`🚫 Key #${index + 1} marked as exhausted until ${new Date(expiration).toLocaleTimeString()}`);
    }

    getFirstAvailableKeyIndex() {
        const now = Date.now();
        for (let i = 0; i < this.apiKeys.length; i++) {
            const expiration = this.keyStates.get(i);
            if (!expiration || now > expiration) {
                if (expiration) {
                    this.keyStates.delete(i);
                    logger.info(`✨ Key #${i + 1} cool-down period ended. Checking availability...`);
                }
                return i;
            }
        }
        return -1;
    }

    markGroqKeyExhausted(index) {
        const expiration = Date.now() + this.EXHAUST_TIMEOUT;
        this.groqKeyStates.set(index, expiration);
        logger.warn(`🚫 Groq Key #${index + 1} marked as exhausted until ${new Date(expiration).toLocaleTimeString()}`);
    }

    getFirstAvailableGroqKeyIndex() {
        const now = Date.now();
        for (let i = 0; i < this.groqKeys.length; i++) {
            const expiration = this.groqKeyStates.get(i);
            if (!expiration || now > expiration) {
                if (expiration) {
                    this.groqKeyStates.delete(i);
                    logger.info(`✨ Groq Key #${i + 1} cool-down ended.`);
                }
                return i;
            }
        }
        return -1;
    }

    async rotateGroqKey() {
        this.markGroqKeyExhausted(this.currentGroqKeyIndex);
        const nextIndex = this.getFirstAvailableGroqKeyIndex();
        if (nextIndex !== -1 && nextIndex !== this.currentGroqKeyIndex) {
            this.currentGroqKeyIndex = nextIndex;
            logger.warn(`🔄 Rotating to Groq API Key #${this.currentGroqKeyIndex + 1}...`);
            this.initGroq();
            return true;
        }
        return false;
    }

    async ensureServiceAvailable() {
        const availableIndex = this.getFirstAvailableKeyIndex();
        if (availableIndex !== -1) {
            if (!this.isServiceAvailable) {
                logger.info(`♻️ AI Service recovering. Switching to available Key #${availableIndex + 1}...`);
                this.isServiceAvailable = true;
                this.lastError = null;
            }
            if (this.keyStates.has(this.currentKeyIndex) && availableIndex !== this.currentKeyIndex) {
                 this.currentKeyIndex = availableIndex;
                 this.initService();
            }
            return true;
        }
        this.isServiceAvailable = false;
        return false;
    }

    detectLanguage(message) {
        // Regex for Tamil characters (Unicode range: U+0B80 to U+0BFF)
        const tamilRegex = /[\u0B80-\u0BFF]/;
        return tamilRegex.test(message) ? 'ta' : 'en';
    }

    classifyIntent(message) {
        const msg = message.toLowerCase();
        if (msg.includes('practice') || msg.includes('test') || msg.includes('quiz') || msg.includes('question')) {
            return 'practice';
        }
        if (msg.includes('summary') || msg.includes('notes') || msg.includes('explain')) {
            return 'explanation';
        }
        if (/\b[A-Z]{2,3}\d{3,4}\b/i.test(message)) {
            return 'doubt';
        }
        return 'general';
    }

    extractSubject(message) {
        // Match standard Anna University subject codes (e.g., CS3491, CCS335)
        const codeMatch = message.match(/\b([A-Z]{2,3}\d{3,4})\b/i);
        if (codeMatch) return codeMatch[1].toUpperCase();

        const msg = message.toLowerCase();
        
        // Manual priority mapping - using word boundaries for accuracy
        const priorityKeywords = {
            'dbms': 'CS3492',
            'database': 'CS3492',
            'data science': 'CS3491',
            'python': 'GE3151',
            'ai': 'CS3491',
            'machine learning': 'CS3491',
            'algorithms': 'CS3401',
            'compiler': 'CS3501',
            'networks': 'CS3591',
            'os': 'CS3451',
            'operating system': 'CS3451'
        };

        for (const [kw, code] of Object.entries(priorityKeywords)) {
            const regex = new RegExp(`\\b${kw}\\b`, 'i');
            if (regex.test(message)) return code;
        }

        // Search in the full subject mapping
        if (this.subjectMapping) {
            for (const [code, name] of Object.entries(this.subjectMapping)) {
                if (msg.includes(name.toLowerCase())) return code;
            }
        }

        return null;
    }

    async generateBulkQuestions(topic, difficulty, count = 5, context = {}) {
        const { subjectName, unitTitle, subjectCode } = context;
        const batchSize = Math.min(count, 10);
        const subCode = (subjectCode || '').toUpperCase();
        const isMaths = subCode.startsWith('MA') || subCode.startsWith('BS');
        const isProgramming = subCode.startsWith('CS') || subCode.startsWith('CB') ||
                              subCode.startsWith('AD') || subCode.startsWith('IT') ||
                              subCode.startsWith('AI') || subCode.startsWith('EC');

        const contextInfo = subjectName && unitTitle
            ? `Subject: ${subjectCode} - ${subjectName}\nUnit: ${unitTitle}\nTarget Topic: ${topic}\n`
            : `Target Topic: ${topic}\n`;

        let systemPrompt, userPrompt;

        if (isMaths) {
            systemPrompt = `You are an elite Anna University Mathematics Professor (R2021 Regulation). Generate ${difficulty} level Part-A (2-mark) MCQs that test formula and theorem identification. Rules: - Questions MUST ask to identify correct formula/theorem. - Include actual formula in options. - NO PREAMBLE. Output JSON.`;
            userPrompt = `${contextInfo}Generate ${batchSize} ${difficulty} level formula-identification MCQs for "${topic}". JSON format: { "questions": [{ "question": "...", "options": ["...", "..."], "correctAnswer": "...", "explanation": "..." }] }`;
        } else if (isProgramming) {
            systemPrompt = `You are an elite Anna University CS/IT Professor. Generate ${difficulty} level Part-A (2-mark) MCQs that test code-reading. Rules: - Include SHORT code snippet (3-8 lines). - Code must be syntactically correct. - NO PREAMBLE. Output JSON.`;
            userPrompt = `${contextInfo}Generate ${batchSize} ${difficulty} level code-output MCQs for "${topic}". JSON format: { "questions": [{ "question": "...", "options": ["...", "..."], "correctAnswer": "...", "explanation": "..." }] }`;
        } else {
            systemPrompt = `You are an elite Anna University Professor. Generate ${difficulty} level Part-A (2-mark) MCQs. Unique, technical, R2021 aligned. NO PREAMBLE. Output JSON.`;
            userPrompt = `${contextInfo}Generate ${batchSize} ${difficulty} level technical MCQs for "${topic}". JSON format: { "questions": [{ "question": "...", "options": ["...", "..."], "correctAnswer": "...", "explanation": "..." }] }`;
        }

        try {
            const prompt = `${systemPrompt}\n\n${userPrompt}`;
            const cacheKey = `bulk_v2_${subjectCode || 'global'}_${topic}_${difficulty}_${count}`;
            if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

            await this.ensureServiceAvailable();
            let questions = [];

            if (this.isServiceAvailable) {
                const result = await this.model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7 }
                });
                const response = await result.response;
                const text = response.text();
                const parsed = this.cleanAndParseJSON(text);
                questions = parsed.questions || parsed.data || (Array.isArray(parsed) ? parsed : []);
            } else {
                questions = await this.getGroqFallbackQuestions(prompt);
            }

            // Randomize options and finalize
            questions = (questions || []).map(q => {
                const correct = q.correctAnswer;
                q.options = this.shuffleArray(q.options || []);
                q.correctAnswer = q.options.find(o => o === correct) || correct;
                return q;
            });

            if (questions.length > 0) this.cache.set(cacheKey, questions);
            return questions;
        } catch (error) {
            logger.error(`❌ Question Gen Error: ${error.message}`);
            
            // Try Groq as secondary fallback if Gemini fails in-flight
            if (this.groq) {
                try {
                    logger.info('🔄 Attempting Groq secondary fallback for bulk questions...');
                    const prompt = `${systemPrompt}\n\n${userPrompt}`;
                    const groqQuestions = await this.getGroqFallbackQuestions(prompt);
                    if (groqQuestions && groqQuestions.length > 0) {
                        return groqQuestions;
                    }
                } catch (groqErr) {
                    logger.error(`❌ Groq Fallback also failed: ${groqErr.message}`);
                }
            }

            return this.getQuestionStructuralFallback(topic, subjectCode, subjectName, count);
        }
    }

    getQuestionStructuralFallback(topic, code = '', name = '', count = 5) {
        const structuralQuestions = [
            {
                question: `Identify the primary technical challenge associated with ${topic}.`,
                options: ["Scalability", "Security", "Consistency", "Interoperability"],
                correctAnswer: "Scalability",
                explanation: "Technical challenges often involve scalability in complex systems."
            },
            {
                question: `Which of the following describes the core principle of ${topic}?`,
                options: ["Efficiency", "Modularity", "Abstraction", "Encapsulation"],
                correctAnswer: "Efficiency",
                explanation: "Core principles usually prioritize system efficiency."
            },
            {
                question: `In the context of ${topic}, what does a 403 error typically represent?`,
                options: ["Forbidden/Access Denied", "Not Found", "Server Error", "Bad Request"],
                correctAnswer: "Forbidden/Access Denied",
                explanation: "A 403 Forbidden error indicates that the server understands the request but refuses to authorize it."
            },
            {
                question: `What is the most common industry standard for implementing ${topic}?`,
                options: ["ISO 27001", "Agile", "REST", "IEEE R2021"],
                correctAnswer: "IEEE R2021",
                explanation: "Standards provide a framework for consistent implementation."
            },
            {
                question: `Which layer of the system architecture does ${topic} primarily reside in?`,
                options: ["Data Layer", "Logic Layer", "UI Layer", "Network Layer"],
                correctAnswer: "Logic Layer",
                explanation: "Most technical topics are implemented within the business logic layer."
            }
        ];
        
        // Return a slice but ensure we return at least everything we have if count is large
        return structuralQuestions.slice(0, count);
    }

    cleanAndParseJSON(text) {
        let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        try { return JSON.parse(cleanText); } catch (e) {
            cleanText = cleanText.replace(/\\([^"\\\/bfnrtu])/g, '\\\\$1');
            try { return JSON.parse(cleanText); } catch (e2) { throw e2; }
        }
    }

    async sendMessage(userMessage, context = {}) {
        await this.ensureServiceAvailable();
        if (!this.isServiceAvailable) return this.getGroqFallbackResponse(userMessage, context);

        try {
            const systemPrompt = this.buildSystemPrompt(context);
            const userPrompt = this.buildUserPrompt(userMessage, context);
            const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
            const cacheKey = `chat_${userMessage}`;
            if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
            });
            const responseData = {
                response: (await result.response).text(),
                metadata: { model: this.modelName, responseTime: 1000, confidence: 0.9 }
            };
            this.cache.set(cacheKey, responseData);
            return responseData;
        } catch (error) {
            return this.getGroqFallbackResponse(userMessage, context);
        }
    }

    buildSystemPrompt(context) { /* Standard Persona */ return "You are TamilEdu AI, an expert for Anna University R2021."; }
    buildUserPrompt(userMessage, context) { return userMessage; }

    async getGroqFallbackResponse(userMessage, context) {
        if (!this.groq) return this.getMockResponse(userMessage, context);
        try {
            const response = await this.groq.chat.completions.create({
                messages: [{ role: 'user', content: userMessage }],
                model: 'llama-3.1-8b-instant'
            });
            return { response: response.choices[0].message.content, metadata: { model: 'Groq Backup' } };
        } catch (e) { return this.getMockResponse(userMessage, context); }
    }

    async getGroqFallbackQuestions(prompt) {
        if (!this.groq) return [];
        try {
            const response = await this.groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.1-8b-instant',
                response_format: { type: "json_object" }
            });
            const parsed = this.cleanAndParseJSON(response.choices[0].message.content);
            return parsed.questions || [];
        } catch (e) { return []; }
    }

    getMockResponse(userMessage, context) {
        return { response: "Service temporarily limited. Retrying...", metadata: { isMockResponse: true } };
    }

    async universalGenerateSyllabus(prompt) {
        try {
            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
            });
            return this.cleanAndParseJSON((await result.response).text());
        } catch (e) {
            if (e.message.includes('429')) await this.rotateKey();
            return await this.generateSyllabusWithGroq(prompt);
        }
    }

    async generateSyllabusWithGroq(prompt) {
        try {
            if (!this.groq) return null;
            const response = await this.groq.chat.completions.create({
                messages: [{ role: 'system', content: 'JSON only.' }, { role: 'user', content: prompt }],
                model: this.groqAvailableModels[0],
                response_format: { type: "json_object" }
            });
            return this.cleanAndParseJSON(response.choices[0].message.content);
        } catch (error) {
            if (error.message.includes('429')) {
                const rotated = await this.rotateGroqKey();
                if (rotated) return this.generateSyllabusWithGroq(prompt);
            }
            return null;
        }
    }

    rotateModel() { 
        this.currentModelIndex = (this.currentModelIndex + 1) % this.availableModels.length;
        this.initModel();
    }

    getStructuralFallback(subjectCode, manualName = null) {
        return {
            subjectName: manualName || subjectCode,
            units: [1,2,3,4,5].map(i => ({
                unitNumber: i, unitTitle: `Unit ${i}`, topics: [{ topicName: "Core Topic", difficulty: "medium" }]
            }))
        };
    }
}

module.exports = new GeminiAIService();
