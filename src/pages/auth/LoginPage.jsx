import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LogoSVG = () => null;

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser, setShowSplash } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orgData, setOrgData] = useState(null);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    const host = window.location.hostname;
    const isIp = /^[0-9.]+$/.test(host);
    if (!isIp && host !== 'localhost') {
      const parts = host.split('.');
      if (parts.length > 1 && parts[0] !== 'www') {
        fetch(`/api/public/orgs/by-subdomain/${parts[0]}`)
          .then(r => r.ok ? r.json() : null)
          .then(d => { if (d) setOrgData(d); })
          .catch(() => {});
      }
    }
  }, []);

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); setLoading(false); return; }
      localStorage.setItem('ap_token', data.token);
      localStorage.setItem('ap_user', JSON.stringify(data));
      setUser(data);
      if (setShowSplash) setShowSplash(true);
      navigate('/dashboard', { replace: true });
    } catch { setError('Network error. Please try again.'); setLoading(false); }
  };

  return (
    <div className="auth-page">
      <Link to="/" style={{ position: 'absolute', top: '32px', left: '32px', color: 'var(--txt-muted)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }} className="hover-text-main">
        <ArrowLeft size={18} /> Back to Home
      </Link>
      <div className="auth-card">
        <div className="auth-logo" style={{ display: 'flex', gap: '10px' }}>
          <LogoSVG />
          <div className="auth-brand">
            {orgData ? orgData.name : <><span style={{ color: 'var(--txt-h)' }}>Auto</span><span>Pilot</span></>}
          </div>
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">{orgData ? `Sign in to ${orgData.name}` : 'Sign in to your AutoPilot account'}</p>
        {error && <div className="auth-error">⚠ {error}</div>}
        <form onSubmit={submit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input id="login-email" type="email" className="form-input" placeholder="you@company.com"
              value={form.email} onChange={e => set('email', e.target.value)} required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="login-password" type="password" className="form-input" placeholder="••••••••"
              value={form.password} onChange={e => set('password', e.target.value)} required />
          </div>
          <button type="submit" id="login-submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="auth-footer">Don&apos;t have an account? <Link to="/register">Start free trial</Link></p>
      </div>
    </div>
  );
}
