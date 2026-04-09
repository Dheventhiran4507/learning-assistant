import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
    BookOpenIcon,
    AcademicCapIcon,
    ChatBubbleLeftRightIcon,
    ChartBarIcon,
    SparklesIcon,
    ArrowRightIcon,
    ChevronDownIcon,
    CursorArrowRaysIcon,
    DocumentMagnifyingGlassIcon,
    PresentationChartLineIcon
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
    const { user, updateUser } = useAuthStore();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/students/stats');
                if (response.data.success) {
                    setStats(response.data.data);
                    updateUser({
                        learningStats: response.data.data.learningStats || {},
                        subjectProgress: response.data.data.subjectProgress || [],
                        weakAreas: response.data.data.weakAreas || []
                    });
                }
            } catch (error) {
                toast.error('Dashboard data sync error');
                console.error('Stats fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [updateUser]);

    const [selectedSemester, setSelectedSemester] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Filter semesters based on user's current semester
    const userCurrentSemester = Math.min(Math.max(Number(user?.semester) || 1, 1), 8); 
    const availableSemesters = Array.from({ length: userCurrentSemester }, (_, i) => i + 1);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen && !event.target.closest('.dropdown-container')) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen]);

    const syllabusProgress = stats?.learningStats?.syllabusProgress || 0;
    const topicsMastered = (Array.isArray(stats?.subjectProgress) ? stats.subjectProgress : []).reduce((total, subject) => {
        return total + (subject.topicsCompleted?.length || 0);
    }, 0);

    const stats_cards = [
        { label: 'Syllabus Coverage', value: `${syllabusProgress}%`, icon: <BookOpenIcon className="w-8 h-8 text-indigo-600" />, color: 'from-indigo-600 to-slate-900' },
        { label: 'Topics Mastered', value: topicsMastered.toString(), icon: <AcademicCapIcon className="w-8 h-8 text-slate-800" />, color: 'from-slate-700 to-slate-900' },
        { label: 'Research Queries', value: (stats?.learningStats?.totalDoubtsCleared || 0).toString(), icon: <DocumentMagnifyingGlassIcon className="w-8 h-8 text-indigo-500" />, color: 'from-indigo-400 to-indigo-600' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pb-10"
            >
                <h1 className="text-7xl font-black text-slate-900 mb-4 leading-none tracking-tight">
                    SYSTEM <span className="lumina-text-gradient">ACCESS</span>
                </h1>
                <p className="text-slate-500 text-lg font-medium max-w-2xl">
                    Welcome, {user?.name}. Intelligence dashboard synchronized for Regulation 2021 protocols.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats_cards.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="lumina-card p-10 flex flex-col items-center text-center lumina-card-hover border-none"
                    >
                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-6 text-slate-900 border border-slate-100 shadow-sm">
                            {stat.icon}
                        </div>
                        <h3 className="text-5xl font-black text-slate-900 mb-2">{stat.value}</h3>
                        <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="space-y-8 pt-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Select Semester</h2>
                        <p className="text-slate-400 font-medium mt-1">Regulation 2021 • Anna University Syllabus</p>
                    </div>
                    <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Available: </span>
                        <span className="text-slate-900 font-black text-sm">S1 - S{userCurrentSemester}</span>
                    </div>
                </div>

                {/* Lumina Style Dropdown Selector */}
                <div className="relative dropdown-container">
                    <motion.button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full lumina-card p-8 flex items-center justify-between group hover:border-indigo-200"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.995 }}
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50/50 flex items-center justify-center text-indigo-600 border border-indigo-100/50">
                                <BookOpenIcon className="w-7 h-7" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-xl font-black text-slate-900">
                                    {selectedSemester ? `Semester ${selectedSemester}` : 'Choose Your Semester'}
                                </h3>
                                <p className="text-slate-400 font-medium text-sm">
                                    Select from S1 to S{userCurrentSemester} to access your curriculum
                                </p>
                            </div>
                        </div>
                        <motion.div
                            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors"
                        >
                            <ChevronDownIcon className="w-5 h-5 stroke-[3]" />
                        </motion.div>
                    </motion.button>

                    {/* Compact Dropdown Menu Grid */}
                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98, y: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 4 }}
                                exit={{ opacity: 0, scale: 0.98, y: -5 }}
                                transition={{ duration: 0.15 }}
                                className="absolute left-0 right-0 z-50 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden"
                            >
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                                    {availableSemesters.map((sem) => (
                                        <motion.button
                                            key={sem}
                                            onClick={() => {
                                                setSelectedSemester(sem);
                                                setIsDropdownOpen(false);
                                                navigate(`/semester/${sem}`);
                                            }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`relative flex flex-col items-center justify-center p-4 rounded-xl transition-all border ${
                                                user?.semester === sem
                                                    ? 'bg-indigo-50 border-indigo-200 hover:border-indigo-300'
                                                    : 'bg-slate-50 border-slate-100 hover:border-slate-300 hover:bg-white hover:shadow-sm'
                                                }`}
                                        >
                                            {user?.semester === sem && (
                                                <div className="absolute -top-2 text-[9px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                                                    Current
                                                </div>
                                            )}
                                            <div className={`text-2xl font-black mb-1 ${user?.semester === sem ? 'text-indigo-600' : 'text-slate-700'}`}>
                                                S{sem}
                                            </div>
                                            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                Semester {sem}
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Quick Access Cards for Current Semester */}
                {user?.semester && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
                    >
                        <motion.button
                            whileHover={{ y: -5 }}
                            onClick={() => navigate(`/semester/${user.semester}`)}
                            className="lumina-card p-10 text-center lumina-card-hover border-none"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-6 text-indigo-600 border border-slate-100 shadow-sm">
                                <BookOpenIcon className="w-7 h-7" />
                            </div>
                            <h4 className="text-slate-900 font-black text-lg mb-2">Current Semester</h4>
                            <p className="text-slate-400 text-sm font-medium">Access Semester {user.semester} topics</p>
                        </motion.button>
                        <motion.button
                            whileHover={{ y: -5 }}
                            onClick={() => navigate('/practice')}
                            className="lumina-card p-10 text-center lumina-card-hover border-none"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-6 text-indigo-600 border border-slate-100 shadow-sm">
                                <CursorArrowRaysIcon className="w-7 h-7" />
                            </div>
                            <h4 className="text-slate-900 font-black text-lg mb-2">Practice Hub</h4>
                            <p className="text-slate-400 text-sm font-medium">Interactive AI study sessions</p>
                        </motion.button>
                        <motion.button
                            whileHover={{ y: -5 }}
                            onClick={() => navigate('/analytics')}
                            className="lumina-card p-10 text-center lumina-card-hover border-none"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-6 text-indigo-600 border border-slate-100 shadow-sm">
                                <ChartBarIcon className="w-7 h-7" />
                            </div>
                            <h4 className="text-slate-900 font-black text-lg mb-2">Learning Analytics</h4>
                            <p className="text-slate-400 text-sm font-medium">Track your detailed progress</p>
                        </motion.button>
                    </motion.div>
                )}
            </div>

            {/* Footer Insight */}
            <div className="lumina-card p-16 bg-slate-900 text-white border-none relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                <div className="relative z-10 max-w-2xl">
                    <h3 className="text-4xl font-black mb-6 tracking-tight">Master Your <span className="text-indigo-400">Curriculum</span></h3>
                    <p className="text-slate-400 text-xl leading-relaxed mb-10 font-medium">
                        Our AI-powered syllabus engine structures complex subjects into manageable units, helping you master the Anna University curriculum efficiently.
                    </p>
                    <button 
                        onClick={() => navigate('/practice')} 
                        className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-100 transition-all flex items-center gap-3 group"
                    >
                        Start Learning Now <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
