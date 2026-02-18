import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import authService from '../services/authService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        studentId: '',
        name: '',
        email: '',
        password: '',
        semester: 1,
        batch: '2021-2025',
        college: 'Anna University'
    });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await authService.register(formData);
            if (data.success) {
                login(data.data.student, data.data.token);
                toast.success(`Welcome, ${data.data.student.name}!`);
                navigate('/dashboard');
            } else {
                toast.error(data.message || 'Registration failed');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Server error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Blobs - Using global styles for consistency */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary-500/20 rounded-full blur-[100px]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
            >
                {/* 3D Illustration Side */}
                <div className="hidden md:flex flex-col justify-center items-center text-center p-8 order-2">
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="mb-8 relative"
                    >
                        {/* Abstract 3D shape for Register */}
                        <div className="w-64 h-64 bg-gradient-to-bl from-secondary-400 to-primary-500 rounded-full shadow-glow-secondary transform -rotate-12 flex items-center justify-center opacity-80 backdrop-blur-lg border border-white/40">
                            <div className="w-48 h-48 bg-white/40 rounded-full transform rotate-12 flex items-center justify-center backdrop-blur-sm border border-white/30">
                                <span className="text-6xl">🚀</span>
                            </div>
                        </div>
                    </motion.div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Join the Revolution</h2>
                    <p className="text-gray-600 text-lg max-w-md">
                        Start your journey towards academic excellence with AI-powered learning.
                    </p>
                </div>

                {/* Register Form Side */}
                <div className="glass p-8 rounded-3xl shadow-2xl border border-gray-100 relative overflow-hidden order-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>

                    <div className="relative z-10 w-full">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary-600 to-primary-600">
                                Create Account
                            </h1>
                            <p className="mt-2 text-gray-500">Fill in your details to get started</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-700 ml-1">Student ID</label>
                                    <input
                                        name="studentId"
                                        required
                                        value={formData.studentId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500 text-gray-900 outline-none"
                                        placeholder="2021CSE001"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-700 ml-1">Full Name</label>
                                    <input
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500 text-gray-900 outline-none"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-700 ml-1">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500 text-gray-900 outline-none"
                                    placeholder="john@annauniv.edu"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-700 ml-1">Semester</label>
                                    <select
                                        name="semester"
                                        value={formData.semester}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500 text-gray-900 outline-none appearance-none"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s} className="bg-white text-gray-900">Semester {s}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-700 ml-1">College</label>
                                    <input
                                        name="college"
                                        required
                                        value={formData.college}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500 text-gray-900 outline-none"
                                        placeholder="College Name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-700 ml-1">Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500 text-gray-900 outline-none"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 font-bold text-white bg-gradient-to-r from-secondary-600 to-primary-600 rounded-xl hover:shadow-glow-secondary transition-all transform hover:scale-[1.02] active:scale-95 mt-2"
                            >
                                {loading ? 'Creating Account...' : 'Register Now'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-gray-500 text-sm">
                                Already have an account?{' '}
                                <Link to="/login" className="font-semibold text-secondary-600 hover:text-secondary-700">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
