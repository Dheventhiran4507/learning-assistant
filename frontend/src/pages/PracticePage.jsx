import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [difficulty, setDifficulty] = useState(difficultyParam || 'medium');

    const { user } = useAuthStore();

    useEffect(() => {
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
    }, [user?.semester, subjectParam]);

    // Automatically start session if all params are present
    useEffect(() => {
        if (!loading && !session && subjectParam && unitParam && !starting && !hasAttemptedAutoStart) {
            // Only auto-start if we have enough info
            setHasAttemptedAutoStart(true);
            startPractice();
        }
    }, [loading, session, subjectParam, unitParam, starting, hasAttemptedAutoStart]);

    const handleSubjectSelect = (code, subjectData) => {
        setSelectedSubject(code);
        setCurrentSyllabus(subjectData || subjects.find(s => s.subjectCode === code));
        setSelectedUnit(null);
        setSelectedTopic(null);
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
        const sub = selectedSubject || subjectParam;
        const uni = selectedUnit || unitParam;
        const top = selectedTopic || topicParam;
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
            toast.error('Failed to start practice session');
        } finally {
            setStarting(false);
        }
    };

    const submitAnswer = async (answerOverride) => {
        const finalAnswer = answerOverride !== undefined ? answerOverride : userAnswer;
        if (!finalAnswer && session.questions[currentIdx].type === 'code') {
            return toast.error('Please write some code before submitting');
        }

        setSubmitting(true);
        try {
            const response = await api.post('/practice/submit', {
                sessionId: session.sessionId,
                questionId: session.questions[currentIdx].questionId,
                userAnswer: finalAnswer
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

    const nextQuestion = () => {
        if (currentIdx < session.questions.length - 1) {
            setCurrentIdx(currentIdx + 1);
            setUserAnswer('');
        } else {
            toast.success('Session Complete!');
            setSession(null);
            if (topicParam || unitParam) {
                navigate(-1); // Go back to unit/topic view
            }
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-mesh">
            <div className="animate-spin text-6xl">📚</div>
        </div>
    );

    if (!session) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <AnimatePresence>
                    {starting && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-white/95 backdrop-blur-3xl z-[100] flex flex-col items-center justify-center"
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-4xl shadow-2xl shadow-primary-500/50 mb-12"
                            >
                                ⚡
                            </motion.div>
                            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Syncing Knowledge Base...</h2>
                            <p className="text-gray-600 font-medium text-lg">Assembling questions for <span className="text-primary-600">{topicParam || 'Custom Session'}</span></p>

                            <div className="mt-12 w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden border border-gray-200">
                                <motion.div
                                    className="h-full bg-primary-500"
                                    animate={{ x: [-256, 256] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                />
                            </div>
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
                            <h1 className="text-6xl font-black text-gray-900 mb-4">
                                Knowledge <span className="text-gradient">Gym</span>
                            </h1>
                            <p className="text-gray-600 text-xl font-medium">Fine-tune your skills with focused practice.</p>
                        </div>

                        <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
                            {['easy', 'medium', 'hard'].map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDifficulty(d)}
                                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${difficulty === d ? 'bg-primary-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Subject List */}
                        <div className="lg:col-span-1 space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 border border-indigo-500/20 text-sm">1</span>
                                Select Subject
                            </h2>
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                                {subjects.map(s => (
                                    <button
                                        key={s.subjectCode}
                                        onClick={() => handleSubjectSelect(s.subjectCode, s)}
                                        className={`w-full text-left p-6 rounded-3xl transition-all border ${selectedSubject === s.subjectCode
                                            ? 'bg-primary-500 border-transparent text-white shadow-2xl shadow-primary-500/30'
                                            : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50 hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="font-bold text-lg text-gray-900">{s.subjectName}</div>
                                        <div className={`text-xs mt-1 ${selectedSubject === s.subjectCode ? 'text-white/80' : 'text-gray-500'}`}>{s.subjectCode} • Regulation {s.regulation}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Units Grid */}
                        <div className={`lg:col-span-2 space-y-6 transition-opacity ${!selectedSubject ? 'opacity-20 pointer-events-none' : ''}`}>
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-600 border border-pink-500/20 text-sm font-bold">2</span>
                                Select Unit or Custom Scope
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setSelectedUnit('all')}
                                    className={`p-8 rounded-3xl border transition-all text-left relative overflow-hidden group ${selectedUnit === 'all'
                                        ? 'bg-gradient-to-br from-indigo-600 to-purple-700 border-transparent text-white shadow-2xl scale-[1.02]'
                                        : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50 hover:border-gray-200'
                                        }`}
                                >
                                    <div className="text-4xl mb-4">🌪️</div>
                                    <div className="text-2xl font-bold mb-1">Full Mastery</div>
                                    <div className="text-sm opacity-60">Cover all units in one session</div>
                                </button>

                                {units.map((u) => (
                                    <button
                                        key={u.unitNumber}
                                        onClick={() => setSelectedUnit(u.unitNumber)}
                                        className={`p-8 rounded-3xl border transition-all text-left group ${selectedUnit === u.unitNumber
                                            ? 'bg-secondary-500 border-transparent text-white shadow-2xl scale-[1.02]'
                                            : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50 hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="text-3xl font-black mb-4 opacity-20 group-hover:opacity-40 transition-opacity text-gray-900">0{u.unitNumber}</div>
                                        <div className="text-2xl font-bold mb-1 truncate text-gray-900">{u.unitTitle}</div>
                                        <div className="text-sm opacity-60 text-gray-500">{u.topics?.length || 0} Topics available</div>
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
                                                onClick={() => setSelectedTopic(null)}
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
                                                    onClick={() => setSelectedTopic(t.topicName)}
                                                    className={`px-6 py-2.5 rounded-2xl text-xs font-bold border transition-all ${selectedTopic === t.topicName
                                                        ? 'bg-accent border-transparent text-white shadow-lg'
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
                            className="btn-premium px-16 py-5 rounded-[2rem] text-xl font-black shadow-2xl hover:shadow-primary-500/50 flex items-center gap-4"
                        >
                            {starting ? <div className="animate-spin">🌀</div> : '⚡'}
                            {starting ? 'Generating Genius Mode...' : 'Ignite Learning Session'}
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // --- PRACTICE SESSION UI ---
    const currentQuestion = session.questions[currentIdx];
    const isAnswered = currentQuestion.isCorrect !== null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12 bg-white p-8 rounded-[2.5rem] border border-gray-100 relative overflow-hidden shadow-lg">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary-500 to-secondary-500"></div>
                <div>
                    <div className="flex items-center gap-3 text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                        <span>{session.subject.subjectCode}</span>
                        <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                        <span>Unit {currentQuestion.unit}</span>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900">
                        Topic: <span className="text-gradient">{currentQuestion.topic}</span>
                    </h2>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-gray-500 text-[10px] font-black uppercase tracking-tighter mb-1">Question Progress</div>
                        <div className="text-2xl font-black text-gray-900">{currentIdx + 1} <span className="text-gray-400">/ {session.questions.length}</span></div>
                    </div>
                    <button
                        onClick={() => setSession(null)}
                        className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-xl hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors border border-gray-200 hover:border-red-200"
                    >
                        ❌
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
                        className="glass-card p-12 rounded-[3.5rem] min-h-[500px] flex flex-col border border-gray-100 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-12 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl"></div>

                        <div className="mb-12">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 inline-block ${currentQuestion.difficulty === 'hard' ? 'bg-red-500/10 text-red-400 border border-red-500/10' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10'
                                }`}>
                                Challenge Level: {currentQuestion.difficulty}
                            </span>
                            <h3 className="text-3xl font-bold text-gray-900 leading-[1.4]">{currentQuestion.question}</h3>
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
                                    <div className="flex items-center gap-6 relative z-10">
                                        <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center text-sm font-black transition-colors ${isAnswered && opt === currentQuestion.userAnswer
                                            ? 'border-transparent bg-white/20'
                                            : 'border-white/10 bg-white/5 text-gray-500'
                                            }`}>
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                        <span className="text-lg font-medium text-gray-700">{opt}</span>
                                    </div>
                                    {isAnswered && opt === currentQuestion.userAnswer && (
                                        <div className={`absolute inset-0 opacity-10 ${currentQuestion.isCorrect ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
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
                                    className="mt-12 p-10 rounded-[2.5rem] bg-gray-50 border border-gray-100 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary-500 to-secondary-500"></div>
                                    <h4 className={`text-2xl font-black mb-4 ${currentQuestion.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                        {currentQuestion.isCorrect ? 'BRILLIANT!' : 'LEARNING MOMENT!'}
                                    </h4>
                                    <p className="text-gray-600 text-lg leading-relaxed mb-10">{currentQuestion.aiFeedback.explanation}</p>

                                    <div className="flex justify-end">
                                        <button
                                            onClick={nextQuestion}
                                            className="btn-premium px-10 py-3 rounded-2xl flex items-center gap-3 text-lg"
                                        >
                                            {currentIdx < session.questions.length - 1 ? 'Evolve to Next' : 'Finalize Session'}
                                            <span>→</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass-card p-10 rounded-[3rem] border border-gray-100">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Mastery Level</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div className="text-4xl font-black text-gray-900">{Math.round(((currentIdx + (isAnswered ? 1 : 0)) / session.questions.length) * 100)}%</div>
                                <div className="text-gray-500 font-bold mb-2">COMPLETE</div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded-full overflow-hidden p-1 border border-gray-200">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentIdx + (isAnswered ? 1 : 0)) / session.questions.length) * 100}%` }}
                                    className="h-full bg-gradient-to-r from-primary-500 via-purple-500 to-secondary-500 rounded-full"
                                ></motion.div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-10 rounded-[3rem] border border-gray-100 bg-gradient-to-br from-primary-500/5 to-transparent">
                        <div className="text-4xl mb-6">💡</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Neural Tip</h3>
                        <p className="text-gray-600 leading-relaxed italic text-lg">
                            "{currentQuestion.aiFeedback.explanation.split('.')[0]}. Research shows that verbalizing this concept helps lock it into long-term memory."
                        </p>
                    </div>

                    <div className="p-8 rounded-[2.5rem] bg-indigo-50 border border-indigo-100 text-center">
                        <h4 className="text-indigo-600 font-bold mb-1">XP Gauge</h4>
                        <div className="text-gray-900 font-black text-2xl">+{(currentIdx + 1) * 50}</div>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-2">Syncing with profile...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
