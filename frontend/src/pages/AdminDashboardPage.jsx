import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import {
    UserIcon,
    AcademicCapIcon,
    ChatBubbleBottomCenterTextIcon,
    ArrowTrendingUpIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    PencilSquareIcon,
    ChartPieIcon,
    LightBulbIcon,
    XMarkIcon,
    ArrowPathIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

const AdminDashboardPage = () => {
    const { user, updateUser } = useAuthStore();
    const isAdmin = user?.role === 'admin' || user?.role === 'hod';
    const isAdvisor = user?.role === 'advisor';
    const isStaff = user?.role === 'staff';

    const [students, setStudents] = useState([]);
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSemester, setSelectedSemester] = useState(user?.semester || 1);
    const [subjects, setSubjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('students'); // 'students' or 'staff'
    const [staff, setStaff] = useState([]);
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [studentFormData, setStudentFormData] = useState({
        id: '',
        name: '',
        email: '',
        studentId: '',
        password: '',
        role: 'student',
        semester: selectedSemester,
        subjectsHandled: []
    });
    const [availableSubjects, setAvailableSubjects] = useState({});
    const [showElectiveModal, setShowElectiveModal] = useState(false);
    const [electiveSearch, setElectiveSearch] = useState('');
    const [addingElective, setAddingElective] = useState(false);
    const [regeneratingSubjects, setRegeneratingSubjects] = useState({});
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [savingStudent, setSavingStudent] = useState(false);
    const [doubts, setDoubts] = useState([]);

    // Fetch fresh user data to ensure role and semester are up to date
    useEffect(() => {
        const refreshUser = async () => {
            try {
                const response = await api.get('/auth/me');
                if (response.data.success) {
                    updateUser(response.data.data);
                }
            } catch (error) {
                console.error('Failed to refresh user profile:', error);
            }
        };
        refreshUser();
    }, [updateUser]);

    // Force semester to advisor/staff's assigned semester
    useEffect(() => {
        if ((user?.role === 'advisor' || user?.role === 'staff') && user?.semester) {
            setSelectedSemester(user.semester);
        }
    }, [user?.role, user?.semester]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const requests = [
                api.get(`/analytics/hod/stats?semester=${selectedSemester}`),
                api.get(`/syllabus/semester/${selectedSemester}`)
            ];

            // If HOD/Admin/Advisor, also fetch staff list
            if (isAdmin || isAdvisor) {
                requests.push(api.get('/analytics/staff'));
            }

            const [statsRes, syllabusRes, staffRes] = await Promise.all(requests);

            if (statsRes.data.success) {
                setStudents(statsRes.data.data.students);
                setMetrics(statsRes.data.data.batchMetrics);
            }

            if (syllabusRes.data.success) {
                setSubjects(syllabusRes.data.data);
            }

            if (staffRes?.data?.success) {
                setStaff(staffRes.data.data);
            }
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableSubjects = async () => {
        try {
            const response = await api.get('/syllabus/available');
            if (response.data.success) {
                setAvailableSubjects(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch available subjects:', error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchAvailableSubjects();
        setSelectedSubject(null); // Clear selection on semester change
    }, [selectedSemester]);

    const handleManageStudent = async (e) => {
        // ... (existing code omitted for brevity in instruction, will keep it in ReplacementContent)
        e.preventDefault();
        setSavingStudent(true);
        try {
            const response = await api.post('/auth/manage-account', {
                ...studentFormData,
                id: editingStudent?._id || '',
                semester: studentFormData.role === 'student' ? selectedSemester : studentFormData.semester
            });

            if (response.data.success) {
                toast.success(response.data.message);
                setShowStudentModal(false);
                fetchData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to manage account');
        } finally {
            setSavingStudent(false);
        }
    };

    const handleDeleteAccount = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}'s account? This cannot be undone.`)) return;
        
        try {
            const response = await api.delete(`/auth/account/${id}`);
            if (response.data.success) {
                toast.success('Account deleted successfully');
                fetchData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete account');
        }
    };

    const openStudentModal = (item = null, type = 'student') => {
        if (item) {
            setEditingStudent(item);
            setStudentFormData({
                id: item._id,
                name: item.name,
                email: item.email,
                studentId: item.studentId,
                password: '',
                role: item.role || type,
                semester: item.semester,
                subjectsHandled: item.subjectsHandled || []
            });
        } else {
            setEditingStudent(null);
            setStudentFormData({
                id: '',
                name: '',
                email: '',
                studentId: type === 'student' ? '' : `STAFF-${Date.now()}`,
                password: '',
                role: type,
                semester: isAdvisor ? user.semester : (type === 'student' ? selectedSemester : 1),
                subjectsHandled: []
            });
        }
        setShowStudentModal(true);
    };

    const handleSelectElective = async (code) => {
        setAddingElective(true);
        try {
            const response = await api.get(`/syllabus/subject/${code.toUpperCase()}?semester=${selectedSemester}`);
            if (response.data.success) {
                toast.success(`${code} added to Semester ${selectedSemester}`);
                setShowElectiveModal(false);
                fetchData(); // Refresh syllabus list
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add elective');
        } finally {
            setAddingElective(false);
        }
    };

    const handleDeleteSubject = async (code, e) => {
        e.stopPropagation();
        if (!window.confirm(`Are you sure you want to delete ${code}? All student progress for this subject will be lost.`)) {
            return;
        }

        try {
            const response = await api.delete(`/syllabus/subject/${code}`);
            if (response.data.success) {
                toast.success(response.data.message);
                fetchData(); // Refresh syllabus list
                if (selectedSubject?.subjectCode === code) {
                    setSelectedSubject(null);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete subject');
        }
    };

    const handleRegenerateSyllabus = async (code, e) => {
        e.stopPropagation();
        if (!window.confirm(`Are you sure you want to re-generate the syllabus for ${code}? This will refresh it using the latest Anna University grounding logic.`)) return;

        setRegeneratingSubjects(prev => ({ ...prev, [code]: true }));
        const toastId = toast.loading(`Re-generating ${code} syllabus...`);

        try {
            const response = await api.post(`/syllabus/subject/${code}/regenerate`);
            if (response.data.success) {
                toast.success(`Successfully refreshed ${code} syllabus`, { id: toastId });
                fetchData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to refresh ${code}`, { id: toastId });
        } finally {
            setRegeneratingSubjects(prev => ({ ...prev, [code]: false }));
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-container">
                    <div className="no-students-view">
                        <p className="no-students-text">Accessing Intelligence Dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            {/* Header */}
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">
                        Academic <span className="admin-title-highlight">Controller</span>
                    </h1>
                    <p className="admin-subtitle">
                        {isAdvisor
                            ? `Comprehensive oversight for Semester ${user.semester} standardized curriculum.`
                            : 'Centralized management of student performance and institutional syllabus auditing.'}
                    </p>
                </div>
                <div className="admin-header-actions">
                    <div className="admin-metrics-card">
                        <span className="admin-metrics-label">Total Students</span>
                        <span className="admin-metrics-value">{metrics?.totalStudents || 0}</span>
                    </div>
                </div>
            </div>

            {/* Batch Metrics */}
            <div className="admin-batch-grid">
                <div className="admin-batch-card-dark">
                    <div className="admin-batch-blob"></div>
                    <div className="admin-batch-header">
                        <ArrowTrendingUpIcon className="admin-batch-icon-dark" />
                        <h3 className="admin-batch-title-dark">Batch Progress Audit</h3>
                    </div>
                    <p className="admin-batch-value-dark">{metrics?.avgProgress || 0}%</p>
                </div>
                <div className="admin-batch-card-light">
                    <div className="admin-batch-header">
                        <ChatBubbleBottomCenterTextIcon className="admin-batch-icon-light" />
                        <h3 className="admin-batch-title-light">Queries Resolved</h3>
                    </div>
                    <p className="admin-batch-value-light">{metrics?.totalDoubts || 0}</p>
                </div>
                <div className="admin-batch-card-light">
                    <div className="admin-batch-header">
                        <ChartPieIcon className="admin-batch-icon-light" />
                        <h3 className="admin-batch-title-light">System Engagement</h3>
                    </div>
                    <p className="admin-batch-value-light">Optimal</p>
                </div>
            </div>

            {/* Main Grid */}
            <div className="admin-main-grid">

                {/* Subject Management (1/3) */}
                <div className="admin-left-col">
                    <div className="admin-col-header">
                        <h2 className="admin-section-title">CURRICULUM ENGINE</h2>
                    </div>
                    <div className="admin-controls-wrapper">
                        {isAdmin ? (
                            <select
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
                                className="admin-select"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                            </select>
                        ) : (
                            <div className="admin-select-display">
                                Semester {selectedSemester}
                            </div>
                        )}
                        <div className="admin-actions-flex">
                            <button 
                                onClick={() => {
                                    setEditingStudent(null);
                                    setStudentFormData({ name: '', studentId: '', email: '', role: 'student', semester: selectedSemester, subjectsHandled: [] });
                                    setShowStudentModal(true);
                                }}
                                className="admin-add-btn"
                            >
                                <PlusIcon className="admin-btn-icon" />
                            </button>
                            <button 
                                onClick={() => setShowElectiveModal(true)}
                                className="admin-elective-btn"
                            >
                                <SparklesIcon className="admin-btn-icon" />
                            </button>
                        </div>
                    </div>

                    <div className="admin-subjects-list">
                        {subjects.map((subject, idx) => (
                            <motion.div
                                key={subject.subjectCode}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => setSelectedSubject(selectedSubject?.subjectCode === subject.subjectCode ? null : subject)}
                                className={`admin-subject-item ${selectedSubject?.subjectCode === subject.subjectCode ? 'active' : 'inactive'}`}
                            >
                                <div>
                                    <div className="admin-subject-meta">
                                        <span className={`admin-subject-code ${selectedSubject?.subjectCode === subject.subjectCode ? 'active' : 'inactive'}`}>{subject.subjectCode}</span>
                                        <span className={`admin-subject-badge ${selectedSubject?.subjectCode === subject.subjectCode ? 'active' : 'inactive'}`}>
                                            {subject.subjectCode.startsWith('C') && !subject.subjectCode.startsWith('CS') ? 'ELECTIVE' : 'CORE'}
                                        </span>
                                    </div>
                                    <h4 className={`admin-subject-name ${selectedSubject?.subjectCode === subject.subjectCode ? 'active' : 'inactive'}`}>
                                        {subject.subjectName}
                                    </h4>
                                </div>
                                <div className="admin-subject-actions">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRegenerateSyllabus(subject.subjectCode, e); }}
                                        className={`action-icon-btn ${regeneratingSubjects[subject.subjectCode] ? 'active' : ''}`}
                                        title="Re-generate Syllabus Structure"
                                        disabled={regeneratingSubjects[subject.subjectCode]}
                                    >
                                        <ArrowPathIcon className={`action-icon ${regeneratingSubjects[subject.subjectCode] ? 'animate-spin' : ''}`} />
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteSubject(subject.subjectCode, e)}
                                        className="action-icon-btn delete"
                                        title="Delete Subject"
                                    >
                                        <TrashIcon className="action-icon" />
                                    </button>
                                    <AcademicCapIcon className={`action-icon ${selectedSubject?.subjectCode === subject.subjectCode ? 'active' : 'inactive'}`} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Management Section (2/3) */}
                <div className="admin-right-col">
                    {/* Tabs for HOD / Advisor */}
                    {(isAdmin || isAdvisor) && (
                        <div className="admin-tabs-wrapper">
                            <button
                                onClick={() => setActiveTab('students')}
                                className={`admin-tab ${activeTab === 'students' ? 'active' : 'inactive'}`}
                            >
                                Student Metrics
                            </button>
                            <button
                                onClick={() => setActiveTab('staff')}
                                className={`admin-tab ${activeTab === 'staff' ? 'active' : 'inactive'}`}
                            >
                                Institutional Staff
                            </button>
                            <button
                                onClick={() => setActiveTab('doubts')}
                                className={`admin-tab ${activeTab === 'doubts' ? 'active' : 'inactive'}`}
                            >
                                Doubt Desk
                            </button>
                        </div>
                    )}

                    {isStaff && (
                         <div className="admin-tabs-wrapper">
                            <button
                                onClick={() => setActiveTab('students')}
                                className={`admin-tab ${activeTab === 'students' ? 'active' : 'inactive'}`}
                            >
                                Student Metrics
                            </button>
                            <button
                                onClick={() => setActiveTab('doubts')}
                                className={`admin-tab ${activeTab === 'doubts' ? 'active' : 'inactive'}`}
                            >
                                Doubt Desk
                            </button>
                         </div>
                    )}

                    <div className="admin-list-header">
                        <h2 className="admin-section-title">
                            {activeTab === 'students' ? 'Cohort Intelligence' : activeTab === 'staff' ? 'Institutional Directory' : 'Student Doubts'}
                        </h2>
                        <div className="admin-controls-wrapper-search">
                            <div className="admin-list-search">
                                <MagnifyingGlassIcon className="admin-search-icon" />
                                <input
                                    type="text"
                                    placeholder={`Filter ${activeTab === 'students' ? 'Students' : 'Personnel'}...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="admin-search-input"
                                />
                            </div>
                            <button
                                onClick={() => openStudentModal(null, activeTab === 'students' ? 'student' : 'staff')}
                                className="admin-add-btn"
                            >
                                <PlusIcon className="admin-btn-icon" />
                            </button>
                        </div>
                    </div>

                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead className="admin-thead">
                                {activeTab === 'students' ? (
                                    <tr>
                                        <th className="admin-th">Student</th>
                                        <th className="admin-th-center">
                                            {selectedSubject ? `${selectedSubject.subjectCode} Progress` : 'Overall Progress'}
                                        </th>
                                        <th className="admin-th-center">Doubts</th>
                                        <th className="admin-th-right">Predicted Score</th>
                                        <th className="admin-th"></th>
                                    </tr>
                                ) : activeTab === 'staff' ? (
                                    <tr>
                                        <th className="admin-th">Staff Member</th>
                                        <th className="admin-th-center">Assigned Semester</th>
                                        <th className="admin-th-center">Role</th>
                                        <th className="admin-th-right">Status</th>
                                        <th className="admin-th"></th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th className="admin-th">Student / Subject</th>
                                        <th className="admin-th-center">Query Content</th>
                                        <th className="admin-th-right">Timestamp</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody className="admin-tbody">
                                {activeTab === 'students' ? (
                                    filteredStudents.map((student, idx) => (
                                        <motion.tr
                                            key={student._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="admin-tr"
                                        >
                                            <td className="admin-td">
                                                <div className="admin-user-info">
                                                    <div className="admin-avatar">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div className="admin-pointer" onClick={() => openStudentModal(student)}>
                                                        <p className="admin-user-name">
                                                            {student.name}
                                                            <PencilSquareIcon className="admin-edit-icon" />
                                                        </p>
                                                        <p className="admin-user-id">{student.studentId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="admin-td">
                                                <div className="admin-progress-wrapper">
                                                    {selectedSubject ? (() => {
                                                        const sp = (student.subjectProgress || []).find(p => p.subjectCode.toUpperCase() === selectedSubject.subjectCode.toUpperCase());
                                                        const totalTopicsInSyllabus = (selectedSubject.units || []).reduce((acc, u) => acc + (u.topics?.length || 0), 0);
                                                        const completedCount = sp?.topicsCompleted?.length || 0;
                                                        const progress = sp?.progress || 0;

                                                        return (
                                                            <div className="progress-container">
                                                                <div className="progress-value-large">
                                                                    {completedCount} <span className="progress-label-small">/ {totalTopicsInSyllabus} Topics</span>
                                                                </div>
                                                                <div className="progress-bar-bg">
                                                                    <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                                                                </div>
                                                                <span className="progress-percent-label">{progress}% COMPLETED</span>
                                                            </div>
                                                        );
                                                    })() : (
                                                        <div className="progress-container-small">
                                                            <div className="progress-bar-bg-small">
                                                                <div className="progress-bar-fill-small" style={{ width: `${student.progress}%` }}></div>
                                                            </div>
                                                            <span className="progress-overall-label">Overall {student.progress}%</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="admin-td-center-bold">
                                                {student.doubts}
                                            </td>
                                            <td className="admin-td-right">
                                                <div className="admin-score-wrapper">
                                                    <span className={`score-badge ${student.predictedScore > 80 ? 'high' : student.predictedScore > 60 ? 'mid' : 'low'}`}>
                                                        {student.predictedScore} / 100
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteAccount(student._id, student.name)}
                                                        className="action-icon-btn delete"
                                                    >
                                                        <TrashIcon className="action-icon" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : activeTab === 'staff' ? (
                                    staff.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase())).map((member, idx) => (
                                        <motion.tr
                                            key={member._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="admin-tr"
                                        >
                                            <td className="admin-td">
                                                <div className="admin-user-info">
                                                    <div className="admin-avatar-staff">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <div className="admin-pointer" onClick={() => openStudentModal(member, 'advisor')}>
                                                        <p className="admin-user-name">
                                                            {member.name}
                                                            <PencilSquareIcon className="admin-edit-icon" />
                                                        </p>
                                                        <p className="admin-user-id">{member.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="admin-td-center">
                                                <span className="admin-semester-badge">
                                                    Semester {member.semester}
                                                </span>
                                            </td>
                                            <td className="admin-td-center-role">
                                                {member.role}
                                            </td>
                                            <td className="admin-td-right">
                                                <div className="admin-score-wrapper">
                                                    <span className={`score-badge ${member.isActive ? 'high' : 'low'}`}>
                                                        {member.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteAccount(member._id, member.name)}
                                                        className="action-icon-btn delete"
                                                    >
                                                        <TrashIcon className="action-icon" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    doubts.filter(d => 
                                        d.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                        d.userMessage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        d.subject?.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase())
                                    ).map((doubt, idx) => (
                                        <motion.tr
                                            key={doubt._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="admin-tr"
                                        >
                                            <td className="admin-td">
                                                <div className="admin-doubt-info">
                                                    <p className="admin-user-name">{doubt.student?.name || 'Anonymous'}</p>
                                                    <div className="admin-doubt-meta">
                                                        <span className="admin-doubt-code">{doubt.subject?.subjectCode || 'General'}</span>
                                                        <span className="admin-doubt-sem">Sem {doubt.student?.semester}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="admin-td">
                                                <p className="admin-doubt-text">
                                                    "{doubt.userMessage}"
                                                </p>
                                                <p className="admin-doubt-ai">AI Resp: {doubt.aiResponse?.substring(0, 60)}...</p>
                                            </td>
                                            <td className="admin-td-right-date">
                                                {new Date(doubt.createdAt).toLocaleDateString()}
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Footer Insight */}
            <div className="admin-footer-insight">
                <div className="admin-footer-blob"></div>
                <div className="admin-footer-content">
                    <div className="admin-footer-header">
                        <LightBulbIcon className="admin-footer-icon" />
                        <h3 className="admin-footer-title">Predictive Audit</h3>
                    </div>
                    <p className="admin-footer-text">
                        Algorithmic analysis of batch performance indicates high friction in <span className="admin-footer-highlight">CS3492 - UNIT 3</span>. System recommendation: Targeted institutional intervention suggested for the upcoming assessment cycle.
                    </p>
                </div>
            </div>

            {/* Manage Student Modal */}
            {
                showStudentModal && (
                    <div className="modal-overlay">
                        <div className="modal-backdrop" onClick={() => setShowStudentModal(false)}></div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="modal-content"
                        >
                            <h1 className="modal-title">
                                {editingStudent ? 'Update' : 'Register'} {studentFormData.role === 'student' ? 'Student' : 'Subject Staff'}
                            </h1>
                            <form onSubmit={handleManageStudent} className="modal-form">
                                <div className="form-field-group">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={studentFormData.name}
                                        onChange={(e) => setStudentFormData({ ...studentFormData, name: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-field-group">
                                    <label className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={studentFormData.email}
                                        onChange={(e) => setStudentFormData({ ...studentFormData, email: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-field-group">
                                        <label className="form-label">Role</label>
                                        <select
                                            disabled={!isAdmin && !isAdvisor}
                                            required
                                            value={studentFormData.role}
                                            onChange={(e) => setStudentFormData({ ...studentFormData, role: e.target.value })}
                                            className="form-select"
                                        >
                                            <option value="student">Student</option>
                                            {isAdmin && <option value="advisor">Class Advisor</option>}
                                            {(isAdmin || isAdvisor) && <option value="staff">Subject Staff</option>}
                                        </select>
                                        {isAdvisor && <p className="form-hint">Role Locked to Semester {user.semester}</p>}
                                    </div>
                                    <div className="form-field-group">
                                        <label className="form-label">
                                            {studentFormData.role === 'student' ? 'Semester' : 'Assign Semester'}
                                        </label>
                                        <select
                                            required
                                            disabled={(!isAdmin && studentFormData.role === 'student') || isAdvisor}
                                            value={studentFormData.semester}
                                            onChange={(e) => setStudentFormData({ ...studentFormData, semester: parseInt(e.target.value) })}
                                            className="form-select"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                        </select>
                                        {isAdvisor && <p className="form-hint">Semester Fixed</p>}
                                    </div>
                                </div>

                                {studentFormData.role === 'student' && (
                                    <div className="form-row">
                                        <div className="form-field-group">
                                            <label className="form-label">ID / Roll No</label>
                                            <input
                                                type="text"
                                                required
                                                value={studentFormData.studentId}
                                                onChange={(e) => setStudentFormData({ ...studentFormData, studentId: e.target.value })}
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-field-group">
                                            <label className="form-label">Access Password</label>
                                            <input
                                                type="text"
                                                placeholder={editingStudent ? "Keep empty to skip" : "Welcome123"}
                                                value={studentFormData.password}
                                                onChange={(e) => setStudentFormData({ ...studentFormData, password: e.target.value })}
                                                className="form-input"
                                            />
                                        </div>
                                    </div>
                                )}
                                {studentFormData.role !== 'student' && (
                                    <div className="form-field-group">
                                        <label className="form-label">Access Password</label>
                                        <input
                                            type="text"
                                            placeholder={editingStudent ? "Keep empty to skip" : "Welcome123"}
                                            value={studentFormData.password}
                                            onChange={(e) => setStudentFormData({ ...studentFormData, password: e.target.value })}
                                            className="form-input"
                                        />
                                    </div>
                                )}

                                {(studentFormData.role === 'advisor' || studentFormData.role === 'staff') && (
                                    <div className="staff-subjects-box">
                                        <label className="form-label-block">Assigned Subjects (Lab Authority)</label>
                                        <div className="elective-subjects-grid">
                                            {subjects.map(subject => (
                                                <label key={subject.subjectCode} className="subject-checkbox-item">
                                                    <input
                                                        type="checkbox"
                                                        checked={studentFormData.subjectsHandled.some(sh => sh.subjectCode === subject.subjectCode)}
                                                        onChange={(e) => {
                                                            const isChecked = e.target.checked;
                                                            let newHandled = [...studentFormData.subjectsHandled];
                                                            if (isChecked) {
                                                                 newHandled.push({ subjectCode: subject.subjectCode, semester: studentFormData.semester });
                                                            } else {
                                                                 newHandled = newHandled.filter(sh => sh.subjectCode !== subject.subjectCode);
                                                            }
                                                            setStudentFormData({ ...studentFormData, subjectsHandled: newHandled });
                                                        }}
                                                        className="form-checkbox"
                                                    />
                                                    <div>
                                                        <p className="subject-code-label">{subject.subjectCode}</p>
                                                        <p className="subject-name-label">{subject.subjectName}</p>
                                                    </div>
                                                </label>
                                            ))}
                                            {subjects.length === 0 && (
                                                <p className="no-subjects-text">No subjects found for Semester {selectedSemester}.</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="modal-actions-footer">
                                    <button type="button" onClick={() => setShowStudentModal(false)} disabled={savingStudent} className="modal-cancel-btn">Cancel</button>
                                    <button type="submit" disabled={savingStudent} className="modal-save-btn">
                                        {savingStudent ? (
                                            <>
                                                <div className="loading-spinner-small"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <CheckIcon className="modal-save-icon" />
                                                {editingStudent ? 'Update Account' : 'Establish Account'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )
            }

            {/* Select Elective Modal */}
            {
                showElectiveModal && (
                    <div className="modal-view-overlay">
                        <div className="modal-blur-bg" onClick={() => setShowElectiveModal(false)}></div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="modal-panel-large"
                        >
                            <div className="modal-header-flex">
                                <h2 className="modal-header-title">Select Elective</h2>
                                <button onClick={() => setShowElectiveModal(false)} className="modal-close-btn">
                                    <XMarkIcon className="modal-close-icon" />
                                </button>
                            </div>

                            <div className="mb-6">
                                <input
                                    type="text"
                                    placeholder="Search by code or name... (e.g. AD3001 or AI)"
                                    value={electiveSearch}
                                    onChange={(e) => setElectiveSearch(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-primary-500/20 font-bold"
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {Object.entries(availableSubjects)
                                    .filter(([code, name]) =>
                                        code.toLowerCase().includes(electiveSearch.toLowerCase()) ||
                                        name.toLowerCase().includes(electiveSearch.toLowerCase())
                                    )
                                    .slice(0, 50) // Performance optimization
                                    .map(([code, name]) => {
                                        const isAdded = subjects.some(s => s.subjectCode === code);
                                        return (
                                            <div
                                                key={code}
                                                className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${isAdded ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100 hover:border-primary-500/50 hover:shadow-md'}`}
                                            >
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-black text-primary-500 uppercase">{code}</span>
                                                        {isAdded && <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-black">ADDED</span>}
                                                    </div>
                                                    <h4 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors uppercase text-sm">
                                                        {name}
                                                    </h4>
                                                </div>
                                                {!isAdded && (
                                                    <button
                                                        disabled={addingElective}
                                                        onClick={() => handleSelectElective(code)}
                                                        className="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-primary-600 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                                    >
                                                        {addingElective ? '...' : 'SELECT'}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>

                            <div className="mt-6 text-center text-xs text-gray-400 font-medium">
                                Showing matching subjects from R2021 Regulation.
                            </div>
                        </motion.div>
                    </div>
                )
            }
        </div >
    );
};

export default AdminDashboardPage;
