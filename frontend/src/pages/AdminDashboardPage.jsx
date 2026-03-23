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

    // Force semester to advisor's assigned semester
    useEffect(() => {
        if (user?.role === 'advisor' && user?.semester) {
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
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-bold text-lg uppercase tracking-widest">Accessing Intelligence Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 text-gray-900">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-200 pb-8">
                <div>
                    <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-2 uppercase">
                        Academic <span className="text-primary italic">Controller</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg italic max-w-xl">
                        {isAdvisor
                            ? `Comprehensive oversight for Semester ${user.semester} standardized curriculum.`
                            : 'Centralized management of student performance and institutional syllabus auditing.'}
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="glass-card px-6 py-3 rounded-2xl">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest block">Total Students</span>
                        <span className="text-2xl font-black text-gray-900">{metrics?.totalStudents || 0}</span>
                    </div>
                </div>
            </div>

            {/* Batch Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="flex items-center gap-3 mb-4">
                        <ArrowTrendingUpIcon className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em]">Batch Progress Audit</h3>
                    </div>
                    <p className="text-5xl font-black text-white">{metrics?.avgProgress || 0}%</p>
                </div>
                <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm group">
                    <div className="flex items-center gap-3 mb-4">
                        <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-purple-500" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Queries Resolved</h3>
                    </div>
                    <p className="text-5xl font-black text-slate-900">{metrics?.totalDoubts || 0}</p>
                </div>
                <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm group">
                    <div className="flex items-center gap-3 mb-4">
                        <ChartPieIcon className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">System Engagement</h3>
                    </div>
                    <p className="text-5xl font-black text-slate-900 uppercase">Optimal</p>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Subject Management (1/3) */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">CURRICULUM ENGINE</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        {isAdmin ? (
                            <select
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
                                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-4 ring-primary/5 grow uppercase text-xs tracking-widest"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                            </select>
                        ) : (
                            <div className="bg-slate-50 text-slate-900 px-6 py-3 rounded-2xl font-black border border-slate-200 flex items-center gap-2 grow text-xs tracking-widest uppercase">
                                Semester {selectedSemester}
                            </div>
                        )}
                        <button
                            onClick={() => setShowElectiveModal(true)}
                            className="bg-slate-900 text-white p-3.5 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shrink-0"
                            title="Add Elective"
                        >
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-3">
                        {subjects.map((subject, idx) => (
                            <motion.div
                                key={subject.subjectCode}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => setSelectedSubject(selectedSubject?.subjectCode === subject.subjectCode ? null : subject)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${selectedSubject?.subjectCode === subject.subjectCode ? 'bg-slate-900 border-slate-900' : 'bg-slate-50 border-slate-200 hover:border-primary/30'}`}
                            >
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${selectedSubject?.subjectCode === subject.subjectCode ? 'text-primary' : 'text-primary'}`}>{subject.subjectCode}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold italic ${selectedSubject?.subjectCode === subject.subjectCode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-400'}`}>
                                            {subject.subjectCode.startsWith('C') && !subject.subjectCode.startsWith('CS') ? 'ELECTIVE' : 'CORE'}
                                        </span>
                                    </div>
                                    <h4 className={`font-bold transition-colors uppercase text-[11px] line-clamp-1 ${selectedSubject?.subjectCode === subject.subjectCode ? 'text-white' : 'text-slate-900 group-hover:text-primary'}`}>
                                        {subject.subjectName}
                                    </h4>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRegenerateSyllabus(subject.subjectCode, e); }}
                                        className={`p-1.5 rounded-lg hover:bg-white/10 transition-all ${regeneratingSubjects[subject.subjectCode] ? 'text-primary' : 'text-slate-300 hover:text-primary'}`}
                                        title="Re-generate Syllabus Structure"
                                        disabled={regeneratingSubjects[subject.subjectCode]}
                                    >
                                        <ArrowPathIcon className={`w-4 h-4 ${regeneratingSubjects[subject.subjectCode] ? 'animate-spin' : ''}`} />
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteSubject(subject.subjectCode, e)}
                                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all"
                                        title="Delete Subject"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                    <AcademicCapIcon className={`w-4 h-4 transition-colors ${selectedSubject?.subjectCode === subject.subjectCode ? 'text-primary' : 'text-slate-300 group-hover:text-primary'}`} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Management Section (2/3) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Tabs for HOD / Advisor */}
                    {(isAdmin || isAdvisor) && (
                        <div className="flex gap-4 border-b border-slate-100 pb-4">
                            <button
                                onClick={() => setActiveTab('students')}
                                className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all ${activeTab === 'students' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Student Metrics
                            </button>
                            <button
                                onClick={() => setActiveTab('staff')}
                                className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all ${activeTab === 'staff' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Institutional Staff
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tighter">
                            {activeTab === 'students' ? 'Cohort Intelligence' : 'Institutional Directory'}
                        </h2>
                        <div className="flex gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder={`Filter ${activeTab === 'students' ? 'Students' : 'Personnel'}...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 ring-primary/5 transition-all"
                                />
                            </div>
                            <button
                                onClick={() => openStudentModal(null, activeTab === 'students' ? 'student' : 'advisor')}
                                className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl hover:bg-slate-800 transition-all shrink-0"
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="glass-card rounded-[2rem] overflow-hidden border-gray-100">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                {activeTab === 'students' ? (
                                    <tr>
                                        <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Student</th>
                                        <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-center">
                                            {selectedSubject ? `${selectedSubject.subjectCode} Progress` : 'Overall Progress'}
                                        </th>
                                        <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Doubts</th>
                                        <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Predicted Score</th>
                                        <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest"></th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Staff Member</th>
                                        <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Assigned Semester</th>
                                        <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Role</th>
                                        <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                                        <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest"></th>
                                    </tr>
                                )}
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {activeTab === 'students' ? (
                                    filteredStudents.map((student, idx) => (
                                        <motion.tr
                                            key={student._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="hover:bg-gray-50/50 transition-colors group"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-sm">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div className="cursor-pointer" onClick={() => openStudentModal(student)}>
                                                        <p className="font-bold text-slate-900 group-hover:text-primary transition-colors flex items-center gap-2">
                                                            {student.name}
                                                            <PencilSquareIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{student.studentId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col items-center">
                                                    {selectedSubject ? (() => {
                                                        const sp = (student.subjectProgress || []).find(p => p.subjectCode.toUpperCase() === selectedSubject.subjectCode.toUpperCase());
                                                        const totalTopicsInSyllabus = (selectedSubject.units || []).reduce((acc, u) => acc + (u.topics?.length || 0), 0);
                                                        const completedCount = sp?.topicsCompleted?.length || 0;
                                                        const progress = sp?.progress || 0;

                                                        return (
                                                            <div className="flex flex-col items-center space-y-1">
                                                                <div className="text-xl font-black text-slate-900 tracking-tighter">
                                                                    {completedCount} <span className="text-[10px] text-slate-400 font-bold">/ {totalTopicsInSyllabus} Topics</span>
                                                                </div>
                                                                <div className="w-full max-w-[120px] h-2 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-primary-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                                                </div>
                                                                <span className="text-[9px] font-black text-primary uppercase">{progress}% COMPLETED</span>
                                                            </div>
                                                        );
                                                    })() : (
                                                        <div className="w-full max-w-[120px] space-y-1 text-center">
                                                            <div className="h-2 bg-slate-900/10 rounded-full overflow-hidden">
                                                                <div className="h-full bg-slate-900" style={{ width: `${student.progress}%` }}></div>
                                                            </div>
                                                            <span className="text-[10px] font-black text-slate-400 italic">Overall {student.progress}%</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center font-bold text-gray-600">
                                                {student.doubts}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className={`px-4 py-1.5 rounded-full font-black text-xs ${student.predictedScore > 80 ? 'bg-green-100 text-green-600' :
                                                        student.predictedScore > 60 ? 'bg-orange-100 text-orange-600' :
                                                            'bg-red-100 text-red-600'
                                                        }`}>
                                                        {student.predictedScore} / 100
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteAccount(student._id, student.name)}
                                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                        title="Delete Account"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    staff.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase())).map((member, idx) => (
                                        <motion.tr
                                            key={member._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="hover:bg-gray-50/50 transition-colors group"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <div className="cursor-pointer" onClick={() => openStudentModal(member, 'advisor')}>
                                                        <p className="font-bold text-slate-900 group-hover:text-primary transition-colors flex items-center gap-2">
                                                            {member.name}
                                                            <PencilSquareIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{member.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="bg-gray-100 px-3 py-1 rounded-lg font-black text-xs text-gray-600 uppercase tracking-widest">
                                                    Semester {member.semester}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-center uppercase text-[10px] font-black tracking-widest text-primary-600">
                                                {member.role}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className={`px-4 py-1.5 rounded-full font-black text-xs ${member.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                        {member.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteAccount(member._id, member.name)}
                                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                        title="Delete Account"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
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
            <div className="bg-slate-950 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <LightBulbIcon className="w-8 h-8 text-indigo-400" />
                        <h3 className="text-2xl font-black uppercase tracking-tighter italic">Predictive Audit</h3>
                    </div>
                    <p className="text-slate-400 text-lg leading-relaxed font-medium">
                        Algorithmic analysis of batch performance indicates high friction in <span className="text-primary-400 underline decoration-indigo-400/30 underline-offset-8 font-black">CS3492 - UNIT 3</span>. System recommendation: Targeted institutional intervention suggested for the upcoming assessment cycle.
                    </p>
                </div>
            </div>

            {/* Manage Student Modal */}
            {
                showStudentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowStudentModal(false)}></div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-[2rem] p-8 max-w-lg w-full relative z-10 shadow-2xl"
                        >
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                                {editingStudent ? 'Update' : 'Register'} {studentFormData.role === 'student' ? 'Student' : 'Subject Staff'}
                            </h1>
                            <form onSubmit={handleManageStudent} className="space-y-4">
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={studentFormData.name}
                                        onChange={(e) => setStudentFormData({ ...studentFormData, name: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary-500/20"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={studentFormData.email}
                                        onChange={(e) => setStudentFormData({ ...studentFormData, email: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary-500/20"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">Role</label>
                                        <select
                                            disabled={!isAdmin && !isAdvisor}
                                            required
                                            value={studentFormData.role}
                                            onChange={(e) => setStudentFormData({ ...studentFormData, role: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary-500/20 disabled:opacity-50 font-bold"
                                        >
                                            <option value="student">Student</option>
                                            {(isAdmin || isAdvisor) && <option value="advisor">{isAdvisor ? 'Subject Staff' : 'Advisor'}</option>}
                                        </select>
                                        {isAdvisor && <p className="text-[10px] text-slate-400 mt-1 italic font-bold uppercase">Role Locked to Semester {user.semester}</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">
                                            {studentFormData.role === 'student' ? 'Semester' : 'Assign Semester'}
                                        </label>
                                        <select
                                            required
                                            disabled={(!isAdmin && studentFormData.role === 'student') || isAdvisor}
                                            value={studentFormData.semester}
                                            onChange={(e) => setStudentFormData({ ...studentFormData, semester: parseInt(e.target.value) })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary-500/20 disabled:opacity-50 font-bold"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                        </select>
                                        {isAdvisor && <p className="text-[10px] text-slate-400 mt-1 italic font-bold uppercase">Semester Fixed</p>}
                                    </div>
                                </div>

                                {studentFormData.role === 'student' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">ID / Roll No</label>
                                            <input
                                                type="text"
                                                required
                                                value={studentFormData.studentId}
                                                onChange={(e) => setStudentFormData({ ...studentFormData, studentId: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary-500/20"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">Access Password</label>
                                            <input
                                                type="text"
                                                placeholder={editingStudent ? "Keep empty to skip" : "Welcome123"}
                                                value={studentFormData.password}
                                                onChange={(e) => setStudentFormData({ ...studentFormData, password: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary-500/20"
                                            />
                                        </div>
                                    </div>
                                )}
                                {studentFormData.role !== 'student' && (
                                    <div>
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">Access Password</label>
                                        <input
                                            type="text"
                                            placeholder={editingStudent ? "Keep empty to skip" : "Welcome123"}
                                            value={studentFormData.password}
                                            onChange={(e) => setStudentFormData({ ...studentFormData, password: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary-500/20"
                                        />
                                    </div>
                                )}

                                {studentFormData.role === 'advisor' && (
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Assigned Subjects (Lab Authority)</label>
                                        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                            {subjects.map(subject => (
                                                <label key={subject.subjectCode} className="flex items-center gap-3 p-2 hover:bg-white rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-100">
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
                                                        className="w-4 h-4 rounded text-primary focus:ring-primary/20"
                                                    />
                                                    <div>
                                                        <p className="text-[11px] font-black text-slate-900 uppercase leading-none">{subject.subjectCode}</p>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase truncate">{subject.subjectName}</p>
                                                    </div>
                                                </label>
                                            ))}
                                            {subjects.length === 0 && (
                                                <p className="text-[10px] text-slate-400 italic">No subjects found for Semester {selectedSemester}.</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 flex gap-4">
                                    <button type="button" onClick={() => setShowStudentModal(false)} disabled={savingStudent} className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all uppercase tracking-widest text-xs disabled:opacity-50">Cancel</button>
                                    <button type="submit" disabled={savingStudent} className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-900/20 uppercase tracking-widest text-xs disabled:opacity-70 flex items-center justify-center gap-2">
                                        {savingStudent ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            editingStudent ? 'Save Changes' : (studentFormData.role === 'student' ? 'Create Student' : 'Create Staff')
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowElectiveModal(false)}></div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-[2rem] p-8 max-w-2xl w-full relative z-10 shadow-2xl flex flex-col max-h-[80vh]"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black uppercase tracking-tighter">Select Elective</h2>
                                <button onClick={() => setShowElectiveModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                                    <XMarkIcon className="w-6 h-6" />
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
