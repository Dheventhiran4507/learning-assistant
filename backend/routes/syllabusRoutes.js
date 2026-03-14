const express = require('express');
const router = express.Router();
const syllabusController = require('../controllers/syllabusController');
const { protect, authorize } = require('../middleware/auth');

router.get('/semester/:semester', protect, syllabusController.getSyllabusBySemester);
router.get('/available', protect, syllabusController.getAvailableSubjects);
router.get('/subject/:subjectCode', protect, syllabusController.getSubjectDetails);
router.post('/subject/:subjectCode/regenerate', protect, authorize('admin', 'hod', 'advisor'), syllabusController.regenerateSyllabus);
router.delete('/subject/:subjectCode', protect, authorize('admin', 'hod', 'advisor'), syllabusController.deleteSyllabus);
router.get('/search', protect, syllabusController.searchSyllabus);

module.exports = router;
