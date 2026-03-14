import { useState } from 'react';
import SyllabusUpload from '../components/SyllabusUpload';
import toast from 'react-hot-toast';

const AdminSyllabusPage = () => {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleUploadSuccess = (data) => {
        toast.success(`Syllabus data successfully integrated.`);
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tighter">
                        Curriculum <span className="text-primary italic">Auditor</span>
                    </h1>
                    <p className="text-slate-500 font-medium italic">Upload and manage standardized semester syllabus modules</p>
                </div>

                <div className="bg-white rounded-[3rem] p-1 shadow-sm border border-slate-100 overflow-hidden">
                    <SyllabusUpload key={refreshKey} onUploadSuccess={handleUploadSuccess} />
                </div>
            </div>
        </div>
    );
};

export default AdminSyllabusPage;
