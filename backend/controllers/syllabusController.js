const Syllabus = require('../models/Syllabus');
const Student = require('../models/Student');
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
const annaUnivService = require('../services/annaUnivService');

// Get syllabus for a specific semester
exports.getSyllabusBySemester = async (req, res) => {
    try {
        const { semester } = req.params;
        const semesterNum = parseInt(semester);
        logger.info(`Fetching subjects for semester ${semesterNum}...`);

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
        let syllabus = await Syllabus.findOne({
            subjectCode: { $regex: new RegExp(`^${subjectCode}$`, 'i') }
        });

        const needsGeneration = !syllabus || !syllabus.units || syllabus.units.length < 5;

        if (needsGeneration) {
            logger.info(`Subject '${subjectCode}' ${!syllabus ? 'not found' : 'has ' + syllabus.units.length + ' units (Expected 5)'}. Triggering AI Syllabus Generation...`);

            try {
                // Determine if it's a valid looking subject code (e.g., CS3401, CME365, GE3751)
                const isLikelySubject = /^[A-Z0-9]{5,10}$/i.test(subjectCode);

                if (isLikelySubject) {
                    const aiService = require('../services/geminiAIService');

                    // Lookup official name if available
                    const officialName = subjectMapping[subjectCode.toUpperCase()];
                    if (officialName) {
                        logger.info(`Found official name for ${subjectCode}: ${officialName}`);
                    }

                    const { subjectName: aiSubjectName, units } = await aiService.generateSyllabusStructure(subjectCode, officialName);

                    if (!syllabus) {
                        // Create new syllabus entry
                        syllabus = await Syllabus.create({
                            subjectCode: subjectCode.toUpperCase(),
                            subjectName: officialName || aiSubjectName,
                            semester: req.query.semester || 1, // Default or from query
                            units: units,
                            regulation: 'R2021',
                            isActive: true
                        });
                        logger.info(`Successfully auto-generated syllabus for ${subjectCode}: ${aiSubjectName}`);
                    } else {
                        // Repair existing empty syllabus
                        syllabus.units = units;
                        syllabus.subjectName = officialName || aiSubjectName; // Update name too if changed
                        syllabus.lastUpdated = new Date();
                        await syllabus.save();
                        logger.info(`Successfully REPAIRED empty syllabus for ${subjectCode}: ${syllabus.subjectName}`);
                    }
                } else {
                    if (!syllabus) {
                        return res.status(404).json({
                            success: false,
                            message: 'Subject not found and code format is invalid for auto-generation.'
                        });
                    }
                }
            } catch (aiError) {
                logger.error(`AI Syllabus Generation failed for ${subjectCode}:`, aiError.message);
                if (!syllabus) {
                    return res.status(404).json({
                        success: false,
                        message: 'Subject not found. AI generation failed.'
                    });
                }
            }
        }
        
        if (syllabus && req.query.semester && syllabus.semester !== parseInt(req.query.semester)) {
            // If it exists but in a different semester, update it to the requested one
            // This happens when adding an elective that was previously assigned elsewhere
            const newSemester = parseInt(req.query.semester);
            logger.info(`Moving subject ${subjectCode} from semester ${syllabus.semester} to ${newSemester}`);
            syllabus.semester = newSemester;
            syllabus.lastUpdated = new Date();
            await syllabus.save();
        }

        res.json({
            success: true,
            data: syllabus,
            isAutoGenerated: syllabus?.subjectName?.includes('(AI Generated)')
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

// Force re-generate syllabus using grounded AI engine
exports.regenerateSyllabus = async (req, res) => {
    try {
        const { subjectCode } = req.params;
        const syllabus = await Syllabus.findOne({ subjectCode: subjectCode.toUpperCase() });

        if (!syllabus) {
            return res.status(404).json({
                success: false,
                message: 'Syllabus record not found for this subject code.'
            });
        }

        logger.info(`Manual re-generation triggered for ${subjectCode} by ${req.user.role} ${req.user.studentId}`);

        try {
            const aiService = require('../services/geminiAIService');
            const officialName = subjectMapping[subjectCode.toUpperCase()];

            const { subjectName: aiSubjectName, units } = await aiService.generateSyllabusStructure(subjectCode, officialName);

            // Update existing record
            syllabus.units = units;
            syllabus.subjectName = officialName || aiSubjectName;
            syllabus.lastUpdated = new Date();
            await syllabus.save();

            // SYNC PROGRESS: Recalculate for all students in this semester
            try {
                const students = await Student.find({ semester: syllabus.semester });
                if (students.length > 0) {
                    logger.info(`🔄 Syncing progress for ${students.length} students after syllabus refresh of ${subjectCode}`);
                    await Promise.all(students.map(student => student.recalculateSubjectProgress(subjectCode).then(s => s.save())));
                }
            } catch (syncErr) {
                logger.error(`Failed to sync student progress for ${subjectCode}:`, syncErr.message);
            }

            res.json({
                success: true,
                message: `Successfully re-generated syllabus for ${subjectCode}. Progress synced for ${subjectCode}.`,
                data: syllabus
            });
        } catch (genError) {
            logger.error(`Generation failed for ${subjectCode}, preserving existing data:`, genError.message);
            
            // If we have units already, just return success with existing data
            if (syllabus.units && syllabus.units.length > 0) {
                return res.json({
                    success: true,
                    message: `AI Refresh currently unavailable. Preserved existing syllabus for ${subjectCode}.`,
                    data: syllabus,
                    isFallback: true
                });
            }
            throw genError; // Re-throw if no data exists at all
        }
    } catch (error) {
        logger.error(`Error in regenerateSyllabus for ${subjectCode}:`, error);
        res.status(500).json({
            success: false,
            message: 'Failed to regenerate syllabus.',
            error: error.message
        });
    }
};

// Get all available subjects from the master list
exports.getAvailableSubjects = async (req, res) => {
    try {
        res.json({
            success: true,
            data: subjectMapping
        });
    } catch (error) {
        logger.error('Error fetching available subjects:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch available subjects',
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

// Delete a syllabus record
exports.deleteSyllabus = async (req, res) => {
    try {
        const { subjectCode } = req.params;
        const syllabus = await Syllabus.findOne({ subjectCode: subjectCode.toUpperCase() });

        if (!syllabus) {
            return res.status(404).json({
                success: false,
                message: 'Syllabus record not found.'
            });
        }

        logger.info(`Subject deletion triggered for ${subjectCode} by ${req.user.role} ${req.user.studentId}`);

        // 1. Remove from all students' subjectProgress arrays
        try {
            await Student.updateMany(
                { 'subjectProgress.subjectCode': subjectCode.toUpperCase() },
                { $pull: { subjectProgress: { subjectCode: subjectCode.toUpperCase() } } }
            );
            logger.info(`Removed ${subjectCode} from student progress arrays.`);
        } catch (updateErr) {
            logger.error(`Error removing ${subjectCode} from student progress:`, updateErr.message);
        }

        // 2. Delete the syllabus record itself
        await Syllabus.deleteOne({ _id: syllabus._id });

        res.json({
            success: true,
            message: `Successfully deleted subject ${subjectCode} and associated student progress.`
        });
    } catch (error) {
        logger.error(`Error in deleteSyllabus for ${req.params.subjectCode}:`, error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete subject.',
            error: error.message
        });
    }
};

