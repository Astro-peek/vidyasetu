import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Layout from './components/Layout';
import AIAssistant from './components/AIAssistant';
import Home from './pages/Home';
import Login from './pages/Login';

// Applicant Pages
import ApplicantDashboard from './pages/applicant/Dashboard';
import ExploreSchemes from './pages/applicant/ExploreSchemes';
import DynamicApplication from './pages/applicant/DynamicApplication';
import ApplicationStatus from './pages/applicant/ApplicationStatus';
import MyApplications from './pages/applicant/MyApplications';
import Profile from './pages/applicant/Profile';
import SchemeDetail from './pages/applicant/SchemeDetail';
import Help from './pages/applicant/Help';

// Admin / Staff Pages
import AdminDashboard from './pages/admin/Dashboard';
import SchemesList from './pages/admin/SchemesList';
import SchemeBuilder from './pages/admin/SchemeBuilder';
import ScrutinyQueue from './pages/officer/ScrutinyQueue';
import ScrutinyWorkspace from './pages/officer/ScrutinyWorkspace';
import CommitteeWorkspace from './pages/committee/CommitteeWorkspace';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { role, authLoading } = useAppContext();
  if (authLoading) return <main className="vs-page vs-empty">Loading secure session...</main>;
  if (!role) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      
      <Route element={<Layout />}>
        {/* Applicant Routes */}
        <Route path="/applicant/dashboard" element={<ProtectedRoute allowedRoles={['applicant']}><ApplicantDashboard /></ProtectedRoute>} />
        <Route path="/apply" element={<ProtectedRoute allowedRoles={['applicant']}><ExploreSchemes /></ProtectedRoute>} />
        <Route path="/schemes/:schemeId" element={<ProtectedRoute allowedRoles={['applicant']}><SchemeDetail /></ProtectedRoute>} />
        <Route path="/apply/:schemeId" element={<ProtectedRoute allowedRoles={['applicant']}><DynamicApplication /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute allowedRoles={['applicant']}><MyApplications /></ProtectedRoute>} />
        <Route path="/applications/:id" element={<ProtectedRoute allowedRoles={['applicant']}><ApplicationStatus /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allowedRoles={['applicant']}><Profile /></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute allowedRoles={['applicant']}><Help /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['scheme_admin', 'ministry_viewer']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/schemes" element={<ProtectedRoute allowedRoles={['scheme_admin']}><SchemesList /></ProtectedRoute>} />
        <Route path="/admin/schemes/:id/builder" element={<ProtectedRoute allowedRoles={['scheme_admin']}><SchemeBuilder /></ProtectedRoute>} />
        
        {/* Officer Routes */}
        <Route path="/scrutiny" element={<ProtectedRoute allowedRoles={['scrutiny_officer']}><ScrutinyQueue /></ProtectedRoute>} />
        <Route path="/scrutiny/:id" element={<ProtectedRoute allowedRoles={['scrutiny_officer']}><ScrutinyWorkspace /></ProtectedRoute>} />

        {/* Committee Routes */}
        <Route path="/committee" element={<ProtectedRoute allowedRoles={['committee_member']}><CommitteeWorkspace /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AppProvider>
     <BrowserRouter basename="/vidyasetu">
        <AppRoutes />
        <AIAssistant />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
