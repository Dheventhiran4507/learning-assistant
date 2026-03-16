import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
    UserIcon,
    LockClosedIcon,
    ShieldCheckIcon,
    ArrowRightIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';

const StaffLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { email: email.trim(), password });

            if (response.data.success) {
                const { student, token } = response.data.data;

                // Only allow staff roles to login via this portal
                if (['admin', 'hod', 'advisor'].includes(student.role)) {
                    login(student, token);
                    toast.success('Welcome to the Staff Portal');
                    navigate('/admin/dashboard');
                } else {
                    toast.error('Access Denied: This portal is for Staff and Advisors only.');
                }
            }
        } catch (error) {
            const serverMsg = error.response?.data?.message;
            const detailMsg = error.response?.data?.error;
            toast.error(detailMsg || serverMsg || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-500/10 rounded-full blur-[120px] -ml-64 -mb-64 animate-pulse" style={{ animationDelay: '2s' }}></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg p-12 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-2xl relative z-10"
            >
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
                        <ShieldCheckIcon className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-3 tracking-tighter uppercase">Staff <span className="text-indigo-400">Terminal</span></h1>
                    <div className="flex items-center justify-center gap-3">
                        <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">Institutional Management Control</p>
                        <span className="text-[10px] font-bold text-slate-600 opacity-80">v1.0.5</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2 text-center block">Institutional Identity</label>
                        <div className="relative">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                                <UserIcon className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-white placeholder-slate-600 outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all font-bold"
                                placeholder="name@university.edu.in"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2 text-center block">Security Clearance</label>
                        <div className="relative">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                                <LockClosedIcon className="w-5 h-5" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-12 py-5 text-white placeholder-slate-600 outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all font-bold"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="w-5 h-5" />
                                ) : (
                                    <EyeIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black text-lg shadow-2xl relative overflow-hidden group disabled:opacity-50 hover:bg-indigo-50 transition-all"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div>
                                <span>VERIFYING...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 tracking-widest">
                                <span>VALIDATE ACCESS</span>
                                <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </div>
                        )}
                    </button>
                </form>

                <div className="mt-12 pt-8 border-t border-white/10 text-center">
                    <p className="text-gray-500 text-sm font-medium mb-4">
                        Secure Access Point. Authorized Personnel Only.
                    </p>
                    <button 
                        onClick={() => navigate('/login')}
                        className="text-indigo-400 hover:text-white transition-colors duration-300 text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 mx-auto"
                    >
                        <UserIcon className="w-4 h-4" /> Go to Student Login
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default StaffLoginPage;
