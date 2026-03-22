import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
    CpuChipIcon, 
    ClipboardDocumentCheckIcon, 
    ChevronRightIcon,
    AcademicCapIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const StudentPostLabPage = () => {
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLab, setSelectedLab] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    const fetchLabs = async () => {
        try {
            const response = await api.get('/lab/active?type=post-lab');
            if (response.data.success) {
                setLabs(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load post-labs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLabs();
    }, []);

    const startQuiz = (lab) => {
        setSelectedLab(lab);
        setCurrentQuestion(0);
        setAnswers(new Array(lab.questions.length).fill(null));
        setResult(null);
        setTimeLeft((lab.duration || 30) * 60);
    };

    useEffect(() => {
        let timer;
        if (selectedLab && !result && timeLeft !== null && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && !result && selectedLab) {
            submitQuiz();
        }
        return () => clearInterval(timer);
    }, [selectedLab, timeLeft, result]);

    const formatTime = (seconds) => {
        if (seconds === null) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelection = (option) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = option;
        setAnswers(newAnswers);
    };

    const submitQuiz = async () => {
        if (answers.includes(null)) {
            return toast.error('Please answer all questions before submitting.');
        }

        setIsSubmitting(true);
        try {
            const formattedAnswers = answers.map((ans, idx) => ({
                questionIndex: idx,
                selectedAnswer: ans,
                timeTaken: 0 
            }));

            const response = await api.post('/lab/submit', {
                assessmentId: selectedLab._id,
                answers: formattedAnswers
            });

            if (response.data.success) {
                setResult(response.data.data);
                toast.success('Assessment completed!');
                fetchLabs(); 
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Post-Labs...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <header className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <CpuChipIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Post-Lab <span className="text-primary italic">Assessments</span></h1>
                        <p className="text-slate-500 font-medium">Test your learning outcomes after the practical experiment.</p>
                    </div>
                </div>
            </header>

            {labs.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[2.5rem] py-24 text-center">
                    <AcademicCapIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest">No post-labs assigned for your semester yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {labs.map((lab) => (
                        <motion.div
                            key={lab._id}
                            whileHover={{ y: -5 }}
                            className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all relative overflow-hidden flex flex-col"
                        >
                            {lab.isCompleted && (
                                <div className="absolute top-4 right-4 bg-emerald-500 text-white p-1 rounded-full">
                                    <ClipboardDocumentCheckIcon className="w-4 h-4" />
                                </div>
                            )}

                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1 rounded-full uppercase italic">{lab.subjectCode}</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lab.questions.length} Questions</span>
                            </div>

                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2 leading-none">{lab.title}</h3>
                            <p className="text-sm text-slate-500 font-medium mb-8 line-clamp-2">{lab.description || 'Evaluate your understanding of the lab session and data results.'}</p>

                            <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                {lab.isCompleted ? (
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Score Obtained</span>
                                        <span className="text-2xl font-black text-emerald-600">{lab.submission.percentage.toFixed(0)}%</span>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => startQuiz(lab)}
                                        className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all"
                                    >
                                        Start Quiz <ChevronRightIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Quiz Modal */}
            <AnimatePresence>
                {selectedLab && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/90 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative"
                        >
                            {!result ? (
                                <div className="p-8 sm:p-12">
                                    {/* Progress Header */}
                                    <div className="flex items-center justify-between mb-12">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black italic">
                                                {currentQuestion + 1}
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question {currentQuestion + 1} of {selectedLab.questions.length}</p>
                                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-black text-[10px] uppercase shadow-sm ${timeLeft < 60 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-50 text-slate-600'}`}>
                                                        <ClockIcon className="w-3.5 h-3.5" />
                                                        {formatTime(timeLeft)}
                                                    </div>
                                                </div>
                                                <div className="w-48 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                                    <motion.div 
                                                        className={`h-full ${timeLeft < 60 ? 'bg-red-500' : 'bg-primary'}`}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${((currentQuestion + 1) / selectedLab.questions.length) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => setSelectedLab(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                                            <XMarkIcon className="w-6 h-6 text-slate-300" />
                                        </button>
                                    </div>

                                    {/* Question */}
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-8 leading-tight">
                                        {selectedLab.questions[currentQuestion].question}
                                    </h2>

                                    {/* Options */}
                                    <div className="space-y-3 mb-12">
                                        {selectedLab.questions[currentQuestion].options.map((option, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleAnswerSelection(option)}
                                                className={`w-full p-6 rounded-2xl text-left border-2 transition-all flex items-center justify-between group ${answers[currentQuestion] === option ? 'border-primary bg-primary/5' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}
                                            >
                                                <span className={`text-sm font-bold ${answers[currentQuestion] === option ? 'text-primary' : 'text-slate-600'}`}>
                                                    {option}
                                                </span>
                                                <div className={`w-6 h-6 rounded-full border-4 transition-all ${answers[currentQuestion] === option ? 'border-primary bg-white' : 'border-slate-200'}`} />
                                            </button>
                                        ))}
                                    </div>

                                    {/* Navigation */}
                                    <div className="flex items-center justify-between">
                                        <button
                                            disabled={currentQuestion === 0}
                                            onClick={() => setCurrentQuestion(prev => prev - 1)}
                                            className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-slate-900 disabled:opacity-0 transition-all"
                                        >
                                            Back
                                        </button>
                                        
                                        {currentQuestion === selectedLab.questions.length - 1 ? (
                                            <button
                                                disabled={isSubmitting}
                                                onClick={submitQuiz}
                                                className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                {isSubmitting ? 'Submitting...' : 'Finish Assessment'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setCurrentQuestion(prev => prev + 1)}
                                                className="bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:shadow-primary/20 transition-all active:scale-95"
                                            >
                                                Next Question
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
                                        <ClipboardDocumentCheckIcon className="w-12 h-12" />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">Great Work!</h2>
                                    <p className="text-slate-500 font-medium mb-8">You've successfully completed the post-lab assessment.</p>
                                    
                                    <div className="bg-slate-50 rounded-[2rem] p-8 mb-8 grid grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
                                            <p className="text-4xl font-black text-slate-900">{result.score}/{result.total}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Result</p>
                                            <p className="text-4xl font-black text-emerald-600">{result.percentage.toFixed(0)}%</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedLab(null)}
                                        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl"
                                    >
                                        Close Portal
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentPostLabPage;
