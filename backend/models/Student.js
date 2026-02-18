const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
    // Personal Information
    studentId: {
        type: String,
        required: [true, 'Student ID is required'],
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false
    },
    phone: {
        type: String,
        match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    
    // Academic Information
    department: {
        type: String,
        required: true,
        default: 'Computer Science Engineering'
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },
    batch: {
        type: String,
        required: true
    },
    college: {
        type: String,
        required: true
    },
    rollNumber: String,
    
    // Language Preferences
    preferredLanguage: {
        type: String,
        enum: ['en', 'ta', 'mixed'],
        default: 'mixed'
    },
    
    // Learning Statistics
    learningStats: {
        totalDoubtsCleared: {
            type: Number,
            default: 0
        },
        totalPracticeHours: {
            type: Number,
            default: 0
        },
        syllabusProgress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        averageResponseTime: {
            type: Number,
            default: 0
        },
        lastActiveDate: {
            type: Date,
            default: Date.now
        }
    },
    
    // Subject Progress
    subjectProgress: [{
        subjectCode: {
            type: String,
            required: true
        },
        subjectName: String,
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        topicsCompleted: [String],
        weakTopics: [{
            topic: String,
            score: Number,
            attempts: Number
        }],
        lastPracticed: Date
    }],
    
    // Weak Areas
    weakAreas: [{
        topic: {
            type: String,
            required: true
        },
        subject: String,
        score: {
            type: Number,
            min: 0,
            max: 10
        },
        totalAttempts: {
            type: Number,
            default: 0
        },
        lastAttempted: Date,
        resolved: {
            type: Boolean,
            default: false
        }
    }],
    
    // Exam Predictions
    examPredictions: [{
        subject: String,
        predictedScore: Number,
        confidence: Number,
        factors: [{
            factor: String,
            value: String,
            weight: Number
        }],
        generatedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Role & Access
    role: {
        type: String,
        enum: ['student', 'hod', 'parent', 'admin'],
        default: 'student'
    },
    parentEmail: String,
    hodEmail: String,
    
    // Account Status
    isActive: {
        type: Boolean,
        default: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
studentSchema.index({ studentId: 1, email: 1 });
studentSchema.index({ 'learningStats.lastActiveDate': -1 });

// Hash password before saving
studentSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
studentSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
studentSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    delete obj.passwordResetToken;
    delete obj.emailVerificationToken;
    return obj;
};

// Static method to calculate predicted score
studentSchema.statics.calculatePredictedScore = function(studentData) {
    const {
        totalPracticeHours,
        syllabusProgress,
        weakAreasResolved,
        totalDoubtsCleared
    } = studentData;
    
    // Weighted formula
    const score = (
        (totalPracticeHours * 0.3) +
        (syllabusProgress * 0.4) +
        (weakAreasResolved * 0.2) +
        (Math.min(totalDoubtsCleared / 10, 10) * 0.1)
    );
    
    return Math.min(Math.round(score), 100);
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
