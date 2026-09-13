import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RoleSelector } from './components/RoleSelector';
import { OfficerDashboard } from './components/OfficerDashboard/OfficerDashboard';
import { StartupDashboard } from './components/StartupDashboard/StartupDashboard';
import { EvaluatorDashboard } from './components/EvaluatorDashboard/EvaluatorDashboard';
import { Footer } from './components/Footer';
import { Loader2, LogOut } from 'lucide-react';

type Page = 'landing' | 'login' | 'register' | 'dashboard';

// ── Dashboard Router (unchanged logic) ───────────────────────────────────────
const DashboardRouter: React.FC = () => {
  const { currentUser, loading, refreshUsers } = useAuth();

  useEffect(() => {
    refreshUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12 }}>
        <Loader2 size={36} className="animate-spin" color="#2563eb" />
        <div style={{ color: '#64748b', fontSize: 14 }}>Connecting to SIH Platform backend &amp; PostgreSQL...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="empty-state" style={{ margin: '40px auto', maxWidth: 480 }}>
        <div className="empty-state-title">No Active User Selected</div>
        <div className="empty-state-sub">Please select a seeded persona from the top navigation bar.</div>
      </div>
    );
  }

  switch (currentUser.role) {
    case 'officer':
      return <OfficerDashboard key={currentUser.id} />;
    case 'startup':
      return <StartupDashboard key={currentUser.id} />;
    case 'evaluator':
      return <EvaluatorDashboard key={currentUser.id} />;
    default:
      return <div>Unknown role: {currentUser.role}</div>;
  }
};

// ── App Shell ────────────────────────────────────────────────────────────────
const AppShell: React.FC = () => {
  const { jwtUser, authLoading, logout } = useAuth();
  const [page, setPage] = React.useState<Page>('landing');

  // Auto-redirect based on auth state
  useEffect(() => {
    if (!authLoading && jwtUser && (page === 'landing' || page === 'login' || page === 'register')) {
      setPage('dashboard');
    } else if (!authLoading && !jwtUser && page === 'dashboard') {
      setPage('login');
    }
  }, [authLoading, jwtUser, page]);

  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Loader2 size={36} className="animate-spin" color="#2563eb" />
      </div>
    );
  }

  // Landing
  if (page === 'landing') {
    return (
      <LandingPage
        onNavigate={(p) => setPage(p)}
      />
    );
  }

  // Login
  if (page === 'login') {
    return (
      <LoginPage
        onNavigate={(p) => setPage(p)}
        onSuccess={() => setPage('dashboard')}
      />
    );
  }

  // Register
  if (page === 'register') {
    return (
      <RegisterPage
        onNavigate={(p) => setPage(p)}
        onSuccess={() => setPage('dashboard')}
      />
    );
  }

  // Dashboard (authenticated)
  return (
    <div className="app-container">
      <RoleSelector />
      {/* JWT user bar + logout */}
      {jwtUser && (
        <div className="auth-jwt-bar">
          <span className="auth-jwt-bar-name">
            Logged in as <strong>{jwtUser.name}</strong>
            <span className={`gov-role-pill gov-role-${jwtUser.role}`} style={{ marginLeft: 8 }}>
              {jwtUser.role}
            </span>
          </span>
          <button
            className="auth-logout-btn"
            onClick={() => { logout(); setPage('landing'); }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      )}
      <main className="main-content">
        <DashboardRouter />
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => (
  <AuthProvider>
    <AppShell />
  </AuthProvider>
);

export default App;
