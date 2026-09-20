import React from 'react';
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
import logoImg from '../assets/maharashtraGov.jpeg';
import { Footer } from '../components/Footer';
import { HeroBannerSlider } from '../components/landing/HeroBannerSlider';
import { ActiveProblemStatements } from '../components/landing/ActiveProblemStatements';


interface LandingPageProps {
  onNavigate: (page: any) => void;
}

const LIFECYCLE_STEPS = [
  { icon: <Award size={22} />, label: 'Challenge', num: '01', desc: "Government departments utilize standardized templates to publish outcome-based problem statements rather than traditional, rigid tenders.", color: '#3b82f6' },
  { icon: <Search size={22} />, label: 'Discovery', num: '02', desc: "An AI-powered matching engine intelligently automates the discovery process by connecting government challenges with relevant startups.", color: '#8b5cf6' },
  { icon: <FileCheck size={22} />, label: 'Eligibility', num: '03', desc: "Seamless DPIIT integration automatically verifies startup identity and checks eligibility, removing traditional prior-turnover barriers.", color: '#10b981' },
  { icon: <BarChart3 size={22} />, label: 'Evaluation', num: '04', desc: "Expert reviews objectively assess the startup bids and proposals to select the most promising candidates for real-world testing.", color: '#f59e0b' },
  { icon: <FlaskConical size={22} />, label: 'Pilot', num: '05', desc: "Startups deploy their innovative solutions through low-risk, capped-value sandbox orders supported by milestone-based payment terms.", color: '#ef4444' },
  { icon: <BarChart3 size={22} />, label: 'KPI & Evidence', num: '06', desc: "Project progress is continuously documented through a single, real-time dashboard that monitors system activity, milestones, and key performance indicators.", color: '#06b6d4' },
  { icon: <ShieldCheck size={22} />, label: 'Validation', num: '07', desc: "Independent evaluators objectively assess the collected evidence and validate pilot KPIs to confirm the solution's readiness for scale-up.", color: '#84cc16' },
  { icon: <TrendingUp size={22} />, label: 'Scale / Stop', num: '08', desc: "Based on validated outcomes, government departments make a data-driven decision to either approve the solution for wider deployment or conclude the pilot.", color: '#6366f1' },
  { icon: <Package size={22} />, label: 'Procurement Handoff', num: '09', desc: "Successful, validated solutions are seamlessly transitioned to the GeM portal for official execution and multi-department rollout.", color: '#d946ef' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {

  return (
    <div className="landing-page">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
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

      {/* ── Innovation Procurement Lifecycle ───────────────────────────────── */}
      <section id="lifecycle" className="landing-lifecycle">
        <div className="landing-section-inner">
          <h2 className="landing-section-title">Innovation Procurement Lifecycle</h2>
          <p className="landing-section-sub">
            Nine structured stages from challenge discovery to government procurement
          </p>
          <div className="landing-timeline">
            {LIFECYCLE_STEPS.map((step, idx) => (
              <div key={step.num} className="landing-timeline-step" style={{ '--timeline-color': step.color } as React.CSSProperties}>
                <div className="landing-timeline-circle">
                  <span className="landing-timeline-num">{step.num}</span>
                  <span className="landing-timeline-icon">{step.icon}</span>
                </div>
                {idx < LIFECYCLE_STEPS.length - 1 && (
                  <div className="landing-timeline-connector" style={{ background: `linear-gradient(to right, ${step.color} 0%, ${LIFECYCLE_STEPS[idx+1].color} 100%)` }} />
                )}
                <span className="landing-timeline-label">{step.label}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '50px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '850px', marginLeft: 'auto', marginRight: 'auto' }}>
            {LIFECYCLE_STEPS.map((step) => (
              <div key={`desc-${step.num}`} style={{ padding: '24px', backgroundColor: '#f8fafc', borderRadius: '12px', borderLeft: `5px solid ${step.color}`, borderTop: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.2rem', color: step.color, marginTop: 0, marginBottom: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ backgroundColor: step.color, color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>{step.num}</span>
                  {step.label}
                </h3>
                <p style={{ color: '#334155', lineHeight: 1.6, fontSize: '1rem', margin: 0 }}>
                  {step.desc}
                </p>
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
              <div style={{ marginTop: 'auto', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                Note: Officer accounts are provisioned by Department Admins.
              </div>
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



      <Footer onNavigate={onNavigate} />
    </div>
  );
};
