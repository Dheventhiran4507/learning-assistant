import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirection logic based on path
        const isAdminPath = location.pathname.startsWith('/admin');
        return <Navigate to={isAdminPath ? "/staff-login" : "/login"} />;
    }

    return children;
};

export default PrivateRoute;
