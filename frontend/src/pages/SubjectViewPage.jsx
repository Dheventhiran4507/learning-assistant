import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

const SubjectViewPage = () => {
    const { subjectCode } = useParams();
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubject = async () => {
            try {
                // Assuming there's an endpoint for single subject or we filter from semester
                const response = await api.get(`/syllabus/subject/${subjectCode}`);
                if (response.data.success) {
                    setSubject(response.data.data);
                }
            } catch (error) {
                toast.error('Failed to load subject details');
            } finally {
                setLoading(false);
            }
        };

        fetchSubject();
    }, [subjectCode]);

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
                    <p className="text-gray-900 font-bold text-lg">Loading subject details...</p>
                </motion.div>
            </div>
        );
    }

    if (!subject) return <div className="text-center text-gray-900 py-20">Subject not found</div>;

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
                    <Link to={`/semester/${subject.semester}`} className="text-gray-500 hover:text-primary-600 transition-colors font-medium">Semester {subject.semester}</Link>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-900 font-bold">{subject.subjectCode}</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-6xl font-black text-gray-900 mb-4 leading-tight">
                            {subject.subjectName} <span className="text-gradient">Units</span>
                        </h1>
                        <p className="text-gray-600 text-xl font-medium">Syllabus breakdown for Regulation {subject.regulation}</p>
                    </div>
                    <div className="glass-card px-6 py-4 rounded-2xl">
                        <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Total Units</div>
                        <div className="text-3xl font-black text-gray-900">{subject.units?.length || 0}</div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-6">
                {subject.units.map((unit, index) => (
                    <motion.div
                        key={unit.unitNumber}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08 }}
                        whileHover={{ x: 8 }}
                        className="glass-card rounded-[2rem] p-8 group relative overflow-hidden"
                    >
                        {/* Gradient Border on Hover */}
                        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary-500 via-purple-500 to-secondary-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        {/* Background Glow */}
                        <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-primary-500/20 group-hover:scale-110 transition-transform">
                                    {unit.unitNumber}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-gradient transition-all">
                                        {unit.unitTitle}
                                    </h3>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <span className="text-lg">🎯</span>
                                        <p className="font-medium">{unit.topics?.length || 0} Topics to master</p>
                                    </div>
                                </div>
                            </div>

                            <Link
                                to={`/unit/${subjectCode}/${unit.unitNumber}`}
                                className="btn-premium text-center px-8 py-3 whitespace-nowrap"
                            >
                                Explore Topics →
                            </Link>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default SubjectViewPage;
