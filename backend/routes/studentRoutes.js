const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Student = require('../models/Student');
const logger = require('../utils/logger');

// Initialize default subjects if not present
const initializeDefaultSubjects = (student) => {
    const defaultSubjects = [
        { subjectCode: 'CS2201', subjectName: 'Data Structures' },
        { subjectCode: 'CS2203', subjectName: 'Algorithms' },
        { subjectCode: 'CS2304', subjectName: 'Object-Oriented Programming' },
        { subjectCode: 'CS2308', subjectName: 'Database Management Systems' },
    ];

    if (!student.subjectProgress || student.subjectProgress.length === 0) {
        student.subjectProgress = defaultSubjects.map(subject => ({
            subjectCode: subject.subjectCode,
            subjectName: subject.subjectName,
            progress: 0,
            topicsCompleted: [],
            weakTopics: [],
            lastPracticed: new Date()
        }));
    }
    return student;
};

// Get student stats
router.get('/stats', protect, async (req, res) => {
    try {
        let student = await Student.findById(req.user.id);
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        student = initializeDefaultSubjects(student);
        await student.save();

        res.json({
            success: true,
            data: {
                learningStats: student.learningStats,
                subjectProgress: student.subjectProgress,
                weakAreas: student.weakAreas,
                examPredictions: student.examPredictions
            }
        });
    } catch (error) {
        logger.error('Error fetching student stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch student stats',
            error: error.message
        });
    }
});

// Get subject progress
router.get('/subjects', protect, async (req, res) => {
    try {
        let student = await Student.findById(req.user.id);
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        student = initializeDefaultSubjects(student);
        await student.save();

        res.json({
            success: true,
            data: student.subjectProgress
        });
    } catch (error) {
        logger.error('Error fetching subject progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subject progress',
            error: error.message
        });
    }
});

// Get weak areas
router.get('/weak-areas', protect, async (req, res) => {
    try {
        const student = await Student.findById(req.user.id);
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            data: student.weakAreas
        });
    } catch (error) {
        logger.error('Error fetching weak areas:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch weak areas',
            error: error.message
        });
    }
});

module.exports = router;
