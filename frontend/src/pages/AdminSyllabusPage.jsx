import { useState } from 'react';
import SyllabusUpload from '../components/SyllabusUpload';
import toast from 'react-hot-toast';

const AdminSyllabusPage = () => {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleUploadSuccess = (data) => {
        toast.success(`Successfully uploaded syllabus for Semester ${data.semester}`);
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Syllabus Management</h1>
                    <p className="text-gray-400">Upload and manage semester syllabus PDFs</p>
                </div>

                <SyllabusUpload key={refreshKey} onUploadSuccess={handleUploadSuccess} />
            </div>
        </div>
    );
};

export default AdminSyllabusPage;
