import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../components/common/ToastContainer';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true); setError('');
    try {
      const res = await api('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ newPassword })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update password');
        setLoading(false);
        return;
      }
      
      // Update local state to remove requiresPasswordChange flag
      const updatedUser = { ...user, requiresPasswordChange: false };
      localStorage.setItem('ap_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast('success', 'Password updated successfully');
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-brand">Auto<span>Pilot</span></div>
        </div>
        <h1 className="auth-title">Action Required</h1>
        <p className="auth-sub">For security reasons, you must change your temporary password before accessing your workspace.</p>
        
        {error && <div className="auth-error">⚠️ {error}</div>}
        
        <form onSubmit={submit} className="auth-form">
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Min 8 characters"
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              required 
              minLength={8} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Confirm password"
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required 
              minLength={8} 
            />
          </div>
          
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? '⏳ Updating…' : 'Update Password & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
