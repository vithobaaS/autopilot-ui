import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
  LayoutDashboard, Play, History, CalendarClock,
  PackageOpen, FlaskConical, SlidersHorizontal, Database, Globe,
  MonitorDot, Users2, Download,
  BarChart2, Eye, Share2,
  Settings, Users, ShieldCheck, KeyRound, Bell, ScrollText, Trash2, LogOut, FolderOpen, Puzzle
} from 'lucide-react';

function NavItem({ to, icon: Icon, label, active, onClick }) {
  if (onClick) {
    return (
      <button className={`nav-item${active ? ' active' : ''}`} onClick={onClick} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
        <span className="nav-icon-wrap"><Icon size={16} /></span>
        {label}
      </button>
    );
  }
  return (
    <Link to={to} className={`nav-item${active ? ' active' : ''}`}>
      <span className="nav-icon-wrap"><Icon size={16} /></span>
      {label}
    </Link>
  );
}

export default function Sidebar({ user, sidebarOpen, path }) {
  const { setShowInstall, logout } = useContext(AuthContext);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const is = (p) => path === p;

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!sidebarOpen) return null;

  return (
    <aside className="sidebar">
      <Link to="/dashboard" className="logo-link">
      <div className="sidebar-header">
          <div className="logo-text">Auto<span>Pilot</span></div>   
        </div>
      </Link>

      <nav className="sidebar-nav">
        <div className="nav-section">Dashboard</div>
        <NavItem to="/dashboard"           icon={LayoutDashboard} label="Dashboard"        active={is('/dashboard')} />

        <div className="nav-section">Executions</div>
        <NavItem to="/executions/running"  icon={Play}            label="Running"          active={is('/executions/running')} />
        <NavItem to="/executions/history"  icon={History}         label="History"          active={is('/executions/history')} />
        <NavItem to="/scheduler"           icon={CalendarClock}   label="Scheduled"        active={is('/scheduler') || is('/scheduler/create')} />

        <div className="nav-section">Test Management</div>
        <NavItem to="/test-suites"         icon={PackageOpen}     label="Suites"           active={is('/test-suites')} />
        <NavItem to="/test-cases"          icon={FlaskConical}    label="Test Cases"       active={is('/test-cases')} />
        <NavItem to="/test-components"     icon={Puzzle} label="Shared Steps"   active={is('/test-components')} />
        <NavItem to="/test-case-groups"    icon={FolderOpen}      label="Test Groups"      active={is('/test-case-groups')} />
        <NavItem to="/variables"           icon={SlidersHorizontal} label="Variables"      active={is('/variables')} />
        <NavItem to="/datasets"            icon={Database}        label="Datasets"         active={is('/datasets')} />
        <NavItem to="/environments"        icon={Globe}           label="Environments"     active={is('/environments')} />

        <div className="nav-section">Agents</div>
        <NavItem to="/agents"              icon={MonitorDot}      label="Agent Directory"  active={is('/agents')} />
        <NavItem to="/groups"              icon={Users2}          label="Agent Pools"      active={path.startsWith('/groups')} />
        <NavItem                           icon={Download}        label="Install Agent"    onClick={() => setShowInstall(true)} />

        <div className="nav-section">Reports</div>
        <NavItem to="/analytics"           icon={BarChart2}       label="Analytics"        active={is('/analytics')} />
        <NavItem to="/reports/visual"      icon={Eye}             label="Visual Regression" active={is('/reports/visual')} />
        <NavItem to="/reports/shared"      icon={Share2}          label="Shared Reports"   active={is('/reports/shared')} />

        <div className="nav-section">Administration</div>
        <NavItem to="/settings"            icon={Settings}        label="Settings"         active={is('/settings')} />
        <NavItem to="/admin/users"         icon={Users}           label="Users"            active={is('/admin/users')} />
        <NavItem to="/admin/roles"         icon={ShieldCheck}     label="Roles"            active={is('/admin/roles')} />
        <NavItem to="/admin/api-keys"      icon={KeyRound}        label="CI/CD & API Keys" active={is('/admin/api-keys')} />
        <NavItem to="/admin/notifications" icon={Bell}            label="Notifications"    active={is('/admin/notifications')} />
        <NavItem to="/admin/audit-logs"    icon={ScrollText}      label="Audit Logs"       active={is('/admin/audit-logs')} />
        <NavItem to="/admin/retention"     icon={Trash2}          label="Retention Policies" active={is('/admin/retention')} />
      </nav>

      <div className="sidebar-footer" style={{ padding: '16px 12px', position: 'relative' }}>
        <div style={{ position: 'relative' }} ref={profileRef}>
          {profileOpen && (
            <div style={{ position: 'absolute', bottom: 'calc(100% + 12px)', top: 'auto', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '6px', zIndex: 9999, boxShadow: 'var(--shadow-lg)' }}>
               <button onClick={() => { setProfileOpen(false); navigate('/settings'); }} className="profile-dropdown-item" style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt-h)', borderRadius: '4px', textAlign: 'left', fontSize: '13px' }}><Settings size={14} style={{ marginRight: 8, color: 'var(--txt-muted)' }}/> Settings</button>
               <button onClick={() => { setProfileOpen(false); setShowInstall(true); }} className="profile-dropdown-item" style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt-h)', borderRadius: '4px', textAlign: 'left', fontSize: '13px' }}><Download size={14} style={{ marginRight: 8, color: 'var(--txt-muted)' }}/> Install Agent</button>
               <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
               <button onClick={logout} className="profile-dropdown-item text-danger" style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', borderRadius: '4px', textAlign: 'left', fontSize: '13px' }}><LogOut size={14} style={{ marginRight: 8 }}/> Sign Out</button>
            </div>
          )}
          <div className="sidebar-profile-card" onClick={() => setProfileOpen(!profileOpen)} style={{ cursor: 'pointer', border: '1px solid var(--border)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)' }}>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <div className="footer-dot" style={{width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', marginRight: 10}} />
              <div className="footer-text">
                <p style={{color: 'var(--txt-h)', fontWeight: 600, fontSize: '13px', margin: 0, textTransform: 'lowercase'}}>{user?.fullName || user?.email || 'User'}</p>
                <span style={{color: 'var(--txt-muted)', fontSize: '11px', display: 'block'}}>{user?.plan ? `Plan: ${user.plan}` : 'Plan: trial'}</span>
              </div>
            </div>
            <button className="logout-btn" style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt-muted)', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '6px'}} title="Toggle Menu">
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
