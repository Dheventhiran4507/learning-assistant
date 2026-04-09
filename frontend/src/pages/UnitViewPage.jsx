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
import './UnitViewPage.css'; // Import the new CSS

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
            <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!unit) return <div className="unit-view-container"><div className="loading-spinner-container"><div className="loading-text">Unit configuration not found</div></div></div>;

    return (
        <div className="unit-view-container">
            <div className="unit-view-wrapper">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="unit-view-header"
                >
                    <div className="unit-view-breadcrumb">
                        <Link to="/dashboard" className="breadcrumb-link">Dashboard</Link>
                        <ChevronRightIcon className="breadcrumb-separator" />
                        <Link to={`/semester/${subject?.semester}`} className="breadcrumb-link">Semester {subject?.semester}</Link>
                        <ChevronRightIcon className="breadcrumb-separator" />
                        <Link to={`/subject/${subjectCode}`} className="breadcrumb-link">{subjectCode}</Link>
                        <ChevronRightIcon className="breadcrumb-separator" />
                        <span className="breadcrumb-current">Module {unitNumber}</span>
                    </div>
                    <div className="unit-view-header-flex">
                        <div>
                            <h1 className="unit-view-title">
                                {unit.unitTitle} <span className="unit-title-highlight">Concepts</span>
                            </h1>
                            <p className="unit-view-subtitle">Master each module through focused academic analysis and testing.</p>
                        </div>
                        <div className="unit-proficiency-card shadow-sm">
                            <div className="proficiency-label">Module Proficiency</div>
                            <div className="proficiency-value">{calculateUnitProgress()}% <span>Acquired</span></div>
                        </div>
                    </div>
                </motion.div>

                <div className="topics-grid">
                    {unit.topics.map((topic, index) => (
                        <motion.div
                            key={topic.topicName}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="topic-card group"
                        >
                            <div>
                                <div className="topic-card-header">
                                    <span className={`complexity-badge ${topic.difficulty === 'hard' ? 'hard' :
                                        topic.difficulty === 'medium' ? 'medium' :
                                            'easy'
                                        }`}>
                                        {topic.difficulty || 'Standard'} Complexity
                                    </span>
                                    <div className="topic-status-icons">
                                        {isTopicCompleted(topic.topicName) && (
                                            <div className="verified-badge">
                                                <CheckCircleIcon className="verified-icon" /> VERIFIED
                                            </div>
                                        )}
                                        <div className="sparkle-icon-wrapper">
                                            <SparklesIcon className="topic-sparkle-icon" />
                                        </div>
                                    </div>
                                </div>
                                <h3 className={`topic-name ${isTopicCompleted(topic.topicName) ? 'completed' : ''}`}>
                                    {topic.topicName}
                                </h3>
                                {topic.subtopics && topic.subtopics.length > 0 ? (
                                    <div className="subtopics-wrap">
                                        {topic.subtopics.map(st => (
                                            <span key={st} className="subtopic-tag">
                                                {st}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="topic-desc">Comprehensive academic study covers theoretical principles and practical applications of {topic.topicName}.</p>
                                )}
                            </div>

                            <div className="topic-card-actions">
                                <div className="practice-btn-wrapper">
                                    <button
                                        onClick={() => startTopicPractice(topic.topicName, topic.difficulty || 'medium')}
                                        className="btn-premium topic-practice-btn"
                                    >
                                        <CursorArrowRaysIcon className="practice-icon" />
                                        Interactive Practice
                                    </button>
                                </div>
                                <Link
                                    to={`/chat?q=Explain the concept of ${encodeURIComponent(topic.topicName)} in ${subjectCode}`}
                                    className="chat-btn-circle group/btn"
                                >
                                    <ChatBubbleLeftRightIcon className="chat-circle-icon" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="achievement-card-gradient"
                >
                    <div className="achievement-card-content">
                        <div className="achievement-title">Module Achievement Test</div>
                        <p className="achievement-desc">
                            Ready to validate your overall understanding of {unit.unitTitle}? Complete the comprehensive module assessment.
                        </p>
                        <button
                            onClick={() => navigate(`/practice?subject=${subjectCode}&unit=${unitNumber}`)}
                            className="btn-premium achievement-start-btn"
                        >
                            Start Assessment <ArrowRightIcon className="achievement-arrow-icon" />
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UnitViewPage;
