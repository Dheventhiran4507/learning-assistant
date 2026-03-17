import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Global error safety for mobile diagnostics
window.onerror = function(message, source, lineno, colno, error) {
    if (message.includes('ResizeObserver')) return; // Ignore harmless noise
    const errorMsg = `Critical App Error: ${message} at ${lineno}:${colno}`;
    console.error(errorMsg);
    // Only show alert in production on mobile if the app is blank
    if (!document.getElementById('root').hasChildNodes()) {
        alert(errorMsg);
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
