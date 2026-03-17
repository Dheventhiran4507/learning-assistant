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
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-12 border-b border-slate-100">
                    <div>
                        <h1 className="text-6xl font-black text-slate-900 mb-4 leading-tight uppercase tracking-tighter">
                            System <span className="text-primary italic">Access</span>
                        </h1>
                        <p className="text-slate-500 text-xl font-medium max-w-xl italic">
                            Welcome, {user?.name}. Intelligence dashboard synchronized for Regulation 2021 protocols.
                        </p>
                    </div>

                </div>
            </motion.div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats_cards.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card rounded-[2.5rem] p-8 relative overflow-hidden group"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:opacity-20 transition-opacity`}></div>
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="p-3 bg-white/50 rounded-2xl border border-white/20">{stat.icon}</div>
                            <div>
                                <h3 className="text-4xl font-black text-gray-900">{stat.value}</h3>
                                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">{stat.label}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Semester Selection - Dropdown */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900">Select Semester</h2>
                        <p className="text-gray-500 font-medium">Regulation 2021 • Anna University Syllabus</p>
                    </div>
                    <div className="glass-card px-4 py-2 rounded-xl">
                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Available: </span>
                        <span className="text-gray-900 font-bold">S1 - S{userCurrentSemester}</span>
                    </div>
                </div>

                {/* Compact Dropdown Selector */}
                <div className="relative w-full mx-auto dropdown-container z-40">
                    <motion.button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-5 flex items-center justify-between group hover:border-indigo-400 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-xl font-black text-indigo-600 border border-indigo-100/50">
                                {selectedSemester ? `S${selectedSemester}` : <BookOpenIcon className="w-6 h-6" />}
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-black text-slate-800 tracking-tight">
                                    {selectedSemester ? `Semester ${selectedSemester}` : 'Choose Your Semester'}
                                </h3>
                                <p className="text-slate-500 text-sm font-medium mt-0.5">
                                    {selectedSemester ? `Access subjects and units` : `Select from S1 to S${userCurrentSemester}`}
                                </p>
                            </div>
                        </div>
                        <motion.div
                            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors"
                        >
                            <ChevronDownIcon className="w-4 h-4 stroke-[3]" />
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
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => navigate(`/semester/${user.semester}`)}
                            className="glass-card rounded-2xl p-6 text-left group border-slate-200"
                        >
                            <BookOpenIcon className="w-10 h-10 text-primary mb-3" />
                            <h4 className="text-gray-900 font-bold mb-2">Current Semester</h4>
                            <p className="text-gray-500 text-sm">Semester {user.semester} subjects</p>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => navigate('/practice')}
                            className="glass-card rounded-2xl p-6 text-left group border-slate-200"
                        >
                            <CursorArrowRaysIcon className="w-10 h-10 text-primary mb-3" />
                            <h4 className="text-gray-900 font-bold mb-2">Practice Hub</h4>
                            <p className="text-gray-500 text-sm">Interactive study session</p>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => navigate('/analytics')}
                            className="glass-card rounded-2xl p-6 text-left group border-slate-200"
                        >
                            <ChartBarIcon className="w-10 h-10 text-primary mb-3" />
                            <h4 className="text-gray-900 font-bold mb-2">Learning Analytics</h4>
                            <p className="text-gray-500 text-sm">Detailed progress reports</p>
                        </motion.button>
                    </motion.div>
                )}
            </div>

            {/* Footer Insight */}
            <div className="glass-card rounded-[3rem] p-12 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent border-slate-200">
                <div className="max-w-2xl">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Master Your Curriculum</h3>
                    <p className="text-slate-600 text-lg leading-relaxed mb-8">
                        Our AI-powered syllabus engine structures complex subjects into manageable units, helping you master the Anna University curriculum efficiently.
                    </p>
                    <Link to="/practice" className="text-primary font-bold hover:text-primary-dark flex items-center gap-2 group">
                        Access Practice Hub <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
