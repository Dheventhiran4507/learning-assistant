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
import './AnalyticsPage.css'; // Import the new CSS

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
        return (
            <div className="analytics-loading-container">
                <div className="analytics-loading-content">
                    <div className="analytics-loading-spinner"></div>
                    <p className="analytics-loading-text">Analyzing performance data...</p>
                </div>
            </div>
        );
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
        <div className="analytics-container">
            <div className="analytics-header">
                <div>
                    <h1 className="analytics-title">
                        Semester {stats?.semester} <span className="text-secondary">Performance Analytics</span>
                    </h1>
                    <p className="analytics-subtitle">Detailed assessment of speed, accuracy, and standardized curriculum mastery</p>
                </div>
                <div className="analytics-status-badge">
                    <div className="analytics-badge-dot"></div>
                    <span className="analytics-badge-text">Real-time Analytics</span>
                </div>
            </div>

            {/* Key Metrics Dashboard */}
            <div className="analytics-metrics-grid">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="analytics-card analytics-card-dark group">
                    <div className="analytics-card-glow"></div>
                    <div className="analytics-card-header">
                        <ClockIcon className="analytics-card-icon" />
                        <p className="analytics-card-label">Total Practice</p>
                    </div>
                    <p className="analytics-card-value">{(stats?.overallMetrics?.totalPracticeTime / 3600).toFixed(1)}<span>Hrs</span></p>
                    <div className="analytics-card-footer-badge">
                        <span className="analytics-badge-dot" style={{ width: '6px', height: '6px' }}></span>
                        High Engagement
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="analytics-card analytics-card-light group">
                    <div className="analytics-card-header">
                        <CheckBadgeIcon className="analytics-card-icon emerald" />
                        <p className="analytics-card-label">Proficiency</p>
                    </div>
                    <p className="analytics-card-value card-value-slate">{stats?.overallMetrics?.averageSemesterAccuracy}<span>%</span></p>
                    <div className="analytics-progress-container">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stats?.overallMetrics?.averageSemesterAccuracy}%` }}
                            className="analytics-progress-bar"
                        ></motion.div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="analytics-card analytics-card-light group">
                    <div className="analytics-card-header">
                        <AcademicCapIcon className="analytics-card-icon indigo" />
                        <p className="analytics-card-label">Curriculum Scope</p>
                    </div>
                    <p className="analytics-card-value card-value-slate">{stats?.subjects?.length}</p>
                    <p className="analytics-card-label card-label-primary">Active Subjects</p>
                </motion.div>
            </div>

            {/* Analytics Charts */}
            <div className="analytics-charts-grid">
                {/* Accuracy vs Speed Radar-like Chart */}
                <motion.div className="analytics-chart-card">
                    <div className="analytics-chart-header">
                        <ChartBarIcon className="chart-header-icon" />
                        <h2 className="analytics-chart-title">Efficiency Assessment</h2>
                    </div>
                    <div style={{ height: '350px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sectorData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    cursor={{ fill: '#f8fafc' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }} />
                                <Bar dataKey="accuracy" name="Accuracy %" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="speed" name="Speed" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Level Distribution */}
                <motion.div transition={{ delay: 0.1 }} className="analytics-chart-card">
                    <div className="analytics-chart-header">
                        <ArrowTrendingUpIcon className="chart-header-icon" />
                        <h2 className="analytics-chart-title">Proficiency Distribution</h2>
                    </div>
                    <div className="analytics-pie-chart-container">
                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={performanceLevels}
                                        innerRadius={60}
                                        outerRadius={85}
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
                        </div>
                        <div className="analytics-legend">
                            {performanceLevels.map((lvl, i) => (
                                <div key={lvl.name} className="analytics-legend-item">
                                    <div className="analytics-legend-label">
                                        <div className="analytics-legend-dot" style={{ backgroundColor: lvl.fill }}></div>
                                        <span className="analytics-legend-text">{lvl.name}</span>
                                    </div>
                                    <span className="analytics-legend-value">{lvl.value} sub</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Subject Performance List */}
            <div className="analytics-table-card">
                <div className="analytics-chart-header">
                    <PresentationChartLineIcon className="chart-header-icon dark" />
                    <h2 className="analytics-chart-title">Curriculum Performance Audit</h2>
                </div>
                <div className="analytics-table-wrapper">
                    <table className="analytics-table">
                        <thead>
                            <tr>
                                <th className="analytics-th">Subject</th>
                                <th className="analytics-th text-center">Accuracy</th>
                                <th className="analytics-th text-center">Speed</th>
                                <th className="analytics-th text-center">Effort</th>
                                <th className="analytics-th text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.subjects?.map((s) => (
                                <tr key={s.subjectCode} className="analytics-tr">
                                    <td className="analytics-td">
                                        <p className="analytics-subject-code">{s.subjectCode}</p>
                                        <p className="analytics-subject-name">{s.subjectName}</p>
                                    </td>
                                    <td className="analytics-td text-center">
                                        <div className="analytics-accuracy-badge">
                                            <span className={`analytics-accuracy-text ${s.avgAccuracy >= 80 ? 'excellent' : s.avgAccuracy >= 60 ? 'good' : 'average'}`}>
                                                {s.avgAccuracy}%
                                            </span>
                                            <div className="analytics-accuracy-mini-bar">
                                                <div className={`analytics-accuracy-mini-fill ${s.avgAccuracy >= 80 ? 'excellent' : 'average'}`} style={{ width: `${s.avgAccuracy}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="analytics-td text-center td-value-bold">
                                        {s.avgSpeed}s
                                    </td>
                                    <td className="analytics-td text-center td-value-bold">
                                        {(s.totalTimeSpent / 60).toFixed(0)}m
                                    </td>
                                    <td className="analytics-td text-right">
                                        <span className={`analytics-status-tag ${s.performanceLevel === 'Excellent' ? 'excellent' :
                                            s.performanceLevel === 'Good' ? 'good' :
                                                s.performanceLevel === 'Average' ? 'average' :
                                                    'critical'
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
