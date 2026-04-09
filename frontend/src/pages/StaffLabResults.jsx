import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
    PresentationChartLineIcon, 
    UserGroupIcon, 
    ArrowPathIcon,
    XMarkIcon,
    CheckCircleIcon,
    XCircleIcon,
    DocumentMagnifyingGlassIcon,
    ArrowDownTrayIcon,
    LightBulbIcon
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import './StaffLabResults.css'; // Import the new CSS

const StaffLabResults = () => {
    const [assessments, setAssessments] = useState([]);
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingResults, setLoadingResults] = useState(false);
    const [viewingStudent, setViewingStudent] = useState(null);

    const fetchAssessments = async () => {
        try {
            const response = await api.get('/lab/staff-assessments');
            if (response.data.success) {
                setAssessments(response.data.data);
            }
        } catch (error) {
            console.error('Fetch Assessments Error Details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            toast.error(`Failed to fetch: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchResults = async (id) => {
        setLoadingResults(true);
        try {
            const response = await api.get(`/lab/results/${id}`);
            if (response.data.success) {
                setResults(response.data.data);
                setSelectedAssessment(id);
            }
        } catch (error) {
            toast.error('Failed to load results');
        } finally {
            setLoadingResults(false);
        }
    };

    const exportToPDF = () => {
        if (!results) return;
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.text('Lab Assessment Results', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Title: ${results.assessment.title}`, 14, 30);
        doc.text(`Subject: ${results.assessment.subjectCode}`, 14, 35);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 40);

        // Summary Metrics
        const avgScore = (results.submissions.reduce((acc, s) => acc + s.percentage, 0) / results.submissions.length).toFixed(1);
        doc.text(`Total Submissions: ${results.submissions.length}`, 14, 50);
        doc.text(`Average Score: ${avgScore}%`, 14, 55);

        // Table
        const tableColumn = ["Student Name", "Student ID", "Score", "Percentage", "Status"];
        const tableRows = results.submissions.map(sub => [
            sub.student?.name || 'N/A',
            sub.student?.studentId || 'N/A',
            sub.status === 'absent' ? '0/0' : `${sub.score}/${sub.maxScore}`,
            sub.status === 'absent' ? '0.0%' : `${sub.percentage.toFixed(1)}%`,
            sub.status === 'absent' ? 'Absent' : 'Completed'
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 65,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42] } // Dark blue header
        });

        doc.save(`Lab_Results_${results.assessment.subjectCode}_${results.assessment.title}.pdf`);
    };

    const exportToExcel = () => {
        if (!results) return;
        
        const worksheetData = results.submissions.map(sub => ({
            'Student Name': sub.student?.name || 'N/A',
            'Student ID': sub.student?.studentId || 'N/A',
            'Score': sub.status === 'absent' ? 0 : sub.score,
            'Max Score': sub.maxScore,
            'Percentage (%)': sub.status === 'absent' ? 0 : sub.percentage.toFixed(1),
            'Status': sub.status === 'absent' ? 'Absent' : 'Completed',
            'Date': sub.completedAt ? new Date(sub.completedAt).toLocaleString() : 'N/A'
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

        XLSX.writeFile(workbook, `Lab_Results_${results.assessment.subjectCode}_${results.assessment.title}.xlsx`);
    };

    useEffect(() => {
        fetchAssessments();
    }, []);

    if (loading) {
        return (
            <div className="loading-view">
                <div className="loading-spinner"></div>
                <p className="sidebar-heading dashboard-loading-text">Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="results-page-container">
            <header className="results-header">
                <div>
                    <h1 className="results-title">
                        <PresentationChartLineIcon className="results-title-icon" />
                        Lab <span>Analytics</span>
                    </h1>
                    <p className="results-subtitle">Track student performance and evaluate lab learning outcomes.</p>
                </div>
            </header>

            <div className="results-main-grid">
                {/* Lab List Sidebar */}
                <div className="results-sidebar">
                    <h2 className="sidebar-heading">Active Assessments</h2>
                    <div className="results-list-wrap">
                        {assessments.map(lab => (
                            <button
                                key={lab._id}
                                onClick={() => fetchResults(lab._id)}
                                className={`assessment-btn ${selectedAssessment === lab._id ? 'active' : 'inactive'}`}
                            >
                                <div className="assessment-btn-meta">
                                    <span className="assessment-type-tag">{lab.type}</span>
                                    <span className="assessment-code">{lab.subjectCode}</span>
                                </div>
                                <p className="assessment-btn-title">{lab.title}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results Section */}
                <div className="results-content-area">
                    {loadingResults ? (
                        <div className="loading-view">
                            <div className="loading-spinner"></div>
                        </div>
                    ) : !results ? (
                        <div className="empty-results-card">
                            <DocumentMagnifyingGlassIcon className="empty-results-icon" />
                            <p className="empty-results-text">Select an assessment to view performance data.</p>
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="results-content-inner"
                        >
                            {/* Summary Metrics */}
                            <div className="results-stats-grid">
                                <div className="stat-card">
                                    <p className="stat-label">Total Students</p>
                                    <p className="stat-value">{results.stats?.totalStudents || 0}</p>
                                </div>
                                <div className="stat-card">
                                    <p className="stat-label">Appeared</p>
                                    <p className="stat-value primary">{results.stats?.appeared || 0}</p>
                                </div>
                                <div className="stat-card">
                                    <p className="stat-label">Absent</p>
                                    <p className="stat-value danger">{results.stats?.absent || 0}</p>
                                </div>
                                <div className="stat-card">
                                    <p className="stat-label">Average Score</p>
                                    <p className="stat-value success">
                                        {results.stats?.appeared > 0 
                                            ? (results.submissions.filter(s => s.status !== 'absent').reduce((acc, s) => acc + s.percentage, 0) / results.stats.appeared).toFixed(1) 
                                            : 0}%
                                    </p>
                                </div>
                            </div>

                            {/* Student Table */}
                            <div className="students-table-card">
                                <div className="table-header">
                                    <h3 className="table-title">
                                        <UserGroupIcon className="table-title-icon" />
                                        Student Performances
                                    </h3>
                                    <div className="table-actions">
                                        <button 
                                            onClick={exportToExcel}
                                            className="export-btn excel"
                                        >
                                            <ArrowDownTrayIcon className="export-icon" />
                                            Excel
                                        </button>
                                        <button 
                                            onClick={exportToPDF}
                                            className="export-btn pdf"
                                        >
                                            <ArrowDownTrayIcon className="export-icon" />
                                            PDF
                                        </button>
                                    </div>
                                </div>
                                <div className="table-scrollable">
                                    <table className="results-table">
                                        <thead>
                                            <tr className="table-head-row">
                                                <th className="table-th">Student</th>
                                                <th className="table-th text-center">Score</th>
                                                <th className="table-th text-center">Percentage</th>
                                                <th className="table-th text-center">Status</th>
                                                <th className="table-th text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="table-body">
                                            {results.submissions.map(sub => (
                                                <motion.tr key={sub._id} className={`table-tr ${sub.status === 'absent' ? 'absent' : ''}`}>
                                                    <td className="table-td">
                                                        <div className="student-info">
                                                            <span className="student-name">{sub.student?.name}</span>
                                                            <div className="student-sub-info">
                                                                <span className="id-badge">ID: {sub.student?.studentId}</span>
                                                                <span className="batch-badge">Batch: {sub.student?.batch}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="table-td td-score">
                                                        {sub.status === 'absent' ? '-' : `${sub.score} / ${sub.maxScore}`}
                                                    </td>
                                                    <td className="table-td td-percent">
                                                        <span className={sub.status === 'absent' ? 'percent-none' : (sub.percentage >= 70 ? 'percent-good' : 'percent-standard')}>
                                                            {sub.status === 'absent' ? '0%' : `${sub.percentage.toFixed(0)}%`}
                                                        </span>
                                                    </td>
                                                    <td className="table-td text-center">
                                                        {sub.status === 'absent' ? (
                                                            <span className="status-badge absent">Absent</span>
                                                        ) : (
                                                            <span className="status-badge completed">Completed</span>
                                                        )}
                                                    </td>
                                                    <td className="table-td actions-cell">
                                                        {sub.status !== 'absent' && (
                                                            <button 
                                                                onClick={() => setViewingStudent(sub)}
                                                                className="view-btn"
                                                            >
                                                                View Answers
                                                            </button>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Answer Modal */}
            <AnimatePresence>
                {viewingStudent && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="modal-content"
                        >
                            <div className="modal-header">
                                <div>
                                    <h3 className="modal-title">Student Response Analysis</h3>
                                    <p className="modal-subtitle">{viewingStudent.student?.name} ({viewingStudent.percentage.toFixed(0)}%)</p>
                                </div>
                                <button onClick={() => setViewingStudent(null)} className="modal-close-btn">
                                    <XMarkIcon className="modal-close-icon" />
                                </button>
                            </div>

                            <div className="modal-body custom-scrollbar">
                                {results.assessment.questions.map((q, idx) => {
                                    const studentAns = viewingStudent.answers.find(a => a.questionIndex === idx);
                                    return (
                                        <div key={idx} className="question-review-card">
                                            <div className="q-review-header">
                                                <h4 className="q-review-text">
                                                    <span>Q{idx + 1}.</span>
                                                    {q.question}
                                                </h4>
                                                {studentAns?.isCorrect ? (
                                                    <CheckCircleIcon className="q-result-icon correct" />
                                                ) : (
                                                    <XCircleIcon className="q-result-icon incorrect" />
                                                )}
                                            </div>
                                            
                                            <div className="answers-grid">
                                                <div className="ans-display">
                                                    <p className="ans-label">Student's Answer</p>
                                                    <p className={`ans-value ${studentAns?.isCorrect ? 'student-correct' : 'student-incorrect'}`}>
                                                        {studentAns?.selectedAnswer || 'Not answered'}
                                                    </p>
                                                </div>
                                                <div className="ans-display">
                                                    <p className="ans-label">Correct Answer</p>
                                                    <p className="ans-value correct-real">{q.correctAnswer}</p>
                                                </div>
                                            </div>

                                            {!studentAns?.isCorrect && (
                                                <div className="explanation-section">
                                                    <p className="explanation-heading">
                                                        <LightBulbIcon className="explanation-icon" />
                                                        Explanation
                                                    </p>
                                                    <p className="explanation-text">{q.explanation || 'Refer to lab manual for more details.'}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="modal-footer">
                                <button 
                                    onClick={() => setViewingStudent(null)}
                                    className="modal-done-btn"
                                >
                                    Done Reviewing
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StaffLabResults;
