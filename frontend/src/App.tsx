import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AffilieListPage from './pages/affilies/AffilieListPage';
import AffilieDetailPage from './pages/affilies/AffilieDetailPage';
import AffilieFormPage from './pages/affilies/AffilieFormPage';
import ContributionListPage from './pages/contributions/ContributionListPage';
import LiquidationListPage from './pages/liquidations/LiquidationListPage';
import LiquidationFormPage from './pages/liquidations/LiquidationFormPage';
import PaymentListPage from './pages/payments/PaymentListPage';
import ReversionListPage from './pages/reversions/ReversionListPage';
import AuditLogPage from './pages/admin/AuditLogPage';
import ProfilePage from './pages/profile/ProfilePage';
import SettingsPage from './pages/settings/SettingsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import PointsPurchasePage from './pages/contributions/PointsPurchasePage';
import PensionSimulationPage from './pages/simulation/PensionSimulationPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import './App.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="affilies" element={<AffilieListPage />} />
        <Route path="affilies/new" element={<AffilieFormPage />} />
        <Route path="affilies/:id" element={<AffilieDetailPage />} />
        <Route path="affilies/:id/edit" element={<AffilieFormPage />} />
        <Route path="contributions" element={<ContributionListPage />} />
        <Route path="contributions/points" element={<PointsPurchasePage />} />
        <Route path="simulation" element={<PensionSimulationPage />} />
        <Route path="liquidations" element={<LiquidationListPage />} />
        <Route path="liquidations/new" element={<LiquidationFormPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="payments" element={<PaymentListPage />} />
        <Route path="reversions" element={<ReversionListPage />} />
        <Route path="admin/audit" element={<AuditLogPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { background: '#1e293b', color: '#f1f5f9', borderRadius: '12px', fontSize: '0.9rem' },
          }}
        />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
