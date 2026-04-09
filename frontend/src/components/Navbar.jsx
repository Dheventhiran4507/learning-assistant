import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import './Navbar.css';

import {
    ArrowRightOnRectangleIcon,
    AcademicCapIcon,
    UserCircleIcon,
    ChatBubbleLeftRightIcon,
    Bars3CenterLeftIcon,
    XMarkIcon,
    ChartBarIcon,
    CursorArrowRaysIcon,
    PresentationChartLineIcon,
    ArrowPathIcon,
    BeakerIcon,
    CpuChipIcon,
    ChartPieIcon,
} from '@heroicons/react/24/outline'; // removed unused icons

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
            { name: 'Academic Admin', path: '/admin/dashboard', icon: <UserCircleIcon className="navbar-nav-item-icon w-5 h-5" /> }
        ];
    } else if (isStaff) {
        navLinks = [
            { name: 'Academic Admin', path: '/admin/dashboard', icon: <UserCircleIcon className="navbar-nav-item-icon w-5 h-5" /> },
            { name: 'Lab Manager', path: '/admin/lab-manager', icon: <BeakerIcon className="navbar-nav-item-icon w-5 h-5" /> },
            { name: 'Lab Results', path: '/admin/lab-results', icon: <ChartPieIcon className="navbar-nav-item-icon w-5 h-5" /> }
        ];
    } else {
        navLinks = [
            { name: 'Dashboard', path: '/dashboard', icon: <ChartBarIcon className="navbar-nav-item-icon w-5 h-5" /> },
            { name: 'Pre-Lab', path: '/pre-lab', icon: <BeakerIcon className="navbar-nav-item-icon w-5 h-5" /> },
            { name: 'Post-Lab', path: '/post-lab', icon: <CpuChipIcon className="navbar-nav-item-icon w-5 h-5" /> },
            { name: 'AI Assistant', path: '/chat', icon: <ChatBubbleLeftRightIcon className="navbar-nav-item-icon w-5 h-5" /> },
            { name: 'Practice Hub', path: '/practice', icon: <CursorArrowRaysIcon className="navbar-nav-item-icon w-5 h-5" /> },
            { name: 'Analytics', path: '/analytics', icon: <PresentationChartLineIcon className="navbar-nav-item-icon w-5 h-5" /> },
        ];
    }

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="navbar-wrapper"
        >
            <div className="navbar-container">
                <div className="navbar-inner">
                    <div className="navbar-left">
                        <Link to="/dashboard" className="navbar-logo-link">
                            <div className="navbar-logo-icon-wrapper">
                                <AcademicCapIcon className="navbar-logo-icon" />
                            </div>
                            <div>
                                <span className="navbar-logo-text">LUMINA</span>
                                <div className="navbar-logo-subtext-wrapper">
                                    <span className="navbar-logo-subtext">PORTAL</span>
                                </div>
                            </div>
                        </Link>

                        {/* Desktop Links */}
                        <div className="navbar-desktop-links">
                            {navLinks.map((link) => {
                                const isActive = location.pathname === link.path;
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`navbar-nav-item ${isActive ? 'active' : 'inactive'}`}
                                    >
                                        <span className="navbar-nav-item-icon items-center flex">{link.icon}</span>
                                        <span>{link.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div className="navbar-actions">
                        {/* Desktop User Info & Actions */}
                        <div className="navbar-desktop-actions">
                            <div className="navbar-user-info">
                                <span className="navbar-user-name">
                                    {typeof user?.name === 'string' ? user.name : (user?.name?.message || 'User')}
                                </span>
                                <span className="navbar-user-semester">Semester {user?.semester || '1'}</span>
                            </div>

                            <div className="navbar-divider"></div>

                            {/* Sync Button */}
                            <button
                                onClick={handleSync}
                                className="navbar-sync-btn"
                                title="Sync Data"
                            >
                                <ArrowPathIcon className="navbar-sync-icon" />
                            </button>

                            <button
                                onClick={handleLogout}
                                className="navbar-logout-btn"
                            >
                                <ArrowRightOnRectangleIcon className="navbar-logout-icon" />
                                <span>Logout</span>
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="navbar-mobile-toggle"
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
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="navbar-drawer-overlay"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="navbar-drawer"
                        >
                            <div className="navbar-drawer-header">
                                <div className="navbar-drawer-user-info">
                                    <div className="navbar-drawer-avatar">
                                        {user?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="navbar-drawer-name">{user?.name}</p>
                                        <p className="navbar-drawer-semester">Semester {user?.semester}</p>
                                    </div>
                                </div>
                                <div className="navbar-drawer-header-actions">
                                    <button
                                        onClick={handleSync}
                                        className="navbar-drawer-sync-btn"
                                        title="Force Sync"
                                    >
                                        <ArrowPathIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setIsMenuOpen(false)}
                                        className="navbar-drawer-close-btn"
                                    >
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="navbar-drawer-nav">
                                <p className="navbar-drawer-nav-title">Navigation</p>
                                {navLinks.map((link) => {
                                    const isActive = location.pathname === link.path;
                                    return (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setIsMenuOpen(false)}
                                            className={`navbar-drawer-nav-item ${isActive ? 'active' : 'inactive'}`}
                                        >
                                            <div className="navbar-drawer-nav-item-icon">
                                                {link.icon}
                                            </div>
                                            <span className="navbar-drawer-nav-item-text">{link.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className="navbar-drawer-footer">
                                <button
                                    onClick={handleLogout}
                                    className="navbar-drawer-logout-btn"
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
