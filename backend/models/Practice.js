const mongoose = require('mongoose');

const practiceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        index: true
    },

    // Practice Session Info
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    subject: {
        subjectCode: {
            type: String,
            required: true
        },
        subjectName: String
    },

    // Practice Type
    practiceType: {
        type: String,
        enum: ['weak_area', 'full_syllabus', 'unit_based', 'exam_simulation', 'custom', 'topic_based'],
        default: 'weak_area'
    },

    // Questions and Answers
    questions: [{
        questionId: String,
        question: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['mcq', 'short_answer', 'long_answer', 'code'],
            default: 'mcq'
        },
        options: [String], // for MCQs
        correctAnswer: String,
        topic: String,
        unit: Number,
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard']
        },
        marks: Number,

        // Student's response
        userAnswer: String,
        isCorrect: Boolean,
        timeTaken: Number, // in seconds
        attemptNumber: {
            type: Number,
            default: 1
        },

        // AI Feedback
        aiFeedback: {
            explanation: String,
            hints: [String],
            relatedTopics: [String]
        }
    }],

    // Session Statistics
    stats: {
        totalQuestions: {
            type: Number,
            default: 0
        },
        correctAnswers: {
            type: Number,
            default: 0
        },
        incorrectAnswers: {
            type: Number,
            default: 0
        },
        skippedQuestions: {
            type: Number,
            default: 0
        },
        accuracy: {
            type: Number,
            default: 0
        },
        totalTimeTaken: {
            type: Number,
            default: 0
        },
        averageTimePerQuestion: {
            type: Number,
            default: 0
        }
    },

    // Performance Analysis
    performance: {
        topicWiseScore: [{
            topic: String,
            correct: Number,
            total: Number,
            percentage: Number
        }],
        difficultyWiseScore: [{
            difficulty: String,
            correct: Number,
            total: Number,
            percentage: Number
        }],
        recommendedTopics: [String]
    },

    // Session Status
    status: {
        type: String,
        enum: ['in_progress', 'completed', 'abandoned'],
        default: 'in_progress'
    },

    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date,

    // Score and Grade
    totalScore: Number,
    maxScore: Number,
    percentageScore: Number,
    grade: {
        type: String,
        enum: ['A+', 'A', 'B+', 'B', 'C', 'D', 'F']
    }
}, {
    timestamps: true
});

// Indexes
practiceSchema.index({ student: 1, createdAt: -1 });
practiceSchema.index({ 'subject.subjectCode': 1 });

// Calculate statistics before saving
practiceSchema.pre('save', function (next) {
    if (this.questions.length > 0) {
        const total = this.questions.length;
        const correct = this.questions.filter(q => q.isCorrect === true).length;
        const incorrect = this.questions.filter(q => q.isCorrect === false).length;
        const skipped = total - correct - incorrect;

        this.stats.totalQuestions = total;
        this.stats.correctAnswers = correct;
        this.stats.incorrectAnswers = incorrect;
        this.stats.skippedQuestions = skipped;
        this.stats.accuracy = total > 0 ? (correct / total) * 100 : 0;

        const totalTime = this.questions.reduce((sum, q) => sum + (q.timeTaken || 0), 0);
        this.stats.totalTimeTaken = totalTime;
        this.stats.averageTimePerQuestion = total > 0 ? totalTime / total : 0;

        // Calculate grade
        const percentage = this.stats.accuracy;
        if (percentage >= 90) this.grade = 'A+';
        else if (percentage >= 80) this.grade = 'A';
        else if (percentage >= 70) this.grade = 'B+';
        else if (percentage >= 60) this.grade = 'B';
        else if (percentage >= 50) this.grade = 'C';
        else if (percentage >= 40) this.grade = 'D';
        else this.grade = 'F';
    }
    next();
});

// Static method to get student's practice history
practiceSchema.statics.getStudentHistory = async function (studentId, limit = 20) {
    return await this.find({ student: studentId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('-questions.aiFeedback');
};

// Static method to get weak topics
practiceSchema.statics.identifyWeakTopics = async function (studentId, threshold = 50) {
    const sessions = await this.find({ student: studentId });

    const topicScores = {};

    sessions.forEach(session => {
        session.questions.forEach(q => {
            if (q.topic) {
                if (!topicScores[q.topic]) {
                    topicScores[q.topic] = { correct: 0, total: 0 };
                }
                topicScores[q.topic].total++;
                if (q.isCorrect) {
                    topicScores[q.topic].correct++;
                }
            }
        });
    });

    const weakTopics = [];
    for (const [topic, scores] of Object.entries(topicScores)) {
        const percentage = (scores.correct / scores.total) * 100;
        if (percentage < threshold) {
            weakTopics.push({
                topic,
                score: Math.round(percentage),
                attempts: scores.total
            });
        }
    }

    return weakTopics.sort((a, b) => a.score - b.score);
};

const Practice = mongoose.model('Practice', practiceSchema);

module.exports = Practice;
