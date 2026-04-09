import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    ChatBubbleLeftRightIcon,
    UserIcon,
    PaperAirplaneIcon,
    AcademicCapIcon,
    LightBulbIcon,
    SparklesIcon,
    Bars3Icon,
    PlusIcon,
    ChatBubbleBottomCenterTextIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import './ChatPage.css'; // Import the new CSS

export default function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Sidebar & Session State
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(Date.now().toString());
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile

    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const { user } = useAuthStore();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    // Fetch Chat Sessions on Mount
    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await api.get('/chat/sessions');
            if (res.data.success) {
                setSessions(res.data.data);
                // If there are sessions and no messages, auto-load the latest session
                if (res.data.data.length > 0 && messages.length === 0) {
                    loadSession(res.data.data[0]._id);
                }
            }
        } catch (error) {
            console.error("Failed to load sessions:", error);
        }
    };

    const loadSession = async (sessionId) => {
        try {
            setCurrentSessionId(sessionId);
            const res = await api.get(`/chat/history?sessionId=${sessionId}`);
            if (res.data.success) {
                // Convert DB format to UI format
                const loadedMessages = [];
                res.data.data.forEach(chat => {
                    loadedMessages.push({
                        id: `user-${chat._id}`,
                        text: chat.userMessage,
                        sender: 'user',
                        timestamp: chat.createdAt
                    });
                    loadedMessages.push({
                        id: `ai-${chat._id}`,
                        text: chat.aiResponse,
                        sender: 'ai',
                        timestamp: chat.createdAt // approximate
                    });
                });
                setMessages(loadedMessages);
            }
            if (window.innerWidth < 1024) setIsSidebarOpen(false); // Close sidebar on mobile after selection
        } catch (error) {
            toast.error("Failed to load chat history");
        }
    };

    const startNewChat = () => {
        setCurrentSessionId(Date.now().toString());
        setMessages([]);
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
        textareaRef.current?.focus();
    };

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();

        if (!input.trim() || loading) return;

        const userText = input.trim();
        const userMessage = {
            id: Date.now(),
            text: userText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await api.post('/chat/message', {
                message: userText,
                sessionId: currentSessionId,
                inputMethod: 'text'
            });

            if (response.data.success) {
                const aiMessage = {
                    id: Date.now() + 1,
                    text: response.data.data.aiResponse || 'I apologize, I could not generate a response. Please try again.',
                    sender: 'ai',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMessage]);
                
                // If this was the first message in a new session, refresh the sidebar
                if (messages.length === 0) {
                    fetchSessions();
                }
            } else {
                toast.error(response.data.message || 'Failed to get response');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send message');
            setMessages(prev => prev.filter(m => m.id !== userMessage.id)); // Rollback optimistic update
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="chat-page-container">
            
            {/* Sidebar Overlay (Mobile) */}
            {isSidebarOpen && (
                <div 
                    className="chat-sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside 
                className={`chat-sidebar ${isSidebarOpen ? 'open' : ''}`}
            >
                <div className="chat-sidebar-header">
                    <button 
                        onClick={startNewChat}
                        className="chat-new-btn"
                    >
                        <PlusIcon className="new-chat-icon" />
                        New Chat
                    </button>
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="chat-sidebar-close"
                    >
                        <XMarkIcon className="sidebar-close-icon" />
                    </button>
                </div>
                
                <div className="chat-sessions-list custom-scrollbar">
                    <div className="chat-sidebar-section-title">Recent Sessions</div>
                    {sessions.length === 0 ? (
                        <p className="chat-no-sessions">No past sessions found.</p>
                    ) : (
                        sessions.map(session => (
                            <button
                                key={session._id}
                                onClick={() => loadSession(session._id)}
                                className={`chat-session-btn ${currentSessionId === session._id ? 'active' : 'inactive'}`}
                            >
                                <ChatBubbleBottomCenterTextIcon className={`chat-session-icon ${currentSessionId === session._id ? 'active' : 'inactive'}`} />
                                <div className="chat-session-details">
                                    <div className="chat-session-title">
                                        {session.firstMessage || 'New Conversation'}
                                    </div>
                                    <div className="chat-session-meta">
                                        {new Date(session.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {session.messageCount} msg
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="chat-main">
                {/* Header */}
                <div className="chat-header">
                    <div className="chat-header-left">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="chat-menu-btn"
                        >
                             <Bars3Icon className="menu-icon" />
                        </button>
                        <div>
                            <h1 className="chat-header-title">
                                Academic <span className="header-title-accent">Assistant</span>
                            </h1>
                            <p className="chat-header-subtitle">Anna University R2021 Guide</p>
                        </div>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="chat-messages-container custom-scrollbar">
                    <div className="chat-messages-wrapper">
                        {messages.length === 0 ? (
                            <div className="chat-empty-state">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="chat-welcome-wrapper"
                                >
                                    <div className="chat-welcome-icon">
                                        <SparklesIcon className="welcome-icon-sparkle" />
                                    </div>
                                    <h3 className="chat-welcome-title">Professional Academic Support</h3>
                                    <p className="chat-welcome-subtitle">
                                        Ask about your syllabus, complex engineering concepts, or exam preparation strategies.
                                    </p>
                                    <div className="chat-prompt-grid">
                                        <button
                                            onClick={() => { setInput("Explain the core principles of OOP in Java with real-world examples."); textareaRef.current?.focus(); }}
                                            className="chat-prompt-btn group"
                                        >
                                            <div className="chat-prompt-icon-wrap orange">
                                                <LightBulbIcon className="prompt-icon" />
                                            </div>
                                            <p className="chat-prompt-title">Complex Concepts</p>
                                            <p className="chat-prompt-desc">Detailed explanations with analogies.</p>
                                        </button>
                                        <button
                                            onClick={() => { setInput("Provide a unit-wise summary for GE3751 Principles of Management."); textareaRef.current?.focus(); }}
                                            className="chat-prompt-btn group"
                                        >
                                            <div className="chat-prompt-icon-wrap blue">
                                                <AcademicCapIcon className="prompt-icon" />
                                            </div>
                                            <p className="chat-prompt-title">Syllabus Guide</p>
                                            <p className="chat-prompt-desc">Official R2021 curriculum support.</p>
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        ) : (
                            <div className="chat-messages-list">
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`chat-message-row ${msg.sender === 'user' ? 'user' : 'ai'}`}
                                    >
                                        {msg.sender === 'ai' && (
                                            <div className="chat-avatar ai">
                                                <SparklesIcon className="avatar-icon" />
                                            </div>
                                        )}
                                        <div className={`chat-bubble ${msg.sender === 'user' ? 'user' : 'ai'}`}>
                                            <div className="chat-markdown">
                                                {msg.sender === 'ai' ? (
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {msg.text}
                                                    </ReactMarkdown>
                                                ) : (
                                                    <p className="chat-user-message-text">{msg.text}</p>
                                                )}
                                            </div>
                                            {msg.sender === 'ai' && (
                                                <div className="chat-bubble-time">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            )}
                                        </div>
                                        {msg.sender === 'user' && (
                                            <div className="chat-avatar user">
                                                <UserIcon className="avatar-icon" />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                                {loading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="chat-message-row ai"
                                    >
                                        <div className="chat-avatar ai-loading">
                                            <SparklesIcon className="avatar-icon" />
                                        </div>
                                        <div className="chat-loading-dots-container">
                                            <div className="loading-dots-wrapper">
                                                <div className="dot dot-1"></div>
                                                <div className="dot dot-2"></div>
                                                <div className="dot dot-3"></div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                <div className="chat-scroll-anchor" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Form at bottom */}
                <div className="chat-input-wrapper">
                    <div className="chat-input-container">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="chat-input-box-wrapper"
                        >
                            <div className="chat-input-box">
                                <textarea
                                    ref={textareaRef}
                                    rows="1"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={loading}
                                    className="chat-textarea custom-scrollbar"
                                    placeholder="Message Assistant..."
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={loading || !input.trim()}
                                    className={`chat-submit-btn ${loading || !input.trim() ? 'disabled' : 'active'}`}
                                >
                                    {loading ? (
                                        <div className="chat-submit-spinner"></div>
                                    ) : (
                                        <>
                                            <span className="chat-submit-text-lg">Send</span>
                                            <PaperAirplaneIcon className="chat-submit-icon" />
                                        </>
                                    )}
                                </button>
                            </div>
                            <p className="chat-input-disclaimer">
                                AI responses are grounded in official Anna University R2021 Syllabus.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}
