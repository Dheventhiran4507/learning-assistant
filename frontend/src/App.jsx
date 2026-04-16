import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Pages
import LoginPage from './pages/LoginPage';
import StaffLoginPage from './pages/StaffLoginPage';

import DashboardPage from './pages/DashboardPage';
import SemesterViewPage from './pages/SemesterViewPage';
import SubjectViewPage from './pages/SubjectViewPage';
import UnitViewPage from './pages/UnitViewPage';
import ChatPage from './pages/ChatPage';
import PracticePage from './pages/PracticePage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdminSyllabusPage from './pages/AdminSyllabusPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import StaffLabManager from './pages/StaffLabManager';
import StaffLabResults from './pages/StaffLabResults';
import StudentPreLabPage from './pages/StudentPreLabPage';
import StudentPostLabPage from './pages/StudentPostLabPage';
import InitialSetupPage from './pages/InitialSetupPage';
import authService from './services/authService';
import { useEffect, useState } from 'react';

// Components
import PrivateRoute from './components/PrivateRoute';
import StudentRoute from './components/StudentRoute';
import Navbar from './components/Navbar';

function App() {
  const { isAuthenticated } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const data = await authService.getSystemStatus();
        if (data && typeof data.initialized === 'boolean') {
            setIsInitialized(data.initialized);
        }
      } catch (error) {
        console.warn('System status check failed, assuming initialized');
      } finally {
        setCheckingStatus(false);
      }
    };
    checkStatus();
  }, []);

  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen text-gray-900">
        {isAuthenticated && <Navbar />}

        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/staff-login"
            element={!isAuthenticated ? <StaffLoginPage /> : <Navigate to="/admin/dashboard" />}
          />

          <Route
            path="/initial-setup"
            element={isInitialized ? <Navigate to="/login" /> : <InitialSetupPage />}
          />


          {/* Student Routes (Protected from Admin/HOD) */}
          <Route
            path="/dashboard"
            element={
              <StudentRoute>
                <DashboardPage />
              </StudentRoute>
            }
          />
          <Route
            path="/semester/:semesterNum"
            element={
              <StudentRoute>
                <SemesterViewPage />
              </StudentRoute>
            }
          />
          <Route
            path="/subject/:subjectCode"
            element={
              <StudentRoute>
                <SubjectViewPage />
              </StudentRoute>
            }
          />
          <Route
            path="/unit/:subjectCode/:unitNumber"
            element={
              <StudentRoute>
                <UnitViewPage />
              </StudentRoute>
            }
          />
          <Route
            path="/pre-lab"
            element={
              <PrivateRoute>
                <StudentPreLabPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/post-lab"
            element={
              <PrivateRoute>
                <StudentPostLabPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <StudentRoute>
                <ChatPage />
              </StudentRoute>
            }
          />
          <Route
            path="/practice"
            element={
              <StudentRoute>
                <PracticePage />
              </StudentRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <StudentRoute>
                <AnalyticsPage />
              </StudentRoute>
            }
          />
          <Route
            path="/admin/syllabus"
            element={
              <PrivateRoute>
                <AdminSyllabusPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute>
                <AdminDashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/lab-manager"
            element={
              <PrivateRoute>
                <StaffLabManager />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/lab-results"
            element={
              <PrivateRoute>
                <StaffLabResults />
              </PrivateRoute>
            }
          />

          {/* Default Route */}
          <Route
            path="/"
            element={
              !isInitialized ? (
                <Navigate to="/initial-setup" />
              ) : (
                <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />
              )
            }
          />
        </Routes>

        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1F2937',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
