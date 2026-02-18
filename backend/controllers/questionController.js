const Question = require('../models/Question');
const Syllabus = require('../models/Syllabus');
const claudeService = require('../services/claudeAIService');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Generate bulk questions for a subject/unit
const textbookGenerator = require('../utils/textbookGenerator');

exports.generateBulkQuestions = async (req, res) => {
    try {
        const { subjectCode, unit, difficulty = 'medium', count = 10 } = req.body;

        // 1. Fetch Syllabus
        const syllabus = await Syllabus.findOne({ subjectCode });
        if (!syllabus) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }

        // 2. Try textbook generator first if subject is supported
        if (textbookGenerator.SUBJECT_MAP[subjectCode] || textbookGenerator.TEXTBOOKS[subjectCode]) {
            const unitInt = unit ? parseInt(unit) : null;
            let allTextbookQs = [];

            if (unitInt) {
                allTextbookQs = textbookGenerator.generateTextbookQuestions(subjectCode, unitInt);
            } else {
                // Generate for all units if not specified
                for (let i = 1; i <= 5; i++) {
                    allTextbookQs.push(...textbookGenerator.generateTextbookQuestions(subjectCode, i));
                }
            }

            if (allTextbookQs.length > 0) {
                // Shuffle and take requested count
                const selectedQs = allTextbookQs
                    .sort(() => 0.5 - Math.random())
                    .slice(0, count);

                const docs = selectedQs.map(q => ({
                    ...q,
                    aiGenerated: false,
                    generationId: uuidv4()
                }));

                await Question.insertMany(docs);

                return res.json({
                    success: true,
                    message: `Successfully generated ${docs.length} questions from textbook content.`,
                    count: docs.length,
                    fromTextbook: true
                });
            }
        }

        // 3. Identify Topics for AI Fallback
        let topicsToCover = [];
        const units = syllabus.units.filter(u => !unit || u.unitNumber === parseInt(unit));

        units.forEach(u => {
            u.topics.forEach(t => {
                topicsToCover.push({
                    name: t.topicName,
                    unit: u.unitNumber
                });
            });
        });

        if (topicsToCover.length === 0) {
            return res.status(400).json({ success: false, message: 'No topics found for the specified unit' });
        }

        logger.info(`Starting bulk generation for ${subjectCode} Unit ${unit || 'All'}. Topics: ${topicsToCover.length}`);

        // 3. Trigger Async Generation (don't wait for all to finish if count is high)
        // For user experience, we can return "Started" and let it run.
        // Or if count is small, wait. Let's make it async but track progress.
        // For simplicity in this iteration, we'll process a subset synchronously or start background job.

        // Let's generate for one batch of topics to avoid timeout
        // Limiting to 5 topics at a time if triggered via API or processing all in background
        const batchId = uuidv4();
        let questionsCreated = 0;

        // Run in background (response sent immediately)
        if (req.query.async === 'true') {
            processBackgroundGeneration(topicsToCover, subjectCode, difficulty, batchId);
            return res.json({
                success: true,
                message: 'Bulk generation started in background',
                batchId,
                topicsCount: topicsToCover.length
            });
        }

        // Otherwise, process a limited amount synchronously (e.g., top 3 topics) for immediate feedback
        const limitedTopics = topicsToCover.slice(0, 3);

        for (const topic of limitedTopics) {
            const questions = await claudeService.generateBulkQuestions(topic.name, difficulty, 5); // 5 per topic

            if (questions.length > 0) {
                const docs = questions.map(q => ({
                    subjectCode,
                    unit: topic.unit,
                    topic: topic.name,
                    type: 'mcq',
                    difficulty,
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    aiGenerated: true,
                    generationId: batchId
                }));

                await Question.insertMany(docs);
                questionsCreated += docs.length;
            }
        }

        res.json({
            success: true,
            message: `Generated ${questionsCreated} questions for ${limitedTopics.length} topics`,
            count: questionsCreated,
            batchId
        });

    } catch (error) {
        logger.error('Error in bulk generation:', error);
        res.status(500).json({ success: false, message: 'Generation failed', error: error.message });
    }
};

// Background helper
async function processBackgroundGeneration(topics, subjectCode, difficulty, batchId) {
    logger.info(`Background job started: ${batchId}`);
    for (const topic of topics) {
        try {
            // fast-forward if we already have enough questions for this topic?
            // checking existing count
            const existingCount = await Question.countDocuments({ subjectCode, topic: topic.name });
            if (existingCount >= 20) continue; // Skip if already populated

            const questions = await claudeService.generateBulkQuestions(topic.name, difficulty, 10);
            if (questions.length > 0) {
                const docs = questions.map(q => ({
                    subjectCode,
                    unit: topic.unit,
                    topic: topic.name,
                    type: 'mcq',
                    difficulty,
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    aiGenerated: true,
                    generationId: batchId
                }));
                await Question.insertMany(docs);
            }
            // Artificial delay to handle rate limits
            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (err) {
            logger.error(`Background gen error for ${topic.name}:`, err);
        }
    }
    logger.info(`Background job completed: ${batchId}`);
}

// Get stats
exports.getStats = async (req, res) => {
    try {
        const { subjectCode } = req.params;
        const stats = await Question.aggregate([
            { $match: { subjectCode } },
            { $group: { _id: "$unit", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
