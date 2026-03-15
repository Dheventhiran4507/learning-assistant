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
    return (
        <div className="flex h-[calc(100dvh-120px)] sm:h-[calc(100vh-100px)] overflow-hidden bg-slate-50/50">
            
            {/* Sidebar Overlay (Mobile) */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside 
                className={`fixed lg:relative inset-y-0 left-0 w-80 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <button 
                        onClick={startNewChat}
                        className="flex-1 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95"
                    >
                        <PlusIcon className="w-5 h-5" />
                        New Chat
                    </button>
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden ml-4 p-2 text-slate-400 hover:bg-slate-100 rounded-lg"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Recent Sessions</div>
                    {sessions.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-8">No past sessions found.</p>
                    ) : (
                        sessions.map(session => (
                            <button
                                key={session._id}
                                onClick={() => loadSession(session._id)}
                                className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all ${currentSessionId === session._id ? 'bg-indigo-50 border border-indigo-100 text-indigo-900' : 'hover:bg-slate-50 border border-transparent text-slate-600'}`}
                            >
                                <ChatBubbleBottomCenterTextIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${currentSessionId === session._id ? 'text-indigo-500' : 'text-slate-400'}`} />
                                <div className="flex-1 overflow-hidden">
                                    <div className="text-sm font-semibold truncate leading-tight">
                                        {session.firstMessage || 'New Conversation'}
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-1 font-medium">
                                        {new Date(session.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {session.messageCount} msg
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col relative w-full lg:w-auto h-full overflow-hidden">
                {/* Header */}
                <div className="flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <Bars3Icon className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-lg sm:text-2xl font-black text-slate-900 leading-none">
                                Academic <span className="text-gradient">Assistant</span>
                            </h1>
                            <p className="text-slate-500 text-[10px] sm:text-sm font-medium mt-1 uppercase tracking-tighter sm:normal-case">Anna University R2021 Guide</p>
                        </div>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 custom-scrollbar scroll-smooth">
                    <div className="max-w-4xl mx-auto w-full">
                        {messages.length === 0 ? (
                            <div className="flex items-center justify-center h-[50vh] text-center">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="max-w-md"
                                >
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 flex items-center justify-center border border-indigo-500/10 shadow-sm">
                                        <SparklesIcon className="w-10 h-10 text-indigo-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Professional Academic Support</h3>
                                    <p className="text-slate-500 text-base mb-8 leading-relaxed">
                                        Ask about your syllabus, complex engineering concepts, or exam preparation strategies.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                                        <button
                                            onClick={() => { setInput("Explain the core principles of OOP in Java with real-world examples."); textareaRef.current?.focus(); }}
                                            className="p-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-200 rounded-2xl transition-all shadow-sm group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                <LightBulbIcon className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <p className="font-semibold text-slate-800 text-sm">Complex Concepts</p>
                                            <p className="text-xs text-slate-500 mt-1">Detailed explanations with analogies.</p>
                                        </button>
                                        <button
                                            onClick={() => { setInput("Provide a unit-wise summary for GE3751 Principles of Management."); textareaRef.current?.focus(); }}
                                            className="p-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-200 rounded-2xl transition-all shadow-sm group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                <AcademicCapIcon className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <p className="font-semibold text-slate-800 text-sm">Syllabus Guide</p>
                                            <p className="text-xs text-slate-500 mt-1">Official R2021 curriculum support.</p>
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        ) : (
                            <div className="space-y-10 pb-12">
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-3 sm:gap-6 ${msg.sender === 'user' ? 'justify-end' : 'justify-start w-full'}`}
                                    >
                                        {msg.sender === 'ai' && (
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                                                <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                            </div>
                                        )}
                                        <div
                                            className={`${msg.sender === 'user'
                                                ? 'max-w-[85%] sm:max-w-[70%] px-5 py-4 sm:px-6 sm:py-4 rounded-3xl bg-slate-800 text-white shadow-md rounded-tr-sm'
                                                : 'w-full max-w-[90%] sm:max-w-[85%] bg-transparent text-slate-800'
                                                }`}
                                        >
                                            <div className={`prose max-w-none ${msg.sender === 'user' ? 'text-white prose-headings:text-white prose-strong:text-white' : 'text-slate-800 prose-headings:text-slate-900 prose-headings:font-bold prose-strong:text-slate-900'} 
                                                prose-p:leading-relaxed prose-p:mb-4 prose-li:mb-1 prose-ul:my-3 prose-ul:list-disc prose-ul:ml-4 prose-ol:list-decimal prose-ol:ml-4 prose-ol:my-3 prose-headings:mt-6 prose-headings:mb-3 prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md prose-code:font-bold prose-pre:bg-slate-900 prose-pre:text-slate-100 text-[14px] sm:text-[15.5px] prose-a:text-indigo-600`}>
                                                {msg.sender === 'ai' ? (
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {msg.text}
                                                    </ReactMarkdown>
                                                ) : (
                                                    <p className="whitespace-pre-wrap leading-relaxed m-0">{msg.text}</p>
                                                )}
                                            </div>
                                            {msg.sender === 'ai' && (
                                                <div className="text-[11px] mt-4 uppercase tracking-widest font-semibold text-slate-400 flex items-center gap-2">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            )}
                                        </div>
                                        {msg.sender === 'user' && (
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 border border-slate-300 shadow-sm mt-1">
                                                <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                                {loading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex gap-4 sm:gap-6 justify-start w-full"
                                    >
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm mt-1 animate-pulse">
                                            <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                        </div>
                                        <div className="bg-transparent flex items-center gap-3 mt-3">
                                            <div className="flex gap-1.5">
                                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} className="h-4" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Form at bottom */}
                <div className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 p-4 sm:p-6 pb-6 lg:pb-8 z-10 w-full">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative"
                        >
                            <div className="bg-white border sm:border-2 border-slate-200 rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus-within:border-indigo-500 focus-within:shadow-[0_8px_30px_rgba(99,102,241,0.1)] transition-all flex flex-row items-end gap-2 group">
                                <textarea
                                    ref={textareaRef}
                                    rows="1"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={loading}
                                    className="flex-1 bg-transparent border-none px-4 sm:px-5 py-3 sm:py-4 text-slate-900 placeholder-slate-400 focus:ring-0 resize-none disabled:opacity-50 transition-all font-medium text-[14px] sm:text-[16px] leading-[1.6]"
                                    placeholder="Message Assistant..."
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={loading || !input.trim()}
                                    className={`h-11 w-11 sm:h-14 sm:w-auto sm:px-8 rounded-xl sm:rounded-2xl font-black uppercase tracking-wider flex items-center justify-center gap-3 transition-all flex-shrink-0 mb-1 mr-1 sm:mb-0 sm:mr-0 ${loading || !input.trim()
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 active:scale-95'
                                        }`}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <span className="hidden sm:inline">Send</span>
                                            <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                                        </>
                                    )}
                                </button>
                            </div>
                            <p className="mt-3 text-[11px] text-center text-slate-400 font-bold tracking-wide">
                                AI responses are grounded in official Anna University R2021 Syllabus.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}
