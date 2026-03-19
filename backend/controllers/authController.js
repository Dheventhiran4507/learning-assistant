const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { verifyGmail } = require('../utils/emailVerifier');
const Syllabus = require('../models/Syllabus');
const { syllabusData } = require('../scripts/seed/seedDatabase');
const { sendAccountCreatedEmail, sendLoginNotificationEmail } = require('../utils/emailService');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

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

        const cleanEmail = email ? email.trim().toLowerCase() : '';
        const cleanStudentId = studentId ? studentId.trim() : '';

        // Gmail Verification (Skip if disabled in .env)
        if (process.env.REQUIRE_GMAIL_VERIFICATION !== 'false') {
            try {
                await verifyGmail(email, password);
            } catch (verifyError) {
                return res.status(401).json({
                    success: false,
                    message: verifyError.message
                });
            }
        } else {
            logger.info(`Gmail verification skipped for ${email} (REQUIRE_GMAIL_VERIFICATION=false)`);
        }

        // Check if student already exists
        const existingStudent = await Student.findOne({
            $or: [{ email: cleanEmail }, { studentId: cleanStudentId }]
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

        // Search by email or studentId (Case-insensitive email)
        const identifier = email ? email.trim().toLowerCase() : '';
        const rawIdentifier = email ? email.trim() : '';

        // DEBUG LOG: Show exact bytes to catch hidden characters
        if (email) {
            const hex = Buffer.from(email).toString('hex');
            logger.info(`Login attempt identifier: "${email}" (Length: ${email.length}, Hex: ${hex})`);
            logger.info(`Normalized identifier: "${identifier}" (Length: ${identifier.length})`);
        }
        
        const student = await Student.findOne({
            $or: [
                { email: identifier },
                { studentId: rawIdentifier } 
            ]
        }).select('+password');

        if (!student) {
            logger.warn(`Login failed: User not found - ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is active
        if (!student.isActive) {
            logger.warn(`Login failed: Account deactivated - ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact administrator.'
            });
        }

        // Block login for students whose email is not verified (dummy email accounts)
        if (student.role === 'student' && !student.isEmailVerified) {
            logger.warn(`Login blocked: Unverified email account - ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Your account email is not verified. Please contact your institution staff to update your account with a valid email ID.'
            });
        }

        // Verify password
        const isPasswordValid = await student.comparePassword(password);

        if (!isPasswordValid) {
            logger.warn(`Login failed: Invalid password - ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify with Gmail SMTP to ensure "original" password is used (Skip if disabled in .env)
        if (email.toLowerCase().endsWith('@gmail.com') && process.env.REQUIRE_GMAIL_VERIFICATION !== 'false') {
            try {
                await verifyGmail(email, password);
            } catch (verifyError) {
                return res.status(401).json({
                    success: false,
                    message: verifyError.message
                });
            }
        } else if (email.toLowerCase().endsWith('@gmail.com')) {
            logger.info(`Gmail verification skipped for login: ${email}`);
        }

        // Update last active date
        student.learningStats.lastActiveDate = new Date();
        await student.save();

        // Generate token
        const token = generateToken(student._id);

        // Send login notification email (non-blocking)
        const userAgent = req.headers['user-agent'] || '';
        sendLoginNotificationEmail(student.email, student.name, new Date(), userAgent);

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
        logger.error('Login error details:', error);
        
        // Provide specific error info even in production for debugging the current live issue
        const errorMessage = error.name === 'ValidationError' 
            ? `Validation failed: ${Object.values(error.errors).map(e => e.message).join(', ')}`
            : error.message;

        res.status(500).json({
            success: false,
            message: 'Login failed due to a server error',
            error: errorMessage
        });
    }
};

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

/**
 * Manage user account (Admins/HODs manage staff and students, Advisors manage students)
 */
exports.manageAccount = async (req, res) => {
    try {
        const {
            id,
            email,
            password,
            name,
            studentId,
            semester,
            role,
            batch,
            college,
            department
        } = req.body;

        // Validation
        if (!email || !name || !studentId) {
            return res.status(400).json({
                success: false,
                message: 'Email, Name, and Student ID are required'
            });
        }

        // Role-based security
        const targetRole = role || 'student';

        if (req.user.role === 'advisor') {
            if (targetRole !== 'student') {
                return res.status(403).json({
                    success: false,
                    message: 'Advisors can only manage student accounts'
                });
            }
            if (parseInt(semester) !== req.user.semester) {
                return res.status(403).json({
                    success: false,
                    message: `As an advisor, you can only manage students in Semester ${req.user.semester}`
                });
            }
        }

        // Find existing or create new
        let userAccount;
        if (id) {
            userAccount = await Student.findById(id);
        } else {
            userAccount = await Student.findOne({ email });
        }

        if (userAccount) {
            // Check if email is being changed and if new email is taken
            if (email !== userAccount.email) {
                const emailInUse = await Student.findOne({ email });
                if (emailInUse) {
                    return res.status(400).json({
                        success: false,
                        message: 'New email is already in use by another account'
                    });
                }
            }

            userAccount.email = email;
            userAccount.name = name;
            userAccount.studentId = studentId;
            userAccount.semester = semester;
            userAccount.role = targetRole;
            userAccount.batch = batch || userAccount.batch;
            userAccount.college = college || userAccount.college;
            userAccount.department = department || userAccount.department;

            if (password) {
                userAccount.password = password;
            }

            await userAccount.save();
            logger.info(`${targetRole} updated by ${req.user.role}: ${email}`);
        } else {
            // Only @gmail.com allowed for students
            if (targetRole === 'student' && !email.toLowerCase().endsWith('@gmail.com')) {
                return res.status(400).json({
                    success: false,
                    message: 'Only @gmail.com addresses are allowed for student accounts.'
                });
            }

            const plainPassword = password || 'Welcome123';

            userAccount = await Student.create({
                email,
                password: plainPassword,
                name,
                studentId,
                semester,
                batch: batch || (targetRole === 'student' ? 'Batch 2024' : 'STAFF'),
                college: college || 'Anna University',
                department: department || 'Computer Science Engineering',
                role: targetRole,
                isActive: true,
                isEmailVerified: true  // Staff vouches for the email
            });
            logger.info(`New ${targetRole} created by ${req.user.role}: ${email}`);

            // Send credentials email (non-blocking)
            if (['student', 'advisor', 'hod'].includes(targetRole)) {
                sendAccountCreatedEmail(email, name, plainPassword).catch(err => {
                    logger.warn(`Credentials email failed for ${email}: ${err.message}`);
                });
            }
        }

        res.status(200).json({
            success: true,
            message: userAccount.isNew ? `${targetRole} created successfully` : `${targetRole} updated successfully`,
            data: userAccount
        });

    } catch (error) {
        logger.error('Manage account error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to manage account',
            error: error.message
        });
    }
};

