import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Loader2, UserPlus, Building2, Rocket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/maharastraGov.jpeg';

interface RegisterPageProps {
  onNavigate: (page: 'landing' | 'login') => void;
  onSuccess: () => void;
}

type RoleOption = 'startup' | 'gov_officer';

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate, onSuccess }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState<RoleOption>('startup');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Startup profile fields
  const [sector, setSector] = useState('');
  const [dpiitStatus, setDpiitStatus] = useState(false);
  const [profileText, setProfileText] = useState('');
  
  const [isEvaluator, setIsEvaluator] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    
    if (role === 'startup') {
      if (!sector.trim() || !profileText.trim()) {
        setError('Please fill in all startup profile fields.');
        return;
      }
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const actualRole = role === 'gov_officer' && isEvaluator ? 'evaluator' : role;
      const payload: any = { name, email, password, role: actualRole };
      if (role === 'startup') {
        payload.startup_profile = {
          sector,
          dpiit_status: dpiitStatus,
          profile_text: profileText
        };
      }
      await register(payload);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        {/* Header */}
        <div className="auth-card-header">
          <img src={logoImg} alt="GoM Seal" className="auth-logo" />
          <h1 className="auth-title">Create Your Account</h1>
          <p className="auth-subtitle">Join the GoM Procurement Portal</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="auth-error-banner" role="alert">
            {error}
          </div>
        )}

        {/* Role Toggle */}
        <div className="auth-role-toggle">
          <button
            type="button"
            className={`auth-role-btn ${role === 'startup' ? 'active' : ''}`}
            onClick={() => setRole('startup')}
          >
            <Rocket size={16} /> Startup
          </button>
          <button
            type="button"
            className={`auth-role-btn ${role === 'gov_officer' ? 'active' : ''}`}
            onClick={() => setRole('gov_officer')}
          >
            <Building2 size={16} /> Government Dept
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-field">
            <label htmlFor="reg-name" className="auth-label">Full Name</label>
            <div className="auth-input-wrapper">
              <User size={16} className="auth-input-icon" />
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                required
                className="auth-input"
                placeholder="Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="reg-email" className="auth-label">Email Address</label>
            <div className="auth-input-wrapper">
              <Mail size={16} className="auth-input-icon" />
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                required
                className="auth-input"
                placeholder="founder@startup.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="reg-password" className="auth-label">Password</label>
            <div className="auth-input-wrapper">
              <Lock size={16} className="auth-input-icon" />
              <input
                id="reg-password"
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={8}
                className="auth-input auth-input--padded-right"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="auth-toggle-pass"
                onClick={() => setShowPass((p) => !p)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {role === 'startup' && (
            <div className="auth-startup-fields">
              <div className="auth-field">
                <label htmlFor="reg-sector" className="auth-label">Sector</label>
                <input
                  id="reg-sector"
                  type="text"
                  required
                  className="auth-input"
                  placeholder="e.g. Agritech, FinTech, EdTech"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  style={{ paddingLeft: '12px' }}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="reg-profile-text" className="auth-label">Profile Text</label>
                <textarea
                  id="reg-profile-text"
                  required
                  className="auth-input"
                  placeholder="Describe your startup..."
                  value={profileText}
                  onChange={(e) => setProfileText(e.target.value)}
                  style={{ paddingLeft: '12px', minHeight: '60px', paddingTop: '8px' }}
                />
              </div>

              <div className="auth-field" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <input
                  id="reg-dpiit"
                  type="checkbox"
                  checked={dpiitStatus}
                  onChange={(e) => setDpiitStatus(e.target.checked)}
                />
                <label htmlFor="reg-dpiit" className="auth-label" style={{ marginBottom: 0 }}>
                  DPIIT Recognized Startup
                </label>
              </div>
            </div>
          )}
          
          {role === 'gov_officer' && (
            <div className="auth-field" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', padding: '12px 0' }}>
              <input
                id="reg-evaluator"
                type="checkbox"
                checked={isEvaluator}
                onChange={(e) => setIsEvaluator(e.target.checked)}
              />
              <label htmlFor="reg-evaluator" className="auth-label" style={{ marginBottom: 0 }}>
                Register as Technical Evaluator (instead of Officer)
              </label>
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Creating Account…
              </>
            ) : (
              <>
                <UserPlus size={16} /> Create Account
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-links">
          <span>Already have an account?</span>
          <button className="auth-link-btn" onClick={() => onNavigate('login')}>
            Sign In
          </button>
        </div>
        <div className="auth-footer-links" style={{ marginTop: 4 }}>
          <button className="auth-link-btn auth-link-btn--muted" onClick={() => onNavigate('landing')}>
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
