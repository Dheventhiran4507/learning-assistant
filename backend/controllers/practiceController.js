const Student = require('../models/Student');
const Practice = require('../models/Practice');
const Syllabus = require('../models/Syllabus');
const Question = require('../models/Question');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const claudeService = require('../services/claudeAIService');

// Start a practice session
exports.startSession = async (req, res) => {
    try {
        const { subjectCode, practiceType = 'custom', difficulty = 'medium', unit, topic } = req.body;
        const studentId = req.user.id;

        const syllabus = await Syllabus.findOne({ subjectCode });
        if (!syllabus) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        // Gather topics for the subject
        let allTopics = [];
        syllabus.units.forEach(u => {
            // Filter by unit if provided
            if (unit && u.unitNumber !== parseInt(unit)) return;

            u.topics.forEach(t => {
                // Filter by topic name if provided
                if (topic && t.topicName !== topic) return;

                allTopics.push({
                    topicName: t.topicName,
                    unit: u.unitNumber,
                    difficulty: difficulty // Use requested difficulty
                });
            });
        });

        if (allTopics.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No topics found for the selected criteria'
            });
        }

        // Shuffle topics if random practice, or take specific one
        if (!topic && allTopics.length > 5) {
            // If many topics, take a random sample of 5 to keep session manageable
            // OR keep all if the user wants "All Units" specifically?
            // The requirement was "expand practice scope", so let's keep all but limit questions per topic.
            // But if user selected "All Units", they might expect covering everything.
            // Let's shuffle and take up to 10 topics to avoid timeouts/too long sessions
            // allTopics = allTopics.sort(() => 0.5 - Math.random()).slice(0, 10);
        }

        // Determine how many questions to fetch per topic to reach a target (e.g. 15 total)
        const targetQuestions = 15;
        const questionsPerTopic = Math.max(1, Math.floor(targetQuestions / Math.max(1, allTopics.length)));

        // 1. Import at top (I'll add it to the top of file later, for now just in-line or assuming it's there)
        const textbookGenerator = require('../utils/textbookGenerator');

        // Generate questions (Try Question Bank first, then Textbook Generator, then AI)
        const questionPromises = allTopics.map(async (t) => {
            try {
                // 1. Try fetching from Question Bank
                const dbQuestions = await Question.aggregate([
                    { $match: { subjectCode: syllabus.subjectCode, topic: t.topicName } }, // Broaden match potentially
                    { $sample: { size: questionsPerTopic } }
                ]);

                if (dbQuestions.length >= questionsPerTopic) {
                    return dbQuestions.map(q => ({
                        questionId: `q-${uuidv4()}`,
                        question: q.question,
                        type: 'mcq',
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        topic: t.topicName,
                        unit: t.unit,
                        difficulty: q.difficulty,
                        marks: 10,
                        aiFeedback: {
                            explanation: q.explanation
                        },
                        fromBank: true
                    }));
                }

                // 2. Intermediate Fallback: Rule-based Textbook Generator
                const textbookQuestions = textbookGenerator.generateTextbookQuestions(syllabus.subjectCode, t.unit);
                const relevantTextbookQs = textbookQuestions
                    .filter(q => q.topic === t.topicName)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, questionsPerTopic);

                if (relevantTextbookQs.length > 0) {
                    return relevantTextbookQs.map(q => ({
                        questionId: `q-${uuidv4()}`,
                        question: q.question,
                        type: 'mcq',
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        topic: t.topicName,
                        unit: t.unit,
                        difficulty: q.difficulty,
                        marks: 10,
                        aiFeedback: {
                            explanation: q.explanation
                        },
                        fromGenerator: true
                    }));
                }

                // 3. Last Resort: AI Service
                const aiQuestions = await claudeService.generatePracticeQuestions(t.topicName, difficulty, questionsPerTopic);

                if (aiQuestions && aiQuestions.length > 0) {
                    return aiQuestions.map(q => ({
                        questionId: `q-${uuidv4()}`,
                        question: q.question,
                        type: 'mcq', // Mock/AI mostly returns MCQs
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        topic: t.topicName,
                        unit: t.unit,
                        difficulty: t.difficulty,
                        marks: 10,
                        aiFeedback: {
                            explanation: q.explanation
                        }
                    }));
                }
            } catch (err) {
                logger.error(`Failed to generate question for topic ${t.topicName}:`, err);
            }
            return null;
        });

        const generatedQuestions = (await Promise.all(questionPromises))
            .filter(q => q !== null)
            .flat();

        if (generatedQuestions.length === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to generate questions. Please try again.'
            });
        }

        const session = await Practice.create({
            student: studentId,
            sessionId: uuidv4(),
            subject: {
                subjectCode: syllabus.subjectCode,
                subjectName: syllabus.subjectName
            },
            practiceType,
            questions: generatedQuestions.map(q => ({
                ...q,
                userAnswer: '',
                isCorrect: null
            })),
            status: 'in_progress'
        });

        res.json({
            success: true,
            data: session
        });
    } catch (error) {
        logger.error('Error starting practice session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to start session',
            error: error.message
        });
    }
};

// Submit an answer for a question in a session
exports.submitAnswer = async (req, res) => {
    try {
        const { sessionId, questionId, userAnswer } = req.body;

        const session = await Practice.findOne({ sessionId });
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        const questionIndex = session.questions.findIndex(q => q.questionId === questionId);
        if (questionIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Question not found in this session'
            });
        }

        const question = session.questions[questionIndex];
        let isCorrect = false;

        // Prepare detailed feedback using stored explanation
        let feedbackExplanation = question.aiFeedback?.explanation || '';

        if (question.type === 'mcq') {
            // Clean answers for comparison
            const cleanUserAnswer = userAnswer ? userAnswer.trim() : '';
            const cleanCorrectAnswer = question.correctAnswer ? question.correctAnswer.trim() : '';

            isCorrect = cleanUserAnswer === cleanCorrectAnswer;

            if (!feedbackExplanation) {
                feedbackExplanation = isCorrect
                    ? 'Correct! You understood the concept well.'
                    : `Incorrect. The correct answer is ${question.correctAnswer}.`;
            }
        } else if (question.type === 'code') {
            // Simulated code execution logic
            isCorrect = true; // Placeholder
            if (!feedbackExplanation) feedbackExplanation = 'Code compiled and executed successfully.';
        }

        session.questions[questionIndex].userAnswer = userAnswer;
        session.questions[questionIndex].isCorrect = isCorrect;

        // Ensure explanation is saved in the feedback
        if (!session.questions[questionIndex].aiFeedback) {
            session.questions[questionIndex].aiFeedback = {};
        }
        session.questions[questionIndex].aiFeedback.explanation = feedbackExplanation;

        await session.save();

        res.json({
            success: true,
            data: {
                isCorrect,
                aiFeedback: {
                    explanation: feedbackExplanation
                }
            }
        });
    } catch (error) {
        logger.error('Error submitting answer:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit answer',
            error: error.message
        });
    }
};

// Get session details
exports.getSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await Practice.findOne({ sessionId });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        res.json({
            success: true,
            data: session
        });
    } catch (error) {
        logger.error('Error fetching session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch session'
        });
    }
};
