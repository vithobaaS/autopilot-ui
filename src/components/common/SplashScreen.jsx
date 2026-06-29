import { useEffect, useState } from 'react';

export function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('hold'); // 'hold' | 'out'

  useEffect(() => {
    const t2 = setTimeout(() => setPhase('out'), 1600);
    const t3 = setTimeout(() => onDone(), 2100);
    return () => { clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div className={`splash-screen ${phase}`}>
      <div className="splash-inner">
        <div className="splash-logo-wrap">
          <div className="splash-brand">Auto<span>Pilot</span></div>
        </div>
        <p className="splash-tagline">Autonomous Testing Platform</p>
      </div>
    </div>
  );
}
