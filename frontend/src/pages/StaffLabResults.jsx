import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
    PresentationChartLineIcon, 
    UserGroupIcon, 
    ArrowPathIcon,
    ChevronDownIcon,
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
            `${sub.score}/${sub.maxScore}`,
            `${sub.percentage.toFixed(1)}%`,
            'Completed'
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
            'Score': sub.score,
            'Max Score': sub.maxScore,
            'Percentage (%)': sub.percentage.toFixed(1),
            'Status': 'Completed',
            'Completed At': new Date(sub.completedAt).toLocaleString()
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
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-gray-100">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <PresentationChartLineIcon className="w-10 h-10 text-primary" />
                        Lab <span className="text-primary italic">Analytics</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">Track student performance and evaluate lab learning outcomes.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Lab List Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Active Assessments</h2>
                    <div className="space-y-2">
                        {assessments.map(lab => (
                            <button
                                key={lab._id}
                                onClick={() => fetchResults(lab._id)}
                                className={`w-full text-left p-5 rounded-3xl transition-all border ${selectedAssessment === lab._id ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 hover:border-slate-200 text-slate-600'}`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase italic ${selectedAssessment === lab._id ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>{lab.type}</span>
                                    <span className={`text-[8px] font-black uppercase ${selectedAssessment === lab._id ? 'text-slate-400' : 'text-slate-300'}`}>{lab.subjectCode}</span>
                                </div>
                                <p className="text-sm font-black uppercase tracking-tight line-clamp-1">{lab.title}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-3">
                    {!results ? (
                        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[3rem] py-24 text-center">
                            <DocumentMagnifyingGlassIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Select an assessment to view performance data.</p>
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* Summary Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Submissions</p>
                                    <p className="text-4xl font-black text-slate-900">{results.submissions.length}</p>
                                </div>
                                <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Average Score</p>
                                    <p className="text-4xl font-black text-primary">
                                        {results.submissions.length > 0 
                                            ? (results.submissions.reduce((acc, s) => acc + s.percentage, 0) / results.submissions.length).toFixed(1) 
                                            : 0}%
                                    </p>
                                </div>
                                <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Top Score</p>
                                    <p className="text-4xl font-black text-emerald-600">
                                        {results.submissions.length > 0 ? Math.max(...results.submissions.map(s => s.percentage)).toFixed(0) : 0}%
                                    </p>
                                </div>
                            </div>

                            {/* Student Table */}
                            <div className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-sm">
                                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                                        <UserGroupIcon className="w-6 h-6 text-primary" />
                                        Student Performances
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={exportToExcel}
                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-100 transition-all border border-emerald-100"
                                        >
                                            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                                            Excel
                                        </button>
                                        <button 
                                            onClick={exportToPDF}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-xl text-[10px] font-black uppercase hover:bg-primary/10 transition-all border border-primary/10"
                                        >
                                            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                                            PDF
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/30">
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Score</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Percentage</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {results.submissions.map(sub => (
                                                <motion.tr key={sub._id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{sub.student?.name}</span>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[8px] font-bold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">ID: {sub.student?.studentId}</span>
                                                                <span className="text-[8px] font-bold text-primary-600 uppercase bg-primary/5 px-1.5 py-0.5 rounded">Batch: {sub.student?.batch}</span>
                                                            </div>
                                                            {sub.student?.rollNumber && (
                                                                <span className="text-[8px] font-bold text-slate-400 uppercase mt-1">Roll: {sub.student.rollNumber}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center font-bold text-slate-600">
                                                        {sub.score} / {sub.maxScore}
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <span className={`text-sm font-black ${sub.percentage >= 70 ? 'text-emerald-600' : 'text-primary'}`}>
                                                            {sub.percentage.toFixed(0)}%
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full uppercase italic">Completed</span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button 
                                                            onClick={() => setViewingStudent(sub)}
                                                            className="text-[10px] font-black uppercase text-primary hover:text-slate-900 transition-colors px-4 py-2 bg-primary/5 rounded-xl group-hover:bg-primary/10"
                                                        >
                                                            View Answers
                                                        </button>
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
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/90 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-3xl h-[80vh] rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col"
                        >
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white z-10">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Student Response Analysis</h3>
                                    <p className="text-[10px] font-black text-primary uppercase italic">{viewingStudent.student?.name} ({viewingStudent.percentage.toFixed(0)}%)</p>
                                </div>
                                <button onClick={() => setViewingStudent(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                                    <XMarkIcon className="w-6 h-6 text-slate-300" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                {results.assessment.questions.map((q, idx) => {
                                    const studentAns = viewingStudent.answers.find(a => a.questionIndex === idx);
                                    return (
                                        <div key={idx} className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100">
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <h4 className="text-base font-black text-slate-900 leading-tight">
                                                    <span className="text-primary mr-2 italic">Q{idx + 1}.</span>
                                                    {q.question}
                                                </h4>
                                                {studentAns?.isCorrect ? (
                                                    <CheckCircleIcon className="w-6 h-6 text-emerald-500 shrink-0" />
                                                ) : (
                                                    <XCircleIcon className="w-6 h-6 text-primary shrink-0" />
                                                )}
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Student's Answer</p>
                                                    <p className={`text-sm font-bold ${studentAns?.isCorrect ? 'text-emerald-700' : 'text-primary'}`}>
                                                        {studentAns?.selectedAnswer || 'Not answered'}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Correct Answer</p>
                                                    <p className="text-sm font-bold text-slate-800">{q.correctAnswer}</p>
                                                </div>
                                            </div>

                                            {!studentAns?.isCorrect && (
                                                <div className="mt-6 pt-6 border-t border-slate-100">
                                                    <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-1">
                                                        <LightBulbIcon className="w-3 h-3" />
                                                        Explanation
                                                    </p>
                                                    <p className="text-xs text-slate-500 font-medium italic">{q.explanation || 'Refer to lab manual for more details.'}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="p-8 border-t border-slate-50 bg-slate-50/50">
                                <button 
                                    onClick={() => setViewingStudent(null)}
                                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-black transition-all"
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
