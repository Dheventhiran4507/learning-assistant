import api from './api';

const authService = {
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await api.put('/auth/profile', profileData);
        return response.data;
    },

    getSystemStatus: async () => {
        const response = await api.get('/auth/status');
        return response.data;
    },

    setupInitialAdmin: async (adminData) => {
        const response = await api.post('/auth/setup-initial-admin', adminData);
        return response.data;
    },

    seedSyllabus: async () => {
        const response = await api.post('/auth/seed-syllabus');
        return response.data;
    },
};

export default authService;
