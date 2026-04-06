import { useEffect, useState, useCallback } from 'react';

/**
 * useSecurityLock - Custom hook to manage assessment security and anti-cheat mechanisms.
 * @param {boolean} isActive - Whether the security lock should be active.
 * @param {function} onViolation - Callback triggered when an integrity violation is detected.
 */
export const useSecurityLock = (isActive, onViolation) => {
    const [violationCount, setViolationCount] = useState(0);

    const triggerViolation = useCallback(() => {
        if (!isActive) return;
        setViolationCount(prev => prev + 1);
        if (onViolation) onViolation();
    }, [isActive, onViolation]);

    // 1. Keyboard & Input Lock
    useEffect(() => {
        if (!isActive) return;

        const lockKiosk = async () => {
            try {
                // Keyboard Lock (Chrome/Edge only)
                if (navigator.keyboard && navigator.keyboard.lock) {
                    await navigator.keyboard.lock([
                        'Escape', 'Tab', 'MetaLeft', 'MetaRight', 
                        'AltLeft', 'AltRight', 'F11', 'F12', 'F5'
                    ]);
                }
            } catch (err) {
                console.warn('Keyboard lock failed:', err);
            }
        };

        const handleKeyDown = (e) => {
            const blockedKeys = ['Tab', 'Escape', 'Meta', 'Alt', 'F11', 'F12', 'F5'];
            const isSystemShortcut = e.altKey || e.ctrlKey || e.metaKey;

            // Block restricted keys and shortcuts (except R for refresh if allowed, but usually not)
            if (blockedKeys.includes(e.key) || isSystemShortcut) {
                e.preventDefault();
                e.stopPropagation();
                
                // Only specific keys trigger a "violation" alert, others are just blocked
                if (['Tab', 'Meta', 'Alt'].includes(e.key)) {
                    triggerViolation();
                }
                return false;
            }
        };

        const handleContextMenu = (e) => {
            e.preventDefault();
            return false;
        };

        window.addEventListener('keydown', handleKeyDown, true);
        document.addEventListener('contextmenu', handleContextMenu);
        lockKiosk();
        
        // Reinforce lock every 2 seconds
        const lockInterval = setInterval(lockKiosk, 2000);

        return () => {
            window.removeEventListener('keydown', handleKeyDown, true);
            document.removeEventListener('contextmenu', handleContextMenu);
            clearInterval(lockInterval);
            if (navigator.keyboard && navigator.keyboard.unlock) {
                navigator.keyboard.unlock();
            }
        };
    }, [isActive, triggerViolation]);

    // 2. Visibility & Focus Monitoring
    useEffect(() => {
        if (!isActive) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                triggerViolation();
            }
        };

        const handleBlur = () => {
            // Some browsers trigger blur when entering fullscreen, 
            // so we add a small delay or check fullscreen state
            setTimeout(() => {
                if (!document.hasFocus() && isActive) {
                    triggerViolation();
                }
            }, 100);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
        };
    }, [isActive, triggerViolation]);

    // 3. Navigation (Back Button) Blocking
    useEffect(() => {
        if (!isActive) return;

        // Push a new state to history to capture the back button
        window.history.pushState(null, '', window.location.href);

        const handlePopState = () => {
            window.history.pushState(null, '', window.location.href);
            // Optionally trigger violation on back button attempt
            // triggerViolation();
        };

        const handleBeforeUnload = (e) => {
            // Note: Modern browsers don't allow custom messages anymore, 
            // but this still triggers the default confirmation dialog.
            e.preventDefault();
            e.returnValue = '';
            return '';
        };

        window.addEventListener('popstate', handlePopState);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isActive]);

    return { violationCount };
};
