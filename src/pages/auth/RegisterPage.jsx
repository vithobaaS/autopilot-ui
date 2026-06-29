import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../components/common/ToastContainer';

const LogoSVG = () => null;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setUser, setShowSplash } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', orgName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return; }
      localStorage.setItem('ap_token', data.token);
      localStorage.setItem('ap_user', JSON.stringify(data));
      localStorage.setItem('ap_new_registration', 'true');
      setUser(data);
      if (setShowSplash) setShowSplash(true);
      toast('success', 'Welcome!', 'Your account has been created.');
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
          <div className="auth-brand">Auto<span>Pilot</span></div>
        </div>
        <h1 className="auth-title">Start free trial</h1>
        <p className="auth-sub">No credit card required · Cancel anytime</p>
        {error && <div className="auth-error">⚠ {error}</div>}
        <form onSubmit={submit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input id="reg-name" type="text" className="form-input" placeholder="Jane Smith"
              value={form.fullName} onChange={e => set('fullName', e.target.value)} required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Work Email</label>
            <input id="reg-email" type="email" className="form-input" placeholder="you@company.com"
              value={form.email} onChange={e => set('email', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Organization Name <span style={{ color: 'var(--txt-muted)', fontWeight: 400 }}>(optional)</span></label>
            <input id="reg-org" type="text" className="form-input" placeholder="Your company"
              value={form.orgName} onChange={e => set('orgName', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="reg-password" type="password" className="form-input" placeholder="Min 8 characters"
              value={form.password} onChange={e => set('password', e.target.value)} required minLength={8} />
          </div>
          <button type="submit" id="reg-submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Free Account'}
          </button>
        </form>
        <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
