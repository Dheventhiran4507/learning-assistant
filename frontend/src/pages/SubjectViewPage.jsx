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
import './SubjectViewPage.css'; // Import the new CSS

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
            <div className="loading-container">
                <div className="loading-content">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">Loading curriculum details...</p>
                </div>
            </div>
        );
    }

    if (!subject) return <div className="loading-container"><div className="loading-text">Subject not found</div></div>;

    return (
        <div className="subject-view-container">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="subject-view-header"
            >
                <div className="subject-view-breadcrumb">
                    <Link to="/dashboard" className="breadcrumb-link">Dashboard</Link>
                    <ChevronRightIcon className="breadcrumb-separator" />
                    <Link to={`/semester/${subject.semester}`} className="breadcrumb-link">Semester {subject.semester}</Link>
                    <ChevronRightIcon className="breadcrumb-separator" />
                    <span className="breadcrumb-current">{subject.subjectCode}</span>
                </div>
                <div className="subject-view-header-flex">
                    <div>
                        <h1 className="subject-view-title">
                            {subject.subjectName} <span className="subject-title-highlight">Curriculum</span>
                        </h1>
                        <p className="subject-view-subtitle">Standardized syllabus breakdown • Regulation {subject.regulation}</p>
                    </div>
                    <div className="subject-view-actions">
                        <div className="subject-modules-card">
                            <div className="modules-card-label">Modules</div>
                            <div className="modules-card-value">{subject.units?.length || 0}</div>
                        </div>
                        {isAdmin && (
                            <button
                                onClick={handleRegenerate}
                                disabled={isRegenerating}
                                className="regenerate-btn"
                            >
                                <ArrowPathIcon className={`regenerate-icon ${isRegenerating ? 'icon-spin' : ''}`} />
                                {isRegenerating ? 'Regenerating...' : 'Refresh Grounding'}
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>

            <div className="units-grid">
                {subject.units?.map((unit, index) => (
                    <motion.div
                        key={unit.unitNumber}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08 }}
                        whileHover={{ x: 8 }}
                        className="unit-card"
                        onClick={() => navigate(`/unit/${subjectCode}/${unit.unitNumber}`)}
                    >
                        <div className="unit-card-marker"></div>
                        <div className="unit-card-glow"></div>

                        <div className="unit-card-main">
                            <div className="unit-number-box">
                                {unit.unitNumber}
                            </div>
                            <div className="unit-card-content">
                                <h3 className="unit-title">
                                    {unit.unitTitle}
                                </h3>
                                <div className="unit-meta">
                                    <BookOpenIcon className="unit-meta-icon" />
                                    <p className="unit-meta-text">{unit.topics?.length || 0} Topics • {getUnitProgress(unit)}% Proficiency</p>
                                </div>
                                <div className="unit-progress-container">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${getUnitProgress(unit)}%` }}
                                        className="unit-progress-bar"
                                    />
                                </div>
                            </div>
                        </div>

                        <Link
                            to={`/unit/${subjectCode}/${unit.unitNumber}`}
                            className="unit-analyze-btn btn-premium"
                        >
                            <div className="analyze-btn-content">
                                Analyze Modules <ArrowRightIcon className="analyze-btn-icon" />
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default SubjectViewPage;
