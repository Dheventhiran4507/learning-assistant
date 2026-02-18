const express = require('express');
const router = express.Router();
const syllabusController = require('../controllers/syllabusController');
const { protect } = require('../middleware/auth');

router.get('/semester/:semester', protect, syllabusController.getSyllabusBySemester);
router.get('/subject/:subjectCode', protect, syllabusController.getSubjectDetails);
router.get('/search', protect, syllabusController.searchSyllabus);

module.exports = router;
