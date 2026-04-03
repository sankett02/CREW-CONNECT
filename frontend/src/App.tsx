import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';
import BrandDashboard from './pages/BrandDashboard';
import CreatorDashboard from './pages/CreatorDashboard';
import ProjectDiscovery from './pages/discovery/ProjectDiscovery';
import ProjectCreation from './pages/ProjectCreation';
import ProjectDetail from './pages/ProjectDetail';
import Workspace from './pages/Workspace';
import Workspaces from './pages/Workspaces';
import Inbox from './pages/Inbox';
import AdminDashboard from './pages/AdminDashboard';
import Payments from './pages/Payments';
import PaymentSuccess from './pages/payments/PaymentSuccess';
import Profile from './pages/Profile';
import TalentDiscovery from './pages/discovery/TalentDiscovery';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRegistration from './pages/admin/AdminRegistration';
import MilestoneGuide from './pages/MilestoneGuide';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;



const DashboardWrapper = () => {
  const { user, viewMode } = useAuth();
  if (user?.role === 'ADMIN') return <AdminDashboard />;
  if (viewMode === 'BRAND') return <BrandDashboard />;
  return <CreatorDashboard />;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Landing page has its own layout and navbar */}
            <Route path="/" element={<Landing />} />
            
            {/* All other routes use the global Layout */}
            <Route element={<Layout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/discover" element={<ProjectDiscovery />} />
              <Route path="/talent" element={<TalentDiscovery />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/register" element={<AdminRegistration />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardWrapper />
                </ProtectedRoute>
              } />
              <Route path="/post" element={
                <ProtectedRoute allowedRoles={['BRAND', 'CREATOR', 'WRITER', 'EDITOR']}>
                  <ProjectCreation />
                </ProtectedRoute>
              } />
              <Route path="/projects/:id" element={
                <ProtectedRoute>
                  <ProjectDetail />
                </ProtectedRoute>
              } />
              <Route path="/workspace/:id" element={
                <ProtectedRoute>
                  <Workspace />
                </ProtectedRoute>
              } />
              <Route path="/workspaces" element={
                <ProtectedRoute>
                  <Workspaces />
                </ProtectedRoute>
              } />
              <Route path="/payments/:id" element={
                <ProtectedRoute>
                  <Payments />
                </ProtectedRoute>
              } />
              <Route path="/payments" element={
                <ProtectedRoute>
                  <Payments />
                </ProtectedRoute>
              } />
              <Route path="/workspace/:id/success" element={
                <ProtectedRoute>
                  <PaymentSuccess />
                </ProtectedRoute>
              } />
              <Route path="/profile/:id" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/inbox" element={
                <ProtectedRoute>
                  <Inbox />
                </ProtectedRoute>
              } />
              <Route path="/milestone-guide" element={
                <ProtectedRoute>
                  <MilestoneGuide />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
