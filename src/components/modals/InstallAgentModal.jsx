import { useState } from 'react';
import { api } from '../../api/apiClient';
import { toast } from '../common/ToastContainer';

export function InstallAgentModal({ onClose }) {
  const [agentOsTab, setAgentOsTab] = useState('windows');
  const [pairingCode, setPairingCode] = useState('');
  const [pairingLoading, setPairingLoading] = useState(false);

  const handleVerifyPairing = async () => {
    if (pairingCode.length !== 6) {
      toast('error', 'Invalid Code', 'Pairing code must be 6 digits');
      return;
    }
    setPairingLoading(true);
    try {
      const res = await api('/api/pairing/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: pairingCode })
      });
      if (res.ok) {
        toast('success', 'Success', 'Agent paired successfully!');
        onClose();
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const data = await res.json();
        toast('error', 'Failed', data.error || 'Invalid pairing code');
      }
    } catch {
      toast('error', 'Error', 'Failed to connect to server');
    }
    setPairingLoading(false);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box" style={{ maxWidth: '600px' }}>
        <div className="modal-head">
          <h2 style={{ color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <span>🚀</span> Connect your first agent
          </h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ marginTop: '4px', fontSize: '14px', marginBottom: '16px' }}>
            To start running tests, you need to install the AutoPilot agent on your machine or server.
          </p>
          <div className="tabs" style={{ display: 'flex', gap: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border)' }}>
            {['windows', 'mac', 'linux'].map(os => (
              <button key={os}
                style={{ padding: '8px 16px', background: 'transparent', border: 'none', borderBottom: agentOsTab === os ? '2px solid var(--brand)' : '2px solid transparent', color: agentOsTab === os ? 'var(--brand)' : 'var(--txt-muted)', cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize' }}
                onClick={() => setAgentOsTab(os)}>
                {os}
              </button>
            ))}
          </div>

          <div className="install-content" style={{ background: 'var(--surface-2)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>1. Install the Agent</h3>
            <p style={{ fontSize: '14px', color: 'var(--txt-muted)', marginBottom: '16px' }}>
              Download and run the installer on your Windows machine.
            </p>
            <a href="/agent/AutopilotAgent-1.0.0.msi" download className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '32px' }}>
              📦 Download .msi Installer
            </a>

            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', borderTop: '1px solid var(--border)', paddingTop: '32px' }}>2. Enter Pairing Code</h3>
            <p style={{ fontSize: '14px', color: 'var(--txt-muted)', marginBottom: '16px' }}>
              When the agent starts, it will display a 6-digit code. Enter it below to securely connect your machine.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="123456"
                maxLength={6}
                value={pairingCode}
                onChange={e => setPairingCode(e.target.value.replace(/\D/g, ''))}
                style={{
                  fontSize: '24px',
                  letterSpacing: '8px',
                  textAlign: 'center',
                  width: '200px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--txt)'
                }}
              />
              <button
                className="btn btn-primary"
                onClick={handleVerifyPairing}
                disabled={pairingLoading || pairingCode.length !== 6}
                style={{ padding: '16px 24px', fontSize: '16px' }}
              >
                {pairingLoading ? 'Verifying...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
