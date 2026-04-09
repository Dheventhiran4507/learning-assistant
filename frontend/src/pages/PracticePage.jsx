import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import MathRenderer from '../components/common/MathRenderer';
import {
    AcademicCapIcon,
    LightBulbIcon,
    ClockIcon,
    CheckCircleIcon,
    XMarkIcon,
    ArrowRightIcon,
    BeakerIcon,
    GlobeAltIcon,
    ArrowPathIcon,
    SparklesIcon,
    ExclamationTriangleIcon,
    ShieldExclamationIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';
import { useSecurityLock } from '../hooks/useSecurityLock';
import SecurityLock from '../components/common/SecurityLock';
import './PracticePage.css'; // Added CSS import

export default function PracticePage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const subjectParam = searchParams.get('subject');
    const unitParam = searchParams.get('unit');
    const topicParam = searchParams.get('topic');
    const difficultyParam = searchParams.get('difficulty');

    const [subjects, setSubjects] = useState([]);
    const [hasAttemptedAutoStart, setHasAttemptedAutoStart] = useState(false);

    // Selection State
    const [selectedSubject, setSelectedSubject] = useState(subjectParam || '');
    const [selectedUnit, setSelectedUnit] = useState(unitParam || null);
    const [selectedTopic, setSelectedTopic] = useState(topicParam || null);

    // Data State
    const [currentSyllabus, setCurrentSyllabus] = useState(null);
    const [units, setUnits] = useState([]);
    const [topics, setTopics] = useState([]);

    // Practice State
    const [session, setSession] = useState(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [userAnswer, setUserAnswer] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [startTime, setStartTime] = useState(Date.now());
    const [visibleTimer, setVisibleTimer] = useState(0);

    // Anti-Cheat Focus Lock State
    const MAX_VIOLATIONS = 1;
    const [tabSwitchCount, setTabSwitchCount] = useState(0);

    const { user } = useAuthStore();

    // PAGE LOCK: Custom safe navigation that blocks mid-session
    const pendingNavRef = useRef(null);

    const safeNavigate = (to) => {
        if (session) {
            // Silently block navigation during active session instead of showing a confirmation
            console.log('Navigation locked during active session');
            return;
        } else {
            navigate(to);
        }
    };

    useEffect(() => {
        setLoading(true);
        setHasAttemptedAutoStart(false); // Reset auto-start for new params

        const fetchSyllabus = async () => {
            try {
                // Fetch subjects for user's semester
                const response = await api.get(`/syllabus/semester/${user?.semester || 1}`);
                let syllabusData = response.data.success ? response.data.data : [];

                setSubjects(syllabusData);

                // If subject selected, load its details immediately
                if (subjectParam) {
                    const subject = syllabusData.find(s => s.subjectCode === subjectParam);
                    if (subject) {
                        handleSubjectSelect(subject.subjectCode, subject);
                    } else {
                        const subResponse = await api.get(`/syllabus/subject/${subjectParam}`);
                        if (subResponse.data.success) {
                            handleSubjectSelect(subjectParam, subResponse.data.data);
                        }
                    }
                }
            } catch (error) {
                console.error('Syllabus fetch error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSyllabus();
    }, [user?.semester, subjectParam, unitParam, topicParam]); // Added all params dependency

    // Automatically start session if all params are present
    useEffect(() => {
        if (!loading && !session && subjectParam && unitParam && !starting && !hasAttemptedAutoStart) {
            // Only auto-start if we have enough info
            setHasAttemptedAutoStart(true);
            startPractice();
        }
    }, [loading, session, subjectParam, unitParam, starting, hasAttemptedAutoStart]);

    // Question Timer Effect
    useEffect(() => {
        let interval;
        if (session && !submitting && currentQuestion && currentQuestion.isCorrect === null) {
            interval = setInterval(() => {
                setVisibleTimer(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [session, submitting, currentIdx]);

    // Reset violation counters on each new question
    useEffect(() => {
        setTabSwitchCount(0);
    }, [currentIdx]);

    // 1. Unified Security Lock
    const { violationCount } = useSecurityLock(
        !!session && session.status !== 'completed',
        () => toast.error('❌ Assessment integrity check: Please stay focused!')
    );

    // 2. Navigation Blocking handled by useSecurityLock.



    // PAGE LOCK: Block tab-close / URL navigate away - Removed as per user request for strict locking instead
    /*
    useEffect(() => {
        const isReviewMode = session?.status === 'completed';
        if (!session || isReviewMode) return;
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = 'Practice session is active. Are you sure you want to leave?';
            return e.returnValue;
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [session]);
    */

    const handleSubjectSelect = (code, subjectData) => {
        setSelectedSubject(code);
        setCurrentSyllabus(subjectData || subjects.find(s => s.subjectCode === code));
        setSelectedUnit(null);
        setSelectedTopic(null);
    };

    const handleCoverageSelection = (unit) => {
        setSelectedUnit(unit);
        if (unit === 'all') {
            startPracticeWithParams(selectedSubject, 'all', null);
        }
    };

    const handleTopicSelection = (topic) => {
        setSelectedTopic(topic);
        startPracticeWithParams(selectedSubject, selectedUnit, topic);
    };

    const startPracticeWithParams = async (sub, uni, top) => {
        const diff = difficulty || difficultyParam || 'medium';
        if (!sub || !uni) return;

        setStarting(true);
        try {
            // Request Fullscreen on start (User Gesture)
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen().catch(() => {
                    toast.error('❌ Please enable fullscreen to start assessment.');
                    throw new Error('Fullscreen blocked');
                });
            }
            
            const response = await api.post('/practice/start', {
                subjectCode: sub,
                difficulty: diff,
                practiceType: top ? 'topic_based' : 'unit_based',
                unit: uni === 'all' ? null : uni,
                topic: top || null
            });
            if (response.data.success) {
                setSession(response.data.data);
                setCurrentIdx(0);
                setUserAnswer('');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to start practice session';
            toast.error(message);
        } finally {
            setStarting(false);
        }
    };

    // Update units when syllabus changes
    useEffect(() => {
        if (currentSyllabus) {
            setUnits(currentSyllabus.units || []);
        }
    }, [currentSyllabus]);

    // Update topics when unit changes
    useEffect(() => {
        if (selectedUnit && currentSyllabus) {
            const unitData = currentSyllabus.units.find(u => u.unitNumber === parseInt(selectedUnit));
            setTopics(unitData ? unitData.topics : []);
        } else {
            setTopics([]);
        }
    }, [selectedUnit, currentSyllabus]);

    const startPractice = async () => {
        await startPracticeWithParams(selectedSubject || subjectParam, selectedUnit || unitParam, selectedTopic || topicParam);
    };

    const submitAnswer = async (answerOverride) => {
        const finalAnswer = answerOverride !== undefined ? answerOverride : userAnswer;
        if (!finalAnswer && session.questions[currentIdx].type === 'code') {
            return toast.error('Please write some code before submitting');
        }

        setSubmitting(true);
        try {
            const timeTaken = Math.round((Date.now() - startTime) / 1000); // in seconds
            const response = await api.post('/practice/submit', {
                sessionId: session.sessionId,
                questionId: session.questions[currentIdx].questionId,
                userAnswer: finalAnswer,
                timeTaken: timeTaken
            });

            if (response.data.success) {
                const updatedQuestions = [...session.questions];
                updatedQuestions[currentIdx] = {
                    ...updatedQuestions[currentIdx],
                    userAnswer: finalAnswer,
                    isCorrect: response.data.data.isCorrect,
                    aiFeedback: response.data.data.aiFeedback
                };
                setSession({ ...session, questions: updatedQuestions });
            }
        } catch (error) {
            toast.error('Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    const nextQuestion = async () => {
        if (currentIdx < session.questions.length - 1) {
            setCurrentIdx(currentIdx + 1);
            setUserAnswer('');
            setStartTime(Date.now());
            setVisibleTimer(0);
        } else {
            const isReviewMode = session?.status === 'completed';
            if (!isReviewMode) {
                try {
                    // Call complete endpoint to mark session as finished
                    await api.post('/practice/complete', { sessionId: session.sessionId });
                    toast.success('Session Complete! Performance tracked.');
                } catch (err) {
                    console.error('Completion error:', err);
                }
            } else {
                toast.success('Review Complete!');
            }
            setSession(null);
            if (topicParam || unitParam) {
                navigate(-1); // Go back to unit/topic view
            }
        }
    };

    if (loading) return (
        <div className="practice-loading">
            <div className="practice-spinner"></div>
        </div>
    );

    if (!session) {
        return (
            <div className="practice-container">
                <AnimatePresence>
                    {starting && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="practice-session-overlay"
                        >
                            <div className="practice-spinner"></div>
                            <p className="practice-overlay-title">Starting Practice Session...</p>
                            <p className="practice-overlay-text">Preparing questions for you</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="practice-setup-header">
                        <div>
                            <h1 className="practice-title">
                            Practice <span className="practice-title-accent">Hub</span>
                        </h1>
                            <p className="practice-subtitle">Refine your understanding through targeted exercises.</p>
                        </div>
                    </div>

                    <div className="practice-grid">
                        {/* Subject List */}
                        <div className="practice-subject-list">
                            <h2 className="practice-list-title">
                                <span className="practice-step-icon step-icon-indigo">1</span>
                                Select Course
                            </h2>
                            <div className="practice-list-container custom-scrollbar">
                                {subjects.map(s => (
                                    <button
                                        key={s.subjectCode}
                                        onClick={() => handleSubjectSelect(s.subjectCode, s)}
                                        className={`practice-subject-btn ${selectedSubject === s.subjectCode ? 'active' : 'inactive'}`}
                                    >
                                        <div className={`practice-subject-name ${selectedSubject === s.subjectCode ? 'active' : 'inactive'}`}>{s.subjectName}</div>
                                        <div className={`practice-subject-code ${selectedSubject === s.subjectCode ? 'active' : 'inactive'}`}>{s.subjectCode} • Regulation {s.regulation}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Units Grid */}
                        <div className={`practice-coverage-scope ${!selectedSubject ? 'disabled' : ''}`}>
                            <h2 className="practice-list-title">
                                <span className="practice-step-icon step-icon-pink">2</span>
                                Coverage Scope
                            </h2>

                            <div className="practice-coverage-grid">
                                <button
                                    onClick={() => handleCoverageSelection('all')}
                                    className={`practice-coverage-btn group ${selectedUnit === 'all' ? 'all-active' : 'inactive'}`}
                                >
                                    <GlobeAltIcon className="practice-coverage-icon" />
                                    <div className={`practice-coverage-title ${selectedUnit === 'all' ? 'active' : 'inactive'}`}>Comprehensive Study</div>
                                    <div className={`practice-coverage-desc ${selectedUnit === 'all' ? 'active' : 'inactive'}`}>Assess knowledge across all units</div>
                                </button>

                                {units.map((u) => (
                                    <button
                                        key={u.unitNumber}
                                        onClick={() => setSelectedUnit(u.unitNumber)}
                                        className={`practice-coverage-btn group ${selectedUnit === u.unitNumber ? 'unit-active' : 'inactive'}`}
                                    >
                                        <div className={`practice-coverage-number ${selectedUnit === u.unitNumber ? 'active' : 'inactive'}`}>0{u.unitNumber}</div>
                                        <div className={`practice-coverage-title ${selectedUnit === u.unitNumber ? 'active' : 'inactive'}`}>{u.unitTitle}</div>
                                        <div className={`practice-coverage-desc ${selectedUnit === u.unitNumber ? 'active' : 'inactive'}`}>{u.topics?.length || 0} Topics</div>
                                    </button>
                                ))}
                            </div>

                            {/* Topics Selection - Horizontal Scroller */}
                            <AnimatePresence>
                                {selectedUnit && topics.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="practice-topics-container"
                                    >
                                        <h3 className="practice-topics-title">Focus on a specific topic:</h3>
                                        <div className="practice-topics-wrap">
                                            <button
                                                onClick={() => handleTopicSelection(null)}
                                                className={`practice-topic-btn all ${!selectedTopic ? 'active' : 'inactive'}`}
                                            >
                                                All Unit Topics
                                            </button>
                                            {topics.map(t => (
                                                <button
                                                    key={t.topicName}
                                                    onClick={() => handleTopicSelection(t.topicName)}
                                                    className={`practice-topic-btn topic ${selectedTopic === t.topicName ? 'active' : 'inactive'}`}
                                                >
                                                    {t.topicName}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="practice-start-wrapper">
                        <button
                            onClick={startPractice}
                            disabled={!selectedUnit || starting}
                            className={`practice-start-btn ${starting ? 'loading' : ''} ${(!selectedUnit || starting) ? 'disabled' : 'enabled'}`}
                        >
                            {starting ? <ArrowPathIcon className="practice-start-icon-spin" /> : <BeakerIcon className="practice-start-icon" />}
                            {starting ? 'Preparing...' : 'Start Session'}
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // --- PRACTICE SESSION UI ---
    const isReviewMode = session.status === 'completed';
    const currentQuestion = session.questions[currentIdx];
    const isAnswered = currentQuestion.isCorrect !== null;

    return (
        <div 
            className="practice-container"
        >
            <SecurityLock 
                isActive={!!session && session.status !== 'completed'} 
                title={session.subject.subjectName} 
            />
            
            {/* Gated Quiz Content - Only visible if session exists */}
            <AnimatePresence mode="wait">
                {session && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Header */}
            <div className="practice-active-header">
                <div className="practice-header-marker"></div>
                <div>
                    <div className="practice-header-subject">
                        <span className="practice-subject-code-tag">{session.subject.subjectCode}</span>
                        <span className="practice-header-dot"></span>
                        <span>Unit {currentQuestion.unit}</span>
                        {isReviewMode && (
                            <>
                                <span className="practice-header-dot"></span>
                                <span className="practice-review-tag">Review</span>
                            </>
                        )}
                    </div>
                    <h2 className="practice-header-topic">
                        <span>{currentQuestion.topic}</span>
                    </h2>
                </div>
                <div className="practice-header-controls">
                    <div className="practice-timer-container">
                        <div className="practice-timer">
                            <ClockIcon className="practice-timer-icon" />
                            <span className="practice-timer-text">
                                {isReviewMode 
                                    ? `${Math.floor((currentQuestion.timeTaken || 0) / 60)}:${((currentQuestion.timeTaken || 0) % 60).toString().padStart(2, '0')}`
                                    : `${Math.floor(visibleTimer / 60)}:${(visibleTimer % 60).toString().padStart(2, '0')}`
                                }
                            </span>
                        </div>
                        <div className="practice-progress-box">
                            <div className="practice-progress-label">Progress</div>
                            <div className="practice-progress-value">{currentIdx + 1}<span>/{session.questions.length}</span></div>
                        </div>
                    </div>
                    {session.status === 'completed' && (
                        <button
                            onClick={() => setSession(null)}
                            className="practice-close-btn"
                        >
                            <XMarkIcon className="practice-close-icon" />
                        </button>
                    )}
                </div>
            </div>

            <div className="practice-main-grid">
                {/* Question Area */}
                <div className="practice-question-col">
                        <motion.div
                            key={currentQuestion.questionId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="practice-question-card"
                        >
                            <div className="practice-question-blob"></div>

                            <div className="practice-question-text">
                                <h3>
                                    <MathRenderer content={currentQuestion.question} />
                                </h3>
                            </div>

                        <div className="practice-options-list">
                            {currentQuestion.options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => !isAnswered && submitAnswer(opt)}
                                    disabled={isAnswered || submitting}
                                    className={`practice-option-btn group ${isAnswered
                                        ? opt === currentQuestion.userAnswer
                                            ? currentQuestion.isCorrect
                                                ? 'correct-selected'
                                                : 'incorrect-selected'
                                            : opt === currentQuestion.correctAnswer
                                                ? 'correct-unselected'
                                                : 'other-unselected'
                                        : 'unanswered'
                                        }`}
                                >
                                    <div className="practice-option-content">
                                        <div className={`practice-option-marker ${isAnswered && opt === currentQuestion.userAnswer ? 'selected' : 'unselected'}`}>
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                        <span className={`practice-option-text ${isAnswered && opt === currentQuestion.userAnswer ? 'selected' : 'unselected'}`}>
                                            <MathRenderer content={opt} />
                                        </span>
                                    </div>
                                    {isAnswered && opt === currentQuestion.userAnswer && (
                                        <div className={`practice-option-pulse ${currentQuestion.isCorrect ? 'correct' : 'incorrect'}`}></div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Feedback Area */}
                        <AnimatePresence>
                            {isAnswered && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="practice-feedback-area"
                                >
                                    <div className="practice-feedback-marker"></div>
                                    <h4 className={`practice-feedback-title ${currentQuestion.isCorrect ? 'correct' : 'incorrect'}`}>
                                        {currentQuestion.isCorrect ? 'CORRECT' : 'REVIEW NEEDED'}
                                    </h4>
                                    <div className="practice-feedback-text">
                                        <MathRenderer content={currentQuestion.aiFeedback.explanation} />
                                    </div>

                                    <div className="practice-next-wrapper">
                                        <button
                                            onClick={nextQuestion}
                                            className="practice-next-btn"
                                        >
                                            {currentIdx < session.questions.length - 1 ? 'Next Question' : 'Complete Session'}
                                            <ArrowRightIcon className="practice-next-icon" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="practice-sidebar">
                    <div className="practice-mastery-card">
                        <h3 className="practice-mastery-title">Mastery Level</h3>
                        <div className="practice-mastery-stats">
                            <div className="practice-mastery-header">
                                <div className="practice-mastery-percent">{Math.round(((currentIdx + (isAnswered ? 1 : 0)) / session.questions.length) * 100)}%</div>
                                <div className="practice-mastery-label">PROGRESS</div>
                            </div>
                            <div className="practice-mastery-bar-container">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentIdx + (isAnswered ? 1 : 0)) / session.questions.length) * 100}%` }}
                                    className="practice-mastery-bar"
                                ></motion.div>
                            </div>
                        </div>
                    </div>

                        <div className="practice-insight-card">
                            <LightBulbIcon className="practice-insight-icon" />
                            <h3 className="practice-insight-title">{isAnswered ? 'Concept Insight' : 'Study Strategy'}</h3>
                            <p className="practice-insight-text">
                                {isAnswered 
                                    ? `${currentQuestion.aiFeedback.explanation.split('.')[0]}. Verbalizing this concept helps reinforce long-term retention.`
                                    : "Focus on understanding the core logic rather than memorizing the pattern. Active recall is the key to mastery."
                                }
                            </p>
                        </div>

                    <div className="practice-points-card">
                        <div className="practice-points-header">
                            <SparklesIcon className="practice-points-icon" />
                            <span>Academic Points</span>
                        </div>
                        <div className="practice-points-value">+{(currentIdx + 1) * 50}</div>
                        <p className="practice-points-desc">Syncing progress...</p>
                    </div>
                </div>
            </div>
            </motion.div>
        )}
    </AnimatePresence>
</div>
);
}
