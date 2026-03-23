const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

router.get('/dashboard', protect, (req, res) => {
    res.json({ success: true, message: 'Analytics endpoint' });
});

// Student personal stats
router.get('/student/stats', protect, analyticsController.getStudentAnalytics);

// Admin/HOD stats
router.get('/hod/stats', protect, authorize('admin', 'hod', 'advisor', 'staff'), analyticsController.getHODStats);
router.get('/staff', protect, authorize('admin', 'hod', 'advisor'), analyticsController.getStaff);

module.exports = router;
