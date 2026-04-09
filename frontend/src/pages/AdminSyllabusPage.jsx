import { useState } from 'react';
import SyllabusUpload from '../components/SyllabusUpload';
import toast from 'react-hot-toast';
import './AdminSyllabusPage.css'; // Import the new CSS

const AdminSyllabusPage = () => {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleUploadSuccess = (data) => {
        toast.success(`Syllabus data successfully integrated.`);
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="admin-syllabus-page">
            <div className="admin-syllabus-wrapper">
                <div className="admin-syllabus-header">
                    <h1 className="admin-syllabus-title">
                        Curriculum <span>Auditor</span>
                    </h1>
                    <p className="admin-syllabus-subtitle">Upload and manage standardized semester syllabus modules</p>
                </div>

                <div className="upload-container-outer">
                    <SyllabusUpload key={refreshKey} onUploadSuccess={handleUploadSuccess} />
                </div>
            </div>
        </div>
    );
};

export default AdminSyllabusPage;
