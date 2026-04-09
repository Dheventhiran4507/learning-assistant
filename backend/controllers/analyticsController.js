const Student = require('../models/Student');
const Practice = require('../models/Practice');
const Syllabus = require('../models/Syllabus');
const logger = require('../utils/logger');

// Get stats for HOD/Admin dashboard
exports.getHODStats = async (req, res) => {
    try {
        const { semester } = req.query;
        let query = { role: 'student' };

        // Role-based filtering
        if (req.user.role === 'advisor' || req.user.role === 'staff') {
            // Advisors and Staff only see their assigned semester
            query.semester = req.user.semester;
        } else if (semester) {
            // HOD/Admin can filter by semester if provided
            query.semester = parseInt(semester);
        }

        const students = await Student.find(query)
            .select('name studentId role semester learningStats subjectProgress weakAreas examPredictions');

        if (!students || students.length === 0) {
            return res.json({
                success: true,
                data: {
                    students: [],
                    batchMetrics: {
                        avgProgress: 0,
                        totalDoubts: 0,
                        totalStudents: 0
                    }
                }
            });
        }

        // Calculate batch-wide metrics
        let totalProgress = 0;
        let totalDoubts = 0;

        const formattedStudents = students.map(student => {
            const progress = student.learningStats?.syllabusProgress || 0;
            const doubts = student.learningStats?.totalDoubtsCleared || 0;

            totalProgress += progress;
            totalDoubts += doubts;

            return {
                _id: student._id,
                name: student.name,
                studentId: student.studentId,
                semester: student.semester,
                progress,
                doubts,
                subjectProgress: student.subjectProgress || [],
                predictedScore: student.examPredictions?.[0]?.predictedScore || 
                               Student.calculatePredictedScore({
                                   totalPracticeHours: student.learningStats?.totalPracticeHours || 0,
                                   syllabusProgress: progress,
                                   weakAreasResolved: student.weakAreas?.filter(w => w.resolved).length || 0,
                                   totalDoubtsCleared: doubts
                               }),
                weakAreasCount: student.weakAreas?.length || 0
            };
        });

        const batchMetrics = {
            avgProgress: Math.round(totalProgress / students.length),
            totalDoubts,
            totalStudents: students.length
        };

        res.json({
            success: true,
            data: {
                students: formattedStudents,
                batchMetrics
            }
        });

    } catch (error) {
        logger.error('Error fetching HOD stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch HOD statistics',
            error: error.message
        });
    }
};

// Get all staff (advisors and subject staff) for HOD/Admin
exports.getStaff = async (req, res) => {
    try {
        const query = { role: { $in: ['advisor', 'staff'] } };
        
        // Advisors only see staff in their assigned semester
        if (req.user.role === 'advisor') {
            query.semester = req.user.semester;
        }

        const staff = await Student.find(query)
            .select('name email role semester isActive studentId subjectsHandled staffPasswordHint');

        res.json({
            success: true,
            data: staff
        });
    } catch (error) {
        logger.error('Error fetching staff:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch staff data',
            error: error.message
        });
    }
};

// Get personal analytics for a student (filtered by semester)
exports.getStudentAnalytics = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const currentSemester = student.semester;

        // 1. Fetch all subjects for the student's current semester
        const subjects = await Syllabus.find({ semester: currentSemester, isActive: true })
            .select('subjectCode subjectName units');

        // 2. Aggregate practice performance for these subjects
        const analyticsData = await Promise.all(subjects.map(async (subject) => {
            const sessions = await Practice.find({
                student: req.user.id,
                'subject.subjectCode': subject.subjectCode,
                status: 'completed'
            });

            let totalAccuracy = 0;
            let totalTime = 0;
            let totalQuestions = 0;

            sessions.forEach(session => {
                totalAccuracy += session.stats.accuracy || 0;
                totalTime += session.stats.totalTimeTaken || 0;
                totalQuestions += session.stats.totalQuestions || 0;
            });

            const avgAccuracy = sessions.length > 0 ? Math.round(totalAccuracy / sessions.length) : 0;
            const avgTimePerQuestion = totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : 0;

            return {
                subjectCode: subject.subjectCode,
                subjectName: subject.subjectName,
                avgAccuracy,
                totalTimeSpent: totalTime,
                avgSpeed: avgTimePerQuestion, // seconds per question
                totalSessions: sessions.length,
                performanceLevel: avgAccuracy >= 80 ? 'Excellent' : avgAccuracy >= 60 ? 'Good' : avgAccuracy >= 40 ? 'Average' : sessions.length > 0 ? 'Needs Improvement' : 'Not Started'
            };
        }));

        res.json({
            success: true,
            data: {
                semester: currentSemester,
                subjects: analyticsData,
                overallMetrics: {
                    totalPracticeTime: analyticsData.reduce((sum, s) => sum + s.totalTimeSpent, 0),
                    averageSemesterAccuracy: analyticsData.length > 0 ? Math.round(analyticsData.reduce((sum, s) => sum + s.avgAccuracy, 0) / analyticsData.length) : 0
                }
            }
        });

    } catch (error) {
        logger.error('Error fetching student analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics',
            error: error.message
        });
    }
};

