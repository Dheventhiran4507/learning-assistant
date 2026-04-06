const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// @route   POST /api/chat/message
// @desc    Send a message and get AI response
// @access  Private
router.post('/message', chatController.sendMessage);

// @route   POST /api/chat/send
// @desc    Send a message and get AI response
// @access  Private
router.post('/send', chatController.sendMessage);

// @route   GET /api/chat/history
// @desc    Get conversation history
// @access  Private
router.get('/history', chatController.getConversationHistory);

// @route   GET /api/chat/sessions
// @desc    Get grouped chat sessions list
// @access  Private
router.get('/sessions', chatController.getChatSessions);

// @route   GET /api/chat/subject/:subjectCode
// @desc    Get subject-specific chats
// @access  Private
router.get('/subject/:subjectCode', chatController.getSubjectChats);

// @route   PUT /api/chat/:chatId/feedback
// @desc    Provide feedback on a chat
// @access  Private
router.put('/:chatId/feedback', chatController.provideFeedback);

// @route   DELETE /api/chat/:chatId
// @desc    Delete a chat
// @access  Private
router.delete('/:chatId', chatController.deleteChat);

// @route   GET /api/chat/staff/doubts
// @desc    Get student doubts for assigned subjects
// @access  Private (Staff/HOD/Admin)
router.get('/staff/doubts', chatController.getStaffDoubts);

module.exports = router;
