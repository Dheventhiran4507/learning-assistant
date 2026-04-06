const Chat = require('../models/Chat');
const Student = require('../models/Student');
const Syllabus = require('../models/Syllabus');
const aiService = require('../services/geminiAIService');
const logger = require('../utils/logger');

exports.sendMessage = async (req, res) => {
    try {
        const { message, sessionId, inputMethod = 'text' } = req.body;
        const studentId = req.user.id; // From auth middleware

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Get student profile
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Detect language and intent
        const detectedLanguage = aiService.detectLanguage(message);
        const intent = aiService.classifyIntent(message);
        const subjectCode = aiService.extractSubject(message);

        // Get conversation history for context
        const conversationHistory = await Chat.find({
            student: studentId,
            sessionId: sessionId || 'default'
        })
            .sort({ createdAt: -1 })
            .limit(5);

        // Get subject information if detected
        let subjectInfo = null;
        if (subjectCode) {
            subjectInfo = await Syllabus.findOne({ subjectCode });
        }

        // Build context for AI
        const context = {
            studentProfile: {
                name: student.name,
                semester: student.semester,
                department: student.department,
                preferredLanguage: student.preferredLanguage,
                learningStats: student.learningStats
            },
            subjectInfo: subjectInfo ? {
                subjectCode: subjectInfo.subjectCode,
                subjectName: subjectInfo.subjectName,
                regulation: subjectInfo.regulation,
                units: subjectInfo.units // Pass the unit data
            } : null,
            conversationHistory: conversationHistory.reverse(),
            relatedTopics: []
        };

        // Get AI response
        const aiResult = await aiService.sendMessage(message, context);

        // Save chat to database
        const chat = new Chat({
            student: studentId,
            sessionId: sessionId || 'default',
            userMessage: message,
            aiResponse: aiResult.response,
            detectedLanguage,
            inputMethod,
            intent,
            subject: subjectInfo ? {
                subjectCode: subjectInfo.subjectCode,
                subjectName: subjectInfo.subjectName,
                topic: extractTopic(message)
            } : undefined,
            aiMetadata: aiResult.metadata
        });

        await chat.save();

        // Update student stats
        student.learningStats.totalDoubtsCleared += 1;
        student.learningStats.lastActiveDate = new Date();

        const responseTime = aiResult.metadata?.responseTime || 100;
        student.learningStats.averageResponseTime =
            ((student.learningStats.averageResponseTime * (student.learningStats.totalDoubtsCleared - 1)) +
                responseTime) / student.learningStats.totalDoubtsCleared;

        await student.save();

        logger.info(`Chat processed for student ${student.studentId}`);

        res.status(200).json({
            success: true,
            data: {
                chatId: chat._id,
                aiResponse: aiResult.response || aiResult,
                message: aiResult.response,
                metadata: {
                    detectedLanguage,
                    intent,
                    subject: subjectCode,
                    responseTime: aiResult.metadata?.responseTime || 0
                }
            }
        });

    } catch (error) {
        logger.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process message',
            error: error.message
        });
    }
};

exports.getConversationHistory = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { sessionId, limit = 50 } = req.query;

        const query = { student: studentId };
        if (sessionId) {
            query.sessionId = sessionId;
        }

        const chats = await Chat.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select('-aiMetadata');

        res.status(200).json({
            success: true,
            count: chats.length,
            data: chats.reverse()
        });

    } catch (error) {
        logger.error('Get conversation history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get conversation history',
            error: error.message
        });
    }
};

exports.getChatSessions = async (req, res) => {
    try {
        const studentId = req.user.id;
        
        // Aggregate to find unique sessions, their first message, and last updated time
        const sessions = await Chat.aggregate([
            { $match: { student: new (require('mongoose').Types.ObjectId)(studentId) } },
            { $sort: { createdAt: 1 } }, // Sort ascending to get the very first message as title
            { 
                $group: { 
                    _id: "$sessionId",
                    firstMessage: { $first: "$userMessage" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $last: "$createdAt" },
                    messageCount: { $sum: 1 }
                }
            },
            { $sort: { updatedAt: -1 } } // Return most recently active sessions first
        ]);
        
        res.status(200).json({
            success: true,
            count: sessions.length,
            data: sessions
        });

    } catch (error) {
        logger.error('Get chat sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get chat sessions',
            error: error.message
        });
    }
};

exports.provideFeedback = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { helpful, rating, comment } = req.body;

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        chat.feedback = {
            helpful,
            rating,
            comment,
            timestamp: new Date()
        };

        await chat.save();

        res.status(200).json({
            success: true,
            message: 'Feedback recorded successfully'
        });

    } catch (error) {
        logger.error('Provide feedback error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record feedback',
            error: error.message
        });
    }
};

exports.getSubjectChats = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { subjectCode } = req.params;

        const chats = await Chat.getSubjectChats(studentId, subjectCode);

        res.status(200).json({
            success: true,
            count: chats.length,
            data: chats
        });

    } catch (error) {
        logger.error('Get subject chats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get subject chats',
            error: error.message
        });
    }
};

exports.deleteChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const studentId = req.user.id;

        const chat = await Chat.findOne({ _id: chatId, student: studentId });
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        await chat.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Chat deleted successfully'
        });

    } catch (error) {
        logger.error('Delete chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete chat',
            error: error.message
        });
    }
};

// Helper function to extract topic from message
function extractTopic(message) {
    // Simple keyword extraction - can be enhanced with NLP
    const keywords = message.toLowerCase()
        .split(' ')
        .filter(word => word.length > 4)
        .slice(0, 3);

    return keywords.join(' ');
}

exports.getStaffDoubts = async (req, res) => {
    try {
        const role = req.user.role;
        const subjectsHandled = req.user.subjectsHandled || [];

        // HODs/Admins see all doubts for the semester
        // Staff only see doubts for their assigned subjects
        const query = { intent: 'doubt' };

        if (role === 'staff') {
            const handledCodes = subjectsHandled.map(sh => sh.subjectCode.toUpperCase());
            query['subject.subjectCode'] = { $in: handledCodes };
        } else if (role === 'advisor' || role === 'hod' || role === 'admin') {
            // Further semester filtering if needed, but for now we follow the existing pattern
            // if (req.user.semester) query.semester = req.user.semester; 
            // The Chat model doesn't have a direct semester field, but we can filter by staff's subjects
        }

        const doubts = await Chat.find(query)
            .populate('student', 'name studentId semester')
            .sort({ createdAt: -1 })
            .limit(100);

        res.status(200).json({
            success: true,
            count: doubts.length,
            data: doubts
        });
    } catch (error) {
        logger.error('Get staff doubts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve doubts',
            error: error.message
        });
    }
};

module.exports = exports;
