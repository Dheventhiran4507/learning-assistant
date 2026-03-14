import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import {
    PresentationChartLineIcon,
    ClockIcon,
    CheckBadgeIcon,
    AcademicCapIcon,
    ArrowTrendingUpIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

export default function AnalyticsPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/analytics/student/stats');
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
        <div className="flex items-center justify-center h-screen bg-slate-50">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-900 font-bold text-lg">Analyzing performance data...</p>
            </div>
        </div>
    }

    // Chart Data Preparation
    const sectorData = stats?.subjects?.map(s => ({
        name: s.subjectCode,
        accuracy: s.avgAccuracy,
        time: s.totalTimeSpent / 60, // minutes
        speed: s.avgSpeed // seconds/question
    })) || [];

    const performanceLevels = [
        { name: 'Excellent', value: stats?.subjects?.filter(s => s.performanceLevel === 'Excellent').length || 0, fill: '#8b5cf6' },
        { name: 'Good', value: stats?.subjects?.filter(s => s.performanceLevel === 'Good').length || 0, fill: '#3b82f6' },
        { name: 'Average', value: stats?.subjects?.filter(s => s.performanceLevel === 'Average').length || 0, fill: '#10b981' },
        { name: 'Critical', value: stats?.subjects?.filter(s => s.performanceLevel === 'Needs Improvement').length || 0, fill: '#ef4444' },
    ].filter(p => p.value > 0);

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 text-gray-900 bg-gray-50 min-h-screen">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black mb-2 text-slate-900 uppercase tracking-tighter">
                        Semester {stats?.semester} <span className="text-primary italic">Performance Analytics</span>
                    </h1>
                    <p className="text-slate-500 font-medium italic">Detailed assessment of speed, accuracy, and standardized curriculum mastery</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-gray-700">Real-time Stats Active</span>
                </div>
            </div>

            {/* Key Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-colors"></div>
                    <div className="flex items-center gap-3 mb-4">
                        <ClockIcon className="w-6 h-6 text-indigo-400" />
                        <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em]">Total Practice Duration</p>
                    </div>
                    <p className="text-5xl font-black mb-1">{(stats?.overallMetrics?.totalPracticeTime / 3600).toFixed(1)}<span className="text-2xl font-light ml-1 opacity-50">Hrs</span></p>
                    <div className="mt-4 flex items-center gap-2 bg-white/5 w-fit px-3 py-1.5 rounded-lg text-[10px] font-bold border border-white/5">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
                        Status: High Engagement
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-3 mb-4">
                        <CheckBadgeIcon className="w-6 h-6 text-emerald-500" />
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Syllabus Proficiency</p>
                    </div>
                    <p className="text-5xl font-black text-slate-900 mb-1">{stats?.overallMetrics?.averageSemesterAccuracy}<span className="text-2xl font-light ml-1 opacity-50">%</span></p>
                    <div className="mt-6 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stats?.overallMetrics?.averageSemesterAccuracy}%` }}
                            className="h-full bg-emerald-500"
                        ></motion.div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-3 mb-4">
                        <AcademicCapIcon className="w-6 h-6 text-indigo-600" />
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Academic Scope</p>
                    </div>
                    <p className="text-5xl font-black text-slate-900 mb-1">{stats?.subjects?.length}</p>
                    <p className="mt-4 text-[10px] font-black text-indigo-600 uppercase tracking-widest">Standardized Subjects</p>
                </motion.div>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Accuracy vs Speed Radar-like Chart */}
                <motion.div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-8">
                        <ChartBarIcon className="w-6 h-6 text-indigo-600" />
                        <h2 className="text-xl font-bold text-slate-900">Efficiency Assessment</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={sectorData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                cursor={{ fill: '#f8fafc' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="accuracy" name="Accuracy %" fill="#8b5cf6" radius={[10, 10, 0, 0]} />
                            <Bar dataKey="speed" name="Speed (sec/q)" fill="#06b6d4" radius={[10, 10, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Level Distribution */}
                <motion.div transition={{ delay: 0.1 }} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-8">
                        <ArrowTrendingUpIcon className="w-6 h-6 text-primary" />
                        <h2 className="text-xl font-bold text-slate-900">Proficiency Distribution</h2>
                    </div>
                    <div className="flex flex-col md:flex-row items-center h-full">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={performanceLevels}
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {performanceLevels.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-4 w-full md:w-48 mt-4 md:mt-0">
                            {performanceLevels.map((lvl, i) => (
                                <div key={lvl.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lvl.fill }}></div>
                                        <span className="text-sm font-bold text-gray-600">{lvl.name}</span>
                                    </div>
                                    <span className="text-sm font-black text-gray-800">{lvl.value} sub</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Subject Performance List */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 mb-12">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <PresentationChartLineIcon className="w-6 h-6 text-slate-900" />
                        <h2 className="text-xl font-bold text-slate-900">Curriculum Performance Audit</h2>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="pb-4 text-sm font-bold text-gray-400 uppercase tracking-widest">Subject</th>
                                <th className="pb-4 text-sm font-bold text-gray-400 uppercase tracking-widest text-center">Avg Accuracy</th>
                                <th className="pb-4 text-sm font-bold text-gray-400 uppercase tracking-widest text-center">Avg Speed</th>
                                <th className="pb-4 text-sm font-bold text-gray-400 uppercase tracking-widest text-center">Total Time</th>
                                <th className="pb-4 text-sm font-bold text-gray-400 uppercase tracking-widest text-right">Performance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {stats?.subjects?.map((s) => (
                                <tr key={s.subjectCode} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="py-6">
                                        <p className="font-black text-gray-800">{s.subjectCode}</p>
                                        <p className="text-sm text-gray-500 font-medium">{s.subjectName}</p>
                                    </td>
                                    <td className="py-6 text-center">
                                        <div className="inline-flex flex-col items-center">
                                            <span className={`text-lg font-black ${s.avgAccuracy >= 80 ? 'text-green-600' : s.avgAccuracy >= 60 ? 'text-blue-600' : 'text-orange-600'}`}>
                                                {s.avgAccuracy}%
                                            </span>
                                            <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1">
                                                <div className={`h-full rounded-full ${s.avgAccuracy >= 80 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${s.avgAccuracy}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 text-center font-bold text-gray-700">
                                        {s.avgSpeed} <span className="text-xs font-medium text-gray-400">sec/q</span>
                                    </td>
                                    <td className="py-6 text-center font-bold text-gray-700">
                                        {(s.totalTimeSpent / 60).toFixed(0)} <span className="text-xs font-medium text-gray-400">min</span>
                                    </td>
                                    <td className="py-6 text-right">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-sm ${s.performanceLevel === 'Excellent' ? 'bg-indigo-50 text-indigo-700 shadow-indigo-100' :
                                            s.performanceLevel === 'Good' ? 'bg-blue-50 text-blue-700 shadow-blue-100' :
                                                s.performanceLevel === 'Average' ? 'bg-green-50 text-green-700 shadow-green-100' :
                                                    'bg-gray-50 text-gray-400'
                                            }`}>
                                            {s.performanceLevel}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
