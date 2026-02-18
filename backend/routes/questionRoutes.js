const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Admin only routes for generation
router.post('/generate-bulk', authorize('admin'), questionController.generateBulkQuestions);

// Stats route (accessible to admin/instructors)
router.get('/stats/:subjectCode', authorize('admin', 'instructor'), questionController.getStats);

module.exports = router;
