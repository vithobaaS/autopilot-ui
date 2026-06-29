import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, Settings, Download, Link2, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Header({ user, profileOpen, setProfileOpen, setSidebarOpen, setShowOnboarding, setShowPairing, logout }) {
  const navigate = useNavigate();
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="top-header">
      <button className="menu-toggle" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle sidebar">
        <Menu size={18} />
      </button>
      <div className="header-right">
        {/* Theme Toggle */}
        <button className="theme-toggle-btn" onClick={toggleTheme} title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          {resolvedTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

      </div>
    </header>
  );
}