/**
 * Check if system is initialized (has at least one admin/hod)
 */
exports.getSystemStatus = async (req, res) => {
    try {
        const adminCount = await Student.countDocuments({ 
            role: { $in: ['admin', 'hod'] } 
        });

        res.status(200).json({
            success: true,
            initialized: adminCount > 0,
            adminCount
        });
    } catch (error) {
        logger.error('Get system status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check system status'
        });
    }
};

/**
 * Setup first admin account
 */
exports.setupInitialAdmin = async (req, res) => {
    try {
        // 1. Check if ANY admin already exists
        const adminExists = await Student.findOne({ 
            role: { $in: ['admin', 'hod'] } 
        });

        if (adminExists) {
            return res.status(403).json({
                success: false,
                message: 'System is already initialized. Standard registration must be used.'
            });
        }

        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, Email, and Password are required for setup'
            });
        }

        // 2. Create the root admin
        const admin = await Student.create({
            studentId: 'ROOT_ADMIN',
            name,
            email: email.toLowerCase(),
            password,
            phone: phone || '0000000000',
            role: 'admin',
            department: 'Institutional Administration',
            semester: 1,
            batch: 'STAFF',
            college: 'Anna University', // Default, can be changed later
            isActive: true,
            isEmailVerified: true
        });

        logger.info(`Root Admin successfully created: ${email}`);

        res.status(201).json({
            success: true,
            message: 'Root Admin account created successfully. You can now login.',
            data: {
                id: admin._id,
                name: admin.name,
                email: admin.email
            }
        });

    } catch (error) {
        logger.error('Initial setup error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete initial setup',
            error: error.message
        });
    }
};

/**
 * Seed initial syllabus data from the seed script
 */
exports.seedSyllabus = async (req, res) => {
    try {
        // Prevent if syllabus already exists
        const syllabusCount = await Syllabus.countDocuments();
        if (syllabusCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Syllabus is already populated.'
            });
        }

        if (!syllabusData || syllabusData.length === 0) {
            return res.status(500).json({
                success: false,
                message: 'No syllabus data found in seed script.'
            });
        }

        logger.info(`Seeding ${syllabusData.length} subjects from setup portal...`);
        await Syllabus.insertMany(syllabusData);

        res.status(200).json({
            success: true,
            message: `Successfully imported ${syllabusData.length} subjects.`
        });
    } catch (error) {
        logger.error('Seed syllabus error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to seed syllabus data',
            error: error.message
        });
    }
};

/**
 * Delete a student or staff account
 */
exports.deleteAccount = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the user
        const userToDelete = await Student.findById(id);

        if (!userToDelete) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }

        // Security Checks
        // 1. Prevent self-deletion
        if (id === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        // 2. Prevent deleting the very first admin (safety net)
        // If the user to delete is an admin, check if it's the only one 
        // or a protected one? Let's just check if it's the current user's role 
        // trying to delete another admin/hod.
        if (userToDelete.role === 'admin' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only super admins can delete admin accounts'
            });
        }

        await Student.findByIdAndDelete(id);

        logger.info(`Account deleted by ${req.user.role} (${req.user.email}): ${userToDelete.email}`);

        res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });

    } catch (error) {
        logger.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete account',
            error: error.message
        });
    }
};

module.exports = exports;
