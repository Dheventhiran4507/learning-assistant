const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new student
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Login student
// @access  Public
router.post('/login', authController.login);

// @route   GET /api/auth/me
// @desc    Get current logged-in student
// @access  Private
router.get('/me', protect, authController.getMe);

// @route   PUT /api/auth/profile
// @desc    Update student profile
// @access  Private
router.put('/profile', protect, authController.updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', protect, authController.changePassword);

module.exports = router;
