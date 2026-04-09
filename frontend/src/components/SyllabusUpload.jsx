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
import './SyllabusUpload.css'; // Import the new CSS

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
        <div className="upload-widget-container">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="upload-widget-card"
            >
                <div className="upload-widget-header">
                    <CloudArrowUpIcon className="upload-widget-icon" />
                    <h2 className="upload-widget-title">Syllabus Integration</h2>
                </div>
                <p className="upload-widget-desc">
                    Deploy standardized curriculum modules by uploading recognized PDF datasets.
                </p>

                {/* Semester Selection */}
                <div className="form-field">
                    <label htmlFor="semester" className="field-label">Deployment Target</label>
                    <select
                        id="semester"
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        disabled={uploading}
                        className="semester-select"
                    >
                        <option value="">Select Academic Semester</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                    </select>
                </div>

                {/* File Upload Area */}
                <div
                    className={`drop-zone ${dragActive ? 'active' : file ? 'has-file' : 'empty'}`}
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
                        style={{ display: 'none' }}
                    />

                    {file ? (
                        <div className="file-display">
                            <DocumentIcon className="file-icon" />
                            <p className="file-name">{file.name}</p>
                            <p className="file-meta">{(file.size / 1024 / 1024).toFixed(2)} MB PDF DATASET</p>
                            <button
                                onClick={() => setFile(null)}
                                className="discard-btn"
                                disabled={uploading}
                            >
                                <XMarkIcon className="discard-icon" /> Discard
                            </button>
                        </div>
                    ) : (
                        <label htmlFor="pdf-upload" className="drop-zone-content">
                            <AcademicCapIcon className="drop-zone-icon" />
                            <p className="drop-zone-prompt">
                                Click to upload module or drag dataset
                            </p>
                            <p className="drop-zone-subprompt">Supports PDF payloads up to 10MB</p>
                        </label>
                    )}
                </div>

                {/* Upload Button */}
                <button
                    onClick={handleUpload}
                    disabled={!file || !semester || uploading}
                    className="deploy-btn"
                >
                    {uploading ? (
                        <>
                            <div className="spinner"></div>
                            <span>Integrating Data...</span>
                        </>
                    ) : (
                        <>
                            <CheckCircleIcon className="deploy-icon" />
                            <span>Validate & Deploy</span>
                        </>
                    )}
                </button>

                {/* Extraction Results */}
                {extractionResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="intel-section"
                    >
                        <div className="intel-header">
                            <ListBulletIcon className="intel-icon" />
                            <h3 className="intel-title">Extraction Intel</h3>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-box">
                                <span className="stat-box-label">Subjects</span>
                                <span className="stat-box-value">{extractionResult.subjectsCount}</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-box-label">Units</span>
                                <span className="stat-box-value">{extractionResult.totalUnits}</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-box-label">Topics</span>
                                <span className="stat-box-value">{extractionResult.totalTopics}</span>
                            </div>
                        </div>

                        <div className="catalog-section">
                            <h4 className="catalog-heading">Integrated Subject Catalog:</h4>
                            {extractionResult.subjects.map((subject, index) => (
                                <div key={index} className="catalog-item">
                                    <div className="subject-info">
                                        <div className="item-icon-box">
                                            <ArchiveBoxIcon className="item-icon" />
                                        </div>
                                        <div className="subject-details">
                                            <div className="subject-code-intel">
                                                <span>{subject.code}</span>
                                            </div>
                                            <h5 className="subject-name-intel">{subject.name}</h5>
                                        </div>
                                    </div>
                                    <div className="subject-counts">
                                        <p>
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
