const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const labController = require('../controllers/labController');
const { protect, authorize } = require('../middleware/auth');

// Multer Config for Document Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/labs');
        const fs = require('fs');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `lab-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.txt', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and Text documents are allowed.'));
        }
    }
});

// Staff Routes
router.get('/staff-assessments', protect, authorize('admin', 'hod', 'advisor', 'staff'), labController.getStaffAssessments);
router.post('/assign', protect, authorize('admin', 'hod', 'advisor', 'staff'), upload.single('document'), labController.assignLab);
router.get('/results/:assessmentId', protect, authorize('admin', 'hod', 'advisor', 'staff'), labController.getLabResults);
router.delete('/:id', protect, authorize('admin', 'hod', 'advisor', 'staff'), labController.deleteAssessment);

// Student Routes
router.get('/active', protect, labController.getLabs);
router.post('/submit', protect, labController.submitLab);
router.get('/submission/:submissionId', protect, labController.getSubmissionResults);

module.exports = router;
