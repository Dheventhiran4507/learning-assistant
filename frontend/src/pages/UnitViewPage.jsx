import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

const UnitViewPage = () => {
    const { subjectCode, unitNumber } = useParams();
    const [unit, setUnit] = useState(null);
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await api.get(`/syllabus/subject/${subjectCode}`);
                if (response.data.success) {
                    setSubject(response.data.data);
                    const unitData = response.data.data.units.find(u => u.unitNumber === parseInt(unitNumber));
                    setUnit(unitData);
                }
            } catch (error) {
                toast.error('Failed to load topic details');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [subjectCode, unitNumber]);

    const startTopicPractice = (topicName, difficulty = 'medium') => {
        navigate(`/practice?subject=${subjectCode}&unit=${unitNumber}&topic=${encodeURIComponent(topicName)}&difficulty=${difficulty}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-mesh">
                <div className="animate-spin text-6xl">📚</div>
            </div>
        );
    }

    if (!unit) return <div className="text-center text-gray-900 py-20 bg-mesh h-screen">Unit not found</div>;

    return (
        <div className="min-h-screen bg-mesh pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-4 mb-4 text-gray-400">
                        <Link to="/dashboard" className="hover:text-primary-400 transition-colors">Dashboard</Link>
                        <span>/</span>
                        <Link to={`/semester/${subject?.semester}`} className="hover:text-primary-400 transition-colors">Semester {subject?.semester}</Link>
                        <span>/</span>
                        <Link to={`/subject/${subjectCode}`} className="hover:text-primary-400 transition-colors">{subjectCode}</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-bold">Unit {unitNumber}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-5xl font-black text-gray-900 mb-4 leading-tight">
                                {unit.unitTitle} <span className="text-gradient">Topics</span>
                            </h1>
                            <p className="text-gray-600 text-xl font-medium max-w-2xl">Master each topic through AI-guided practice and focused tests.</p>
                        </div>
                        <div className="bg-white p-4 rounded-3xl border border-gray-100 backdrop-blur-xl shadow-lg">
                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Unit Progress</div>
                            <div className="text-2xl font-black text-gray-900">0% <span className="text-gray-500">Complete</span></div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {unit.topics.map((topic, index) => (
                        <motion.div
                            key={topic.topicName}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-card rounded-[2.5rem] p-8 flex flex-col justify-between group h-full border border-gray-100 hover:border-primary-500/30 transition-all duration-500"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${topic.difficulty === 'hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                        topic.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                            'bg-green-500/10 text-green-400 border-green-500/20'
                                        }`}>
                                        {topic.difficulty || 'Medium'} Content
                                    </span>
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                                        🎯
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-primary-600 transition-colors">
                                    {topic.topicName}
                                </h3>
                                {topic.subtopics && topic.subtopics.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {topic.subtopics.map(st => (
                                            <span key={st} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-lg border border-gray-200">
                                                {st}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm mb-8">Detailed exploration of {topic.topicName} principles and implementation.</p>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => startTopicPractice(topic.topicName, topic.difficulty || 'medium')}
                                    className="flex-1 btn-premium py-4 font-black rounded-2xl flex items-center justify-center gap-2"
                                >
                                    <span>⚡</span>
                                    Practice Topic
                                </button>
                                <Link
                                    to={`/chat?q=Explain the concept of ${encodeURIComponent(topic.topicName)} in ${subjectCode}`}
                                    className="w-14 h-14 glass flex items-center justify-center rounded-2xl hover:bg-gray-100 transition-all group/btn"
                                >
                                    <span className="text-2xl group-hover/btn:scale-110 transition-transform">🤖</span>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-16 p-1 bg-gradient-to-r from-primary-500 via-purple-500 to-secondary-500 rounded-[2rem] shadow-2xl shadow-primary-500/20"
                >
                    <div className="bg-white rounded-[1.8rem] p-12 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-mesh opacity-20 pointer-events-none"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl font-black text-gray-900 mb-4">Complete Unit Challenge</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto mb-8 text-lg">
                                Ready to test your overall understanding of {unit.unitTitle}? Take the Unit Master Test covering all {unit.topics.length} topics.
                            </p>
                            <button
                                onClick={() => navigate(`/practice?subject=${subjectCode}&unit=${unitNumber}`)}
                                className="btn-premium px-12 py-4 rounded-2xl text-lg shadow-2xl hover:shadow-primary-500/40"
                            >
                                Start Unit Master Test 🚀
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UnitViewPage;
