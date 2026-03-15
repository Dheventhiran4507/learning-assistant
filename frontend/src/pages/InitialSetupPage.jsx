import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
    UserPlusIcon,
    AcademicCapIcon,
    EnvelopeIcon,
    LockClosedIcon,
    KeyIcon,
    ShieldCheckIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';

const InitialSetupPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [shouldSeed, setShouldSeed] = useState(true);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            return toast.error('Passwords do not match');
        }

        setLoading(true);

        try {
            const data = await authService.setupInitialAdmin({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            if (data.success) {
                if (shouldSeed) {
                    toast.loading('Importing syllabus data...');
                    try {
                        await authService.seedSyllabus();
                        toast.success('Syllabus imported successfully!');
                    } catch (seedError) {
                        toast.error('Admin created, but syllabus import failed.');
                        console.error(seedError);
                    }
                }
                toast.success('Root Admin created successfully!');
                navigate('/staff-login');
            } else {
                toast.error(data.message || 'Setup failed');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Server error during setup');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50">
            {/* Design patterns similar to Login Page */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-slate-900/5 rounded-full blur-[120px]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-5 gap-0 items-stretch bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden"
            >
                {/* Branding Side (2/5) */}
                <div className="hidden md:block col-span-2 bg-slate-900 p-12 text-white relative">
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <AcademicCapIcon className="w-16 h-16 text-primary-400 mb-8" />
                            <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-4">
                                Lumina <span className="text-primary-400 italic">Portal</span>
                            </h2>
                            <p className="text-slate-400 font-medium">
                                Welcome to Vidal. As the first user, you are establishing the primary root administrator account for this instance.
                            </p>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <ShieldCheckIcon className="w-6 h-6 text-primary-400 shrink-0" />
                                <div>
                                    <p className="font-bold text-sm uppercase">Secure Root Access</p>
                                    <p className="text-xs text-slate-500">This account has full control over all institutional data.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <KeyIcon className="w-6 h-6 text-primary-400 shrink-0" />
                                <div>
                                    <p className="font-bold text-sm uppercase">Setup Only Once</p>
                                    <p className="text-xs text-slate-500">This portal will be disabled once the root account is established.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-32 -mb-32"></div>
                </div>

                {/* Form Side (3/5) */}
                <div className="col-span-3 p-8 md:p-16">
                    <div className="max-w-md mx-auto">
                        <div className="mb-10">
                            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <UserPlusIcon className="w-8 h-8 text-primary-500" />
                                Initial Setup
                            </h1>
                            <p className="text-slate-500 text-sm font-medium mt-1">Configure your root admin credentials</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 text-slate-900 outline-none transition-all font-bold placeholder:text-slate-300"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Admin Email</label>
                                <div className="relative">
                                    <EnvelopeIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 text-slate-900 outline-none transition-all font-bold placeholder:text-slate-300"
                                        placeholder="institutional@admin.edu"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Root Password</label>
                                <div className="relative">
                                    <LockClosedIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 text-slate-900 outline-none transition-all font-bold placeholder:text-slate-300"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="w-5 h-5" />
                                        ) : (
                                            <EyeIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Confirm Password</label>
                                <div className="relative">
                                    <LockClosedIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 text-slate-900 outline-none transition-all font-bold placeholder:text-slate-300"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeSlashIcon className="w-5 h-5" />
                                        ) : (
                                            <EyeIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-2xl border border-primary-100 mb-2">
                                <input
                                    type="checkbox"
                                    id="seedSyllabus"
                                    checked={shouldSeed}
                                    onChange={(e) => setShouldSeed(e.target.checked)}
                                    className="w-5 h-5 accent-slate-900 cursor-pointer"
                                />
                                <label htmlFor="seedSyllabus" className="text-[11px] font-bold text-slate-700 cursor-pointer">
                                    Import Default Anna University R2021 Syllabus
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 font-black text-white bg-slate-900 rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95 disabled:opacity-50 mt-4 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                            >
                                {loading ? 'Initializing System...' : 'Establish Root Instance'}
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default InitialSetupPage;
