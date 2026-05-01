import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SoundProvider } from './context/SoundContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { ToastProvider } from './context/ToastContext';
import { AdminLayout } from './components/Layout/AdminLayout';
import { PublicLayout } from './components/Layout/PublicLayout';

import {
  Home, Login, About, Contact, Dashboard, Menu, Orders,
  Inventory, Salaries, Employees, Settings
} from './pages';

function App() {
  return (
    <ThemeProvider>
      <SoundProvider>
        <ToastProvider>
          <AuthProvider>
            <Router>
            <Routes>
              {/* Public Routes restricted to unauthenticated users */}
              <Route element={<PublicRoute />}>
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Navigate to="/home" replace />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact-us" element={<Contact />} />
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
                  <Route path="/settings" element={<Settings />} />

                  {/* Only Admin can access these */}
                  <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                    <Route path="/employees" element={<Employees />} />
                    <Route path="/salaries" element={<Salaries />} />
                  </Route>
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </Router>
          </AuthProvider>
        </ToastProvider>
      </SoundProvider>
    </ThemeProvider>
  );
}

export default App;
