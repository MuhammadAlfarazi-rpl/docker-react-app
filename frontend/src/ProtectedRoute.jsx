import { useAuth } from './AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  const auth = useAuth();

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;