import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from './components/Toast';

// Layouts
import AppLayout from './layouts/AppLayout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// Quote
import QuotePage from './pages/quotes/QuotePage';

// Policies
import PoliciesList from './pages/policies/PoliciesList';
import PolicyDetail from './pages/policies/PolicyDetail';

// Claims
import ClaimsList from './pages/claims/ClaimsList';
import NewClaim from './pages/claims/NewClaim';
import ClaimDetail from './pages/claims/ClaimDetail';

// Payments
import PaymentsPage from './pages/payments/PaymentsPage';

// Admin
import AdminUsers from './pages/admin/AdminUsers';
import AdminPolicies from './pages/admin/AdminPolicies';
import AdminClaims from './pages/admin/AdminClaims';
import AdminPayments from './pages/admin/AdminPayments';
import AdminStats from './pages/admin/AdminStats';

// Reference pages
import GuidewirePage from './pages/guidewire/GuidewirePage';
import GosuPage from './pages/gosu/GosuPage';

// Role-protected route
function RoleRoute({ allowed, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowed.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected routes inside AppLayout */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Quote */}
        <Route path="/quote" element={<QuotePage />} />

        {/* Policies */}
        <Route path="/policies" element={<PoliciesList />} />
        <Route path="/policies/:id" element={<PolicyDetail />} />

        {/* Claims */}
        <Route path="/claims" element={<ClaimsList />} />
        <Route path="/claims/new" element={
          <RoleRoute allowed={['customer']}>
            <NewClaim />
          </RoleRoute>
        } />
        <Route path="/claims/:id" element={<ClaimDetail />} />

        {/* Payments */}
        <Route path="/payments" element={<PaymentsPage />} />

        {/* Admin routes */}
        <Route path="/admin/users" element={
          <RoleRoute allowed={['admin']}>
            <AdminUsers />
          </RoleRoute>
        } />
        <Route path="/admin/policies" element={
          <RoleRoute allowed={['admin']}>
            <AdminPolicies />
          </RoleRoute>
        } />
        <Route path="/admin/claims" element={
          <RoleRoute allowed={['admin']}>
            <AdminClaims />
          </RoleRoute>
        } />
        <Route path="/admin/payments" element={
          <RoleRoute allowed={['admin']}>
            <AdminPayments />
          </RoleRoute>
        } />
        <Route path="/admin/stats" element={
          <RoleRoute allowed={['admin']}>
            <AdminStats />
          </RoleRoute>
        } />

        {/* Reference pages — accessible to all */}
        <Route path="/guidewire" element={<GuidewirePage />} />
        <Route path="/gosu" element={<GosuPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  );
}
