const Syllabus = require('../models/Syllabus');
const logger = require('../utils/logger');
const annaUnivService = require('../services/annaUnivService');

// Get syllabus for a specific semester
exports.getSyllabusBySemester = async (req, res) => {
    try {
        const { semester } = req.params;
        const semesterNum = parseInt(semester);

        // 1. Fetch from local database
        const localSyllabus = await Syllabus.find({
            semester: semesterNum,
            isActive: true
        }).sort({ subjectCode: 1 });

        // 2. Fetch from Anna University API
        const externalSyllabus = await annaUnivService.fetchSyllabusBySemester(semesterNum);

        // 3. Merge results (prioritize local for now or unique subjects)
        // 3. Merge results (prioritize local for now or unique subjects)
        const localCodes = new Set(localSyllabus.map(s => s.subjectCode));

        // Ensure externalSyllabus is an array before filtering
        const validExternalSyllabus = Array.isArray(externalSyllabus) ? externalSyllabus : [];
        const uniqueExternal = validExternalSyllabus.filter(s => !localCodes.has(s.subjectCode));

        const mergedSyllabus = [...localSyllabus, ...uniqueExternal].sort((a, b) => {
            if (!a.subjectCode || !b.subjectCode) return 0;
            return a.subjectCode.localeCompare(b.subjectCode);
        });

        res.json({
            success: true,
            data: mergedSyllabus,
            count: mergedSyllabus.length,
            sources: {
                local: localSyllabus.length,
                external: uniqueExternal.length
            }
        });
    } catch (error) {
        logger.error('Error fetching syllabus by semester:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch syllabus',
            error: error.message
        });
    }
};

// Get details for a specific subject
exports.getSubjectDetails = async (req, res) => {
    try {
        const { subjectCode } = req.params;
        const syllabus = await Syllabus.findOne({ subjectCode });

        if (!syllabus) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        res.json({
            success: true,
            data: syllabus
        });
    } catch (error) {
        logger.error('Error fetching subject details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subject details',
            error: error.message
        });
    }
};

// Search syllabus
exports.searchSyllabus = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const syllabus = await Syllabus.find({
            $or: [
                { subjectCode: { $regex: query, $options: 'i' } },
                { subjectName: { $regex: query, $options: 'i' } },
                { 'units.topics.topicName': { $regex: query, $options: 'i' } }
            ],
            isActive: true
        }).limit(20);

        res.json({
            success: true,
            data: syllabus
        });
    } catch (error) {
        logger.error('Error searching syllabus:', error);
        res.status(500).json({
            success: false,
            message: 'Search failed',
            error: error.message
        });
    }
};
