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
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-900 font-bold text-lg">Loading curriculum...</p>
                    <div className="mt-6 w-48 h-1 bg-slate-200 rounded-full overflow-hidden mx-auto">
                        <motion.div
                            className="h-full bg-primary"
                            animate={{ x: [-200, 200] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        />
                    </div>
                </div>
            </div>
        );
    }

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
                    <span className="text-slate-900 font-bold">Semester {semesterNum} Catalog</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-6xl font-black text-slate-900 mb-4 leading-tight">
                            Semester <span className="text-gradient underline decoration-primary/20 underline-offset-8">{semesterNum}</span>
                        </h1>
                        <p className="text-slate-600 text-xl font-medium max-w-2xl leading-relaxed">
                            Access your core academic subjects and elective modules for technical mastery.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="glass-card px-6 py-4 rounded-2xl flex items-center justify-between min-w-[240px] border border-slate-200 shadow-sm">
                            <div>
                                <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Enrolled Subjects</div>
                                <div className="text-3xl font-black text-slate-900">{subjects.length} Subjects</div>
                            </div>
                            <AcademicCapIcon className="w-10 h-10 text-indigo-500" />
                        </div>

                        {/* Search/Add Elective Bar - Restricted to Advisor/HOD/Admin */}
                        {(user?.role === 'admin' || user?.role === 'hod' || user?.role === 'advisor') && (
                            <form onSubmit={handleSearchElective} className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                                    <MagnifyingGlassIcon className="w-6 h-6" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Add Elective (e.g. CS3001)"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-16 pr-24 py-5 rounded-2xl border border-slate-200 bg-white shadow-lg focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-400 font-bold"
                                />
                                <button
                                    type="submit"
                                    disabled={searching}
                                    className="absolute right-3 top-2.5 bottom-2.5 px-6 rounded-xl bg-slate-900 text-white font-black hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {searching ? '...' : <><PlusIcon className="w-5 h-5" /> ADD</>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject, index) => (
                    <motion.div
                        key={subject.subjectCode}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        whileHover={{ y: -8 }}
                        className="glass-card rounded-[2rem] p-8 relative overflow-hidden group cursor-pointer"
                    >
                        {/* Professional Accent */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        {/* Background Glow */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                                    <BookOpenIcon className="w-8 h-8 text-indigo-600" />
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${subject.subjectType === 'ELECTIVE' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                        {subject.subjectType || 'CORE'}
                                    </span>
                                    <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                        {subject.credits} Credits
                                    </span>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-all leading-tight">
                                {subject.subjectName}
                            </h3>
                            <p className="text-slate-500 font-mono text-sm mb-6 tracking-tighter">{subject.subjectCode}</p>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <AcademicCapIcon className="w-5 h-5 text-indigo-400" />
                                    <span className="font-bold underline decoration-indigo-200 underline-offset-4">{subject.units?.length || 5} Modules</span>
                                </div>
                                <Link
                                    to={`/subject/${subject.subjectCode}`}
                                    className="btn-premium py-2.5 px-6 rounded-xl text-sm shadow-sm"
                                >
                                    Analyze →
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {subjects.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm"
                >
                    <BookOpenIcon className="w-20 h-20 text-slate-200 mx-auto mb-6" />
                    <p className="text-slate-500 text-xl font-medium mb-6">No subjects found for this semester yet.</p>
                    <Link to="/dashboard" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all flex items-center gap-2 mx-auto w-fit">
                        <ArrowRightIcon className="w-5 h-5 rotate-180" /> Back to Dashboard
                    </Link>
                </motion.div>
            )}
        </div>
    );
};

export default SemesterViewPage;
