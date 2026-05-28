import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SoundProvider } from './context/SoundContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { ToastProvider } from './context/ToastContext';
import { ScrollToTop } from './components/ScrollToTop';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminLayout } from './components/Layout/AdminLayout';
import { PublicLayout } from './components/Layout/PublicLayout';

import {
  Home, Login, About, Contact, ContactMessages, JobApplication, Jobs, Dashboard, Menu, Orders,
  Inventory, Salaries, Employees, Settings, SystemMessages, Reports, ErrorPage
} from './pages';

function App() {
  return (
    <ThemeProvider>
      <SoundProvider>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <ScrollToTop />
              <ErrorBoundary>
                <Routes>
                {/* Public Routes restricted to unauthenticated users */}
                <Route element={<PublicRoute />}>
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<Navigate to="/home" replace />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact-us" element={<Contact />} />
                    <Route path="/jobs" element={<JobApplication />} />
                    <Route path="/login" element={<Login />} />
                  </Route>
                </Route>

                {/* Protected Routes for authenticated users */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<AdminLayout />}>
                    {/* Everyone authenticated can access these */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/contact-messages" element={<ContactMessages />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/reports" element={<Reports />} />

                    {/* Admin and Manager can access these */}
                    <Route element={<ProtectedRoute allowedRoles={['Admin', 'Manager']} />}>
                      <Route path="/employees" element={<Employees />} />
                      <Route path="/salaries" element={<Salaries />} />
                      <Route path="/system/messages" element={<SystemMessages />} />
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={['Admin', 'Manager']} />}>
                      <Route path="/admin/jobs" element={<Jobs />} />
                    </Route>
                  </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<ErrorPage />} />
                </Routes>
              </ErrorBoundary>
            </Router>
          </AuthProvider>
        </ToastProvider>
      </SoundProvider>
    </ThemeProvider>
  );
}

export default App;
