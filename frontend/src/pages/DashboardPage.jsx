import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

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
                        learningStats: response.data.data.learningStats,
                        subjectProgress: response.data.data.subjectProgress,
                        weakAreas: response.data.data.weakAreas
                    });
                }
            } catch (error) {
                // toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [updateUser]);

    const [selectedSemester, setSelectedSemester] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Filter semesters based on user's current semester
    const userCurrentSemester = user?.semester || 8; // Default to 8 if not set
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
    const topicsMastered = stats?.subjectProgress?.reduce((total, subject) => {
        return total + (subject.topicsCompleted?.length || 0);
    }, 0) || 0;

    const stats_cards = [
        { label: 'Syllabus Coverage', value: `${syllabusProgress}%`, icon: '📚', color: 'from-blue-500 to-indigo-600' },
        { label: 'Topics Mastered', value: topicsMastered.toString(), icon: '🏆', color: 'from-purple-500 to-pink-600' },
        { label: 'Doubts Cleared', value: (stats?.learningStats?.totalDoubtsCleared || 0).toString(), icon: '🔥', color: 'from-orange-400 to-red-500' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-mesh">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="text-6xl mb-4"
                    >
                        📚
                    </motion.div>
                    <p className="text-white font-bold tracking-widest uppercase text-sm">Initializing Knowledge Engine...</p>
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-12 border-b border-white/5">
                    <div>
                        <h1 className="text-6xl font-black text-gray-900 mb-4 leading-tight">
                            Welcome back, <span className="text-gradient underline decoration-primary-500/30 underline-offset-8">{user?.name}</span>
                        </h1>
                        <p className="text-gray-600 text-xl font-medium max-w-xl">
                            Select your semester to access subjects and track your academic progress.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Link to="/chat" className="btn-premium flex items-center gap-2">
                            <span>🤖</span> AI Assistant
                        </Link>
                        <Link to="/analytics" className="glass px-6 py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-all">
                            📊 View Analytics
                        </Link>
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
                            <div className="text-4xl">{stat.icon}</div>
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

                {/* Dropdown Selector */}
                <div className="relative max-w-2xl mx-auto dropdown-container">
                    <motion.button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full glass-card rounded-[2rem] p-6 flex items-center justify-between group hover:border-primary-500/30 transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-primary-500/20">
                                {selectedSemester ? `S${selectedSemester}` : '📚'}
                            </div>
                            <div className="text-left">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {selectedSemester ? `Semester ${selectedSemester}` : 'Choose Your Semester'}
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    {selectedSemester ? `Access subjects and units` : `Select from S1 to S${userCurrentSemester}`}
                                </p>
                            </div>
                        </div>
                        <motion.div
                            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-2xl text-gray-400 group-hover:text-primary-400 transition-colors"
                        >
                            ▼
                        </motion.div>
                    </motion.button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-50 w-full mt-4 glass-strong rounded-[2rem] p-4 border border-white/20 shadow-2xl"
                        >
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {availableSemesters.map((sem) => (
                                    <motion.button
                                        key={sem}
                                        onClick={() => {
                                            setSelectedSemester(sem);
                                            setIsDropdownOpen(false);
                                            navigate(`/semester/${sem}`);
                                        }}
                                        whileHover={{ x: 8 }}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${user?.semester === sem
                                            ? 'bg-primary-500/20 border border-primary-500/40'
                                            : 'hover:bg-white/5 border border-transparent'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black ${user?.semester === sem
                                            ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/30'
                                            : 'bg-white/5 text-gray-400'
                                            }`}>
                                            S{sem}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h4 className="text-gray-900 font-bold">Semester {sem}</h4>
                                            <p className="text-gray-500 text-xs">
                                                {user?.semester === sem ? 'Current Semester' : `View subjects & topics`}
                                            </p>
                                        </div>
                                        {user?.semester === sem && (
                                            <div className="text-xs font-black bg-primary-500 text-white px-3 py-1 rounded-full uppercase tracking-tighter">
                                                Current
                                            </div>
                                        )}
                                        <div className="text-gray-500 text-xl">→</div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
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
                            className="glass-card rounded-2xl p-6 text-left group"
                        >
                            <div className="text-3xl mb-3">📚</div>
                            <h4 className="text-gray-900 font-bold mb-2">Current Semester</h4>
                            <p className="text-gray-500 text-sm">Semester {user.semester} subjects</p>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => navigate('/practice')}
                            className="glass-card rounded-2xl p-6 text-left group"
                        >
                            <div className="text-3xl mb-3">🎯</div>
                            <h4 className="text-gray-900 font-bold mb-2">Practice</h4>
                            <p className="text-gray-500 text-sm">Start practice session</p>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => navigate('/analytics')}
                            className="glass-card rounded-2xl p-6 text-left group"
                        >
                            <div className="text-3xl mb-3">📊</div>
                            <h4 className="text-gray-900 font-bold mb-2">Analytics</h4>
                            <p className="text-gray-500 text-sm">View your progress</p>
                        </motion.button>
                    </motion.div>
                )}
            </div>

            {/* Footer Insight */}
            <div className="glass-card rounded-[3rem] p-12 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent">
                <div className="max-w-2xl">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Master Your Coursework 🚀</h3>
                    <p className="text-gray-600 text-lg leading-relaxed mb-8">
                        Our AI syllabus engine breaks down complex subjects into bite-sized units and topics, ensuring you cover every aspect of the Anna University curriculum with confidence.
                    </p>
                    <Link to="/practice" className="text-primary-400 font-bold hover:text-primary-300 flex items-center gap-2 group">
                        Start Quick Practice Session <span className="group-hover:translate-x-2 transition-transform">→</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
