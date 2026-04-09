import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
    CpuChipIcon, 
    ClipboardDocumentCheckIcon, 
    ClockIcon,
    ChevronRightIcon,
    AcademicCapIcon,
    XMarkIcon,
    CheckCircleIcon,
    DocumentMagnifyingGlassIcon,
    LightBulbIcon,
} from '@heroicons/react/24/outline';
import { useSecurityLock } from '../hooks/useSecurityLock';
import SecurityLock from '../components/common/SecurityLock';
import './StudentPostLabPage.css'; // Import the new CSS

const StudentPostLabPage = () => {
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLab, setSelectedLab] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [reviewResult, setReviewResult] = useState(null);
    const [loadingReview, setLoadingReview] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);

    // Anti-Cheat / Page Lock State
    const MAX_VIOLATIONS = 1;
    const [tabSwitchCount, setTabSwitchCount] = useState(0);

    const fetchReview = async (submissionId) => {
        setLoadingReview(true);
        try {
            const response = await api.get(`/lab/submission/${submissionId}`);
            if (response.data.success) {
                setReviewResult(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load review details');
        } finally {
            setLoadingReview(false);
        }
    };

    const fetchLabs = async () => {
        try {
            const response = await api.get('/lab/active?type=post-lab');
            if (response.data.success) {
                setLabs(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load post-labs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLabs();
    }, []);

    // 1. Unified Security Lock
    const { violationCount } = useSecurityLock(
        !!selectedLab && !result,
        () => {
            setTabSwitchCount(prev => {
                const next = prev + 1;
                if (next >= MAX_VIOLATIONS) {
                    submitQuiz(true); // Auto-submit on violation
                    toast.error('❌ Assessment integrity violated! Submitting.');
                }
                return next;
            });
        }
    );

    const startQuiz = async (lab) => {
        try {
            // GLOBAL TIMING: Check if assessment is already expired
            const expiresAt = new Date(lab.createdAt).getTime() + (lab.duration * 60 * 1000);
            const remaining = Math.floor((expiresAt - Date.now()) / 1000);

            if (remaining <= 0) {
                return toast.error('❌ This assessment has closed (Deadline passed).');
            }

            // Explicitly request lock (User Gesture)
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen().catch(() => {
                    toast.error('❌ Fullscreen required to start assessment.');
                    throw new Error('Lock failure');
                });
            }
            setSelectedLab(lab);
            setCurrentQuestion(0);
            setAnswers(new Array(lab.questions.length).fill(null));
            setResult(null);
            setTimeLeft(remaining); // Use global remaining time instead of student-specific timer
        } catch (err) {
            console.error('Quiz start lock failure:', err);
        }
    };

    useEffect(() => {
        let timer;
        if (selectedLab && !result && timeLeft !== null && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && !result && selectedLab) {
            submitQuiz(true);
        }
        return () => clearInterval(timer);
    }, [selectedLab, timeLeft, result]);

    const formatTime = (seconds) => {
        if (seconds === null) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelection = (option) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = option;
        setAnswers(newAnswers);
    };

    const submitQuiz = async (isAutoSubmit = false) => {
        if (!isAutoSubmit && answers.includes(null)) {
            return toast.error('Please answer all questions before submitting.');
        }

        setIsSubmitting(true);
        try {
            const formattedAnswers = answers.map((ans, idx) => ({
                questionIndex: idx,
                selectedAnswer: ans || '', // Ensure empty string if null
                timeTaken: 0 
            }));

            const response = await api.post('/lab/submit', {
                assessmentId: selectedLab._id,
                answers: formattedAnswers
            });

            if (response.data.success) {
                setResult(response.data.data);
                toast.success('Assessment completed!');
                fetchLabs(); 
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-view">
                <div className="loading-spinner"></div>
                <p className="no-labs-text loading-small">Loading Post-Labs...</p>
            </div>
        );
    }

    return (
        <div className="postlab-container">
            <SecurityLock isActive={!!selectedLab && !result} title={selectedLab?.title} />
            <header className="postlab-header">
                <div className="postlab-header-content">
                    <div className="postlab-icon-box">
                        <CpuChipIcon className="postlab-icon" />
                    </div>
                    <div>
                        <h1 className="postlab-title">Post-Lab <span>Assessments</span></h1>
                        <p className="postlab-subtitle">Test your learning outcomes after the practical experiment.</p>
                    </div>
                </div>
            </header>

            {labs.length === 0 ? (
                <div className="no-labs-card">
                    <AcademicCapIcon className="no-labs-icon" />
                    <p className="no-labs-text">No post-labs assigned for your semester yet.</p>
                </div>
            ) : (
                <div className="labs-grid">
                    {labs.map((lab) => (
                        <motion.div
                            key={lab._id}
                            whileHover={{ y: -5 }}
                            className="lab-card"
                        >
                            {lab.isCompleted && (
                                <div className="completed-icon">
                                    <ClipboardDocumentCheckIcon className="completed-check-icon" />
                                </div>
                            )}

                            <div className="lab-meta">
                                <span className="subject-code-tag">{lab.subjectCode}</span>
                                <span className="question-count-text">{lab.questions.length} Questions</span>
                            </div>

                            <h3 className="lab-title">{lab.title}</h3>
                            <p className="lab-desc">{lab.description || 'Evaluate your understanding of the lab session and data results.'}</p>

                            <div className="lab-card-footer">
                                {lab.isCompleted ? (
                                    <div className="score-display">
                                        <div className="lab-card-meta-inner">
                                            <span className="lab-subject-tag">{lab.subjectCode}</span>
                                            <span className="lab-sem-tag">Semester {lab.semester}</span>
                                        </div>
                                        <button 
                                            onClick={() => fetchReview(lab.submission._id)}
                                            className="review-btn review-btn-spaced"
                                        >
                                            <DocumentMagnifyingGlassIcon className="review-btn-icon" />
                                            Review Answers
                                        </button>
                                    </div>
                                ) : (
                                    // Check for global expiry
                                    (new Date(lab.createdAt).getTime() + (lab.duration * 60 * 1000) < Date.now()) ? (
                                        <div className="closed-badge">
                                            <XMarkIcon className="closed-badge-icon" /> Assessment Closed
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => startQuiz(lab)}
                                            className="start-quiz-btn"
                                        >
                                            Start Quiz <ChevronRightIcon className="start-quiz-icon" />
                                        </button>
                                    )
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Quiz Modal */}
            <AnimatePresence mode="wait">
                {selectedLab && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="modal-content"
                        >
                            {!result ? (
                                <div className="quiz-padding">
                                    {/* Progress Header */}
                                    <div className="quiz-header">
                                        <div className="question-status">
                                            <div className="question-number-badge">
                                                {currentQuestion + 1}
                                            </div>
                                            <div className="question-info">
                                                <div className="question-info-header">
                                                    <p className="question-count-text-clean">Question {currentQuestion + 1} of {selectedLab.questions.length}</p>
                                                    <div className={`timer-badge ${timeLeft < 60 ? 'warning' : 'normal'}`}>
                                                        <ClockIcon className="timer-icon" />
                                                        {formatTime(timeLeft)}
                                                    </div>
                                                </div>
                                                <div className="quiz-progress-bar">
                                                    <motion.div 
                                                        className={`quiz-progress-fill ${timeLeft < 60 ? 'warning' : 'normal'}`}
                                                        style={{ width: `${((currentQuestion + 1) / selectedLab.questions.length) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => setSelectedLab(null)} className="modal-close-btn">
                                            <XMarkIcon className="modal-close-icon" />
                                        </button>
                                    </div>

                                    {/* Question */}
                                    <h2 className="question-text">
                                        {selectedLab.questions[currentQuestion].question}
                                    </h2>

                                    {/* Options */}
                                    <div className="options-list">
                                        {selectedLab.questions[currentQuestion].options.map((option, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleAnswerSelection(option)}
                                                className={`option-btn ${answers[currentQuestion] === option ? 'selected' : 'unselected'}`}
                                            >
                                                <span className={`option-text ${answers[currentQuestion] === option ? 'selected' : 'unselected'}`}>
                                                    {option}
                                                </span>
                                                <div className={`option-radio ${answers[currentQuestion] === option ? 'selected' : 'unselected'}`} />
                                            </button>
                                        ))}
                                    </div>

                                    {/* Navigation */}
                                    <div className="quiz-nav">
                                        <button
                                            disabled={currentQuestion === 0}
                                            onClick={() => setCurrentQuestion(prev => prev - 1)}
                                            className="nav-back-btn"
                                        >
                                            Back
                                        </button>
                                        
                                        {currentQuestion === selectedLab.questions.length - 1 ? (
                                            <button
                                                disabled={isSubmitting}
                                                onClick={submitQuiz}
                                                className="nav-finish-btn"
                                            >
                                                {isSubmitting ? 'Submitting...' : 'Finish Assessment'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setCurrentQuestion(prev => prev + 1)}
                                                className="nav-next-btn"
                                            >
                                                Next Question
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="result-view">
                                    <div className="result-icon-box">
                                        <ClipboardDocumentCheckIcon className="result-check-icon" />
                                    </div>
                                    <h2 className="result-title">Great Work!</h2>
                                    <p className="result-subtitle">You've successfully completed the post-lab assessment.</p>
                                    
                                    <div className="result-stats-grid">
                                        <div>
                                            <p className="result-stat-label">Score</p>
                                            <p className="result-stat-value">{result.score}/{result.total}</p>
                                        </div>
                                        <div>
                                            <p className="result-stat-label">Result</p>
                                            <p className="result-stat-value percent">{result.percentage.toFixed(0)}%</p>
                                        </div>
                                    </div>

                                    <div className="result-actions">
                                        <button
                                            onClick={() => {
                                                const subId = result._id;
                                                setSelectedLab(null);
                                                fetchReview(subId);
                                            }}
                                            className="nav-next-btn full-width-btn"
                                        >
                                            Review My Answers
                                        </button>
                                        <button
                                            onClick={() => setSelectedLab(null)}
                                            className="nav-finish-btn full-width-btn"
                                        >
                                            Close Portal
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Review Modal */}
            <AnimatePresence>
                {reviewResult && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="review-overlay"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="review-modal"
                        >
                            <div className="review-header">
                                <div>
                                    <h3 className="postlab-title-small">Your Response Analysis</h3>
                                    <p className="proficiency-label-sidebar">Assessment Results: {reviewResult.percentage.toFixed(0)}% Correct</p>
                                </div>
                                <button onClick={() => setReviewResult(null)} className="modal-close-btn">
                                    <XMarkIcon className="modal-close-icon" />
                                </button>
                            </div>

                            <div className="review-body custom-scrollbar">
                                {reviewResult.assessment.questions.map((q, idx) => {
                                    const studentAns = reviewResult.answers.find(a => a.questionIndex === idx);
                                    return (
                                        <div key={idx} className={`review-question-card ${studentAns?.isCorrect ? 'correct' : 'incorrect'}`}>
                                            <div className="review-q-header">
                                                <h4 className="review-q-text">
                                                    <span className={`review-q-number ${studentAns?.isCorrect ? 'correct' : 'incorrect'}`}>Q{idx + 1}.</span>
                                                    {q.question}
                                                </h4>
                                                <div className={`review-q-icon ${studentAns?.isCorrect ? 'correct' : 'incorrect'}`}>
                                                    {studentAns?.isCorrect ? <CheckCircleIcon className="review-icon-small" /> : <XMarkIcon className="review-icon-small" />}
                                                </div>
                                            </div>
                                            
                                            <div className="review-answers-grid">
                                                <div>
                                                    <p className="result-stat-label">Your Choice</p>
                                                    <p className={`student-answer-text ${studentAns?.isCorrect ? 'correct' : 'incorrect'}`}>
                                                        {studentAns?.selectedAnswer || 'Skipped'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="result-stat-label">Correct Answer</p>
                                                    <p className="correct-answer-text">{q.correctAnswer}</p>
                                                </div>
                                            </div>

                                            {(q.explanation || studentAns?.isCorrect === false) && (
                                                <div className="explanation-box">
                                                    <p className="explanation-label">
                                                        <LightBulbIcon className="explanation-icon" />
                                                        Insights
                                                    </p>
                                                    <p className="explanation-text">{q.explanation || 'Review the lab session results for detailed conceptual understanding.'}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="review-footer">
                                <button 
                                    onClick={() => setReviewResult(null)}
                                    className="nav-finish-btn review-finish-btn"
                                >
                                    Finish Review
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentPostLabPage;
