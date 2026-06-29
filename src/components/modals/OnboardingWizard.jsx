import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { InstallAgentModal } from './InstallAgentModal';
import { Rocket, Cloud } from 'lucide-react';

export function OnboardingWizard({ onClose }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);

  if (step === 3) {
    // Re-use the existing InstallAgentModal for the final step
    return <InstallAgentModal onClose={onClose} isWizard={true} />;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        
        {step === 1 && (
          <div className="wizard-step">
            <div style={{ marginBottom: '1rem', color: 'var(--brand)' }}><Rocket size={48}/></div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--txt-h)' }}>
              Welcome to AutoPilot, {user?.fullName || 'there'}!
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--txt-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
              You're joining <strong>{user?.orgName || 'your workspace'}</strong>.<br/>
              AutoPilot is your command center for autonomous end-to-end testing. 
              Let's get you set up in less than 2 minutes.
            </p>
            <button className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '1.1rem' }} onClick={() => setStep(2)}>
              Get Started
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="wizard-step">
            <div style={{ marginBottom: '1rem', color: 'var(--brand)' }}><Cloud size={48}/></div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--txt-h)' }}>
              How AutoPilot Works
            </h2>
            <div style={{ textAlign: 'left', background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '2rem' }}>
              <ol style={{ paddingLeft: '20px', color: 'var(--txt-muted)', lineHeight: '1.8' }}>
                <li><strong>Design</strong> your tests in the cloud dashboard.</li>
                <li><strong>Connect</strong> a local execution agent on your machine.</li>
                <li><strong>Run</strong> tests securely on your own infrastructure.</li>
              </ol>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>Connect Agent</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
