const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/status', authController.getSystemStatus);
router.post('/setup-initial-admin', authController.setupInitialAdmin);
router.post('/seed-syllabus', authController.seedSyllabus);

router.get('/me', protect, authController.getMe);

router.put('/profile', protect, authController.updateProfile);

router.put('/change-password', protect, authController.changePassword);

router.post('/manage-account', protect, authController.manageAccount);

module.exports = router;
