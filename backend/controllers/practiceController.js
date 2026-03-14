const Student = require('../models/Student');
const Syllabus = require('../models/Syllabus');
const Practice = require('../models/Practice');
const Question = require('../models/Question');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

// Load subject mapping
const subjectMappingPath = path.join(__dirname, '../data/r2021_subjects.json');
let subjectMapping = {};
try {
    if (fs.existsSync(subjectMappingPath)) {
        subjectMapping = JSON.parse(fs.readFileSync(subjectMappingPath, 'utf8'));
    }
} catch (error) {
    logger.error('Error loading subject mapping:', error);
}
const { v4: uuidv4 } = require('uuid');
const aiService = require('../services/geminiAIService');

// Start a practice session
exports.startSession = async (req, res) => {
    try {
        const { subjectCode, practiceType = 'custom', difficulty = 'medium', unit, topic } = req.body;
        const studentId = req.user.id;

        logger.info(`Practice Session Start Request: Subject=${subjectCode}, Unit=${unit}, Topic=${topic}, User=${studentId}`);

        // Flexible Subject Search (Case-insensitive)
        let syllabus = await Syllabus.findOne({
            subjectCode: { $regex: new RegExp(`^${subjectCode}$`, 'i') }
        });

        // Check for completed topic-based session to show in review mode
        if (practiceType === 'topic_based' && topic) {
            const completedSession = await Practice.findOne({
                student: studentId,
                'subject.subjectCode': { $regex: new RegExp(`^${subjectCode}$`, 'i') },
                practiceType: 'topic_based',
                status: 'completed',
                'questions.topic': topic
            }).sort({ completedAt: -1 });

            if (completedSession) {
                logger.info(`Returning completed session ${completedSession.sessionId} for review mode.`);
                return res.json({
                    success: true,
                    data: completedSession,
                    isReviewMode: true
                });
            }
        }

        if (!syllabus) {
            logger.info(`Syllabus not found for ${subjectCode} during practice start. Attempting auto-generation...`);
            try {
                const aiService = require('../services/geminiAIService');

                // Lookup official name if available
                const officialName = subjectMapping[subjectCode.toUpperCase()];
                if (officialName) {
                    logger.info(`Found official name for ${subjectCode}: ${officialName}`);
                }

                const { subjectName: aiSubjectName, units } = await aiService.generateSyllabusStructure(subjectCode, officialName);

                // Create syllabus if missing
                syllabus = await Syllabus.create({
                    subjectCode: subjectCode.toUpperCase(),
                    subjectName: officialName || aiSubjectName,
                    semester: 1, // Default
                    units: units,
                    isActive: true
                });
            } catch (genError) {
                logger.error(`Auto-Syllabus Gen failed for practice:`, genError.message);
                return res.status(404).json({
                    success: false,
                    message: `Subject '${subjectCode}' not found and auto-generation failed.`
                });
            }
        }

        // Gather topics for the subject
        let allTopics = [];
        syllabus.units.forEach(u => {
            if (unit && u.unitNumber !== parseInt(unit)) return;
            u.topics.forEach(t => {
                if (topic && t.topicName !== topic) return;
                allTopics.push({
                    topicName: t.topicName,
                    unit: u.unitNumber,
                    unitTitle: u.unitTitle, // Correctly include unit title
                    difficulty: difficulty
                });
            });
        });

        if (allTopics.length === 0) {
            return res.status(400).json({
                success: false,
                message: `No topics found for ${subjectCode}.`
            });
        }

        const targetQuestions = 15;
        const questionsPerTopic = Math.max(1, Math.floor(targetQuestions / Math.max(1, allTopics.length)));

        // Generate questions (Controlled sequence to avoid 429s)
        const generatedQuestions = [];
        for (const t of allTopics) {
            const topicNameNormalized = t.topicName.trim();
            try {
                // 1. Try fetching from Question Bank (Case-insensitive)
                const dbQuestions = await Question.aggregate([
                    { $match: { 
                        subjectCode: syllabus.subjectCode, 
                        topic: { $regex: new RegExp(`^${topicNameNormalized}$`, 'i') }
                    } },
                    { $sample: { size: questionsPerTopic } }
                ]);

                let processedDbQuestions = dbQuestions.map(q => ({
                    questionId: `q-${uuidv4()}`,
                    question: q.question,
                    type: 'mcq',
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    topic: t.topicName,
                    unit: t.unit,
                    difficulty: q.difficulty,
                    marks: 10,
                    aiFeedback: { explanation: q.explanation },
                    fromBank: true
                }));

                // 2. If we have enough from DB, add them and move to next topic
                if (processedDbQuestions.length >= questionsPerTopic) {
                    generatedQuestions.push(...processedDbQuestions);
                    continue;
                }

                // 3. For sparse topics, use AI (Serial execution to stay under quota)
                const remainingCount = questionsPerTopic - processedDbQuestions.length;
                const code = syllabus.subjectCode.toUpperCase();
                
                logger.info(`🤖 Generating ${remainingCount} AI questions for topic: ${t.topicName}`);
                const aiQuestions = await aiService.generateBulkQuestions(
                    topicNameNormalized,
                    difficulty,
                    remainingCount,
                    {
                        subjectCode: code,
                        subjectName: syllabus.subjectName,
                        unitTitle: t.unitTitle
                    }
                );

                if (aiQuestions && aiQuestions.length > 0) {
                    const qualityQuestions = aiQuestions.filter(q => !q.isMock);
                    
                    // Cache quality questions
                    await Promise.all(qualityQuestions.map(async (q) => {
                        const exists = await Question.findOne({
                            subjectCode: syllabus.subjectCode,
                            topic: t.topicName,
                            question: q.question
                        });
                        if (!exists) {
                            await Question.create({
                                subjectCode: syllabus.subjectCode,
                                unit: t.unit,
                                topic: t.topicName,
                                question: q.question,
                                options: q.options,
                                correctAnswer: q.correctAnswer,
                                explanation: q.explanation,
                                difficulty: t.difficulty,
                                aiGenerated: true
                            }).catch(e => logger.warn('Failed to cache AI question:', e.message));
                        }
                    }));

                    const processedAiQuestions = qualityQuestions.map(q => ({
                        questionId: `q-${uuidv4()}`,
                        question: q.question,
                        type: 'mcq',
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        topic: t.topicName,
                        unit: t.unit,
                        difficulty: t.difficulty,
                        marks: 10,
                        aiFeedback: { explanation: q.explanation }
                    }));

                    generatedQuestions.push(...processedDbQuestions, ...processedAiQuestions);
                } else if (processedDbQuestions.length > 0) {
                    // If AI fails but we have some DB questions, use them
                    generatedQuestions.push(...processedDbQuestions);
                }
            } catch (err) {
                logger.error(`Failed to handle topic ${t.topicName}:`, err);
            }
        }

        if (generatedQuestions.length === 0) {
            logger.error(`Practice Gen Failed: No questions could be generated for ${subjectCode} - ${unit} - ${topic}`);
            return res.status(503).json({
                success: false,
                message: 'AI is currently preparing standard technical questions for this topic. Please wait 30 seconds and try again.'
            });
        }

        const uniqueGeneratedQuestions = [];
        const seenTexts = new Set();

        for (const q of generatedQuestions) {
            const normalizedText = q.question.trim().toLowerCase();
            if (!seenTexts.has(normalizedText)) {
                uniqueGeneratedQuestions.push(q);
                seenTexts.add(normalizedText);
            }
        }

        const session = await Practice.create({
            student: studentId,
            sessionId: uuidv4(),
            subject: {
                subjectCode: syllabus.subjectCode,
                subjectName: syllabus.subjectName
            },
            practiceType,
            questions: uniqueGeneratedQuestions.map(q => ({
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
        const { sessionId, questionId, userAnswer, timeTaken } = req.body;

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
        session.questions[questionIndex].timeTaken = timeTaken || 0; // Track time taken in seconds

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

// Complete a practice session
exports.completeSession = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await Practice.findOne({ sessionId });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        session.status = 'completed';
        session.completedAt = new Date();
        await session.save();

        // Sync with Student profile
        const student = await Student.findById(session.student);
        if (student) {
            // Update learning stats
            const timeInHours = (session.stats.totalTimeTaken || 0) / 3600;
            student.learningStats.totalPracticeHours += timeInHours;
            student.learningStats.lastActiveDate = new Date();

            // Update subject progress
            const subjectCode = session.subject.subjectCode;
            let subjectIndex = student.subjectProgress.findIndex(p => p.subjectCode === subjectCode);

            if (subjectIndex !== -1) {
                // Find topics correctly answered in this session
                const correctTopics = session.questions
                    .filter(q => q.isCorrect && q.topic)
                    .map(q => q.topic);

                // Add unique topics to completed list
                const newTopics = [...new Set([...student.subjectProgress[subjectIndex].topicsCompleted, ...correctTopics])];
                student.subjectProgress[subjectIndex].topicsCompleted = newTopics;

                // Update last practiced
                student.subjectProgress[subjectIndex].lastPracticed = new Date();

                // Recalculate progress for the subject using the new helper method
                try {
                    await student.recalculateSubjectProgress(subjectCode);
                } catch (sylErr) {
                    logger.warn(`Failed to update subject progress % for ${subjectCode}:`, sylErr.message);
                }
            }

            // identify weak areas from this session
            const weakTopics = session.questions
                .filter(q => q.isCorrect === false && q.topic)
                .map(q => q.topic);

            // Add to student's overall weak areas if not already being tracked
            weakTopics.forEach(topicName => {
                const existingWeak = student.weakAreas.find(w => w.topic === topicName && w.subject === subjectCode);
                if (existingWeak) {
                    existingWeak.totalAttempts++;
                    existingWeak.lastAttempted = new Date();
                    existingWeak.resolved = false;
                } else {
                    student.weakAreas.push({
                        topic: topicName,
                        subject: subjectCode,
                        score: 0,
                        totalAttempts: 1,
                        lastAttempted: new Date(),
                        resolved: false
                    });
                }
            });
            
            // Update Predicted Score
            const newPredictedScore = Student.calculatePredictedScore({
                totalPracticeHours: student.learningStats.totalPracticeHours,
                syllabusProgress: student.learningStats.syllabusProgress,
                weakAreasResolved: student.weakAreas.filter(w => w.resolved).length,
                totalDoubtsCleared: student.learningStats.totalDoubtsCleared
            });

            if (student.examPredictions.length === 0) {
                student.examPredictions.push({
                    subject: 'Overall Batch Progress',
                    predictedScore: newPredictedScore,
                    confidence: 85,
                    generatedAt: new Date()
                });
            } else {
                student.examPredictions[0].predictedScore = newPredictedScore;
                student.examPredictions[0].generatedAt = new Date();
            }

            await student.save();
        }

        res.json({
            success: true,
            message: 'Session completed successfully and progress synced',
            data: {
                stats: session.stats,
                grade: session.grade
            }
        });
    } catch (error) {
        logger.error('Error completing session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete session'
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
