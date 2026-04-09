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
import './InitialSetupPage.css'; // Import the new CSS

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
                const msg = typeof data.message === 'string' ? data.message : (data.message?.message || 'Setup failed');
                toast.error(msg);
            }
        } catch (error) {
            const serverMsg = error.response?.data?.message;
            const finalMsg = typeof serverMsg === 'string' ? serverMsg : (serverMsg?.message || 'Server error during setup');
            toast.error(finalMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="setup-page-container">
            {/* Design patterns similar to Login Page */}
            <div className="setup-background-patterns">
                <div className="pattern-top-left"></div>
                <div className="pattern-bottom-right"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="setup-card"
            >
                {/* Branding Side (2/5) */}
                <div className="setup-branding-side">
                    <div className="branding-content">
                        <div>
                            <AcademicCapIcon className="brand-icon" />
                            <h2 className="brand-title">
                                Lumina <span>Portal</span>
                            </h2>
                            <p className="brand-tagline">
                                Welcome to Vidal. As the first user, you are establishing the primary root administrator account for this instance.
                            </p>
                        </div>
                        
                        <div className="brand-features">
                            <div className="feature-item">
                                <ShieldCheckIcon className="feature-icon" />
                                <div>
                                    <p className="feature-title">Secure Root Access</p>
                                    <p className="feature-desc">This account has full control over all institutional data.</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <KeyIcon className="feature-icon" />
                                <div>
                                    <p className="feature-title">Setup Only Once</p>
                                    <p className="feature-desc">This portal will be disabled once the root account is established.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="branding-decoration"></div>
                </div>

                {/* Form Side (3/5) */}
                <div className="setup-form-side">
                    <div className="setup-form-wrapper">
                        <div className="form-header">
                            <h1 className="form-title">
                                <UserPlusIcon className="form-title-icon" />
                                Initial Setup
                            </h1>
                            <p className="form-subtitle">Configure your root admin credentials</p>
                        </div>

                        <form onSubmit={handleSubmit} className="setup-form">
                            <div className="setup-input-group">
                                <label className="setup-input-label">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="setup-input"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="setup-input-group">
                                <label className="setup-input-label">Admin Email</label>
                                <div className="setup-input-wrapper">
                                    <EnvelopeIcon className="setup-input-icon" />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="setup-input setup-input-with-icon"
                                        placeholder="institutional@admin.edu"
                                    />
                                </div>
                            </div>

                            <div className="setup-input-group">
                                <label className="setup-input-label">Root Password</label>
                                <div className="setup-input-wrapper">
                                    <LockClosedIcon className="setup-input-icon" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="setup-input setup-input-with-icon setup-input-padded"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="password-toggle-btn"
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="toggle-icon-small" />
                                        ) : (
                                            <EyeIcon className="toggle-icon-small" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="setup-input-group">
                                <label className="setup-input-label">Confirm Password</label>
                                <div className="setup-input-wrapper">
                                    <LockClosedIcon className="setup-input-icon" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="setup-input setup-input-with-icon setup-input-padded"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="password-toggle-btn"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeSlashIcon className="toggle-icon-small" />
                                        ) : (
                                            <EyeIcon className="toggle-icon-small" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="seed-checkbox-container">
                                <input
                                    type="checkbox"
                                    id="seedSyllabus"
                                    checked={shouldSeed}
                                    onChange={(e) => setShouldSeed(e.target.checked)}
                                    className="seed-checkbox"
                                />
                                <label htmlFor="seedSyllabus" className="seed-label">
                                    Import Default Anna University R2021 Syllabus
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="setup-submit-btn"
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
