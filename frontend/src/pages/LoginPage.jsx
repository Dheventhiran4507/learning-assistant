import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import authService from '../services/authService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import './LoginPage.css';
import {
    AcademicCapIcon,
    ArrowRightIcon,
    EnvelopeIcon,
    LockClosedIcon,
    ShieldCheckIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await authService.login({ email: email.trim(), password });
            if (data.success) {
                const user = data.data.student;
                const token = data.data.token;
                
                if (user.role !== 'student') {
                    toast.error('This is the Student Portal. Staff and Administrators should use the Staff Portal to login.');
                    setLoading(false);
                    return;
                }

                login(user, token);
                toast.success(`Welcome back, ${user.name}!`);
                navigate('/dashboard');
            } else {
                const msg = typeof data.message === 'string' ? data.message : (data.message?.message || 'Login failed');
                toast.error(msg);
            }
        } catch (error) {
            const serverMsg = error.response?.data?.message;
            const detailMsg = error.response?.data?.error;
            
            // Handle cases where serverMsg might be an object {code, message}
            const finalMsg = typeof detailMsg === 'string' ? detailMsg : 
                           (typeof serverMsg === 'string' ? serverMsg : 
                           (serverMsg?.message || 'Login failed'));
            
            toast.error(finalMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            {/* Background Blobs */}
            <div className="login-bg-blobs-wrapper">
                <div className="login-bg-blob-indigo"></div>
                <div className="login-bg-blob-slate"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="login-content-grid"
            >
                {/* 3D Illustration Side */}
                <div className="login-illustration-side">
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="login-illustration-wrapper"
                    >
                        <div className="login-shape-outer">
                            <div className="login-shape-inner">
                                <AcademicCapIcon className="login-icon-large" />
                            </div>
                        </div>
                    </motion.div>
                    <h2 className="login-title-large">Academic Excellence</h2>
                    <p className="login-subtitle-large">
                        Standardized learning modules and AI-powered performance analytics for the modern engineer.
                    </p>
                </div>

                {/* Login Form Side */}
                <div className="login-form-side">
                    <div className="login-form-glass-overlay"></div>

                    <div className="login-form-content">
                        <div className="login-form-header">
                            <h1 className="login-form-title">
                                Student Portal
                            </h1>
                            <div className="login-form-subtitle-wrapper">
                                <p className="login-form-subtitle">Authentication required for secure access</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="login-form-group">
                            <div className="login-input-group">
                                <label className="login-label">Email Address</label>
                                <div className="login-input-wrapper">
                                    <div className="login-input-icon">
                                        <EnvelopeIcon className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="login-input"
                                        placeholder="university.id@student.edu"
                                    />
                                </div>
                            </div>

                            <div className="login-input-group">
                                <label className="login-label">Password</label>
                                <div className="login-input-wrapper">
                                    <div className="login-input-icon">
                                        <LockClosedIcon className="w-5 h-5" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="login-input password"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="login-eye-toggle"
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
                                className="login-submit-btn"
                            >
                                {loading ? (
                                    <>
                                        <div className="login-spinner"></div>
                                        <span>Granting Access...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Initialize Session</span>
                                        <ArrowRightIcon className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="login-footer">
                            <div className="login-staff-section">
                                <span className="login-staff-text">Are you Staff or Admin?</span>
                                <Link to="/staff-login" className="login-staff-btn">
                                    <ShieldCheckIcon className="w-5 h-5" /> Institutional Portal Login
                                </Link>
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
                                className="login-reset-btn"
                            >
                                App not working? Reset Session →
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
