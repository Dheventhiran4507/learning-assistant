const LabAssessment = require('../models/LabAssessment');
const LabSubmission = require('../models/LabSubmission');
const Student = require('../models/Student');
const Syllabus = require('../models/Syllabus');
const aiService = require('../services/geminiAIService');
const pdf = require('pdf-parse-fork');
const fs = require('fs');
const logger = require('../utils/logger');

const { sendLabAssignedEmail } = require('../utils/emailService');

const labController = {
    // Staff: Upload document and assign lab
    assignLab: async (req, res) => {
        try {
            const { title, description, type, subjectCode, questionCount, duration } = req.body;
            const semester = parseInt(req.user.semester);
            const role = req.user.role;
            const file = req.file;

            // Authorization: Only assigned staff or Admins/HODs can assign labs for a subject
            if (role === 'staff') {
                const isAssigned = req.user.subjectsHandled?.some(
                    sh => sh.subjectCode.toUpperCase() === subjectCode.toUpperCase()
                );
                if (!isAssigned) {
                    return res.status(403).json({ 
                        success: false, 
                        message: `You are not authorized to assign labs for subject ${subjectCode}.` 
                    });
                }
            }

            if (!file) {
                return res.status(400).json({ success: false, message: 'Please upload a document.' });
            }

            let textContent = '';
            if (file.mimetype === 'application/pdf') {
                const dataBuffer = fs.readFileSync(file.path);
                const data = await pdf(dataBuffer);
                textContent = data.text;
            } else {
                textContent = fs.readFileSync(file.path, 'utf8');
            }

            // Clean up temporary file
            fs.unlinkSync(file.path);

            if (!textContent || textContent.trim().length < 50) {
                return res.status(400).json({ success: false, message: 'Document content too short or unreadable.' });
            }

            // Generate AI Questions
            const qCount = parseInt(questionCount) || 5;
            const prompt = `Based on the following lab document content, generate ${qCount} highly relevant technical MCQs for a ${type} quiz. 
            The questions should test understanding of the concepts mentioned in the text.
            
            Document Content:
            ${textContent.substring(0, 4000)} // Truncate to avoid token limits
            
            Return JSON format: { "questions": [{ "question": "...", "options": ["...", "..."], "correctAnswer": "...", "explanation": "..." }] }`;

            const aiResponse = await aiService.universalGenerateSyllabus(prompt);
            const questions = aiResponse.questions || aiResponse.data || [];

            if (!questions || questions.length === 0) {
                throw new Error('AI failed to generate questions for this document.');
            }

            const newAssessment = new LabAssessment({
                title,
                description,
                type,
                semester,
                subjectCode,
                questions,
                documentContent: textContent.substring(0, 10000), // Store first 10k chars
                createdBy: req.user.id,
                duration: parseInt(duration) || 30
            });

            await newAssessment.save();

            // Notify students via email
            try {
                const students = await Student.find({ role: 'student', semester: semester });
                const staffName = req.user.name;
                
                // Fetch subject name for the email
                const subject = await Syllabus.findOne({ subjectCode: subjectCode.toUpperCase() });
                const subjectName = subject ? subject.subjectName : subjectCode;

                // Send emails in background
                students.forEach(student => {
                    sendLabAssignedEmail(student.email, student.name, staffName, subjectName, title, type);
                });
                
                logger.info(`📧 Lab notification emails triggered for ${students.length} students in Semester ${semester}`);
            } catch (emailError) {
                logger.error('Email notification error:', emailError);
                // Don't fail the request if email fails
            }

            res.status(201).json({
                success: true,
                message: `${type === 'pre-lab' ? 'Pre-lab' : 'Post-lab'} assigned successfully. Emails triggered for Semester ${semester}.`,
                data: newAssessment
            });

        } catch (error) {
            logger.error('Lab Assignment Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Student: Get active labs for their semester
    getLabs: async (req, res) => {
        try {
            const { type } = req.query; // 'pre-lab' or 'post-lab'
            const semester = req.user.semester;

            const labs = await LabAssessment.find({ 
                semester, 
                type, 
                isActive: true 
            }).select('-documentContent').sort({ createdAt: -1 });

            // Hard Close Logic: Filter out expired assessments
            const currentTime = new Date();
            const activeLabs = labs.filter(lab => {
                const expiryTime = new Date(lab.createdAt.getTime() + (lab.duration || 30) * 60000);
                return currentTime <= expiryTime;
            });

            // Also check which ones student has already submitted
            const submissions = await LabSubmission.find({ 
                student: req.user.id 
            }).select('assessment score percentage');

            const labsWithStatus = activeLabs.map(lab => {
                const submission = submissions.find(s => s.assessment.toString() === lab._id.toString());
                return {
                    ...lab.toObject(),
                    isCompleted: !!submission,
                    submission: submission ? {
                        _id: submission._id,
                        score: submission.score,
                        percentage: submission.percentage
                    } : null
                };
            });

            res.json({ success: true, data: labsWithStatus });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Student: Submit answers
    submitLab: async (req, res) => {
        try {
            const { assessmentId, answers } = req.body;
            const studentId = req.user.id;

            const assessment = await LabAssessment.findById(assessmentId);
            if (!assessment) {
                return res.status(404).json({ success: false, message: 'Assessment not found.' });
            }

            // Calculate Score
            let correctCount = 0;
            const evaluatedAnswers = answers.map(answer => {
                const question = assessment.questions[answer.questionIndex];
                const isCorrect = question.correctAnswer === answer.selectedAnswer;
                if (isCorrect) correctCount++;
                return { ...answer, isCorrect };
            });

            const maxScore = assessment.questions.length;
            const percentage = (correctCount / maxScore) * 100;

            const submission = new LabSubmission({
                assessment: assessmentId,
                student: studentId,
                answers: evaluatedAnswers,
                score: correctCount,
                maxScore,
                percentage,
                completedAt: new Date()
            });

            await submission.save();

            res.status(201).json({
                success: true,
                message: 'Assessment submitted successfully.',
                data: {
                    score: correctCount,
                    total: maxScore,
                    percentage
                }
            });

        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ success: false, message: 'You have already submitted this assessment.' });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Staff: Get results for an assessment
    getLabResults: async (req, res) => {
        try {
            const { assessmentId } = req.params;

            const assessment = await LabAssessment.findById(assessmentId);
            if (!assessment) {
                return res.status(404).json({ success: false, message: 'Assessment not found.' });
            }

            // Authorization check
            if (req.user.role === 'staff') {
                const isAssigned = req.user.subjectsHandled?.some(
                    sh => sh.subjectCode.toUpperCase() === assessment.subjectCode.toUpperCase()
                );
                if (!isAssigned) {
                    return res.status(403).json({ 
                        success: false, 
                        message: 'You are not authorized to view results for this subject.' 
                    });
                }
            }

            const submissions = await LabSubmission.find({ assessment: assessmentId })
                .populate('student', 'name studentId email semester')
                .sort({ percentage: -1 });

            res.json({
                success: true,
                data: {
                    assessment,
                    submissions
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Staff: Get all assessments for their semester
    getStaffAssessments: async (req, res) => {
        try {
            const semester = req.user.semester;
            const role = req.user.role;
            const subjectsHandled = req.user.subjectsHandled || [];

            const query = { semester };
            
            // If staff, only show labs for their assigned subjects AND created by them
            if (role === 'staff') {
                const handledCodes = subjectsHandled.map(sh => sh.subjectCode.toUpperCase());
                query.subjectCode = { $in: handledCodes };
                query.createdBy = req.user.id;
            }

            const assessments = await LabAssessment.find(query)
                .sort({ createdAt: -1 });

            res.json({
                success: true,
                data: assessments
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Staff: Delete assessment
    deleteAssessment: async (req, res) => {
        try {
            const { id } = req.params;
            await LabAssessment.findByIdAndDelete(id);
            await LabSubmission.deleteMany({ assessment: id });
            res.json({ success: true, message: 'Assessment deleted successfully.' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    
    // Student: Get detailed results for a submission
    getSubmissionResults: async (req, res) => {
        try {
            const { submissionId } = req.params;
            const submission = await LabSubmission.findById(submissionId)
                .populate({
                    path: 'assessment',
                    select: 'title subjectCode type questions'
                });

            if (!submission) {
                return res.status(404).json({ success: false, message: 'Submission not found.' });
            }

            // Student can only view their own submission
            if (req.user.role === 'student' && submission.student.toString() !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Not authorized to view this submission.' });
            }

            res.json({ success: true, data: submission });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = labController;
