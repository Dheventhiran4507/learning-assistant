import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import {
    AcademicCapIcon,
    BookOpenIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    ChevronRightIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';
import './SemesterViewPage.css'; // Import the new CSS

const SemesterViewPage = () => {
    const { semesterNum } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        // Access Control
        if (user && parseInt(semesterNum) > user.semester) {
            toast.error(`You cannot access Semester ${semesterNum} yet.`);
            navigate('/dashboard');
            return;
        }

        const fetchSubjects = async () => {
            try {
                const response = await api.get(`/syllabus/semester/${semesterNum}`);
                if (response.data.success) {
                    setSubjects(response.data.data);
                }
            } catch (error) {
                toast.error('Failed to load semester subjects');
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, [semesterNum, user, navigate]);

    const handleSearchElective = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setSearching(true);
        try {
            // This will trigger auto-generation if not found
            const response = await api.get(`/syllabus/subject/${searchTerm.toUpperCase()}?semester=${semesterNum}`);
            if (response.data.success) {
                navigate(`/subject/${searchTerm.toUpperCase()}`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Subject not found');
        } finally {
            setSearching(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-content">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">Loading curriculum...</p>
                    <div className="loading-progress-bar">
                        <motion.div
                            className="loading-progress-fill"
                            animate={{ x: [-200, 200] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="semester-view-container">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="semester-view-header"
            >
                <div className="semester-view-breadcrumb">
                    <Link to="/dashboard" className="breadcrumb-link">Dashboard</Link>
                    <ChevronRightIcon className="breadcrumb-separator" />
                    <span className="breadcrumb-current">Semester {semesterNum} Catalog</span>
                </div>
                <div className="semester-view-header-flex">
                    <div>
                        <h1 className="semester-view-title">
                            Semester <span className="semester-number-highlight">{semesterNum}</span>
                        </h1>
                        <p className="semester-view-subtitle">
                            Access your core academic subjects and elective modules for technical mastery.
                        </p>
                    </div>

                    <div className="stats-and-search">
                        <div className="semester-stats-card">
                            <div>
                                <div className="stats-card-label">Enrolled Subjects</div>
                                <div className="stats-card-value">{subjects.length} Subjects</div>
                            </div>
                            <AcademicCapIcon className="stats-card-icon" />
                        </div>

                        {/* Search/Add Elective Bar - Restricted to Advisor/HOD/Admin */}
                        {(user?.role === 'admin' || user?.role === 'hod' || user?.role === 'advisor') && (
                            <form onSubmit={handleSearchElective} className="search-elective-form">
                                <div className="search-icon-wrapper">
                                    <MagnifyingGlassIcon className="search-icon" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Add Elective (e.g. CS3001)"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                                <button
                                    type="submit"
                                    disabled={searching}
                                    className="search-submit-btn"
                                >
                                    {searching ? '...' : <><PlusIcon className="add-icon" /> ADD</>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </motion.div>

            <div className="subjects-grid">
                {subjects.map((subject, index) => (
                    <motion.div
                        key={subject.subjectCode}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        whileHover={{ y: -8 }}
                        className="subject-card"
                        onClick={() => navigate(`/subject/${subject.subjectCode}`)}
                    >
                        <div className="subject-card-glow"></div>

                        <div className="subject-card-content">
                            <div className="subject-card-header">
                                <div className="subject-icon-wrapper">
                                    <BookOpenIcon className="subject-icon" />
                                </div>
                                <span className="subject-credits-tag">
                                    {subject.credits} Credits
                                </span>
                            </div>

                            <h3 className="subject-name">
                                {subject.subjectName}
                            </h3>
                            <p className="subject-code">{subject.subjectCode}</p>

                            <div className="subject-card-footer">
                                <div className="subject-modules-count">
                                    <AcademicCapIcon className="modules-icon" />
                                    <span className="modules-text">{subject.units?.length || 5} Modules</span>
                                </div>
                                <button
                                    className="btn-premium subject-analyze-btn"
                                >
                                    Analyze →
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {subjects.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="no-subjects-view"
                >
                    <BookOpenIcon className="no-subjects-icon" />
                    <p className="no-subjects-text">No subjects found for this semester yet.</p>
                    <Link to="/dashboard" className="back-dashboard-btn">
                        <ArrowRightIcon className="back-icon" /> Back to Dashboard
                    </Link>
                </motion.div>
            )}
        </div>
    );
};

export default SemesterViewPage;
