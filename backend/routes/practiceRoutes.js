const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const practiceController = require('../controllers/practiceController');

// New session-based routes
router.post('/start', protect, practiceController.startSession);
router.post('/submit', protect, practiceController.submitAnswer);
router.get('/session/:sessionId', protect, practiceController.getSession);

// Maintain legacy routes for compatibility during transition
const Student = require('../models/Student');
const logger = require('../utils/logger');

// Get practice questions for a subject (Legacy)
router.get('/questions/:subjectCode', protect, async (req, res) => {
    try {
        const { subjectCode } = req.params;
        const { difficulty = 'medium', count = 5 } = req.query;
        const questions = generateQuestions(subjectCode, difficulty, parseInt(count));
        res.json({
            success: true,
            data: { questions, subjectCode, difficulty }
        });
    } catch (error) {
        logger.error('Error fetching practice questions:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch questions' });
    }
});

// Submit practice answer (Legacy)
router.post('/submit-answer', protect, async (req, res) => {
    try {
        const { questionId, selectedAnswer, subject } = req.body;
        const allQuestions = generateAllQuestions();
        const question = allQuestions.find(q => q.id === questionId);
        if (!question) return res.status(404).json({ success: false, message: 'Not found' });

        const isCorrect = selectedAnswer === question.correctAnswer;
        const student = await Student.findById(req.user.id);
        if (student) {
            student.learningStats.totalPracticeHours += 0.05;
            await student.save();
        }
        res.json({ success: true, data: { isCorrect, correctAnswer: question.correctAnswer, points: isCorrect ? 10 : 0 } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed' });
    }
});

function generateAllQuestions() {
    return [
        { id: 'ds-001', subject: 'CS2201', topic: 'Arrays', difficulty: 'easy', question: 'Complexity O(1)?', options: ['Yes', 'No'], correctAnswer: 'Yes' }
    ];
}

function generateQuestions(subjectCode, difficulty, count) {
    return generateAllQuestions().slice(0, count);
}

module.exports = router;

module.exports = router;
