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
const labRoutes = require('./routes/labRoutes');

const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Render load balancer)

// Render requires listening on the port provided in process.env.PORT
const PORT = process.env.PORT || 10000; 

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: (origin, callback) => {
        // Allow same-origin (no origin) or developer matches
        if (!origin || process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        
        // Allow Render domains
        if (origin.includes('onrender.com') || origin === process.env.FRONTEND_URL) {
            return callback(null, true);
        }
        
        callback(new Error('Not allowed by CORS'));
    },
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

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/api/debug-info', (req, res) => {
    res.status(200).json({
        project: 'Vidal - Lumina Portal',
        version: '1.1.2',
        auth: 'Dheventhiran4507',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/lab', labRoutes);

// Serve Static Files (Frontend)
const frontendPath = path.resolve(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Redirect Frontend Routes to Vercel (Production Safety)
app.get('*', (req, res) => {
    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://learning-assistant-beryl.vercel.app';
    
    // If it's an API request that wasn't handled, return 404
    if (req.url.startsWith('/api')) {
        logger.warn(`API route not found: ${req.url}`);
        return res.status(404).json({ message: 'API route not found' });
    }
    
    // In production, redirect all frontend navigation to Vercel
    if (process.env.NODE_ENV === 'production' && !req.url.includes('.')) {
        logger.info(`Redirecting ${req.url} to ${FRONTEND_URL}${req.url}`);
        return res.redirect(`${FRONTEND_URL}${req.url}`);
    }

    // Otherwise serve the local frontend index.html
    const indexPath = path.join(frontendPath, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            logger.error(`Error sending index.html: ${err.message}`);
            // If it fails on production, we've already tried redirecting above, 
            // but just in case of file requests like .ico that weren't caught:
            res.status(404).send('Resource not found.');
        }
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vidal')
    .then(() => {
        logger.info('✅ MongoDB connected successfully');

        // Start server
        const server = app.listen(PORT, '0.0.0.0', () => {
            logger.info(`🚀 Server running on port ${PORT}`);
            logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`🌐 Local: http://localhost:${PORT}`);
            
            // Log reachable address for Render debugging
            const os = require('os');
            const interfaces = os.networkInterfaces();
            for (const name of Object.keys(interfaces)) {
                for (const iface of interfaces[name]) {
                    if (iface.family === 'IPv4' && !iface.internal) {
                        logger.info(`📱 Publicly reachable (on Render internal network): http://${iface.address}:${PORT}/api`);
                    }
                }
            }
        });
        
        server.on('error', (error) => {
            logger.error('❌ Server startup error:', error.message);
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

// Backend server entry point
// Triggered restart at 2026-02-23
module.exports = app;
