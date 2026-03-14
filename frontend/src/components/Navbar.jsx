import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
    ChartBarIcon,
    ChatBubbleLeftRightIcon,
    CursorArrowRaysIcon,
    PresentationChartLineIcon,
    ArrowRightOnRectangleIcon,
    AcademicCapIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isAdmin = user?.role === 'admin' || user?.role === 'hod' || user?.role === 'advisor';

    const navLinks = isAdmin
        ? [{ name: 'Academic Admin', path: '/admin/dashboard', icon: <UserCircleIcon className="w-5 h-5" /> }]
        : [
            { name: 'Dashboard', path: '/dashboard', icon: <ChartBarIcon className="w-5 h-5" /> },
            { name: 'AI Assistant', path: '/chat', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" /> },
            { name: 'Practice Hub', path: '/practice', icon: <CursorArrowRaysIcon className="w-5 h-5" /> },
            { name: 'Analytics', path: '/analytics', icon: <PresentationChartLineIcon className="w-5 h-5" /> },
        ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="sticky top-0 z-50 w-full px-6 py-6 pointer-events-none"
        >
            <div className="max-w-7xl mx-auto pointer-events-auto">
                <div className="glass rounded-[2rem] px-8 py-4 backdrop-blur-3xl border border-white/5 shadow-2xl flex items-center justify-between relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-primary-500/10 blur-3xl opacity-50"></div>

                    <div className="flex items-center gap-12 relative z-10">
                        <Link to="/dashboard" className="flex items-center gap-3 group">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-900/10 group-hover:rotate-3 transition-transform">
                                <AcademicCapIcon className="w-7 h-7 text-white" />
                            </div>
                            <div className="hidden lg:block">
                                <span className="text-xl font-black text-gray-900 block leading-none tracking-tighter uppercase">LUMINA</span>
                                <span className="text-[10px] font-black text-primary-600 tracking-[0.3em] uppercase">PORTAL</span>
                            </div>
                        </Link>

                        <div className="hidden md:flex items-center gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5">
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

                    <div className="flex items-center gap-6 relative z-10">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-gray-900 text-sm font-black">{user?.name}</span>
                            <span className="text-primary-600 text-[10px] font-black uppercase tracking-tighter">Semester {user?.semester || '1'}</span>
                        </div>

                        <div className="h-10 w-[1px] bg-white/5 hidden sm:block"></div>

                        <button
                            onClick={handleLogout}
                            className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all group"
                            title="Sign Out"
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
