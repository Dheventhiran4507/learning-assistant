const pdfService = require('../services/pdfService');
const Syllabus = require('../models/Syllabus');
const logger = require('../utils/logger');
const fs = require('fs').promises;

/**
 * Upload and process syllabus PDF
 */
exports.uploadSyllabus = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No PDF file uploaded'
            });
        }

        const { semester } = req.body;
        if (!semester) {
            return res.status(400).json({
                success: false,
                message: 'Semester number is required'
            });
        }

        const filePath = req.file.path;
        logger.info(`Processing syllabus PDF for semester ${semester}: ${filePath}`);

        // Extract and parse syllabus
        const subjects = await pdfService.extractSyllabus(filePath, parseInt(semester));

        if (subjects.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No subjects found in PDF. Please check the file format.'
            });
        }

        // Store in database
        const savedSubjects = [];
        let totalUnits = 0;
        let totalTopics = 0;

        for (const subjectData of subjects) {
            // Check if subject already exists
            let subject = await Syllabus.findOne({
                subjectCode: subjectData.subjectCode,
                semester: subjectData.semester
            });

            if (subject) {
                // Update existing subject
                subject.subjectName = subjectData.subjectName;
                subject.units = subjectData.units;
                await subject.save();
            } else {
                // Create new subject
                subject = await Syllabus.create(subjectData);
            }

            savedSubjects.push({
                code: subject.subjectCode,
                name: subject.subjectName,
                units: subject.units.length,
                topics: subject.units.reduce((sum, unit) => sum + unit.topics.length, 0)
            });

            totalUnits += subject.units.length;
            totalTopics += subject.units.reduce((sum, unit) => sum + unit.topics.length, 0);
        }

        // Clean up uploaded file
        await fs.unlink(filePath);

        logger.info(`Syllabus uploaded successfully: ${subjects.length} subjects, ${totalUnits} units, ${totalTopics} topics`);

        res.json({
            success: true,
            message: 'Syllabus uploaded and processed successfully',
            data: {
                semester: parseInt(semester),
                subjectsCount: subjects.length,
                totalUnits: totalUnits,
                totalTopics: totalTopics,
                subjects: savedSubjects
            }
        });

    } catch (error) {
        logger.error('Error uploading syllabus:', error);

        // Clean up file if it exists
        if (req.file && req.file.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                logger.error('Error deleting uploaded file:', unlinkError);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Failed to process syllabus PDF',
            error: error.message
        });
    }
};

/**
 * Get extraction preview without saving
 */
exports.previewSyllabus = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No PDF file uploaded'
            });
        }

        const { semester } = req.body;
        const filePath = req.file.path;

        // Extract and parse syllabus
        const subjects = await pdfService.extractSyllabus(filePath, parseInt(semester || 1));

        // Clean up uploaded file
        await fs.unlink(filePath);

        res.json({
            success: true,
            data: subjects
        });

    } catch (error) {
        logger.error('Error previewing syllabus:', error);

        if (req.file && req.file.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                logger.error('Error deleting uploaded file:', unlinkError);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Failed to preview syllabus',
            error: error.message
        });
    }
};
