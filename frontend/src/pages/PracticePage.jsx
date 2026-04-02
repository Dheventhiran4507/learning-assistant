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
    ShieldExclamationIcon
} from '@heroicons/react/24/outline';

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
    const [showWarning, setShowWarning] = useState(false);
    const [isPrivacyShieldActive, setIsPrivacyShieldActive] = useState(false);

    const { user } = useAuthStore();

    // PAGE LOCK: Custom safe navigation that blocks mid-session
    const pendingNavRef = useRef(null);
    const [showBlockedNav, setShowBlockedNav] = useState(false);

    const safeNavigate = (to) => {
        if (session) {
            pendingNavRef.current = to;
            setShowBlockedNav(true);
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
        setShowWarning(false);
        setIsPrivacyShieldActive(false);
    }, [currentIdx]);

    // Anti-Cheat: Focus Lock Effect
    useEffect(() => {
        const isReviewMode = session?.status === 'completed';
        // Only active during an unanswered question
        const currentQ = session?.questions?.[currentIdx];
        if (!session || !currentQ || currentQ.isCorrect !== null || isReviewMode) return;

        let violationCount = 0;

        const triggerViolation = () => {
            violationCount += 1;
            setTabSwitchCount(violationCount);
            setIsPrivacyShieldActive(true);
            if (violationCount >= MAX_VIOLATIONS) {
                setShowWarning(false);
                // Auto-submit a wrong answer to penalize cheating
                submitAnswer('__FOCUS_VIOLATION__');
                toast.error('❌ Session integrity violated! Question marked wrong.', { duration: 4000 });
            } else {
                setShowWarning(true);
                toast.error(`⚠️ Warning: Stay on this page!`, { duration: 3000 });
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) triggerViolation();
        };

        const handleBlur = () => {
            triggerViolation();
        };

        const handleFocus = () => {
            // Content remains hidden/blurred until they dismiss the warning or if they already failed
        };

        window.addEventListener('focus', handleFocus);

        const blockKeys = (e) => {
            // Block copy, select-all, paste, view-source, devtools
            if (e.ctrlKey && ['c', 'a', 'v', 'u', 'i'].includes(e.key.toLowerCase())) {
                e.preventDefault();
                e.stopPropagation();
            }
            if (e.key === 'F12') {
                e.preventDefault();
            }
        };

        const blockContextMenu = (e) => e.preventDefault();

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('keydown', blockKeys, true);
        document.addEventListener('contextmenu', blockContextMenu);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('keydown', blockKeys, true);
            document.removeEventListener('contextmenu', blockContextMenu);
        };
    }, [session, currentIdx]);

    // PAGE LOCK: Block browser Back button using history loop
    useEffect(() => {
        const isReviewMode = session?.status === 'completed';
        if (!session || isReviewMode) return;
        // Push a dummy state so Back button hits this state first
        window.history.pushState(null, '', window.location.href);
        const handlePopState = () => {
            // Re-push so Back button never actually leaves
            window.history.pushState(null, '', window.location.href);
            setIsPrivacyShieldActive(true);
            setShowWarning(true);
            setTabSwitchCount(prev => {
                const next = prev + 1;
                if (next >= MAX_VIOLATIONS) {
                    submitAnswer('__FOCUS_VIOLATION__');
                    toast.error('❌ Session integrity violated! Question marked wrong.', { duration: 4000 });
                } else {
                    toast.error(`⚠️ Warning: Back button is blocked!`, { duration: 3000 });
                }
                return next;
            });
        };
        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
            window.history.back();
        };
    }, [session]);



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
        <div className="flex items-center justify-center h-screen bg-white">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!session) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
                <AnimatePresence>
                    {starting && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center"
                        >
                            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-900 font-bold text-xl">Starting Practice Session...</p>
                            <p className="text-gray-500">Preparing questions for you</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl sm:text-6xl font-black text-slate-900 mb-2 sm:mb-4">
                                Practice <span className="text-gradient">Hub</span>
                            </h1>
                            <p className="text-slate-500 text-sm sm:text-xl font-medium">Refine your understanding through targeted exercises.</p>
                        </div>

                        <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm opacity-0 pointer-events-none hidden">
                            {/* Difficulty selector removed as per user request */}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Subject List */}
                        <div className="lg:col-span-1 space-y-6">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 border border-indigo-500/20 text-sm font-bold">1</span>
                                Select Course
                            </h2>
                            <div className="space-y-4 max-h-[40vh] sm:max-h-[60vh] overflow-y-auto pr-2 sm:pr-4 custom-scrollbar">
                                {subjects.map(s => (
                                    <button
                                        key={s.subjectCode}
                                        onClick={() => handleSubjectSelect(s.subjectCode, s)}
                                        className={`w-full text-left p-4 sm:p-6 rounded-2xl sm:rounded-3xl transition-all border ${selectedSubject === s.subjectCode
                                            ? 'bg-primary border-transparent text-white shadow-lg'
                                            : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-slate-200'
                                            }`}
                                    >
                                        <div className={`font-bold text-base sm:text-lg ${selectedSubject === s.subjectCode ? 'text-white' : 'text-slate-900'}`}>{s.subjectName}</div>
                                        <div className={`text-[10px] sm:text-xs mt-1 ${selectedSubject === s.subjectCode ? 'text-white/80' : 'text-slate-500'}`}>{s.subjectCode} • Regulation {s.regulation}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Units Grid */}
                        <div className={`lg:col-span-2 space-y-6 transition-opacity ${!selectedSubject ? 'opacity-20 pointer-events-none' : ''}`}>
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-600 border border-pink-500/20 text-sm font-bold">2</span>
                                Coverage Scope
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleCoverageSelection('all')}
                                    className={`p-6 sm:p-8 rounded-2xl sm:rounded-3xl border transition-all text-left relative overflow-hidden group ${selectedUnit === 'all'
                                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-800 border-transparent text-white shadow-xl scale-[1.01]'
                                        : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-slate-200'
                                        }`}
                                >
                                    <GlobeAltIcon className="w-8 h-8 sm:w-10 sm:h-10 mb-3 sm:mb-4 opacity-20 group-hover:opacity-100 transition-opacity" />
                                    <div className="text-xl sm:text-2xl font-bold mb-1">Comprehensive Study</div>
                                    <div className="text-[11px] sm:text-sm opacity-60">Assess knowledge across all units</div>
                                </button>

                                {units.map((u) => (
                                    <button
                                        key={u.unitNumber}
                                        onClick={() => setSelectedUnit(u.unitNumber)}
                                        className={`p-6 sm:p-8 rounded-2xl sm:rounded-3xl border transition-all text-left group ${selectedUnit === u.unitNumber
                                            ? 'bg-slate-800 border-transparent text-white shadow-xl scale-[1.01]'
                                            : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-slate-200'
                                            }`}
                                    >
                                        <div className={`text-2xl sm:text-3xl font-black mb-3 sm:mb-4 transition-opacity ${selectedUnit === u.unitNumber ? 'text-white/20' : 'text-slate-200 group-hover:text-slate-300'}`}>0{u.unitNumber}</div>
                                        <div className={`text-lg sm:text-2xl font-bold mb-1 truncate ${selectedUnit === u.unitNumber ? 'text-white' : 'text-slate-900'}`}>{u.unitTitle}</div>
                                        <div className={`text-[11px] sm:text-sm opacity-60 ${selectedUnit === u.unitNumber ? 'text-white/60' : 'text-slate-50'}`}>{u.topics?.length || 0} Topics</div>
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
                                        className="mt-12 space-y-4"
                                    >
                                        <h3 className="text-xl font-bold text-gray-900">Focus on a specific topic:</h3>
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                onClick={() => handleTopicSelection(null)}
                                                className={`px-6 py-2.5 rounded-2xl text-xs font-bold border transition-all ${!selectedTopic
                                                    ? 'bg-gray-200 border-gray-300 text-gray-900'
                                                    : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                All Unit Topics
                                            </button>
                                            {topics.map(t => (
                                                <button
                                                    key={t.topicName}
                                                    onClick={() => handleTopicSelection(t.topicName)}
                                                    className={`px-6 py-2.5 rounded-2xl text-xs font-bold border transition-all ${selectedTopic === t.topicName
                                                        ? 'bg-indigo-600 border-transparent text-white shadow-lg'
                                                        : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                                                        }`}
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

                    <div className="flex justify-center pt-12">
                        <button
                            onClick={startPractice}
                            disabled={!selectedUnit || starting}
                            className="btn-premium px-8 sm:px-16 py-4 sm:py-5 rounded-2xl sm:rounded-[2rem] text-lg sm:text-xl font-black shadow-xl flex items-center gap-4 w-full sm:w-auto justify-center"
                        >
                            {starting ? <ArrowPathIcon className="w-6 h-6 animate-spin" /> : <BeakerIcon className="w-6 h-6" />}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-12">

            {/* ===== ANTI-CHEAT / PRIVACY SHIELD OVERLAY ===== */}
            <AnimatePresence>
                {(showWarning || isPrivacyShieldActive) && (
                    <motion.div
                        key="cheat-warning"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-[30px] bg-slate-900/90"
                        onClick={() => !isAnswered && setShowWarning(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.7, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-[2.5rem] p-12 max-w-md w-full mx-4 shadow-2xl text-center relative overflow-hidden"
                        >
                            {/* Red top accent */}
                            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-t-[2.5rem]" />

                            <div className="flex items-center justify-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                                    <ShieldExclamationIcon className="w-10 h-10 text-red-600" />
                                </div>
                            </div>

                            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-4">
                                <ExclamationTriangleIcon className="w-4 h-4" />
                                Focus Violation
                            </div>

                            <h2 className="text-2xl font-black text-gray-900 mb-3 uppercase tracking-tight">Security Alert!</h2>
                            <p className="text-gray-500 text-base leading-relaxed mb-6">
                                Practice session-ல் இருக்கும்போது வேற tab-க்கோ அல்லது window-க்கோ போகக்கூடாது. Integrity-க்காக screen hide செய்யப்பட்டுள்ளது.
                            </p>

                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-8 flex items-center gap-4 text-left">
                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                                    <ClockIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Penalty</p>
                                    <p className="text-sm font-bold text-slate-700 uppercase">Violation Recorded</p>
                                </div>
                            </div>

                            {tabSwitchCount < MAX_VIOLATIONS ? (
                                <button
                                    onClick={() => {
                                        setShowWarning(false);
                                        setIsPrivacyShieldActive(false);
                                    }}
                                    className="w-full py-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-lg transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                                >
                                    BACK TO TEST
                                </button>
                            ) : (
                                <div className="text-red-600 font-black text-sm uppercase tracking-widest">
                                    Question marked as failed.
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== BLOCKED NAVIGATION CONFIRM OVERLAY ===== */}
            <AnimatePresence>
                {showBlockedNav && (
                    <motion.div
                        key="blocked-nav"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center"
                        style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(15,23,42,0.75)' }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white rounded-[2.5rem] p-12 max-w-md w-full mx-4 shadow-2xl text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-t-[2.5rem]" />

                            <div className="flex items-center justify-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
                                    <ExclamationTriangleIcon className="w-10 h-10 text-orange-600" />
                                </div>
                            </div>

                            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-3">Session Still Active!</h2>
                            <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-8">
                                Practice session முடியாம வேற page-க்கு போனா இந்த question <strong>incomplete</strong>-ஆ mark ஆகும்.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => { setShowBlockedNav(false); pendingNavRef.current = null; }}
                                    className="w-full py-4 rounded-xl sm:rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-black text-base sm:text-lg transition-all"
                                >
                                    Continue Session 💪
                                </button>
                                <button
                                    onClick={() => {
                                        const dest = pendingNavRef.current;
                                        setShowBlockedNav(false);
                                        setSession(null);
                                        pendingNavRef.current = null;
                                        if (dest) navigate(dest);
                                    }}
                                    className="w-full py-3 rounded-xl sm:rounded-2xl border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold transition-all text-sm"
                                >
                                    Exit anyway
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-12 bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-gray-100 relative overflow-hidden shadow-lg">
                <div className="absolute top-0 left-0 w-1.5 sm:w-2 h-full bg-gradient-to-b from-primary-500 to-secondary-500"></div>
                <div>
                    <div className="flex items-center gap-2 sm:gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 sm:mb-2">
                        <span className="truncate max-w-[80px] sm:max-w-none">{session.subject.subjectCode}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span>Unit {currentQuestion.unit}</span>
                        {isReviewMode && (
                            <>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span className="text-secondary-500 font-bold bg-secondary-50 px-2 py-0.5 rounded-md border border-secondary-200 text-[8px] sm:text-[10px]">Review</span>
                            </>
                        )}
                    </div>
                    <h2 className="text-lg sm:text-3xl font-black text-slate-900 truncate max-w-[250px] sm:max-w-none">
                        <span className="text-primary">{currentQuestion.topic}</span>
                    </h2>
                </div>
                <div className="flex items-center justify-between w-full sm:w-auto gap-3 sm:gap-8 border-t sm:border-t-0 pt-3 sm:pt-0 mt-3 sm:mt-0">
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="bg-slate-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-slate-200 flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                            <span className="text-base sm:text-xl font-black text-slate-700 tracking-mono">
                                {isReviewMode 
                                    ? `${Math.floor((currentQuestion.timeTaken || 0) / 60)}:${((currentQuestion.timeTaken || 0) % 60).toString().padStart(2, '0')}`
                                    : `${Math.floor(visibleTimer / 60)}:${(visibleTimer % 60).toString().padStart(2, '0')}`
                                }
                            </span>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="text-gray-500 text-[8px] sm:text-[10px] font-black uppercase tracking-tighter sm:mb-1">Progress</div>
                            <div className="text-base sm:text-2xl font-black text-gray-900">{currentIdx + 1}<span className="text-gray-400 text-xs sm:text-lg">/{session.questions.length}</span></div>
                        </div>
                    </div>
                    <button
                        onClick={() => setSession(null)}
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors border border-gray-200"
                    >
                        <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Question Area */}
                <div className="lg:col-span-8 space-y-8">
                        <motion.div
                            key={currentQuestion.questionId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 sm:p-12 rounded-3xl sm:rounded-[3.5rem] min-h-[400px] sm:min-h-[500px] flex flex-col border border-gray-100 relative overflow-hidden shadow-sm"
                        >
                            <div className="absolute top-0 right-12 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl"></div>

                            <div className="mb-8 sm:mb-12">
                                <h3 className="text-xl sm:text-3xl font-bold text-gray-900 leading-[1.4]">
                                    <MathRenderer content={currentQuestion.question} />
                                </h3>
                            </div>

                        <div className="flex-1 space-y-4">
                            {currentQuestion.options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => !isAnswered && submitAnswer(opt)}
                                    disabled={isAnswered || submitting}
                                    className={`w-full p-6 rounded-3xl text-left border-2 transition-all group relative overflow-hidden ${isAnswered
                                        ? opt === currentQuestion.userAnswer
                                            ? currentQuestion.isCorrect
                                                ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.1)]'
                                                : 'bg-red-500/10 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.1)]'
                                            : opt === currentQuestion.correctAnswer
                                                ? 'bg-green-500/10 border-green-500/30'
                                                : 'bg-white/5 border-transparent opacity-40'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-primary-500/50 hover:scale-[1.01]'
                                        }`}
                                >
                                    <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl border flex items-center justify-center text-xs sm:text-sm font-black transition-colors ${isAnswered && opt === currentQuestion.userAnswer
                                            ? 'border-transparent bg-white/30'
                                            : 'border-slate-100 bg-slate-50 text-slate-500'
                                            }`}>
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                        <span className={`text-[15px] sm:text-lg font-medium ${isAnswered && opt === currentQuestion.userAnswer ? 'text-white' : 'text-slate-700'}`}>
                                            <MathRenderer content={opt} />
                                        </span>
                                    </div>
                                    {isAnswered && opt === currentQuestion.userAnswer && (
                                        <div className={`absolute inset-0 opacity-10 ${currentQuestion.isCorrect ? 'bg-green-600' : 'bg-red-600'} animate-pulse`}></div>
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
                                    className="mt-8 sm:mt-12 p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] bg-gray-50 border border-gray-100 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-1.5 sm:w-2 h-full bg-primary"></div>
                                    <h4 className={`text-xl sm:text-2xl font-black mb-3 sm:mb-4 ${currentQuestion.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                        {currentQuestion.isCorrect ? 'CORRECT' : 'REVIEW NEEDED'}
                                    </h4>
                                    <div className="text-gray-600 text-[15px] sm:text-lg leading-relaxed mb-6 sm:mb-10">
                                        <MathRenderer content={currentQuestion.aiFeedback.explanation} />
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            onClick={nextQuestion}
                                            className="btn-premium px-6 sm:px-10 py-3 rounded-xl sm:rounded-2xl flex items-center gap-3 text-base sm:text-lg w-full sm:w-auto justify-center"
                                        >
                                            {currentIdx < session.questions.length - 1 ? 'Next Question' : 'Complete Session'}
                                            <ArrowRightIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white p-6 sm:p-10 rounded-3xl sm:rounded-[3rem] border border-gray-100 shadow-sm">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 sm:mb-6">Mastery Level</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div className="text-3xl sm:text-4xl font-black text-gray-900 leading-none">{Math.round(((currentIdx + (isAnswered ? 1 : 0)) / session.questions.length) * 100)}%</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase">PROGRESS</div>
                            </div>
                            <div className="h-3 sm:h-4 bg-gray-100 rounded-full overflow-hidden p-0.5 sm:p-1 border border-gray-100">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentIdx + (isAnswered ? 1 : 0)) / session.questions.length) * 100}%` }}
                                    className="h-full bg-gradient-to-r from-primary-500 via-purple-500 to-secondary-500 rounded-full"
                                ></motion.div>
                            </div>
                        </div>
                    </div>

                        <div className="glass-card p-10 rounded-[3rem] border border-slate-200 bg-slate-50/50">
                            <LightBulbIcon className="w-10 h-10 text-amber-500 mb-6" />
                            <h3 className="text-xl font-bold text-slate-900 mb-4">{isAnswered ? 'Concept Insight' : 'Study Strategy'}</h3>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                {isAnswered 
                                    ? `${currentQuestion.aiFeedback.explanation.split('.')[0]}. Verbalizing this concept helps reinforce long-term retention.`
                                    : "Focus on understanding the core logic rather than memorizing the pattern. Active recall is the key to mastery."
                                }
                            </p>
                        </div>

                    <div className="p-8 rounded-[2.5rem] bg-slate-100 border border-slate-200 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-600 font-bold mb-1">
                            <SparklesIcon className="w-5 h-5" />
                            <span>Academic Points</span>
                        </div>
                        <div className="text-slate-900 font-black text-2xl">+{(currentIdx + 1) * 50}</div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">Syncing progress...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
