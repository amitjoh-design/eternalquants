import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ContentPage from './pages/ContentPage';

/* Redirects unauthenticated users to /auth */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null; // wait for session check
  return user ? children : <Navigate to="/auth" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"     element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/learn"
        element={
          <ProtectedRoute>
            <ContentPage />
          </ProtectedRoute>
        }
      />
      {/* Catch-all → home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
