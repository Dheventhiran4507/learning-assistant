import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import './LoginPage.css'; // Reusing LoginPage styles since the UI layout is identical
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
                    // Fallback should not be needed but here as safety
                    login(student, token);
                    toast.success('Welcome to Portal');
                    navigate('/dashboard');
                }
            }
        } catch (error) {
            const serverMsg = error.response?.data?.message;
            const detailMsg = error.response?.data?.error;
            
            // Safety check for objects
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
                                <ShieldCheckIcon className="login-icon-large" />
                            </div>
                        </div>
                    </motion.div>
                    <h2 className="login-title-large">Institutional Control</h2>
                    <p className="login-subtitle-large">
                        Administrative terminal for managing academic workflows and student performance metrics.
                    </p>
                </div>

                {/* Login Form Side */}
                <div className="login-form-side">
                    <div className="login-form-glass-overlay"></div>

                    <div className="login-form-content">
                        <div className="login-form-header">
                            <h1 className="login-form-title">
                                Institutional Portal
                            </h1>
                            <div className="login-form-subtitle-wrapper">
                                <p className="login-form-subtitle">Authentication required for secure access</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="login-form-group">
                            <div className="login-input-group">
                                <label className="login-label">Institutional Email</label>
                                <div className="login-input-wrapper">
                                    <div className="login-input-icon">
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="login-input"
                                        placeholder="name@university.edu.in"
                                    />
                                </div>
                            </div>

                            <div className="login-input-group">
                                <label className="login-label">Clearance Key</label>
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

                        <div className="login-footer">
                            <div className="login-staff-section">
                                <span className="login-staff-text">Are you a Student?</span>
                                <button 
                                    onClick={() => navigate('/login')}
                                    className="login-staff-btn"
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
                                className="login-reset-btn"
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
