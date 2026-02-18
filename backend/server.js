const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const syllabusRoutes = require('./routes/syllabusRoutes');
const practiceRoutes = require('./routes/practiceRoutes');
const syllabusUploadRoutes = require('./routes/syllabusUploadRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(compression()); // Compress responses
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: logger.stream }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased for development/testing
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});



// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/syllabus-upload', syllabusUploadRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/questions', require('./routes/questionRoutes'));

// Serve Static Files (Frontend)
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Catch-all route for React Router (must be after API routes)
app.get('*', (req, res) => {
    // If it's an API request that wasn't handled, return 404
    if (req.url.startsWith('/api')) {
        return res.status(404).json({ message: 'API route not found' });
    }
    // Otherwise serve the frontend index.html
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tamiledu-ai')
    .then(() => {
        logger.info('✅ MongoDB connected successfully');

        // Start server
        app.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}`);
            logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
        });
    })
    .catch((error) => {
        logger.error('❌ MongoDB connection error:', error);
        process.exit(1);
    });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection:', err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
});

module.exports = app;
