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
import PreAuthAccessibilitySelector from './components/accessibility/PreAuthAccessibilitySelector';
import VoiceNavigationController from './components/accessibility/VoiceNavigationController';
import KeyboardNavigationManager from './components/accessibility/KeyboardNavigationManager';

import { authService } from './utils/auth';
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';

function AppContent() {
  const { preferences, updatePreference } = useAccessibility();
  const [user, setUser] = useState(() => {
    return authService.getCurrentUser();
  });

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showWelcome, setShowWelcome] = useState(() => {
    return preferences.showWelcome && user !== null;
  });

  // Show pre-auth accessibility selector if not configured and not logged in
  const [showPreAuthAccessibility, setShowPreAuthAccessibility] = useState(() => {
    return !preferences.hasConfigured && !user;
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
    // Reset accessibility configuration on logout so selector shows again
    updatePreference('hasConfigured', false);
    setShowPreAuthAccessibility(true);
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

  // Show pre-auth accessibility selector first
  if (showPreAuthAccessibility) {
    return (
      <PreAuthAccessibilitySelector
        onComplete={() => {
          updatePreference('hasConfigured', true);
          setShowPreAuthAccessibility(false);
        }}
      />
    );
  }

  if (!user) {
    return (
      <>
        {/* Skip to main content link */}
        <a href="#main-content" id="skip-to-main" className="skip-link">
          Skip to main content
        </a>

        <Login onLogin={handleLogin} />
        <AccessibilityAssistant />
        <VoiceNavigationController onNavigate={setCurrentPage} />
        <KeyboardNavigationManager onNavigate={setCurrentPage} />
      </>
    );
  }

  return (
    <>
      {/* Skip to main content link */}
      <a href="#main-content" id="skip-to-main" className="skip-link">
        Skip to main content
      </a>

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
      <VoiceNavigationController onNavigate={setCurrentPage} />
      <KeyboardNavigationManager onNavigate={setCurrentPage} />
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
