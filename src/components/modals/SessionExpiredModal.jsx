import { useEffect } from 'react';

export function SessionExpiredModal() {
  useEffect(() => {
    const forceLogout = () => {
      localStorage.removeItem('ap_token');
      localStorage.removeItem('ap_user');
      window.location.href = '/login';
    };

    window.addEventListener('ap_session_expired', forceLogout);
    return () => window.removeEventListener('ap_session_expired', forceLogout);
  }, []);

  return null;
}
