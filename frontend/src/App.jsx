import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { RequireAuth } from './components/RequireAuth';
import { useAuth } from './context/AuthContext';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProfilePage } from './pages/ProfilePage';
import { RegisterPage } from './pages/RegisterPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { UsersPage } from './pages/UsersPage';

const RootRedirect = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={role === 'viewer' ? '/app/transactions' : '/app/dashboard'} replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<RequireAuth allowedRoles={['viewer', 'analyst', 'admin']} />}>
        <Route element={<AppShell />}>
          <Route path="/app/transactions" element={<TransactionsPage />} />
          <Route path="/app/profile" element={<ProfilePage />} />

          <Route element={<RequireAuth allowedRoles={['analyst', 'admin']} />}>
            <Route path="/app/dashboard" element={<DashboardPage />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={['admin']} />}>
            <Route path="/app/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}