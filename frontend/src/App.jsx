import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing';
import CreateTicket from './pages/CreateTicket';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import DeveloperDashboard from './pages/DeveloperDashboard';
import MyTickets from './pages/MyTickets';
import TicketDetail from './pages/TicketDetail';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false, requireDeveloper = false }) => {
  const { isAuthenticated, isAdmin, isDeveloper, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/my-tickets" />;
  }

  if (requireDeveloper && !isDeveloper) {
    return <Navigate to="/my-tickets" />;
  }

  return children;
};

// Smart Dashboard Redirect - routes based on role
const DashboardRedirect = () => {
  const { isAdmin, isDeveloper, isUser } = useAuth();

  if (isAdmin) {
    return <Navigate to="/admin" />;
  }
  if (isDeveloper) {
    return <Navigate to="/developer" />;
  }
  return <Navigate to="/my-tickets" />;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SidebarProvider>
          <Router>
            <div className="App transition-colors duration-300">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/create-ticket" element={<CreateTicket />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Dashboard Redirect */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardRedirect />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Dashboard */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Developer Dashboard */}
                <Route
                  path="/developer"
                  element={
                    <ProtectedRoute requireDeveloper={true}>
                      <DeveloperDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* User Routes */}
                <Route
                  path="/my-tickets"
                  element={
                    <ProtectedRoute>
                      <MyTickets />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ticket/:id"
                  element={
                    <ProtectedRoute>
                      <TicketDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>

              {/* Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: 'var(--color-toast-bg)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-strong)',
                    backdropFilter: 'blur(10px)',
                  },
                  success: {
                    iconTheme: {
                      primary: 'var(--color-success)',
                      secondary: 'var(--color-card)',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: 'var(--color-error)',
                      secondary: 'var(--color-card)',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </SidebarProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
