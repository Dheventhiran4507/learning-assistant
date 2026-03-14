import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
    AcademicCapIcon,
    BookOpenIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    ChevronRightIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';

const SubjectViewPage = () => {
    const { subjectCode } = useParams();
    const { user } = useAuthStore();
    const [subject, setSubject] = useState(null);
    const [userProgress, setUserProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRegenerating, setIsRegenerating] = useState(false);

    const isAdmin = user?.role === 'admin' || user?.role === 'hod' || user?.role === 'advisor';

    const fetchSubject = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/syllabus/subject/${subjectCode}`);
            if (response.data.success) {
                setSubject(response.data.data);
            }

            const statsRes = await api.get('/students/stats');
            if (statsRes.data.success) {
                const progress = statsRes.data.data.subjectProgress.find(p => p.subjectCode === subjectCode);
                setUserProgress(progress);
            }
        } catch (error) {
            toast.error('Failed to load subject details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubject();
    }, [subjectCode]);

    const handleRegenerate = async () => {
        if (!window.confirm('Are you sure you want to re-generate this syllabus? This will refresh all topics using the latest grounded logic.')) return;

        setIsRegenerating(true);
        const toastId = toast.loading('Re-generating curriculum...');

        try {
            const response = await api.post(`/syllabus/subject/${subjectCode}/regenerate`);
            if (response.data.success) {
                toast.success('Curriculum refreshed successfully!', { id: toastId });
                fetchSubject(); // Reload data
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to refresh curriculum', { id: toastId });
        } finally {
            setIsRegenerating(false);
        }
    };

    // Helper to calculate progress for a specific unit
    const getUnitProgress = (unit) => {
        if (!userProgress || !unit || !unit.topics || unit.topics.length === 0) return 0;
        const topicsCompleted = userProgress.topicsCompleted || [];
        const unitTopics = unit.topics.map(t => t.topicName);
        const completed = unitTopics.filter(name => topicsCompleted.includes(name));
        return Math.round((completed.length / unitTopics.length) * 100);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-900 font-bold text-lg">Loading curriculum details...</p>
                </motion.div>
            </div>
        );
    }

    if (!subject) return <div className="text-center text-gray-900 py-20">Subject not found</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <div className="flex items-center gap-3 mb-6 text-sm">
                    <Link to="/dashboard" className="text-slate-500 hover:text-primary transition-colors font-medium">Dashboard</Link>
                    <ChevronRightIcon className="w-4 h-4 text-slate-400" />
                    <Link to={`/semester/${subject.semester}`} className="text-slate-500 hover:text-primary transition-colors font-medium">Semester {subject.semester}</Link>
                    <ChevronRightIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900 font-bold">{subject.subjectCode}</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-6xl font-black text-slate-900 mb-4 leading-tight">
                            {subject.subjectName} <span className="text-gradient underline decoration-indigo-500/10 underline-offset-8">Curriculum</span>
                        </h1>
                        <p className="text-slate-600 text-xl font-medium">Standardized syllabus breakdown • Regulation {subject.regulation}</p>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <div className="glass-card px-6 py-4 rounded-2xl border border-slate-200">
                            <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1 text-center">Modules</div>
                            <div className="text-3xl font-black text-slate-900 text-center">{subject.units?.length || 0}</div>
                        </div>
                        {isAdmin && (
                            <button
                                onClick={handleRegenerate}
                                disabled={isRegenerating}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
                            >
                                <ArrowPathIcon className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                                {isRegenerating ? 'Regenerating...' : 'Refresh Grounding'}
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-6">
                {subject.units?.map((unit, index) => (
                    <motion.div
                        key={unit.unitNumber}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08 }}
                        whileHover={{ x: 8 }}
                        className="glass-card rounded-[2rem] p-8 group relative overflow-hidden"
                    >
                        {/* Gradient Border on Hover */}
                        <div className="absolute left-0 top-0 h-full w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        {/* Background Glow */}
                        <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-primary-500/20 group-hover:scale-110 transition-transform">
                                    {unit.unitNumber}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-all">
                                        {unit.unitTitle}
                                    </h3>
                                    <div className="flex items-center gap-2 text-slate-500 mb-3">
                                        <BookOpenIcon className="w-5 h-5 text-indigo-500" />
                                        <p className="font-medium">{unit.topics?.length || 0} Topics • {getUnitProgress(unit)}% Proficiency</p>
                                    </div>
                                    {/* Mini Progress Bar */}
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${getUnitProgress(unit)}%` }}
                                            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Link
                                to={`/unit/${subjectCode}/${unit.unitNumber}`}
                                className="btn-premium text-center px-8 py-3 whitespace-nowrap"
                            >
                                <div className="flex items-center gap-2">
                                    Analyze Modules <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default SubjectViewPage;
