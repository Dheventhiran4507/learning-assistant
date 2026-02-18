const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const logger = require('../utils/logger');

/**
 * Protect routes - verify JWT token
 */
exports.protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route. Please login.'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get student from token
            req.user = await Student.findById(decoded.id);

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (!req.user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated'
                });
            }

            next();

        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

    } catch (error) {
        logger.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};

/**
 * Authorize roles
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = exports;
