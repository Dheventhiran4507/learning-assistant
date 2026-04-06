import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldExclamationIcon, LockClosedIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

/**
 * SecurityLock Component - Enforces fullscreen mode and blocks interaction if bypassed.
 * @param {boolean} isActive - Whether the assessment is currently running.
 * @param {string} title - Assessment title.
 * @param {function} onLockRestored - Callback when fullscreen is successfully re-entered.
 */
const SecurityLock = ({ isActive, title = 'Assessment', onLockRestored }) => {
    const [isLocked, setIsLocked] = useState(false);
    const [isReentering, setIsReentering] = useState(false);

    const checkSecurity = useCallback(() => {
        const hasFullscreen = !!document.fullscreenElement;
        const hasFocus = document.hasFocus();
        const isVisible = !document.hidden;

        // Lock if any security condition is failed
        setIsLocked(!hasFullscreen || !hasFocus || !isVisible);
    }, []);

    useEffect(() => {
        if (!isActive) {
            setIsLocked(false);
            return;
        }

        // Periodic check for focus/visibility/fullscreen
        const interval = setInterval(checkSecurity, 500);
        
        const handleEvents = () => checkSecurity();
        
        document.addEventListener('fullscreenchange', handleEvents);
        window.addEventListener('blur', handleEvents);
        window.addEventListener('focus', handleEvents);
        document.addEventListener('visibilitychange', handleEvents);

        // Initial check after a short delay to allow transition
        const timeout = setTimeout(checkSecurity, 100);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
            document.removeEventListener('fullscreenchange', handleEvents);
            window.removeEventListener('blur', handleEvents);
            window.removeEventListener('focus', handleEvents);
            document.removeEventListener('visibilitychange', handleEvents);
        };
    }, [isActive, checkSecurity]);

    const requestLock = async () => {
        setIsReentering(true);
        try {
            // First, focus the window explicitly
            window.focus();

            // Attempt to restore fullscreen if lost
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
                toast.success('🔒 Security session restored.');
                if (onLockRestored) onLockRestored();
            } else {
                // If already in fullscreen but lost focus, just re-check security
                checkSecurity();
                toast.success('🔒 Focus restored.');
            }
        } catch (err) {
            console.error('Locking failure:', err);
            toast.error('❌ Browser blocked security lock. Click explicitly to restore.');
        } finally {
            setIsReentering(false);
        }
    };

    if (!isActive) return null;

    return (
        <AnimatePresence>
            {isLocked && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[99999] flex flex-col items-center justify-center p-6 bg-slate-900/95 backdrop-blur-2xl overflow-hidden text-center"
                >
                    <div className="max-w-md w-full bg-slate-800/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
                        {/* Shimmering pulse effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-500/5 animate-pulse pointer-events-none" />
                        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                            <ShieldExclamationIcon className="w-12 h-12 text-red-500 animate-pulse" />
                        </div>
                        
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 leading-tight">
                            Security Protocol <span className="text-red-500 italic">Violated!</span>
                        </h2>
                        
                        <p className="text-slate-400 font-medium mb-10 leading-relaxed">
                            Assessment <span className="text-white font-bold">{title}</span> requires an active browser-level lock to ensure integrity. Session content is hidden until the lock is restored.
                        </p>

                        <div className="space-y-4">
                            <button
                                onClick={requestLock}
                                disabled={isReentering}
                                className="w-full bg-white text-slate-900 py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-slate-100 active:scale-95 transition-all shadow-xl shadow-white/5"
                            >
                                {isReentering ? (
                                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                ) : (
                                    <LockClosedIcon className="w-5 h-5" />
                                )}
                                {isReentering ? 'Restoring...' : 'Restore Secure Session'}
                            </button>
                            
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                Leaving the assessment area may lead to automatic disqualification.
                            </p>
                        </div>
                    </div>

                    {/* Decorative backdrop elements */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SecurityLock;
