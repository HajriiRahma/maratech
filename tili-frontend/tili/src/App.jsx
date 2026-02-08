import { useState } from 'react';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Meetings from './pages/Meetings';
import Projects from './pages/Projects';
import Settings from './pages/Settings';
import WelcomeModal from './components/accessibility/WelcomeModal';
import AccessibilityAssistant from './components/accessibility/AccessibilityAssistant';

import { authService } from './utils/auth';
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';

function AppContent() {
  const { preferences } = useAccessibility();
  const [user, setUser] = useState(() => {
    return authService.getCurrentUser();
  });

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showWelcome, setShowWelcome] = useState(() => {
    return preferences.showWelcome && user !== null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
    // Show welcome modal on first login
    if (preferences.showWelcome) {
      setShowWelcome(true);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentPage('dashboard');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'documents': return <Documents />;
      case 'meetings': return <Meetings />;
      case 'projects': return <Projects />;
      case 'settings': return <Settings user={user} />;
      default: return <Dashboard />;
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      {showWelcome && <WelcomeModal onComplete={() => setShowWelcome(false)} />}

      <Layout
        activePage={currentPage}
        onNavigate={setCurrentPage}
        user={user}
        onLogout={handleLogout}
      >
        {renderPage()}
      </Layout>

      <AccessibilityAssistant />
    </>
  );
}

function App() {
  return (
    <AccessibilityProvider>
      <AppContent />
    </AccessibilityProvider>
  );
}

// Temporary placeholder component to verify layout
const PlaceholderPage = ({ name }) => (
  <div style={{ padding: '20px' }}>
    <h2>{name.charAt(0).toUpperCase() + name.slice(1)}</h2>
    <p>This page is currently being built.</p>
  </div>
);

export default App;
