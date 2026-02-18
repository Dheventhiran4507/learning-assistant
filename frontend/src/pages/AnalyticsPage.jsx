import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/students/stats');
                if (response.data.success) {
                    setStats(response.data.data);
                }
            } catch (error) {
                toast.error('Failed to load analytics');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin text-4xl mb-4">📊</div>
                    <p className="text-gray-900">Loading analytics...</p>
                </div>
            </div>
        );
    }

    // Mock data for charts
    const scoreData = [
        { name: 'Week 1', score: 65 },
        { name: 'Week 2', score: 72 },
        { name: 'Week 3', score: 78 },
        { name: 'Week 4', score: 85 },
    ];

    const topicData = [
        { name: 'Mastered', value: 12, fill: '#22c55e' },
        { name: 'Proficient', value: 8, fill: '#3b82f6' },
        { name: 'Learning', value: 15, fill: '#f59e0b' },
    ];

    const subjectPerformance = (stats?.subjectProgress || []).map(s => ({
        name: s.subjectName || s.subjectCode,
        progress: s.progress || 0
    })).slice(0, 5);

    const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];

    return (
        <div className="max-w-7xl mx-auto p-8 text-gray-900">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    Learning Analytics
                </h1>
                <p className="text-gray-600">Your personalized learning insights and progress</p>
            </div>

            {/* Key Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <p className="text-gray-500 text-sm mb-2">Doubts Cleared</p>
                    <p className="text-3xl font-bold text-purple-600">{stats?.learningStats?.totalDoubtsCleared || 0}</p>
                    <p className="text-xs text-gray-500 mt-2">+2 this week</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <p className="text-gray-500 text-sm mb-2">Syllabus Progress</p>
                    <p className="text-3xl font-bold text-blue-600">{stats?.learningStats?.syllabusProgress || 0}%</p>
                    <p className="text-xs text-gray-500 mt-2">Well on track</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <p className="text-gray-500 text-sm mb-2">Practice Hours</p>
                    <p className="text-3xl font-bold text-pink-600">{(stats?.learningStats?.totalPracticeHours || 0).toFixed(1)}</p>
                    <p className="text-xs text-gray-500 mt-2">Keep it up!</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <p className="text-gray-500 text-sm mb-2">Predicted Score</p>
                    <p className="text-3xl font-bold text-green-600">{(stats?.examPredictions?.[0]?.predictedScore || 75).toFixed(0)}</p>
                    <p className="text-xs text-gray-500 mt-2">Based on progress</p>
                </motion.div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Score Trend Chart */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Score Trend</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={scoreData}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                            <XAxis dataKey="name" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#1f2937' }} itemStyle={{ color: '#1f2937' }} />
                            <Area type="monotone" dataKey="score" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorScore)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Topic Mastery Pie Chart */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Topic Mastery Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={topicData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={100}
                                fill="#8b5cf6"
                                dataKey="value"
                            >
                                {topicData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#1f2937' }} itemStyle={{ color: '#1f2937' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Subject Performance */}
            {subjectPerformance.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Subject Performance</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={subjectPerformance}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                            <XAxis dataKey="name" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#1f2937' }} itemStyle={{ color: '#1f2937' }} />
                            <Bar dataKey="progress" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            )}

            {/* Weak Areas */}
            {stats?.weakAreas && stats.weakAreas.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white border border-gray-100 rounded-2xl p-6 mt-8 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">⚠️ Weak Areas to Focus On</h2>
                    <div className="space-y-3">
                        {stats.weakAreas.slice(0, 5).map((area, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{area.topic}</p>
                                    <p className="text-sm text-gray-500">{area.subject || 'Unknown Subject'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-red-500">Score: {area.score}/10</p>
                                    <p className="text-xs text-gray-500">{area.totalAttempts} attempts</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
