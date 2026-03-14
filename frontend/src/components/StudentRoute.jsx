import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const StudentRoute = ({ children }) => {
    const { user, isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (user?.role === 'admin' || user?.role === 'hod' || user?.role === 'advisor') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return children;
};

export default StudentRoute;
