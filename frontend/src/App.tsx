import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { FaqPage, TermsPage, PrivacyPage, UserManualPage, AboutUsPage, ContactUsPage } from './pages/StaticPages';
import { OfficerDashboard } from './components/OfficerDashboard/OfficerDashboard';
import { StartupDashboard } from './components/StartupDashboard/StartupDashboard';
import { EvaluatorDashboard } from './components/EvaluatorDashboard/EvaluatorDashboard';
import { Footer } from './components/Footer';
import { Loader2, LogOut } from 'lucide-react';

type Page = 'landing' | 'login' | 'register' | 'dashboard' | 'faq' | 'terms' | 'privacy' | 'manual' | 'about' | 'contact';

// ── Dashboard Router ──────────────────────────────────────────────────────────
const DashboardRouter: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12 }}>
        <Loader2 size={36} className="animate-spin" color="#2563eb" />
        <div style={{ color: '#64748b', fontSize: 14 }}>Loading your dashboard...</div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
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
  const { currentUser, loading: authLoading, logout } = useAuth();
  const [page, setPage] = React.useState<Page>('landing');

  // Auto-redirect based on auth state
  useEffect(() => {
    if (!authLoading && currentUser && (page === 'landing' || page === 'login' || page === 'register')) {
      setPage('dashboard');
    } else if (!authLoading && !currentUser && page === 'dashboard') {
      setPage('login');
    }
  }, [authLoading, currentUser, page]);

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
        onSuccess={() => setPage('login')} // Per prompt 2, registration does not auto-login
      />
    );
  }

  // Static Pages
  if (page === 'faq') return <FaqPage onNavigate={(p) => setPage(p)} />;
  if (page === 'terms') return <TermsPage onNavigate={(p) => setPage(p)} />;
  if (page === 'privacy') return <PrivacyPage onNavigate={(p) => setPage(p)} />;
  if (page === 'manual') return <UserManualPage onNavigate={(p) => setPage(p)} />;
  if (page === 'about') return <AboutUsPage onNavigate={(p) => setPage(p)} />;
  if (page === 'contact') return <ContactUsPage onNavigate={(p) => setPage(p)} />;

  // Dashboard (authenticated)
  return (
    <div className="app-container">
      {/* RoleSelector completely removed! */}
      {/* JWT user bar + logout */}
      {currentUser && (
        <div className="auth-jwt-bar">
          <span className="auth-jwt-bar-name">
            Logged in as <strong>{currentUser.name}</strong>
            <span className={`gov-role-pill gov-role-${currentUser.role}`} style={{ marginLeft: 8 }}>
              {currentUser.role}
            </span>
          </span>
          <button
            className="auth-logout-btn"
            onClick={async () => { await logout(); setPage('landing'); }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      )}
      <main className="main-content">
        <DashboardRouter />
      </main>
      <Footer onNavigate={setPage} />
    </div>
  );
};

export const App: React.FC = () => (
  <AuthProvider>
    <AppShell />
  </AuthProvider>
);

export default App;
