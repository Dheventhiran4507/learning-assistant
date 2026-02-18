import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId] = useState(Date.now().toString());
    const messagesEndRef = useRef(null);
    const { user } = useAuthStore();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!input.trim()) {
            toast.error('Please enter a message');
            return;
        }

        // Add user message to chat
        const userMessage = {
            id: Date.now(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await api.post('/chat/message', {
                message: input,
                sessionId,
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
            } else {
                toast.error(response.data.message || 'Failed to get response');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] max-w-5xl mx-auto p-4 sm:p-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h1 className="text-4xl font-black text-gray-900 mb-2">
                    AI <span className="text-gradient">Assistant</span>
                </h1>
                <p className="text-gray-600 text-lg">Your personal learning companion powered by Claude AI</p>
            </motion.div>

            {/* Chat Messages */}
            <div className="flex-1 glass-card rounded-[2rem] p-6 sm:p-8 overflow-y-auto mb-4 space-y-6 border border-gray-100 bg-white/50">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center text-5xl border border-white/50 float-animation shadow-lg">
                                🤖
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Start a Conversation</h3>
                            <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
                                Ask about your doubts in Tamil or English. I'm here to help!
                            </p>
                            <div className="flex flex-wrap gap-3 justify-center">
                                <button
                                    onClick={() => setInput("Explain Newton's laws of motion")}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                                >
                                    💡 Explain a concept
                                </button>
                                <button
                                    onClick={() => setInput("Help me with calculus")}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                                >
                                    📚 Study help
                                </button>
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.sender === 'ai' && (
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center text-xl border border-white/50 shadow-sm flex-shrink-0">
                                        🤖
                                    </div>
                                )}
                                <div
                                    className={`max-w-xs lg:max-w-2xl px-5 py-4 rounded-2xl ${msg.sender === 'user'
                                        ? 'bg-gradient-to-br from-primary-600 to-secondary-600 text-white shadow-lg shadow-primary-500/20'
                                        : 'bg-white border border-gray-100 text-gray-800 shadow-sm'
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                    <span className="text-xs opacity-60 mt-2 block">
                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                                {msg.sender === 'user' && (
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-xl flex-shrink-0">
                                        👤
                                    </div>
                                )}
                            </motion.div>
                        ))}
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-3 justify-start"
                            >
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center text-xl border border-white/50 shadow-sm flex-shrink-0">
                                    🤖
                                </div>
                                <div className="bg-white border border-gray-100 px-5 py-4 rounded-2xl shadow-sm">
                                    <div className="flex gap-2 items-center">
                                        <div className="w-2.5 h-2.5 bg-primary-500 rounded-full animate-bounce"></div>
                                        <div className="w-2.5 h-2.5 bg-secondary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                        <span className="text-sm text-gray-500 ml-2">AI is thinking...</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Form */}
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSendMessage}
                className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-4 flex gap-3 shadow-lg"
            >
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 transition-all font-medium"
                    placeholder="Type your question here..."
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="btn-premium px-8 py-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="spinner w-5 h-5"></div>
                            <span>Sending...</span>
                        </>
                    ) : (
                        <>
                            <span>Send</span>
                            <span>🚀</span>
                        </>
                    )}
                </button>
            </motion.form>
        </div>
    );
}
