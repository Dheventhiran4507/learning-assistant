const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Generate JWT Token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

/**
 * Register a new student
 */
exports.register = async (req, res) => {
    try {
        const {
            studentId,
            name,
            email,
            password,
            phone,
            semester,
            batch,
            college,
            department
        } = req.body;

        // Check if student already exists
        const existingStudent = await Student.findOne({
            $or: [{ email }, { studentId }]
        });

        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: 'Student already exists with this email or student ID'
            });
        }

        // Create new student
        const student = await Student.create({
            studentId,
            name,
            email,
            password,
            phone,
            semester,
            batch,
            college,
            department: department || 'Computer Science Engineering'
        });

        // Generate token
        const token = generateToken(student._id);

        logger.info(`New student registered: ${student.studentId}`);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                student: {
                    id: student._id,
                    studentId: student.studentId,
                    name: student.name,
                    email: student.email,
                    semester: student.semester,
                    department: student.department
                },
                token
            }
        });

    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

/**
 * Login student
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find student and include password
        const student = await Student.findOne({ email }).select('+password');

        if (!student) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is active
        if (!student.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact administrator.'
            });
        }

        // Verify password
        const isPasswordValid = await student.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last active date
        student.learningStats.lastActiveDate = new Date();
        await student.save();

        // Generate token
        const token = generateToken(student._id);

        logger.info(`Student logged in: ${student.studentId}`);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                student: {
                    id: student._id,
                    studentId: student.studentId,
                    name: student.name,
                    email: student.email,
                    semester: student.semester,
                    department: student.department,
                    role: student.role,
                    preferredLanguage: student.preferredLanguage
                },
                token
            }
        });

    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

/**
 * Get current logged-in student
 */
exports.getMe = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: student
        });

    } catch (error) {
        logger.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get student data',
            error: error.message
        });
    }
};

/**
 * Update student profile
 */
exports.updateProfile = async (req, res) => {
    try {
        const allowedUpdates = ['name', 'phone', 'preferredLanguage', 'parentEmail'];
        const updates = {};

        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        const student = await Student.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: student
        });

    } catch (error) {
        logger.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
};

/**
 * Change password
 */
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        const student = await Student.findById(req.user.id).select('+password');

        // Verify current password
        const isPasswordValid = await student.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        student.password = newPassword;
        await student.save();

        logger.info(`Password changed for student: ${student.studentId}`);

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        logger.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password',
            error: error.message
        });
    }
};

module.exports = exports;
