import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Global error safety for mobile diagnostics
window.onerror = function(message, source, lineno, colno, error) {
    if (message.includes('ResizeObserver')) return;
    
    // Auto-fix for React Error #31 (Objects as children)
    if (message.includes('Minified React error #31')) {
        console.error('Detected React Error #31 - Clearing storage and reloading...');
        localStorage.clear();
        // Use a flag to avoid infinite reload loop
        if (!sessionStorage.getItem('reloaded-after-error')) {
            sessionStorage.setItem('reloaded-after-error', 'true');
            window.location.reload(true);
            return;
        }
    }

    const errorMsg = `Critical App Error: ${message} at ${lineno}:${colno}`;
    console.error(errorMsg);
    
    // Alert only if app is totally blank
    const root = document.getElementById('root');
    if (root && !root.hasChildNodes()) {
        alert(errorMsg + '\n\nPlease try refreshing the page.');
    }
};

try {
    ReactDOM.createRoot(document.getElementById('root')).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    )
} catch (err) {
    console.error('Initial Mount Failure:', err);
    alert('Failed to initialize application: ' + err.message);
}
