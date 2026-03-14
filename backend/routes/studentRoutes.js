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

// Get student stats with semester filtering
router.get('/stats', protect, async (req, res) => {
    try {
        let student = await Student.findById(req.user.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Filter subject progress to only include current semester subjects
        // We can fetch from Syllabus if progress is empty for the current semester
        const currentSemester = student.semester || 1;

        // Find subjects for current semester
        const Syllabus = require('../models/Syllabus');
        const semesterSubjects = await Syllabus.find({ semester: currentSemester, isActive: true });
        const semesterSubjectCodes = semesterSubjects.map(s => s.subjectCode);

        // Filter existing progress or initialize if needed
        let filteredProgress = student.subjectProgress.filter(p => semesterSubjectCodes.includes(p.subjectCode));

        if (filteredProgress.length === 0 && semesterSubjects.length > 0) {
            // First time loading this semester, initialize progress objects
            const newProgressItems = semesterSubjects.map(s => ({
                subjectCode: s.subjectCode,
                subjectName: s.subjectName,
                progress: 0,
                topicsCompleted: [],
                weakTopics: [],
                lastPracticed: new Date()
            }));

            // Add to student's progress (avoiding duplicates)
            const existingCodes = student.subjectProgress.map(p => p.subjectCode);
            const itemsToAdd = newProgressItems.filter(item => !existingCodes.includes(item.subjectCode));

            if (itemsToAdd.length > 0) {
                student.subjectProgress.push(...itemsToAdd);
                await student.save();
            }
            filteredProgress = student.subjectProgress.filter(p => semesterSubjectCodes.includes(p.subjectCode));
        }

        // Calculate dynamic syllabus progress for the current semester
        const totalSubjects = filteredProgress.length;
        const totalProgressSum = filteredProgress.reduce((sum, p) => sum + (p.progress || 0), 0);
        const dynamicSyllabusProgress = totalSubjects > 0 ? Math.round(totalProgressSum / totalSubjects) : 0;

        res.json({
            success: true,
            data: {
                learningStats: {
                    ...student.learningStats.toObject(),
                    syllabusProgress: dynamicSyllabusProgress // Override with semester-specific progress
                },
                subjectProgress: filteredProgress, // Only current semester
                weakAreas: student.weakAreas,
                examPredictions: student.examPredictions,
                semester: currentSemester
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
