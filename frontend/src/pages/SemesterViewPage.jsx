import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const SemesterViewPage = () => {
    const { semesterNum } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="text-6xl mb-4"
                    >
                        📚
                    </motion.div>
                    <p className="text-gray-900 font-bold text-lg">Loading subjects...</p>
                    <div className="mt-4 w-48 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto">
                        <motion.div
                            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                            animate={{ x: [-200, 200] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        />
                    </div>
                </motion.div>
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
                    <Link to="/dashboard" className="text-gray-500 hover:text-primary-600 transition-colors font-medium">Dashboard</Link>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-900 font-bold">Semester {semesterNum}</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-6xl font-black text-gray-900 mb-4 leading-tight">
                            Semester <span className="text-gradient hover:text-gradient-warm transition-all duration-300">{semesterNum}</span>
                        </h1>
                        <p className="text-gray-600 text-xl font-medium max-w-2xl">
                            Explore subjects and start mastering your engineering curriculum.
                        </p>
                    </div>
                    <div className="glass-card px-6 py-4 rounded-2xl">
                        <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Total Subjects</div>
                        <div className="text-3xl font-black text-gray-900">{subjects.length}</div>
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
                        {/* Gradient Accent */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-purple-500 to-secondary-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        {/* Background Glow */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/10 to-purple-500/10 flex items-center justify-center text-3xl border border-gray-100 group-hover:scale-110 transition-transform">
                                    📘
                                </div>
                                <span className="px-4 py-1.5 rounded-full bg-primary-50/50 text-primary-600 text-xs font-bold border border-primary-100">
                                    {subject.credits} Credits
                                </span>
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-all leading-tight">
                                {subject.subjectName}
                            </h3>
                            <p className="text-gray-500 font-mono text-sm mb-6">{subject.subjectCode}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span className="text-lg">📚</span>
                                    <span className="font-medium">{subject.units?.length || 5} Units</span>
                                </div>
                                <Link
                                    to={`/subject/${subject.subjectCode}`}
                                    className="btn-premium py-2.5 px-6 rounded-xl text-sm"
                                >
                                    Explore →
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
                    className="text-center py-20 glass-card rounded-[2.5rem]"
                >
                    <div className="text-6xl mb-6">📚</div>
                    <p className="text-gray-500 text-xl font-medium mb-4">No subjects found for this semester yet.</p>
                    <Link to="/dashboard" className="btn-secondary inline-block mt-4">
                        ← Back to Dashboard
                    </Link>
                </motion.div>
            )}
        </div>
    );
};

export default SemesterViewPage;
