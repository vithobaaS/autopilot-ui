export function getToken() { return localStorage.getItem('ap_token'); }
export function getUser()  { try { return JSON.parse(localStorage.getItem('ap_user') || 'null'); } catch { return null; } }

// Central API fetch — injects JWT on every request
export async function api(path, opts = {}) {
  const token = getToken();
  
  if (!token && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
    localStorage.removeItem('ap_user');
    window.location.href = '/login';
    return new Response(null, { status: 401 });
  }

  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(path, { ...opts, headers });
  if (res.status === 401 || res.status === 403) {
    if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      const userStr = localStorage.getItem('ap_user');
      if (userStr) {
        window.dispatchEvent(new Event('ap_session_expired'));
      } else {
        localStorage.removeItem('ap_token');
        localStorage.removeItem('ap_user');
        window.location.href = '/login';
      }
    }
  }
  return res;
}
