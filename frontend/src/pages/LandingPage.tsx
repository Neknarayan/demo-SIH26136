import React, { useState } from 'react';
import {
  CheckCircle2,
  Building2,
  Rocket,
  Search,
  FileCheck,
  FlaskConical,
  BarChart3,
  ShieldCheck,
  TrendingUp,
  Package,
  Award,
  UserCircle2,
} from 'lucide-react';
import logoImg from '../assets/maharastraGov.jpeg';
import { Footer } from '../components/Footer';
import { HeroBannerSlider } from '../components/landing/HeroBannerSlider';
import { ActiveProblemStatements } from '../components/landing/ActiveProblemStatements';
import { PilotMilestoneTracker } from '../components/landing/PilotMilestoneTracker';
import { NoticeTicker } from '../components/landing/NoticeTicker';


interface LandingPageProps {
  onNavigate: (page: any) => void;
}

const LIFECYCLE_STEPS = [
  { icon: <Award size={22} />, label: 'Challenge', num: '01' },
  { icon: <Search size={22} />, label: 'Discovery', num: '02' },
  { icon: <FileCheck size={22} />, label: 'Eligibility', num: '03' },
  { icon: <BarChart3 size={22} />, label: 'Evaluation', num: '04' },
  { icon: <FlaskConical size={22} />, label: 'Pilot', num: '05' },
  { icon: <BarChart3 size={22} />, label: 'KPI & Evidence', num: '06' },
  { icon: <ShieldCheck size={22} />, label: 'Validation', num: '07' },
  { icon: <TrendingUp size={22} />, label: 'Scale / Stop', num: '08' },
  { icon: <Package size={22} />, label: 'Procurement Handoff', num: '09' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');

  return (
    <div className="landing-page">
      {/* ── Notice Ticker (very top — before navbar) ──────────────────────────
           Official gazette releases, deadline extensions, policy updates. */}
      <NoticeTicker />

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          {/* Logo */}
          <div className="landing-nav-logo">
            <img src={logoImg} alt="GoM Seal" className="landing-nav-emblem" />
            <div className="landing-nav-brand-text">
              <span className="landing-nav-brand-title">GoM Procurement Portal</span>
              <span className="landing-nav-brand-sub">Government of Maharashtra</span>
            </div>
          </div>

          {/* Center Links */}
          <ul className="landing-nav-links">
            <li><a href="#home" className="landing-nav-link">Home</a></li>
            <li><a href="#lifecycle" className="landing-nav-link">How It Works</a></li>
            <li><a href="#features" className="landing-nav-link">For Startups</a></li>
            <li><a href="#features" className="landing-nav-link">For Government</a></li>
          </ul>

          {/* Auth Button */}
          <button
            className="landing-nav-auth-btn"
            onClick={() => onNavigate('login')}
          >
            <UserCircle2 size={17} />
            Login / Register
          </button>
        </div>
      </nav>

      {/* ── Hero Banner Slider ────────────────────────────────────────────────
           3-slide initiative carousel acting as the main landing hero. */}
      <HeroBannerSlider id="home" autoPlayInterval={5000} />

      {/* ── Active Problem Statements ─────────────────────────────────────────
           Filterable live RFP/challenge feed with deadline countdowns. */}
      <ActiveProblemStatements onApply={() => onNavigate('login')} />

      {/* ── Pilot Milestone Tracker ───────────────────────────────────────────
           Procurement transparency: real startup progress through 4 stages. */}
      <PilotMilestoneTracker />

      {/* ── Innovation Procurement Lifecycle ───────────────────────────────── */}
      <section id="lifecycle" className="landing-lifecycle">
        <div className="landing-section-inner">
          <h2 className="landing-section-title">Innovation Procurement Lifecycle</h2>
          <p className="landing-section-sub">
            Nine structured stages from challenge discovery to government procurement
          </p>
          <div className="landing-timeline">
            {LIFECYCLE_STEPS.map((step, idx) => (
              <div key={step.num} className="landing-timeline-step">
                <div className="landing-timeline-circle">
                  <span className="landing-timeline-num">{step.num}</span>
                  <span className="landing-timeline-icon">{step.icon}</span>
                </div>
                {idx < LIFECYCLE_STEPS.length - 1 && (
                  <div className="landing-timeline-connector" />
                )}
                <span className="landing-timeline-label">{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="landing-features">
        <div className="landing-section-inner">
          <div className="landing-features-grid">
            {/* Col 1: Why Platform */}
            <div className="landing-feature-col landing-feature-col--why">
              <h2 className="landing-feature-col-title">Why This Platform?</h2>
              <p className="landing-feature-col-desc">
                India's public procurement is undergoing a transformation. The GoM
                Procurement Portal bridges the gap between government departments
                facing real operational challenges and innovative startups ready to
                pilot solutions — all in a structured, transparent, and auditable
                framework.
              </p>
              <p className="landing-feature-col-desc">
                Built for Maharashtra's Viksit Bharat mission, the platform ensures
                every rupee of pilot investment is backed by evidence-driven decision
                support.
              </p>
            </div>

            {/* Col 2: Government Officers */}
            <div className="landing-feature-col landing-feature-card">
              <div className="landing-feature-card-icon">
                <Building2 size={28} />
              </div>
              <h3 className="landing-feature-card-title">For Government Officers</h3>
              <ul className="landing-feature-list">
                <li>
                  <CheckCircle2 size={16} className="landing-check-icon" />
                  Post procurement challenges and define success KPIs
                </li>
                <li>
                  <CheckCircle2 size={16} className="landing-check-icon" />
                  Track startup pilots with real-time evidence dashboards
                </li>
                <li>
                  <CheckCircle2 size={16} className="landing-check-icon" />
                  Get explainable, rule-based procurement recommendations
                </li>
              </ul>
              <button className="landing-feature-card-btn" onClick={() => onNavigate('register')}>
                Register as Officer
              </button>
            </div>

            {/* Col 3: Startups */}
            <div className="landing-feature-col landing-feature-card">
              <div className="landing-feature-card-icon landing-feature-card-icon--orange">
                <Rocket size={28} />
              </div>
              <h3 className="landing-feature-card-title">For Startups</h3>
              <ul className="landing-feature-list">
                <li>
                  <CheckCircle2 size={16} className="landing-check-icon" />
                  Discover active government challenges and check eligibility
                </li>
                <li>
                  <CheckCircle2 size={16} className="landing-check-icon" />
                  Submit proposals and track application status in real time
                </li>
                <li>
                  <CheckCircle2 size={16} className="landing-check-icon" />
                  Pilot your solution with structured KPI monitoring
                </li>
              </ul>
              <button className="landing-feature-card-btn landing-feature-card-btn--orange" onClick={() => onNavigate('register')}>
                Register as Startup
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Subscribe / CTA strip ───────────────────────────────────────────── */}
      <section className="landing-subscribe">
        <div className="landing-section-inner landing-subscribe-inner">
          <div className="landing-subscribe-text">
            <h3>Stay Updated on New Challenges</h3>
            <p>Get notified when new government procurement challenges are published.</p>
          </div>
          <div className="landing-subscribe-form">
            <input
              type="email"
              placeholder="Enter your email address"
              className="landing-subscribe-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="landing-subscribe-btn">Subscribe</button>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};
