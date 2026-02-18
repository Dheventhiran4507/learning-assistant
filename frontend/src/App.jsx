import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SemesterViewPage from './pages/SemesterViewPage';
import SubjectViewPage from './pages/SubjectViewPage';
import UnitViewPage from './pages/UnitViewPage';
import ChatPage from './pages/ChatPage';
import PracticePage from './pages/PracticePage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdminSyllabusPage from './pages/AdminSyllabusPage';

// Components
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

function App() {
  const { isAuthenticated } = useAuthStore();

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
            path="/register"
            element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />}
          />

          {/* Private Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/semester/:semesterNum"
            element={
              <PrivateRoute>
                <SemesterViewPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/subject/:subjectCode"
            element={
              <PrivateRoute>
                <SubjectViewPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/unit/:subjectCode/:unitNumber"
            element={
              <PrivateRoute>
                <UnitViewPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/practice"
            element={
              <PrivateRoute>
                <PracticePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <AnalyticsPage />
              </PrivateRoute>
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

          {/* Default Route */}
          <Route
            path="/"
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
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
