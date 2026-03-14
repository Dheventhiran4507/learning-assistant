import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import {
    CloudArrowUpIcon,
    DocumentIcon,
    CheckCircleIcon,
    ListBulletIcon,
    AcademicCapIcon,
    ArchiveBoxIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const SyllabusUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [semester, setSemester] = useState('');
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [extractionResult, setExtractionResult] = useState(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === 'application/pdf') {
                setFile(droppedFile);
            } else {
                toast.error('Please upload a PDF file');
            }
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === 'application/pdf') {
                setFile(selectedFile);
            } else {
                toast.error('Please upload a PDF file');
            }
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a PDF file');
            return;
        }

        if (!semester) {
            toast.error('Please select a semester');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('semester', semester);

        try {
            const response = await axios.post('/api/syllabus-upload/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setExtractionResult(response.data.data);
                toast.success(`Successfully extracted ${response.data.data.subjectsCount} subjects!`);

                // Reset form
                setFile(null);
                setSemester('');

                // Notify parent component
                if (onUploadSuccess) {
                    onUploadSuccess(response.data.data);
                }
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload syllabus');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 md:p-12"
            >
                <div className="flex items-center gap-3 mb-4">
                    <CloudArrowUpIcon className="w-8 h-8 text-slate-900" />
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Syllabus Integration</h2>
                </div>
                <p className="text-slate-500 font-medium italic mb-10 pb-6 border-b border-slate-50">
                    Deploy standardized curriculum modules by uploading recognized PDF datasets.
                </p>

                {/* Semester Selection */}
                <div className="mb-8">
                    <label htmlFor="semester" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block px-2">Deployment Target</label>
                    <select
                        id="semester"
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        disabled={uploading}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-4 ring-primary/5 transition-all text-sm uppercase tracking-widest"
                    >
                        <option value="">Select Academic Semester</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                    </select>
                </div>

                {/* File Upload Area */}
                <div
                    className={`relative border-2 border-dashed rounded-[2.5rem] transition-all duration-300 group ${dragActive ? 'border-indigo-500 bg-indigo-50/50' :
                            file ? 'border-emerald-500 bg-emerald-50/10' :
                                'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        id="pdf-upload"
                        accept=".pdf"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="hidden"
                    />

                    {file ? (
                        <div className="flex flex-col items-center py-12 px-8 text-center">
                            <DocumentIcon className="w-16 h-16 text-emerald-500 mb-4" />
                            <p className="font-black text-slate-900 mb-1 truncate max-w-xs">{file.name}</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB PDF DATASET</p>
                            <button
                                onClick={() => setFile(null)}
                                className="mt-6 text-red-500 font-black text-[10px] uppercase tracking-widest border border-red-100 px-4 py-2 rounded-xl hover:bg-red-50 transition-all flex items-center gap-2"
                                disabled={uploading}
                            >
                                <XMarkIcon className="w-4 h-4" /> Discard
                            </button>
                        </div>
                    ) : (
                        <label htmlFor="pdf-upload" className="flex flex-col items-center py-16 px-8 text-center cursor-pointer">
                            <AcademicCapIcon className="w-16 h-16 text-slate-300 mb-4 group-hover:scale-110 transition-transform duration-500" />
                            <p className="font-bold text-slate-900 text-lg mb-1">
                                Click to upload module or drag dataset
                            </p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Supports PDF payloads up to 10MB</p>
                        </label>
                    )}
                </div>

                {/* Upload Button */}
                <button
                    onClick={handleUpload}
                    disabled={!file || !semester || uploading}
                    className="w-full mt-8 py-5 bg-slate-900 border border-slate-800 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                    {uploading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Integrating Data...</span>
                        </>
                    ) : (
                        <>
                            <CheckCircleIcon className="w-6 h-6" />
                            <span>Validate & Deploy</span>
                        </>
                    )}
                </button>

                {/* Extraction Results */}
                {extractionResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-12 bg-slate-50 rounded-[2rem] p-8 border border-slate-100"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <ListBulletIcon className="w-6 h-6 text-slate-900" />
                            <h3 className="text-xl font-bold uppercase tracking-tighter text-slate-900">Extraction Intel</h3>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-10">
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Subjects</span>
                                <span className="text-3xl font-black text-slate-900">{extractionResult.subjectsCount}</span>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Units</span>
                                <span className="text-3xl font-black text-slate-900">{extractionResult.totalUnits}</span>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Topics</span>
                                <span className="text-3xl font-black text-slate-900">{extractionResult.totalTopics}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-4">Integrated Subject Catalog:</h4>
                            {extractionResult.subjects.map((subject, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl group hover:border-indigo-200 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-50 flex items-center justify-center rounded-lg text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                            <ArchiveBoxIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{subject.code}</span>
                                            </div>
                                            <h5 className="font-bold text-slate-900 uppercase text-[11px] line-clamp-1">{subject.name}</h5>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            {subject.units} Units • {subject.topics} Topics
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default SyllabusUpload;
