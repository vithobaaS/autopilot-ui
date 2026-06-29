import { useState } from 'react';
import { api } from '../../api/apiClient';
import { toast } from '../common/ToastContainer';

export function PairAgentModal({ onClose }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast('error', 'Code must be exactly 6 digits');
      return;
    }
    setLoading(true);
    try {
      const res = await api('/api/pairing/verify', {
        method: 'POST',
        body: JSON.stringify({ code })
      });
      if (res.ok) {
        toast('success', 'Agent successfully paired with organization!');
        onClose();
      } else {
        const data = await res.json();
        toast('error', data.error || 'Failed to pair agent');
      }
    } catch {
      toast('error', 'Network error');
    }
    setLoading(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 style={{ marginBottom: '8px' }}>Pair Local Agent</h2>
        <p className="text-muted" style={{ marginBottom: '24px', lineHeight: 1.5 }}>
          Enter the 6-digit code displayed by your AutoPilot Local Agent application to securely link it to your cloud organization.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ textAlign: 'center' }}>6-Digit Pairing Code</label>
            <input 
              type="text" 
              className="form-input" 
              value={code} 
              onChange={e => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              placeholder="000000"
              style={{ fontSize: '2rem', textAlign: 'center', letterSpacing: '0.5rem', padding: '16px', fontFamily: 'monospace' }}
              required 
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1.1rem' }} disabled={loading}>
            {loading ? 'Pairing...' : 'Link Agent'}
          </button>
        </form>
      </div>
    </div>
  );
}
