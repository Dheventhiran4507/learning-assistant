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

    // 1. Hard Keyboard & Input Lock
    useEffect(() => {
        if (!isActive) return;

        const lockKiosk = async () => {
            try {
                // Keyboard Lock (Chrome/Edge only) - Hard system-level interception
                if (navigator.keyboard && navigator.keyboard.lock) {
                    await navigator.keyboard.lock([
                        'Escape', 'Tab', 'MetaLeft', 'MetaRight', 
                        'AltLeft', 'AltRight', 'KeyR', 'F1', 'F3', 'F5', 'F6', 'F11', 'F12'
                    ]);
                }
            } catch (err) {
                console.warn('Keyboard lock failed:', err);
            }
        };

        const handleKeyDown = (e) => {
            // High-priority blocked keys
            const blockedKeys = [
                'Tab', 'Escape', 'Meta', 'Alt', 'F1', 'F3', 'F5', 'F6', 'F11', 'F12', 
                'PrintScreen', 'ContextMenu'
            ];
            const isSystemShortcut = e.altKey || e.ctrlKey || e.metaKey;

            // Immediately block restricted keys and shortcuts
            if (blockedKeys.includes(e.key) || isSystemShortcut) {
                // Allow Ctrl+C and Ctrl+V only if strictly needed (usually not for assessments)
                // For maximum security, we block EVERYTHING except standard character input.
                
                e.preventDefault();
                e.stopPropagation();
                
                // Alert on high-risk navigation keys
                if (['Tab', 'Meta', 'Alt', 'Escape'].includes(e.key)) {
                    triggerViolation();
                }
                return false;
            }
        };

        const handleContextMenu = (e) => {
            e.preventDefault();
            return false;
        };

        // Capture phase listeners for total interception
        window.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });
        document.addEventListener('contextmenu', handleContextMenu, { capture: true });
        
        lockKiosk();
        
        // Reinforce lock every 1 second to combat background refocusing
        const lockInterval = setInterval(lockKiosk, 1000);

        return () => {
            window.removeEventListener('keydown', handleKeyDown, { capture: true });
            document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
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
