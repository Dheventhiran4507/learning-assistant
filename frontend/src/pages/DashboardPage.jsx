import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import './DashboardPage.css';
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
} from '@heroicons/react/24/outline'; // cleaned unused icons

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
        { label: 'Syllabus Coverage', value: `${syllabusProgress}%`, icon: <BookOpenIcon className="dashboard-stat-icon icon-primary" /> },
        { label: 'Topics Mastered', value: topicsMastered.toString(), icon: <AcademicCapIcon className="dashboard-stat-icon icon-dark" /> },
        { label: 'Research Queries', value: (stats?.learningStats?.totalDoubtsCleared || 0).toString(), icon: <DocumentMagnifyingGlassIcon className="dashboard-stat-icon icon-accent" /> },
    ];

    if (loading) {
        return (
            <div className="dashboard-loading-container">
                <div className="dashboard-loading-content">
                    <div className="dashboard-loading-spinner"></div>
                    <p className="dashboard-loading-text">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="dashboard-header-wrapper"
            >
                <h1 className="dashboard-title">
                    SYSTEM <span className="lumina-text-gradient">ACCESS</span>
                </h1>
                <p className="dashboard-subtitle">
                    Welcome, {user?.name}. Intelligence dashboard synchronized for Regulation 2021 protocols.
                </p>
            </motion.div>

            <div className="dashboard-stats-grid">
                {stats_cards.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="lumina-card dashboard-stat-card lumina-card-hover"
                    >
                        <div className="dashboard-stat-icon-wrapper">
                            {stat.icon}
                        </div>
                        <h3 className="dashboard-stat-value">{stat.value}</h3>
                        <p className="dashboard-stat-label">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="dashboard-semester-section">
                <div className="dashboard-semester-header">
                    <div>
                        <h2 className="dashboard-semester-title">Select Semester</h2>
                        <p className="dashboard-semester-subtitle">Regulation 2021 • Anna University Syllabus</p>
                    </div>
                    <div className="dashboard-semester-badge">
                        <span className="dashboard-semester-badge-label">Available: </span>
                        <span className="dashboard-semester-badge-value">S1 - S{userCurrentSemester}</span>
                    </div>
                </div>

                {/* Lumina Style Dropdown Selector */}
                <div className="dashboard-dropdown-container dropdown-container">
                    <motion.button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="lumina-card dashboard-dropdown-btn group"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.995 }}
                    >
                        <div className="dashboard-dropdown-btn-left">
                            <div className="dashboard-dropdown-icon-wrapper">
                                <BookOpenIcon className="dashboard-dropdown-icon" />
                            </div>
                            <div className="dashboard-dropdown-text-wrapper">
                                <h3 className="dashboard-dropdown-title">
                                    {selectedSemester ? `Semester ${selectedSemester}` : 'Choose Your Semester'}
                                </h3>
                                <p className="dashboard-dropdown-subtitle">
                                    Select from S1 to S{userCurrentSemester} to access your curriculum
                                </p>
                            </div>
                        </div>
                        <motion.div
                            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                            className="dashboard-dropdown-chevron-wrapper"
                        >
                            <ChevronDownIcon className="dashboard-chevron" />
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
                                className="dashboard-dropdown-menu"
                            >
                                <div className="dashboard-dropdown-grid custom-scrollbar">
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
                                            className={`dashboard-dropdown-item ${
                                                user?.semester === sem ? 'active' : 'inactive'
                                                }`}
                                        >
                                            {user?.semester === sem && (
                                                <div className="dashboard-dropdown-item-badge">
                                                    Current
                                                </div>
                                            )}
                                            <div className={`dashboard-dropdown-item-title ${user?.semester === sem ? 'item-title-active' : 'item-title-inactive'}`}>
                                                S{sem}
                                            </div>
                                            <div className="dashboard-dropdown-item-subtitle">
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
                        className="dashboard-quick-access-grid"
                    >
                        <motion.button
                            whileHover={{ y: -5 }}
                            onClick={() => navigate(`/semester/${user.semester}`)}
                            className="lumina-card dashboard-quick-card lumina-card-hover"
                        >
                            <div className="dashboard-quick-icon-wrapper">
                                <BookOpenIcon className="dashboard-quick-icon" />
                            </div>
                            <h4 className="dashboard-quick-title">Current Semester</h4>
                            <p className="dashboard-quick-subtitle">Access Semester {user.semester} topics</p>
                        </motion.button>
                        <motion.button
                            whileHover={{ y: -5 }}
                            onClick={() => navigate('/practice')}
                            className="lumina-card dashboard-quick-card lumina-card-hover"
                        >
                            <div className="dashboard-quick-icon-wrapper">
                                <CursorArrowRaysIcon className="dashboard-quick-icon" />
                            </div>
                            <h4 className="dashboard-quick-title">Practice Hub</h4>
                            <p className="dashboard-quick-subtitle">Interactive AI study sessions</p>
                        </motion.button>
                        <motion.button
                            whileHover={{ y: -5 }}
                            onClick={() => navigate('/analytics')}
                            className="lumina-card dashboard-quick-card lumina-card-hover"
                        >
                            <div className="dashboard-quick-icon-wrapper">
                                <ChartBarIcon className="dashboard-quick-icon" />
                            </div>
                            <h4 className="dashboard-quick-title">Learning Analytics</h4>
                            <p className="dashboard-quick-subtitle">Track your detailed progress</p>
                        </motion.button>
                    </motion.div>
                )}
            </div>

            {/* Footer Insight */}
            <div className="lumina-card dashboard-footer-card">
                <div className="dashboard-footer-bg-blob"></div>
                <div className="dashboard-footer-content">
                    <h3 className="dashboard-footer-title">Master Your <span className="dashboard-footer-title-highlight">Curriculum</span></h3>
                    <p className="dashboard-footer-subtitle">
                        Our AI-powered syllabus engine structures complex subjects into manageable units, helping you master the Anna University curriculum efficiently.
                    </p>
                    <button 
                        onClick={() => navigate('/practice')} 
                        className="dashboard-footer-btn group"
                    >
                        Start Learning Now <ArrowRightIcon className="dashboard-arrow" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
