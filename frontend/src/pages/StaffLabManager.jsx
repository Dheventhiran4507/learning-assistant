import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { 
    CloudArrowUpIcon, 
    DocumentTextIcon, 
    CheckCircleIcon, 
    ArrowPathIcon,
    TrashIcon,
    BeakerIcon,
    IdentificationIcon
} from '@heroicons/react/24/outline';

const StaffLabManager = () => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('pre-lab');
    const [subjectCode, setSubjectCode] = useState('');
    const [questionCount, setQuestionCount] = useState(5);
    const [isUploading, setIsUploading] = useState(false);
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();
    const subjectsHandled = user?.subjectsHandled || [];

    const fetchAssessments = async () => {
        try {
            const response = await api.get('/lab/staff-assessments');
            if (response.data.success) {
                setAssessments(response.data.data);
            }
        } catch (error) {
            console.error('Fetch Assessments Manager Error:', error);
            toast.error(`Fetch Error: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssessments();
        // Set first subject as default if available
        if (subjectsHandled.length > 0 && !subjectCode) {
            setSubjectCode(subjectsHandled[0].subjectCode);
        }
    }, [type]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            if (!title) setTitle(selectedFile.name.split('.')[0]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !subjectCode || !title) {
            return toast.error('Please fill all required fields and upload a document.');
        }

        setIsUploading(true);
        const toastId = toast.loading('Uploading document and generating AI questions...');

        const formData = new FormData();
        formData.append('document', file);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('type', type);
        formData.append('subjectCode', subjectCode.toUpperCase());
        formData.append('questionCount', questionCount);

        try {
            const response = await api.post('/lab/assign', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                toast.success(response.data.message, { id: toastId });
                setFile(null);
                setTitle('');
                setDescription('');
                setSubjectCode('');
                fetchAssessments();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed', { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this assessment?')) return;
        try {
            const response = await api.delete(`/lab/${id}`);
            if (response.data.success) {
                toast.success('Assessment deleted');
                fetchAssessments();
            }
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-gray-100">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <BeakerIcon className="w-10 h-10 text-primary" />
                        Lab <span className="text-primary italic">Manager</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">Assign AI-powered Pre-lab and Post-lab assessments from technical documents.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Upload Form */}
                <div className="lg:col-span-1">
                    <form onSubmit={handleUpload} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl space-y-6 sticky top-24">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tighter">Assign New Task</h2>
                            
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Lab Type</label>
                                <div className="flex bg-slate-50 p-1 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setType('pre-lab')}
                                        className={`flex-1 py-2 px-4 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${type === 'pre-lab' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
                                    >
                                        Pre-Lab
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType('post-lab')}
                                        className={`flex-1 py-2 px-4 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${type === 'post-lab' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
                                    >
                                        Post-Lab
                                    </button>
                                </div>
                            </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Subject Assigned</label>
                                    <select
                                        value={subjectCode}
                                        onChange={(e) => setSubjectCode(e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 ring-primary/20 uppercase"
                                    >
                                        <option value="" disabled>Select Subject</option>
                                        {subjectsHandled.map(sh => (
                                            <option key={sh.subjectCode} value={sh.subjectCode}>
                                                {sh.subjectCode} (Sem {sh.semester})
                                            </option>
                                        ))}
                                        {subjectsHandled.length === 0 && (
                                            <option value="" disabled>No subjects assigned</option>
                                        )}
                                    </select>
                                    {subjectsHandled.length === 0 && (
                                        <p className="text-[9px] text-red-400 mt-1 italic font-medium">Please contact Admin to assign subjects to you.</p>
                                    )}
                                </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Number of Questions (AI)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="15"
                                    value={questionCount}
                                    onChange={(e) => setQuestionCount(e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 ring-primary/20"
                                />
                                <p className="text-[9px] text-slate-400 mt-1 italic font-medium">Recommended: 5-10 questions</p>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Assessment Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter title..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 ring-primary/20"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Upload Lab Manual / Document</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        accept=".pdf,.txt"
                                    />
                                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center group-hover:border-primary/50 transition-colors bg-slate-50/50">
                                        {file ? (
                                            <>
                                                <CheckCircleIcon className="w-10 h-10 text-emerald-500 mb-2" />
                                                <p className="text-[10px] font-black uppercase text-emerald-600 truncate max-w-full italic px-2">{file.name}</p>
                                            </>
                                        ) : (
                                            <>
                                                <CloudArrowUpIcon className="w-10 h-10 text-slate-300 mb-2 group-hover:text-primary transition-colors" />
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Drop PDF or Click to Browse</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isUploading}
                            className={`w-full py-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs shadow-xl transition-all flex items-center justify-center gap-2 ${isUploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-black active:scale-95'}`}
                        >
                            {isUploading ? (
                                <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Generating Assessment...</>
                            ) : (
                                'Activate Learning'
                            )}
                        </button>
                    </form>
                </div>

                {/* Active List */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tighter">Active {type === 'pre-lab' ? 'Pre-Lab' : 'Post-Lab'} Tasks</h2>
                        <button onClick={fetchAssessments} className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400">
                            <ArrowPathIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : assessments.length === 0 ? (
                        <div className="text-center py-24 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
                            <DocumentTextIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No assessments assigned for this category yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {assessments.map((lab, idx) => (
                                <motion.div
                                    key={lab._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 flex items-center justify-center rounded-bl-3xl">
                                        <span className="text-xs font-black text-slate-300">#{idx + 1}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase italic">{lab.subjectCode}</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Sem {lab.semester}</span>
                                    </div>

                                    <h3 className="text-lg font-black text-slate-900 uppercase leading-none mb-2">{lab.title}</h3>
                                    <p className="text-xs text-slate-500 line-clamp-2 mb-6 font-medium leading-relaxed">{lab.description || 'No description provided.'}</p>

                                    <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-auto">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <IdentificationIcon className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-tighter">{lab.questions?.length || 0} Questions Generated</span>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(lab._id)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffLabManager;
