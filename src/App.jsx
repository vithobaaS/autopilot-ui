import { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css';

import { AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { getUser } from './api/apiClient';
import { ToastContainer } from './components/common/ToastContainer';
import { SplashScreen } from './components/common/SplashScreen';
import { PrivateRoute } from './components/common/PrivateRoute';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { OnboardingWizard } from './components/modals/OnboardingWizard';
import { PairAgentModal } from './components/modals/PairAgentModal';
import { InstallAgentModal } from './components/modals/InstallAgentModal';
import { SessionExpiredModal } from './components/modals/SessionExpiredModal';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';
import DashboardView from './pages/dashboard/DashboardView';
import TestCaseListView from './pages/testcase/TestCaseListView';
import TestCaseFormView from './pages/testcase/TestCaseFormView';
import TestStudioView from './pages/testcase/TestStudioView';
import TestCaseGroupListView from './pages/testcasegroup/TestCaseGroupListView';
import TestCaseGroupFormView from './pages/testcasegroup/TestCaseGroupFormView';
import TestSuiteListView from './pages/testsuite/TestSuiteListView';
import TestSuiteFormView from './pages/testsuite/TestSuiteFormView';
import SchedulerListView from './pages/scheduler/SchedulerListView';
import SchedulerFormView from './pages/scheduler/SchedulerFormView';
import ExecutionDetailsView from './pages/execution/ExecutionDetailsView';
import GroupsListView from './pages/agents/GroupsListView';
import CreateGroupView from './pages/agents/CreateGroupView';
import GroupDetailsView from './pages/agents/GroupDetailsView';
import AgentListView from './pages/agents/AgentListView';
import SettingsView from './pages/settings/SettingsView';
import ApiKeysView from './pages/admin/ApiKeysView';
import AuditLogsView from './pages/admin/AuditLogsView';
import VariablesView from './pages/variables/VariablesView';
import EnvironmentsView from './pages/environments/EnvironmentsView';
import AnalyticsView from './pages/analytics/AnalyticsView';
import ExecutionListView from './pages/execution/ExecutionListView';
import DatasetsView from './pages/datasets/DatasetsView';
import TestComponentListView from './pages/testcase/TestComponentListView';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [user, setUser] = useState(getUser);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [showPairing, setShowPairing] = useState(false);
  const [showSplash, setShowSplash] = useState(() => {
    const should = sessionStorage.getItem('ap_show_splash') === '1';
    if (should) sessionStorage.removeItem('ap_show_splash');
    return should;
  });

  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();

  const closeOnboarding = () => {
    setShowOnboarding(false);
    if (user) {
      localStorage.setItem(`onboarding_dismissed_${user.email}`, 'true');
    }
  };

  const logout = () => {
    localStorage.removeItem('ap_token');
    localStorage.removeItem('ap_user');
    localStorage.removeItem('onboarding_dismissed');
    setUser(null);
    navigate('/login', { replace: true });
    setTimeout(() => window.location.reload(), 50);
  };

  // Public routes — don't show the shell
  if (path === '/login' || path === '/register' || path === '/change-password' || path === '/') {
    return (
      <ThemeProvider>
      <AuthContext.Provider value={{ user, setUser, setShowSplash }}>
        <Routes>
          <Route path="/"         element={<LandingPage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Routes>
        <ToastContainer />
      </AuthContext.Provider>
      </ThemeProvider>
    );
  }

  if (path.startsWith('/test-cases/studio')) {
    return (
      <ThemeProvider>
      <AuthContext.Provider value={{ user, setUser, logout, setShowOnboarding, setShowSplash }}>
        {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
        <Routes>
          <Route path="/test-cases/studio/create"   element={<PrivateRoute><TestStudioView /></PrivateRoute>} />
          <Route path="/test-cases/studio/edit/:id" element={<PrivateRoute><TestStudioView /></PrivateRoute>} />
        </Routes>
        <SessionExpiredModal />
        <ToastContainer />
      </AuthContext.Provider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
    <AuthContext.Provider value={{ user, setUser, logout, setShowOnboarding, setShowInstall, setShowSplash }}>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      <div className="app-layout">
      <Sidebar user={user} sidebarOpen={sidebarOpen} path={path} />

      <main className="main-content">
        <Header
          user={user}
          profileOpen={profileOpen}
          setProfileOpen={setProfileOpen}
          setSidebarOpen={setSidebarOpen}
          setShowOnboarding={setShowOnboarding}
          setShowInstall={setShowInstall}
          setShowPairing={setShowPairing}
          logout={logout}
        />

        <div className="page-container">
          <Routes>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/"                        element={<PrivateRoute><Navigate to="/dashboard" replace /></PrivateRoute>} />
            <Route path="/dashboard"               element={<PrivateRoute><DashboardView /></PrivateRoute>} />
            <Route path="/analytics"               element={<PrivateRoute><AnalyticsView /></PrivateRoute>} />
            <Route path="/scheduler"               element={<PrivateRoute><SchedulerListView /></PrivateRoute>} />
            <Route path="/scheduler/create"        element={<PrivateRoute><SchedulerFormView /></PrivateRoute>} />
            <Route path="/scheduler/edit/:id"      element={<PrivateRoute><SchedulerFormView /></PrivateRoute>} />
            <Route path="/executions/running"      element={<PrivateRoute><ExecutionListView type="running" /></PrivateRoute>} />
            <Route path="/executions/history"      element={<PrivateRoute><ExecutionListView type="history" /></PrivateRoute>} />
            <Route path="/executions/:id"          element={<PrivateRoute><ExecutionDetailsView /></PrivateRoute>} />
            <Route path="/agents"                  element={<PrivateRoute><AgentListView /></PrivateRoute>} />
            <Route path="/groups"                  element={<PrivateRoute><GroupsListView /></PrivateRoute>} />
            <Route path="/groups/create"           element={<PrivateRoute><CreateGroupView /></PrivateRoute>} />
            <Route path="/groups/:id"              element={<PrivateRoute><GroupDetailsView /></PrivateRoute>} />
            <Route path="/test-cases"              element={<PrivateRoute><TestCaseListView /></PrivateRoute>} />
            <Route path="/test-components"         element={<PrivateRoute><TestComponentListView /></PrivateRoute>} />
            <Route path="/test-cases/create"       element={<PrivateRoute><TestCaseFormView /></PrivateRoute>} />
            <Route path="/test-cases/edit/:id"     element={<PrivateRoute><TestCaseFormView /></PrivateRoute>} />
            <Route path="/test-cases/studio/create"    element={<PrivateRoute><TestStudioView /></PrivateRoute>} />
            <Route path="/test-cases/studio/edit/:id"  element={<PrivateRoute><TestStudioView /></PrivateRoute>} />
            <Route path="/test-case-groups"        element={<PrivateRoute><TestCaseGroupListView /></PrivateRoute>} />
            <Route path="/test-case-groups/create" element={<PrivateRoute><TestCaseGroupFormView /></PrivateRoute>} />
            <Route path="/test-case-groups/edit/:id" element={<PrivateRoute><TestCaseGroupFormView /></PrivateRoute>} />
            <Route path="/test-suites"             element={<PrivateRoute><TestSuiteListView /></PrivateRoute>} />
            <Route path="/test-suites/create"      element={<PrivateRoute><TestSuiteFormView /></PrivateRoute>} />
            <Route path="/test-suites/edit/:id"    element={<PrivateRoute><TestSuiteFormView /></PrivateRoute>} />
            <Route path="/settings"                element={<PrivateRoute><SettingsView /></PrivateRoute>} />
            <Route path="/admin/api-keys"          element={<PrivateRoute><ApiKeysView /></PrivateRoute>} />
            <Route path="/admin/audit-logs"        element={<PrivateRoute><AuditLogsView /></PrivateRoute>} />
            <Route path="/variables"               element={<PrivateRoute><VariablesView /></PrivateRoute>} />
            <Route path="/environments"            element={<PrivateRoute><EnvironmentsView /></PrivateRoute>} />
            <Route path="/datasets"                element={<PrivateRoute><DatasetsView /></PrivateRoute>} />
            <Route path="*"                        element={<PrivateRoute><Navigate to="/dashboard" replace /></PrivateRoute>} />
          </Routes>
        </div>
      </main>

      {showOnboarding && <OnboardingWizard onClose={closeOnboarding} />}
      {showInstall && <InstallAgentModal onClose={() => setShowInstall(false)} />}
      {showPairing && <PairAgentModal onClose={() => setShowPairing(false)} />}
      <SessionExpiredModal />

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <div className="lightbox-close" onClick={() => setLightbox(null)}>✕</div>
          <img src={lightbox} className="lightbox-img" alt="Screenshot" />
        </div>
      )}
      <ToastContainer />
    </div>
    </AuthContext.Provider>
    </ThemeProvider>
  );
}
