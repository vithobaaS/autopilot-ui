import { Link } from 'react-router-dom';
import { Rocket, Activity, BrainCircuit, ShieldCheck, CheckCircle2, Zap, Clock, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg)', color: 'var(--txt)' }}>
      {/* Header */}
      <header style={{ padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <div className="logo">
          <div className="logo-text">Auto<span>Pilot</span></div>
        </div>
        <div>
          <Link to="/login" style={{ marginRight: '24px', color: 'var(--txt-h)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          <Link to="/register" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: 'var(--r-md)' }}>Get Started</Link>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px', textAlign: 'center' }}>
        
        {/* Hero Section */}
        <div style={{ maxWidth: '1000px', marginBottom: '80px' }}>
          <div style={{ display: 'inline-block', marginBottom: '16px', padding: '6px 16px', background: 'var(--brand-subtle)', color: 'var(--brand)', borderRadius: 'var(--r-xl)', fontSize: '14px', fontWeight: 600 }}>
            ✨ Qruize Magic & AutoPilot
          </div>
          <h1 style={{ fontSize: '56px', fontWeight: 800, color: 'var(--txt-h)', marginBottom: '24px', lineHeight: 1.15, letterSpacing: '-1px' }}>
            End-to-End Test Automation <br /> for Business Users & QA
          </h1>
          <p style={{ fontSize: '20px', color: 'var(--txt-muted)', marginBottom: '40px', lineHeight: 1.6, maxWidth: '800px', margin: '0 auto 40px auto' }}>
            Empower Manual Testers to build complex automation without coding, while our AI Decision Engine predicts release risks and gates CI/CD deployments seamlessly across Web & Mobile platforms.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              Start your free trial <Rocket size={18} />
            </Link>
            <a href="#pricing" className="btn" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: 600, background: 'var(--surface-2)', color: 'var(--txt-h)', border: '1px solid var(--border)', borderRadius: '8px', textDecoration: 'none' }}>
              View Pricing
            </a>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '1100px', borderRadius: '16px', padding: '12px', background: 'linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%)', border: '1px solid var(--border)', marginBottom: '100px' }}>
          <img src="/autopilot/screenshot.png" alt="AutoPilot Dashboard" style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }} onError={(e) => { e.target.style.display = 'none'; }} />
        </div>

        {/* Bridging the Gap Section */}
        <div style={{ maxWidth: '900px', marginBottom: '80px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--txt-h)', marginBottom: '24px' }}>Bridging the Gap</h2>
          <p style={{ fontSize: '18px', color: 'var(--txt-muted)', lineHeight: 1.6 }}>
            Organizations struggle to balance manual functional testing with the high technical barrier of test automation. 
            <strong> AutoPilot</strong> bridges this gap. There is no dependency on highly-skilled automation engineers. 
            Time-to-automate shortens by <strong>80%</strong>, resulting in higher ROI and dramatically quicker Time to Market.
          </p>
        </div>

        {/* Feature Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', maxWidth: '1200px', width: '100%', marginBottom: '100px', textAlign: 'left' }}>
          
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ background: 'var(--blue-bg)', color: 'var(--blue-txt)', width: '48px', height: '48px', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Zap size={24} />
            </div>
            <h3 style={{ fontSize: '18px', color: 'var(--txt-h)', fontWeight: 700, marginBottom: '12px' }}>Scriptless Automation</h3>
            <p style={{ color: 'var(--txt-muted)', fontSize: '15px', lineHeight: 1.6 }}>
              Intuitive drag-and-drop GUI powered by Selenium & Appium. Create complex cross-browser and mobile tests with zero coding knowledge.
            </p>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ background: 'var(--brand-subtle)', color: 'var(--brand)', width: '48px', height: '48px', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <BrainCircuit size={24} />
            </div>
            <h3 style={{ fontSize: '18px', color: 'var(--txt-h)', fontWeight: 700, marginBottom: '12px' }}>AI Decision Engine</h3>
            <p style={{ color: 'var(--txt-muted)', fontSize: '15px', lineHeight: 1.6 }}>
              Our proprietary rules engine utilizes AI to predict release risks and automatically gate dangerous deployments.
            </p>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ background: 'var(--indigo-bg)', color: 'var(--indigo-txt)', width: '48px', height: '48px', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Activity size={24} />
            </div>
            <h3 style={{ fontSize: '18px', color: 'var(--txt-h)', fontWeight: 700, marginBottom: '12px' }}>Integrations & Ingestion</h3>
            <p style={{ color: 'var(--txt-muted)', fontSize: '15px', lineHeight: 1.6 }}>
              Seamlessly connect Jenkins, Bamboo, JIRA, and DevOps to stream live execution metrics into one centralized hub.
            </p>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ background: 'var(--green-bg)', color: 'var(--green-txt)', width: '48px', height: '48px', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '18px', color: 'var(--txt-h)', fontWeight: 700, marginBottom: '12px' }}>Governance & Audit</h3>
            <p style={{ color: 'var(--txt-muted)', fontSize: '15px', lineHeight: 1.6 }}>
              Interactive dashboards for pass/fail distributions, combined with immutable audit logging for strict compliance tracking.
            </p>
          </div>

        </div>

        {/* Pricing Section */}
        <div id="pricing" style={{ width: '100%', maxWidth: '1200px', marginBottom: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--txt-h)', marginBottom: '16px' }}>Choose Your Plan</h2>
            <p style={{ fontSize: '18px', color: 'var(--txt-muted)' }}>Try AutoPilot for Free. Upgrade when you are ready.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', textAlign: 'left' }}>
            
            {/* Beginner */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '40px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--txt-h)', marginBottom: '8px' }}>Beginner Plan</h3>
              <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--txt-h)', marginBottom: '8px' }}>$149 <span style={{ fontSize: '16px', color: 'var(--txt-muted)', fontWeight: 400 }}>/ month</span></div>
              <p style={{ color: 'var(--txt-muted)', fontSize: '14px', marginBottom: '24px' }}>Billed as one payment of $1600/year (Save $188)</p>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '15px' }}><CheckCircle2 size={18} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }}/> 1 User</li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '15px' }}><CheckCircle2 size={18} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }}/> Cloud Deployment</li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '15px' }}><CheckCircle2 size={18} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }}/> Default Actions & Features</li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '15px' }}><CheckCircle2 size={18} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }}/> Basic Support Portal</li>
              </ul>
              <Link to="/register" className="btn" style={{ width: '100%', padding: '12px', textAlign: 'center', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--txt-h)', fontWeight: 600, textDecoration: 'none' }}>Get Started</Link>
            </div>

            {/* Startup */}
            <div style={{ background: 'var(--brand)', border: '1px solid var(--brand)', borderRadius: 'var(--r-lg)', padding: '40px', display: 'flex', flexDirection: 'column', color: '#fff', transform: 'scale(1.05)', boxShadow: 'var(--shadow-xl)', position: 'relative', zIndex: 1 }}>
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--green)', color: '#fff', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Most Popular</div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Startup Plan</h3>
              <div style={{ fontSize: '36px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>$449 <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>/ month</span></div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '24px' }}>Billed as one payment of $5000/year (Save $388)</p>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '15px' }}><CheckCircle2 size={18} color="rgba(255,255,255,0.9)" style={{ flexShrink: 0, marginTop: '2px' }}/> 5 Users</li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '15px' }}><CheckCircle2 size={18} color="rgba(255,255,255,0.9)" style={{ flexShrink: 0, marginTop: '2px' }}/> Cloud Deployment</li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '15px' }}><CheckCircle2 size={18} color="rgba(255,255,255,0.9)" style={{ flexShrink: 0, marginTop: '2px' }}/> Customized Action Creation</li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '15px' }}><CheckCircle2 size={18} color="rgba(255,255,255,0.9)" style={{ flexShrink: 0, marginTop: '2px' }}/> Technical Expert Support</li>
              </ul>
              <Link to="/register" className="btn" style={{ width: '100%', padding: '12px', textAlign: 'center', background: '#fff', color: 'var(--brand)', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}>Get Started</Link>
            </div>

            {/* Enterprise */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '40px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--txt-h)', marginBottom: '8px' }}>Enterprise Plan</h3>
              <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--txt-h)', marginBottom: '8px' }}>$2400 <span style={{ fontSize: '16px', color: 'var(--txt-muted)', fontWeight: 400 }}>/ month</span></div>
              <p style={{ color: 'var(--txt-muted)', fontSize: '14px', marginBottom: '24px' }}>Tailored specifically to your business needs</p>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '15px' }}><CheckCircle2 size={18} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }}/> Unlimited Users</li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '15px' }}><CheckCircle2 size={18} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }}/> Cloud or On-Premise</li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '15px' }}><CheckCircle2 size={18} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }}/> Enterprise Level SLA</li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '15px' }}><CheckCircle2 size={18} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }}/> Dedicated Expert Support</li>
              </ul>
              <a href="mailto:info@qruize.com" className="btn" style={{ width: '100%', padding: '12px', textAlign: 'center', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--txt-h)', fontWeight: 600, textDecoration: 'none' }}>Contact Sales</a>
            </div>

          </div>
        </div>

      </main>

      <footer style={{ padding: '64px 24px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '48px', justifyContent: 'space-between' }}>
          
          <div style={{ maxWidth: '300px' }}>
             <div className="logo" style={{ marginBottom: '16px' }}>
              <div className="logo-text" style={{ fontSize: '20px' }}>Auto<span>Pilot</span></div>
            </div>
            <p style={{ color: 'var(--txt-muted)', fontSize: '14px', lineHeight: 1.6 }}>
              A product of Qruize Inc. End-to-end Test Automation for Business Users & QA Analysts. Accelerating testing through AI & scriptless innovation.
            </p>
          </div>

          <div>
            <h4 style={{ color: 'var(--txt-h)', fontWeight: 600, marginBottom: '16px' }}>Contact Us</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--txt-muted)', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><strong>Phone:</strong> 1-877-320-0477 (Toll Free)</li>
              <li><strong>Email:</strong> info@qruize.com</li>
              <li><strong>HQ:</strong> 2007 W Hedding St, Suite 214.<br/>San Jose, CA 95128. USA</li>
            </ul>
          </div>

        </div>
        <div style={{ maxWidth: '1200px', margin: '48px auto 0 auto', paddingTop: '24px', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--txt-muted)', fontSize: '13px' }}>
          © {new Date().getFullYear()} Qruize Inc / AutoPilot. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
