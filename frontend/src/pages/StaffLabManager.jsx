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
import './StaffLabManager.css'; // Import the new CSS

const StaffLabManager = () => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('pre-lab');
    const [subjectCode, setSubjectCode] = useState('');
    const [questionCount, setQuestionCount] = useState(5);
    const [duration, setDuration] = useState(30);
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
        formData.append('duration', duration);

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
        <div className="lab-manager-container">
            <header className="lab-manager-header">
                <div>
                    <h1 className="lab-manager-title">
                        <BeakerIcon className="lab-manager-title-icon" />
                        Lab <span>Manager</span>
                    </h1>
                    <p className="lab-manager-subtitle">Assign AI-powered Pre-lab and Post-lab assessments from technical documents.</p>
                </div>
            </header>

            <div className="lab-manager-grid">
                {/* Upload Form */}
                <div className="manager-form-column">
                    <form onSubmit={handleUpload} className="lab-manager-form">
                        <div className="form-inner-wrapper">
                            <h2 className="form-section-title">Assign New Task</h2>
                            
                            <div className="input-group">
                                <label className="input-label">Lab Type</label>
                                <div className="type-toggle-container">
                                    <button
                                        type="button"
                                        onClick={() => setType('pre-lab')}
                                        className={`type-toggle-btn ${type === 'pre-lab' ? 'active' : 'inactive'}`}
                                    >
                                        Pre-Lab
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType('post-lab')}
                                        className={`type-toggle-btn ${type === 'post-lab' ? 'active' : 'inactive'}`}
                                    >
                                        Post-Lab
                                    </button>
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Subject Assigned</label>
                                <select
                                    value={subjectCode}
                                    onChange={(e) => setSubjectCode(e.target.value)}
                                    className="manager-select"
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
                                    <p className="error-hint">Please contact Admin to assign subjects to you.</p>
                                )}
                            </div>

                            <div className="input-group">
                                <label className="input-label">Assessment Config (Qty & Duration)</label>
                                <div className="config-grid">
                                    <div className="relative-input-container">
                                        <input
                                            type="number"
                                            min="1"
                                            max="15"
                                            value={questionCount}
                                            onChange={(e) => setQuestionCount(e.target.value)}
                                            className="manager-input"
                                        />
                                        <span className="input-suffix">Qty</span>
                                    </div>
                                    <div className="relative-input-container">
                                        <input
                                            type="number"
                                            min="5"
                                            max="180"
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            className="manager-input"
                                        />
                                        <span className="input-suffix input-suffix-underline">Min</span>
                                    </div>
                                </div>
                                <div className="config-hints">
                                    <p className="hint-text">Qty: 1-15</p>
                                    <p className="hint-text">Duration: 5-180m</p>
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Assessment Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter title..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="manager-input"
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Upload Lab Manual / Document</label>
                                <div className="file-upload-zone">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="hidden-file-input"
                                        accept=".pdf,.txt"
                                    />
                                    <div className="upload-display">
                                        {file ? (
                                            <>
                                                <CheckCircleIcon className="upload-icon success" />
                                                <p className="upload-status-text success">{file.name}</p>
                                            </>
                                        ) : (
                                            <>
                                                <CloudArrowUpIcon className="upload-icon pending" />
                                                <p className="upload-status-text pending">Drop PDF or Click to Browse</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isUploading}
                            className={`activate-btn ${isUploading ? 'loading' : 'ready'} activate-btn-spaced`}
                        >
                            {isUploading ? (
                                <><ArrowPathIcon className="animate-spin duration-icon-small" /> Generating Assessment...</>
                            ) : (
                                'Activate Learning'
                            )}
                        </button>
                    </form>
                </div>

                {/* Active List */}
                <div className="manager-list-column">
                    <div className="list-header">
                        <h2 className="form-section-title">Active {type === 'pre-lab' ? 'Pre-Lab' : 'Post-Lab'} Tasks</h2>
                        <button onClick={fetchAssessments} className="refresh-btn">
                            <ArrowPathIcon className="refresh-icon" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading-spinner-container">
                            <div className="loading-spinner"></div>
                        </div>
                    ) : assessments.length === 0 ? (
                        <div className="no-tasks-card">
                            <DocumentTextIcon className="no-tasks-icon" />
                            <p className="no-tasks-text">No assessments assigned for this category yet.</p>
                        </div>
                    ) : (
                        <div className="task-cards-grid">
                            {assessments.map((lab, idx) => (
                                <motion.div
                                    key={lab._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="task-card"
                                >
                                    <div className="task-card-index">
                                        <span>#{idx + 1}</span>
                                    </div>
                                    
                                    <div className="task-card-meta">
                                        <span className="task-subject-tag">{lab.subjectCode}</span>
                                        <span className="task-sem-tag">Sem {lab.semester}</span>
                                    </div>

                                    <h3 className="task-card-title">{lab.title}</h3>
                                    <p className="task-card-desc">{lab.description || 'No description provided.'}</p>

                                    <div className="task-card-footer">
                                        <div className="task-qty-info">
                                            <IdentificationIcon className="task-qty-icon" />
                                            <span className="task-qty-text">{lab.questions?.length || 0} Questions Generated</span>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(lab._id)}
                                            className="delete-task-btn"
                                        >
                                            <TrashIcon className="delete-task-icon" />
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
