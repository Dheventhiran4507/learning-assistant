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
        if (window.confirm('Force synchronize data? This will refresh the application and clear local cache.')) {
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

    const isAdminOrHOD = user?.role === 'admin' || user?.role === 'hod';
    const isAdvisor = user?.role === 'advisor';
    const isStaff = user?.role === 'staff';

    let navLinks = [];
    if (isAdminOrHOD || isAdvisor) {
        navLinks = [
            { name: 'Academic Admin', path: '/admin/dashboard', icon: <UserCircleIcon className="w-5 h-5" /> }
        ];
    } else if (isStaff) {
        navLinks = [
            { name: 'Academic Admin', path: '/admin/dashboard', icon: <UserCircleIcon className="w-5 h-5" /> },
            { name: 'Lab Manager', path: '/admin/lab-manager', icon: <BeakerIcon className="w-5 h-5" /> },
            { name: 'Lab Results', path: '/admin/lab-results', icon: <ChartPieIcon className="w-5 h-5" /> }
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
            className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)]"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center gap-8">
                        <Link to="/dashboard" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/10 group-hover:scale-105 transition-transform">
                                <AcademicCapIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <span className="text-xl font-black text-slate-900 block leading-none tracking-tight uppercase">LUMINA</span>
                                <div className="flex items-center gap-1.5 leading-none mt-0.5">
                                    <span className="text-[10px] font-black text-indigo-600 tracking-widest uppercase">PORTAL</span>
                                    <span className="text-[8px] font-bold text-slate-300">v1.1.2</span>
                                </div>
                            </div>
                        </Link>

                        {/* Desktop Links - Minimalist centered */}
                        <div className="hidden lg:flex items-center gap-1 ml-4">
                            {navLinks.map((link) => {
                                const isActive = location.pathname === link.path;
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`lumina-nav-item flex items-center gap-2
                                            ${isActive 
                                                ? 'bg-indigo-50 text-indigo-700' 
                                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}
                                        `}
                                    >
                                        <span className="opacity-80">{link.icon}</span>
                                        <span>{link.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        {/* Desktop User Info & Actions */}
                        <div className="hidden md:flex items-center gap-5">
                            <div className="flex flex-col items-end leading-tight">
                                <span className="text-slate-900 text-sm font-black">
                                    {typeof user?.name === 'string' ? user.name : (user?.name?.message || 'User')}
                                </span>
                                <span className="text-indigo-600 text-[10px] font-black uppercase tracking-widest">Semester {user?.semester || '1'}</span>
                            </div>

                            <div className="h-8 w-[1px] bg-slate-100"></div>

                            {/* Sync Button - Solid circular */}
                            <button
                                onClick={handleSync}
                                className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all group"
                                title="Sync Data"
                            >
                                <ArrowPathIcon className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                            </button>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-all font-black uppercase tracking-widest text-[10px] group"
                            >
                                <ArrowRightOnRectangleIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                <span>Logout</span>
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            <Bars3CenterLeftIcon className="w-6 h-6" />
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
