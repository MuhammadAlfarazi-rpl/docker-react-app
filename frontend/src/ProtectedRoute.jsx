import { useAuth } from './AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  const auth = useAuth();

  if (!auth.token) {
    // Jika tidak ada token, sepak ke halaman /login
    return <Navigate to="/login" replace />;
  }

  // Jika ada token, kasi masuk
  return <Outlet />;
}

export default ProtectedRoute;