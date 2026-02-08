import { useState } from 'react';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; // Will implement next
import Documents from './pages/Documents'; // Will implement
import Meetings from './pages/Meetings'; // Will implement
import Projects from './pages/Projects'; // Will implement
import Settings from './pages/Settings';

import { authService } from './utils/auth';

function App() {
  // Initialize user from authService
  const [user, setUser] = useState(() => {
    return authService.getCurrentUser();
  });

  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogin = (userData) => {
    setUser(userData);
    // authService.login/register already handles storage, but if we just receive user object from Login component,
    // we might assume Login component did the storage work or we trust state.
    // However, for consistency, authService handles persistence.
    setCurrentPage('dashboard');
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
    <Layout
      activePage={currentPage}
      onNavigate={setCurrentPage}
      user={user}
      onLogout={handleLogout}
    >
      {renderPage()}
    </Layout>
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
