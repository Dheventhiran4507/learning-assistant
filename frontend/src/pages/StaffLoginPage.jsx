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
    EyeSlashIcon,
    KeyIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const StaffLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [concurrentModal, setConcurrentModal] = useState(null); // { name, role }
    const [showForgotModal, setShowForgotModal] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { email: email.trim(), password });

            if (response.data.success) {
                const { student, token } = response.data.data;

                // Block students from logging in via staff portal
                if (student.role === 'student') {
                    toast.error('This is the Institutional Portal. Students should use the Student Portal to login.');
                    setLoading(false);
                    setTimeout(() => navigate('/login'), 2000);
                    return;
                }

                // STAFF REDIRECT: Ensure all staff roles go to the Academic Admin Dashboard
                if (['admin', 'hod', 'advisor', 'staff'].includes(student.role)) {
                    login(student, token);
                    toast.success('Access Granted - Welcome back to Academic Admin');
                    navigate('/admin/dashboard');
                } else {
                    login(student, token);
                    toast.success('Welcome to Portal');
                    navigate('/dashboard');
                }
            }
        } catch (error) {
            const statusCode = error.response?.status;
            const serverMsg = error.response?.data?.message;

            // ── Concurrent session detected ──
            if (statusCode === 409 && serverMsg === 'CONCURRENT_SESSION') {
                const { name, role } = error.response.data.data || {};
                setConcurrentModal({ name, role });
                setLoading(false);
                return;
            }

            const detailMsg = error.response?.data?.error;
            const finalMsg = typeof detailMsg === 'string' ? detailMsg :
                           (typeof serverMsg === 'string' ? serverMsg :
                           (serverMsg?.message || 'Login failed'));
            toast.error(finalMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Blobs - Using global styles for consistency */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-slate-500/10 rounded-full blur-[120px]"></div>
            </div>

            {/* ── Forgot Password Modal ── */}
            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm" onClick={() => setShowForgotModal(false)}></div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative z-10 bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl"
                    >
                        <div className="flex items-start justify-between mb-5">
                            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                                <KeyIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                            <button onClick={() => setShowForgotModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
                            Password Recovery
                        </h2>
                        <p className="text-slate-500 text-sm mb-5 leading-relaxed font-medium">
                            Staff passwords are managed by your institution's administrator.
                            To reset your password, please contact:
                        </p>
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3">
                                <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                                    <UserIcon className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">HOD / Class Advisor</p>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">Ask them to reset via Admin Dashboard → Edit Staff</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                                <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                                    <ShieldCheckIcon className="w-4 h-4 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">System Admin</p>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">Has full authority to update any credentials</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowForgotModal(false)}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                        >
                            Got it
                        </button>
                    </motion.div>
                </div>
            )}

            {/* ── Concurrent Session Modal ── */}
            {concurrentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm" onClick={() => setConcurrentModal(null)}></div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative z-10 bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center"
                    >
                        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <ShieldCheckIcon className="w-9 h-9 text-amber-500" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">
                            Session Active
                        </h2>
                        <p className="text-slate-500 font-medium text-sm mb-4">
                            This account is currently logged in on another device.
                        </p>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
                            <p className="text-[11px] font-black text-amber-700 uppercase tracking-widest">
                                {concurrentModal.name || 'User'} — {concurrentModal.role}
                            </p>
                            <p className="text-xs text-amber-600 mt-1 font-medium">
                                Please ask the current user to log out first, or contact the administrator.
                            </p>
                        </div>
                        <button
                            onClick={() => setConcurrentModal(null)}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                        >
                            Close
                        </button>
                    </motion.div>
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
            >
                {/* 3D Illustration Side */}
                <div className="hidden md:flex flex-col justify-center items-center text-center p-8">
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="mb-8 relative"
                    >
                        {/* Abstract 3D shape representation using CSS gradients */}
                        <div className="w-64 h-64 bg-slate-900 rounded-[3rem] shadow-2xl transform rotate-3 flex items-center justify-center border border-slate-800">
                            <div className="w-48 h-48 bg-slate-800 rounded-[2.5rem] transform -rotate-3 flex items-center justify-center border border-slate-700">
                                <ShieldCheckIcon className="w-24 h-24 text-white" />
                            </div>
                        </div>
                    </motion.div>
                    <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Institutional Control</h2>
                    <p className="text-slate-500 text-lg max-w-md font-medium">
                        Administrative terminal for managing academic workflows and student performance metrics.
                    </p>
                </div>

                {/* Login Form Side */}
                <div className="glass p-8 md:p-12 rounded-3xl shadow-2xl border border-gray-100 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-widest">
                                Institutional Portal
                            </h1>
                            <div className="flex items-center justify-center gap-2 mt-1">
                                <p className="text-slate-500 font-medium">Authentication required for secure access</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 ml-1">Institutional Email</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary text-slate-900 placeholder-slate-400 outline-none transition-all font-medium"
                                        placeholder="name@university.edu.in"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 ml-1">Clearance Key</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <LockClosedIcon className="w-5 h-5" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary text-slate-900 placeholder-slate-400 outline-none transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="w-5 h-5" />
                                        ) : (
                                            <EyeIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Forgot Password Link */}
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(true)}
                                    className="text-xs font-black text-slate-400 hover:text-primary transition-colors uppercase tracking-widest flex items-center gap-1.5"
                                >
                                    <KeyIcon className="w-3.5 h-3.5" />
                                    Forgot Password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 font-black text-white bg-slate-900 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Verifying...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Validate Access</span>
                                        <ArrowRightIcon className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center px-4">
                            <div className="pt-6 border-t border-gray-100 flex flex-col items-center justify-center gap-3">
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Are you a Student?</span>
                                <button 
                                    onClick={() => navigate('/login')}
                                    className="w-full py-4 bg-white border-2 border-slate-200 rounded-2xl font-black text-sm uppercase tracking-widest text-slate-900 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                                >
                                    <UserIcon className="w-5 h-5" /> Go to Student Login
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={async () => {
                                    if (window.confirm('Reset application data and refresh session?')) {
                                        if ('serviceWorker' in navigator) {
                                            const regs = await navigator.serviceWorker.getRegistrations();
                                            for (let r of regs) await r.unregister();
                                        }
                                        localStorage.clear();
                                        window.location.reload(true);
                                    }
                                }}
                                className="mt-4 text-[10px] text-slate-400 hover:text-indigo-500 transition-colors underline underline-offset-2"
                            >
                                System issues? Reset application →
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default StaffLoginPage;
