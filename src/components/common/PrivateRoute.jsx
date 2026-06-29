import { Navigate, useLocation } from 'react-router-dom';
import { getToken, getUser } from '../../api/apiClient';

export function PrivateRoute({ children }) {
  const token = getToken();
  const user = getUser();
  const location = useLocation();

  if (!token) return <Navigate to="/login" replace />;
  
  if (user?.requiresPasswordChange && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return children;
}
