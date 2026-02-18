const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, (req, res) => {
    res.json({ success: true, message: 'Analytics endpoint' });
});

module.exports = router;
