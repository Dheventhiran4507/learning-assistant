import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
    AcademicCapIcon,
    BookOpenIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    ChatBubbleLeftRightIcon,
    CursorArrowRaysIcon,
    ChevronRightIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

const UnitViewPage = () => {
    const { subjectCode, unitNumber } = useParams();
    const [unit, setUnit] = useState(null);
    const [subject, setSubject] = useState(null);
    const [userProgress, setUserProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Fetch subject/unit details
                const syllabusRes = await api.get(`/syllabus/subject/${subjectCode}`);
                if (syllabusRes.data.success) {
                    setSubject(syllabusRes.data.data);
                    const unitData = syllabusRes.data.data.units.find(u => u.unitNumber === parseInt(unitNumber));
                    setUnit(unitData);
                }

                // Fetch student progress
                const statsRes = await api.get('/students/stats');
                if (statsRes.data.success) {
                    const progress = statsRes.data.data.subjectProgress.find(p => p.subjectCode === subjectCode);
                    setUserProgress(progress);
                }
            } catch (error) {
                toast.error('Failed to load details');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [subjectCode, unitNumber]);

    // Helper to check if a topic is completed
    const isTopicCompleted = (topicName) => {
        return userProgress?.topicsCompleted?.includes(topicName);
    };

    // Calculate Unit Progress
    const calculateUnitProgress = () => {
        if (!unit || !userProgress || !unit.topics || unit.topics.length === 0) return 0;
        const topicsCompleted = userProgress.topicsCompleted || [];
        const unitTopics = unit.topics.map(t => t.topicName);
        const completedInUnit = unitTopics.filter(name => topicsCompleted.includes(name));
        return Math.round((completedInUnit.length / unitTopics.length) * 100);
    };

    const startTopicPractice = (topicName, difficulty = 'medium') => {
        navigate(`/practice?subject=${subjectCode}&unit=${unitNumber}&topic=${encodeURIComponent(topicName)}&difficulty=${difficulty}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!unit) return <div className="text-center text-slate-900 py-20 bg-slate-50 h-screen">Unit configuration not found</div>;

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-3 mb-6 text-sm">
                        <Link to="/dashboard" className="text-slate-500 hover:text-primary transition-colors font-medium">Dashboard</Link>
                        <ChevronRightIcon className="w-4 h-4 text-slate-400" />
                        <Link to={`/semester/${subject?.semester}`} className="text-slate-500 hover:text-primary transition-colors font-medium">Semester {subject?.semester}</Link>
                        <ChevronRightIcon className="w-4 h-4 text-slate-400" />
                        <Link to={`/subject/${subjectCode}`} className="text-slate-500 hover:text-primary transition-colors font-medium">{subjectCode}</Link>
                        <ChevronRightIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-900 font-bold">Module {unitNumber}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-5xl font-black text-slate-900 mb-4 leading-tight">
                                {unit.unitTitle} <span className="text-gradient underline decoration-indigo-500/10 underline-offset-8">Concepts</span>
                            </h1>
                            <p className="text-slate-600 text-xl font-medium max-w-2xl">Master each module through focused academic analysis and testing.</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 text-center">Module Proficiency</div>
                            <div className="text-2xl font-black text-slate-900 text-center">{calculateUnitProgress()}% <span className="text-slate-500 font-bold text-sm uppercase">Acquired</span></div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {unit.topics.map((topic, index) => (
                        <motion.div
                            key={topic.topicName}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-card rounded-[2.5rem] p-8 flex flex-col justify-between group h-full border border-gray-100 hover:border-primary-500/30 transition-all duration-500"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${topic.difficulty === 'hard' ? 'bg-red-50 text-red-600 border-red-100' :
                                        topic.difficulty === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                        {topic.difficulty || 'Standard'} Complexity
                                    </span>
                                    <div className="flex items-center gap-3">
                                        {isTopicCompleted(topic.topicName) && (
                                            <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-md shadow-emerald-500/20">
                                                <CheckCircleIcon className="w-3 h-3" /> VERIFIED
                                            </div>
                                        )}
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                            <SparklesIcon className="w-5 h-5 text-indigo-500" />
                                        </div>
                                    </div>
                                </div>
                                <h3 className={`text-3xl font-bold mb-4 leading-tight group-hover:text-primary-600 transition-colors ${isTopicCompleted(topic.topicName) ? 'text-gray-400' : 'text-gray-900'}`}>
                                    {topic.topicName}
                                </h3>
                                {topic.subtopics && topic.subtopics.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {topic.subtopics.map(st => (
                                            <span key={st} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-lg border border-gray-200">
                                                {st}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-sm mb-8 leading-relaxed italic">Comprehensive academic study covers theoretical principles and practical applications of {topic.topicName}.</p>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => startTopicPractice(topic.topicName, topic.difficulty || 'medium')}
                                    className="flex-1 btn-premium py-4 font-black rounded-2xl flex items-center justify-center gap-2"
                                >
                                    <CursorArrowRaysIcon className="w-5 h-5" />
                                    Interactive Practice
                                </button>
                                <Link
                                    to={`/chat?q=Explain the concept of ${encodeURIComponent(topic.topicName)} in ${subjectCode}`}
                                    className="w-14 h-14 bg-white border border-slate-200 flex items-center justify-center rounded-2xl hover:bg-slate-50 transition-all group/btn shadow-sm"
                                >
                                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-slate-500 group-hover/btn:text-primary transition-colors" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-16 p-1 bg-gradient-to-r from-primary-500 via-purple-500 to-secondary-500 rounded-[2rem] shadow-2xl shadow-primary-500/20"
                >
                    <div className="bg-white rounded-[1.8rem] p-12 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-mesh opacity-20 pointer-events-none"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl font-black text-slate-900 mb-4">Module Achievement Test</h2>
                            <p className="text-slate-600 max-w-2xl mx-auto mb-8 text-lg">
                                Ready to validate your overall understanding of {unit.unitTitle}? Complete the comprehensive module assessment.
                            </p>
                            <button
                                onClick={() => navigate(`/practice?subject=${subjectCode}&unit=${unitNumber}`)}
                                className="btn-premium px-12 py-4 rounded-2xl text-lg shadow-xl"
                            >
                                Start Assessment <ArrowRightIcon className="w-5 h-5 inline ml-2" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UnitViewPage;
