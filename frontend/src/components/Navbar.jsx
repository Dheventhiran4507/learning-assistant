import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
    ArrowRightOnRectangleIcon,
    AcademicCapIcon,
    UserCircleIcon,
    ChatBubbleLeftRightIcon,
    Bars3CenterLeftIcon,
    XMarkIcon,
    ChevronLeftIcon,
    ChartBarIcon,
    CursorArrowRaysIcon,
    PresentationChartLineIcon,
    ArrowPathIcon,
    BeakerIcon,
    CpuChipIcon,
    ChartPieIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleSync = async () => {
        if (window.confirm('Update-ai force panni synchronize panna thuraiya? App oru vaatti refresh aahum.')) {
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (let registration of registrations) {
                    await registration.unregister();
                }
            }
            window.location.reload(true);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleBack = () => {
        navigate(-1);
    };

    const isSubPage = location.pathname !== '/dashboard' && location.pathname !== '/admin/dashboard';

    const isAdmin = user?.role === 'admin' || user?.role === 'hod';
    const isAdvisor = user?.role === 'advisor';

    let navLinks = [];
    if (isAdmin) {
        navLinks = [
            { name: 'Academic Admin', path: '/admin/dashboard', icon: <UserCircleIcon className="w-5 h-5" /> },
            { name: 'Lab Manager', path: '/admin/lab-manager', icon: <BeakerIcon className="w-5 h-5" /> },
            { name: 'Lab Results', path: '/admin/lab-results', icon: <ChartPieIcon className="w-5 h-5" /> }
        ];
    } else if (isAdvisor) {
        navLinks = [
            { name: 'Academic Admin', path: '/admin/dashboard', icon: <UserCircleIcon className="w-5 h-5" /> }
        ];
    } else {
        navLinks = [
            { name: 'Dashboard', path: '/dashboard', icon: <ChartBarIcon className="w-5 h-5" /> },
            { name: 'Pre-Lab', path: '/pre-lab', icon: <BeakerIcon className="w-5 h-5" /> },
            { name: 'Post-Lab', path: '/post-lab', icon: <CpuChipIcon className="w-5 h-5" /> },
            { name: 'AI Assistant', path: '/chat', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" /> },
            { name: 'Practice Hub', path: '/practice', icon: <CursorArrowRaysIcon className="w-5 h-5" /> },
            { name: 'Analytics', path: '/analytics', icon: <PresentationChartLineIcon className="w-5 h-5" /> },
        ];
    }

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="sticky top-0 z-50 w-full px-4 sm:px-6 py-4 sm:py-6 pointer-events-none"
        >
            <div className="max-w-7xl mx-auto pointer-events-auto">
                <div className="glass rounded-2xl sm:rounded-[2rem] px-4 sm:px-8 py-3 sm:py-4 backdrop-blur-3xl border border-white/5 shadow-2xl flex items-center justify-between relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-primary-500/10 blur-3xl opacity-50"></div>

                    <div className="flex items-center gap-4 sm:gap-12 relative z-10">
                        <div className="flex items-center gap-2">
                            {isSubPage && (
                                <button
                                    onClick={handleBack}
                                    className="p-2 bg-slate-100 rounded-xl lg:hidden active:scale-95 transition-transform"
                                >
                                    <ChevronLeftIcon className="w-5 h-5 text-slate-900" />
                                </button>
                            )}
                            <Link to="/dashboard" className="flex items-center gap-3 group">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-900/10 group-hover:rotate-3 transition-transform">
                                    <AcademicCapIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                </div>
                                <div className="hidden sm:block">
                                    <span className="text-lg sm:text-xl font-black text-gray-900 block leading-none tracking-tighter uppercase">LUMINA</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] sm:text-[10px] font-black text-primary-600 tracking-[0.3em] uppercase">PORTAL</span>
                                        <span className="text-[7px] font-bold text-slate-400 opacity-50">v1.1.2</span>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Links */}
                        <div className="hidden lg:flex items-center gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5">
                            {navLinks.map((link) => {
                                const isActive = location.pathname === link.path;
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`relative px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3
                                            ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}
                                        `}
                                    >
                                        <span className="text-base">{link.icon}</span>
                                        <span>{link.name}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-active"
                                                className="absolute inset-0 bg-gray-100 rounded-xl -z-10 shadow-inner"
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6 relative z-10">
                        {/* Desktop User Info */}
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-gray-900 text-sm font-black">
                                {typeof user?.name === 'string' ? user.name : (user?.name?.message || 'User')}
                            </span>
                            <span className="text-primary-600 text-[10px] font-black uppercase tracking-tighter">Semester {user?.semester || '1'}</span>
                        </div>

                        <div className="h-10 w-[1px] bg-slate-200 hidden md:block"></div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="lg:hidden p-2 text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            <Bars3CenterLeftIcon className="w-6 h-6" />
                        </button>

                        {/* Desktop Sync Button */}
                        <button
                            onClick={handleSync}
                            className="hidden lg:flex w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all group mr-2"
                            title="Force Sync App"
                        >
                            <ArrowPathIcon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                        </button>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 sm:px-4 h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 hover:border-red-200 transition-all group"
                            title="Sign Out"
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            <span className="hidden xl:block text-[10px] font-black uppercase tracking-widest">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        {/* PWA Sync Version: 1.0.3 */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] pointer-events-auto"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 h-full w-4/5 max-w-sm bg-white z-[70] shadow-2xl flex flex-col pointer-events-auto"
                        >
                            <div className="p-8 flex items-center justify-between border-b border-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center uppercase font-black text-white text-lg">
                                        {user?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 leading-none">{user?.name}</p>
                                        <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-1">Semester {user?.semester}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleSync}
                                        className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-colors border border-indigo-100"
                                        title="Force Sync"
                                    >
                                        <ArrowPathIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setIsMenuOpen(false)}
                                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                                    >
                                        <XMarkIcon className="w-6 h-6 text-slate-900" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2">Navigation</p>
                                {navLinks.map((link) => {
                                    const isActive = location.pathname === link.path;
                                    return (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setIsMenuOpen(false)}
                                            className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300
                                                ${isActive ? 'bg-indigo-50 text-indigo-900' : 'text-slate-600 hover:bg-slate-50'}
                                            `}
                                        >
                                            <div className={`${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                                                {link.icon}
                                            </div>
                                            <span className="font-black uppercase tracking-widest text-xs">{link.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className="p-8 border-t border-slate-50">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-100 transition-colors"
                                >
                                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                    Sign Out
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
