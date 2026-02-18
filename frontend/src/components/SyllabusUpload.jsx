import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

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
        <div className="syllabus-upload-container">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="upload-card"
            >
                <h2>Upload Syllabus PDF</h2>
                <p className="upload-description">
                    Upload a PDF containing the complete syllabus. The system will automatically extract all subjects, units, and topics.
                </p>

                {/* Semester Selection */}
                <div className="form-group">
                    <label htmlFor="semester">Semester</label>
                    <select
                        id="semester"
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        disabled={uploading}
                    >
                        <option value="">Select Semester</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                    </select>
                </div>

                {/* File Upload Area */}
                <div
                    className={`drop-zone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
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
                        <div className="file-info">
                            <svg className="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <p className="file-name">{file.name}</p>
                            <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            <button
                                onClick={() => setFile(null)}
                                className="remove-file-btn"
                                disabled={uploading}
                            >
                                Remove
                            </button>
                        </div>
                    ) : (
                        <label htmlFor="pdf-upload" className="upload-label">
                            <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="upload-text">
                                <span className="upload-link">Click to upload</span> or drag and drop
                            </p>
                            <p className="upload-hint">PDF files only (max 10MB)</p>
                        </label>
                    )}
                </div>

                {/* Upload Button */}
                <button
                    onClick={handleUpload}
                    disabled={!file || !semester || uploading}
                    className="upload-btn"
                >
                    {uploading ? (
                        <>
                            <span className="spinner"></span>
                            Processing...
                        </>
                    ) : (
                        'Upload & Extract Syllabus'
                    )}
                </button>

                {/* Extraction Results */}
                {extractionResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="extraction-results"
                    >
                        <h3>Extraction Summary</h3>
                        <div className="results-grid">
                            <div className="result-item">
                                <span className="result-label">Subjects</span>
                                <span className="result-value">{extractionResult.subjectsCount}</span>
                            </div>
                            <div className="result-item">
                                <span className="result-label">Units</span>
                                <span className="result-value">{extractionResult.totalUnits}</span>
                            </div>
                            <div className="result-item">
                                <span className="result-label">Topics</span>
                                <span className="result-value">{extractionResult.totalTopics}</span>
                            </div>
                        </div>

                        <div className="subjects-list">
                            <h4>Extracted Subjects:</h4>
                            {extractionResult.subjects.map((subject, index) => (
                                <div key={index} className="subject-item">
                                    <span className="subject-code">{subject.code}</span>
                                    <span className="subject-name">{subject.name}</span>
                                    <span className="subject-stats">
                                        {subject.units} units • {subject.topics} topics
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>

            <style jsx>{`
                .syllabus-upload-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 2rem;
                }

                .upload-card {
                    background: white;
                    border-radius: 12px;
                    padding: 2rem;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .upload-card h2 {
                    margin: 0 0 0.5rem 0;
                    color: #1a1a1a;
                    font-size: 1.75rem;
                }

                .upload-description {
                    color: #666;
                    margin-bottom: 2rem;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                    color: #333;
                }

                .form-group select {
                    width: 100%;
                    padding: 0.75rem;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: border-color 0.2s;
                }

                .form-group select:focus {
                    outline: none;
                    border-color: #4f46e5;
                }

                .drop-zone {
                    border: 2px dashed #d0d0d0;
                    border-radius: 12px;
                    padding: 3rem 2rem;
                    text-align: center;
                    transition: all 0.3s;
                    margin-bottom: 1.5rem;
                }

                .drop-zone.active {
                    border-color: #4f46e5;
                    background: #f0f0ff;
                }

                .drop-zone.has-file {
                    border-color: #10b981;
                    background: #f0fdf4;
                }

                .upload-label {
                    cursor: pointer;
                    display: block;
                }

                .upload-icon, .file-icon {
                    width: 48px;
                    height: 48px;
                    margin: 0 auto 1rem;
                    color: #9ca3af;
                }

                .file-icon {
                    color: #10b981;
                }

                .upload-text {
                    margin: 0.5rem 0;
                    color: #4b5563;
                }

                .upload-link {
                    color: #4f46e5;
                    font-weight: 500;
                }

                .upload-hint {
                    margin: 0;
                    font-size: 0.875rem;
                    color: #9ca3af;
                }

                .file-info {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                }

                .file-name {
                    font-weight: 500;
                    color: #1a1a1a;
                    margin: 0;
                }

                .file-size {
                    color: #666;
                    font-size: 0.875rem;
                    margin: 0;
                }

                .remove-file-btn {
                    margin-top: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: #ef4444;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.875rem;
                }

                .remove-file-btn:hover {
                    background: #dc2626;
                }

                .upload-btn {
                    width: 100%;
                    padding: 1rem;
                    background: #4f46e5;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .upload-btn:hover:not(:disabled) {
                    background: #4338ca;
                }

                .upload-btn:disabled {
                    background: #9ca3af;
                    cursor: not-allowed;
                }

                .spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid #ffffff;
                    border-top-color: transparent;
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .extraction-results {
                    margin-top: 2rem;
                    padding: 1.5rem;
                    background: #f9fafb;
                    border-radius: 8px;
                }

                .extraction-results h3 {
                    margin: 0 0 1rem 0;
                    color: #1a1a1a;
                }

                .results-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .result-item {
                    background: white;
                    padding: 1rem;
                    border-radius: 8px;
                    text-align: center;
                }

                .result-label {
                    display: block;
                    font-size: 0.875rem;
                    color: #666;
                    margin-bottom: 0.25rem;
                }

                .result-value {
                    display: block;
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #4f46e5;
                }

                .subjects-list h4 {
                    margin: 0 0 1rem 0;
                    color: #333;
                }

                .subject-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem;
                    background: white;
                    border-radius: 6px;
                    margin-bottom: 0.5rem;
                }

                .subject-code {
                    font-weight: 600;
                    color: #4f46e5;
                    min-width: 80px;
                }

                .subject-name {
                    flex: 1;
                    color: #333;
                }

                .subject-stats {
                    font-size: 0.875rem;
                    color: #666;
                }
            `}</style>
        </div>
    );
};

export default SyllabusUpload;
