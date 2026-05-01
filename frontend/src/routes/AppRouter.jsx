import { createContext, useContext, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import Layout from '../components/Layout.jsx';
import Spinner from '../components/Spinner.jsx';

/** Pass toast down without prop-drilling through router slots */
export const ToastCtx = createContext(null);
export const useToastCtx = () => useContext(ToastCtx);

const LoginPage     = lazy(() => import('../pages/LoginPage.jsx'));
const DashboardPage = lazy(() => import('../pages/DashboardPage.jsx'));
const MenuPage      = lazy(() => import('../pages/MenuPage.jsx'));
const CartPage      = lazy(() => import('../pages/CartPage.jsx'));
const OrdersPage    = lazy(() => import('../pages/OrdersPage.jsx'));
const AdminPage     = lazy(() => import('../pages/AdminPage.jsx'));

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
    <Spinner size="lg" />
  </div>
);

export default function AppRouter({ toast }) {
  return (
    <ToastCtx.Provider value={toast}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Authenticated – wrapped in shared Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="menu"   element={<MenuPage />} />
              <Route path="cart"   element={<CartPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route
                path="admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ToastCtx.Provider>
  );
}
