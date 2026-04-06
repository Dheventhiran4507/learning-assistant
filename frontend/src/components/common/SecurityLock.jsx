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
    const [isFullscreen, setIsFullscreen] = useState(true);
    const [isReentering, setIsReentering] = useState(false);

    const checkFullscreen = useCallback(() => {
        setIsFullscreen(!!document.fullscreenElement);
    }, []);

    useEffect(() => {
        if (!isActive) return;

        // Periodic check to ensure fullscreen remains active
        const interval = setInterval(checkFullscreen, 500);
        document.addEventListener('fullscreenchange', checkFullscreen);

        // Initial check
        checkFullscreen();

        return () => {
            clearInterval(interval);
            document.removeEventListener('fullscreenchange', checkFullscreen);
        };
    }, [isActive, checkFullscreen]);

    const requestLock = async () => {
        setIsReentering(true);
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
                toast.success('🔒 Security session restored.');
                if (onLockRestored) onLockRestored();
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
            {!isFullscreen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 bg-slate-900 overflow-hidden text-center"
                >
                    <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl p-10 rounded-[3rem] border border-slate-700 shadow-2xl">
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
