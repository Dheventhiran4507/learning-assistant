import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import authService from '../services/authService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await authService.login({ email, password });
            if (data.success) {
                login(data.data.student, data.data.token);
                toast.success(`Welcome back, ${data.data.student.name}!`);
                navigate('/dashboard');
            } else {
                toast.error(data.message || 'Login failed');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Server error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Blobs - Using global styles for consistency */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary-500/20 rounded-full blur-[100px]"></div>
            </div>

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
                        <div className="w-64 h-64 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-3xl shadow-glow-primary transform rotate-12 flex items-center justify-center opacity-80 backdrop-blur-lg border border-white/40">
                            <div className="w-48 h-48 bg-white/40 rounded-2xl transform -rotate-12 flex items-center justify-center backdrop-blur-sm border border-white/30">
                                <span className="text-6xl">🎓</span>
                            </div>
                        </div>
                    </motion.div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Learn Smarter with AI</h2>
                    <p className="text-gray-600 text-lg max-w-md">
                        Experience personalised learning tailored just for Anna University students.
                    </p>
                </div>

                {/* Login Form Side */}
                <div className="glass p-8 md:p-12 rounded-3xl shadow-2xl border border-gray-100 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
                                Welcome Back
                            </h1>
                            <p className="mt-2 text-gray-500">Please enter your details to sign in</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl opacity-20 group-hover:opacity-100 transition duration-300 blur-sm"></div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="relative w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder-gray-400 outline-none transition-all"
                                        placeholder="student@annauniv.edu"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl opacity-20 group-hover:opacity-100 transition duration-300 blur-sm"></div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="relative w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder-gray-400 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 font-bold text-white bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl hover:shadow-glow-primary transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4 relative overflow-hidden group"
                            >
                                <span className="absolute w-64 h-64 mt-12 group-hover:-rotate-90 group-hover:-mt-24 transition-all duration-1000 ease-out -translate-x-20 -translate-y-24 bg-white opacity-10 rotate-45 transform left-0 top-0"></span>
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-500">
                                Don't have an account?{' '}
                                <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                                    Create Free Account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
