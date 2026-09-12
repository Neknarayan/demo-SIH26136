/**
 * ActiveProblemStatements.tsx — Filterable live challenges & RFP feed
 *
 * Shows active government procurement challenges with deadline countdowns.
 * Filters: Department, Stage, Grant Budget (range).
 * Each card: department badge, title, deadline countdown, grant amount, CTA.
 */
import React, { useState, useMemo } from 'react';
import {
  Filter,
  Clock,
  IndianRupee,
  Tag,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
export type ChallengeStage = 'Open for Bids' | 'Under Review' | 'Closed';

export interface ProblemStatement {
  id: string;
  department: string;
  title: string;
  description: string;
  stage: ChallengeStage;
  /** ISO date string */
  deadline: string;
  /** e.g. "₹25L – ₹50L" */
  grantBudget: string;
  /** Numeric upper bound in lakhs for range filtering */
  grantMaxLakh: number;
  dpiitRequired: boolean;
  rfpLink: string;
}

// ── Static demo data ─────────────────────────────────────────────────────────
const DEMO_CHALLENGES: ProblemStatement[] = [
  {
    id: 'PS-001',
    department: 'Urban Development',
    title: 'Smart Water Monitoring for Municipal Networks',
    description:
      'Deploy IoT sensor telemetry to detect non-revenue water loss and monitor pipeline pressure across urban distribution grids.',
    stage: 'Open for Bids',
    deadline: '2026-10-15',
    grantBudget: '₹25L – ₹50L',
    grantMaxLakh: 50,
    dpiitRequired: true,
    rfpLink: '#rfp-ps001',
  },
  {
    id: 'PS-002',
    department: 'Agriculture',
    title: 'AI-Driven Crop Disease Early Warning System',
    description:
      'Satellite + ground-sensor fusion model to provide district-level crop disease advisories 14 days in advance.',
    stage: 'Open for Bids',
    deadline: '2026-10-28',
    grantBudget: '₹10L – ₹25L',
    grantMaxLakh: 25,
    dpiitRequired: false,
    rfpLink: '#rfp-ps002',
  },
  {
    id: 'PS-003',
    department: 'Health',
    title: 'Rural Telemedicine & Diagnostic Kiosk Network',
    description:
      'Solar-powered kiosks with AI-assisted diagnostics for primary health indicators in sub-district health centres.',
    stage: 'Under Review',
    deadline: '2026-09-30',
    grantBudget: '₹50L – ₹1Cr',
    grantMaxLakh: 100,
    dpiitRequired: true,
    rfpLink: '#rfp-ps003',
  },
  {
    id: 'PS-004',
    department: 'Urban Development',
    title: 'Automated Road Distress and Pothole Mapping',
    description:
      'Edge-AI computer vision on municipal vehicles to classify road degradations and generate geo-tagged maintenance alerts.',
    stage: 'Open for Bids',
    deadline: '2026-11-10',
    grantBudget: '₹10L – ₹25L',
    grantMaxLakh: 25,
    dpiitRequired: false,
    rfpLink: '#rfp-ps004',
  },
  {
    id: 'PS-005',
    department: 'Agriculture',
    title: 'Soil Moisture & Micronutrient Telemetry Platform',
    description:
      'Low-cost IoT sensors reporting real-time soil health parameters to a state agriculture cloud dashboard.',
    stage: 'Under Review',
    deadline: '2026-09-25',
    grantBudget: '₹10L – ₹25L',
    grantMaxLakh: 25,
    dpiitRequired: false,
    rfpLink: '#rfp-ps005',
  },
  {
    id: 'PS-006',
    department: 'Health',
    title: 'Cold Chain Integrity Monitoring for Vaccine Logistics',
    description:
      'Blockchain-anchored temperature and tamper-detection sensors across the state vaccine cold chain.',
    stage: 'Open for Bids',
    deadline: '2026-10-20',
    grantBudget: '₹25L – ₹50L',
    grantMaxLakh: 50,
    dpiitRequired: true,
    rfpLink: '#rfp-ps006',
  },
];

const ALL_DEPARTMENTS = ['All', ...Array.from(new Set(DEMO_CHALLENGES.map((c) => c.department)))];
const ALL_STAGES: ('All' | ChallengeStage)[] = ['All', 'Open for Bids', 'Under Review'];
const BUDGET_BANDS = [
  { label: 'All Budgets', max: Infinity },
  { label: 'Up to ₹25L', max: 25 },
  { label: 'Up to ₹50L', max: 50 },
  { label: 'Above ₹50L', max: Infinity, min: 51 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysUntil(isoDate: string): number {
  const now = new Date();
  const target = new Date(isoDate);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function DeadlineBadge({ deadline }: { deadline: string }) {
  const days = daysUntil(deadline);
  const urgent = days <= 7;
  const expired = days < 0;

  if (expired) {
    return <span className="aps-deadline aps-deadline--expired"><AlertCircle size={12} /> Closed</span>;
  }
  return (
    <span className={`aps-deadline ${urgent ? 'aps-deadline--urgent' : ''}`}>
      <Clock size={12} />
      {urgent ? `${days}d left!` : `${days} days left`}
    </span>
  );
}

const STAGE_COLORS: Record<ChallengeStage, string> = {
  'Open for Bids': 'aps-stage--open',
  'Under Review': 'aps-stage--review',
  'Closed': 'aps-stage--closed',
};

// ── Component ─────────────────────────────────────────────────────────────────
interface ActiveProblemStatementsProps {
  onApply?: (ps: ProblemStatement) => void;
}

export const ActiveProblemStatements: React.FC<ActiveProblemStatementsProps> = ({ onApply }) => {
  const [dept, setDept] = useState('All');
  const [stage, setStage] = useState<'All' | ChallengeStage>('All');
  const [budgetIdx, setBudgetIdx] = useState(0);

  const filtered = useMemo(() => {
    const band = BUDGET_BANDS[budgetIdx];
    return DEMO_CHALLENGES.filter((c) => {
      if (dept !== 'All' && c.department !== dept) return false;
      if (stage !== 'All' && c.stage !== stage) return false;
      if (c.grantMaxLakh > band.max) return false;
      if ('min' in band && c.grantMaxLakh < (band as { min: number }).min) return false;
      return true;
    });
  }, [dept, stage, budgetIdx]);

  return (
    <section id="problems" className="aps-root">
      <div className="landing-section-inner">
        <h2 className="landing-section-title">Active Challenges &amp; RFPs</h2>
        <p className="landing-section-sub">
          Live procurement challenges open for startup bids across Maharashtra departments
        </p>

        {/* Filters */}
        <div className="aps-filters">
          <div className="aps-filter-group">
            <Filter size={14} className="aps-filter-icon" />
            <select
              className="aps-select"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              aria-label="Filter by department"
            >
              {ALL_DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="aps-filter-group">
            <select
              className="aps-select"
              value={stage}
              onChange={(e) => setStage(e.target.value as typeof stage)}
              aria-label="Filter by stage"
            >
              {ALL_STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="aps-filter-group">
            <IndianRupee size={14} className="aps-filter-icon" />
            <select
              className="aps-select"
              value={budgetIdx}
              onChange={(e) => setBudgetIdx(Number(e.target.value))}
              aria-label="Filter by grant budget"
            >
              {BUDGET_BANDS.map((b, i) => (
                <option key={i} value={i}>{b.label}</option>
              ))}
            </select>
          </div>

          <span className="aps-count">{filtered.length} challenge{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="aps-empty">
            <AlertCircle size={32} />
            <p>No challenges match the current filters.</p>
          </div>
        ) : (
          <div className="aps-grid">
            {filtered.map((ps) => (
              <article key={ps.id} className="aps-card">
                {/* Header row */}
                <div className="aps-card-header">
                  <span className="aps-dept-badge">
                    <Tag size={11} /> {ps.department}
                  </span>
                  <span className={`aps-stage ${STAGE_COLORS[ps.stage]}`}>{ps.stage}</span>
                </div>

                {/* Title & description */}
                <h3 className="aps-card-title">{ps.title}</h3>
                <p className="aps-card-desc">{ps.description}</p>

                {/* Meta row */}
                <div className="aps-card-meta">
                  <div className="aps-meta-item">
                    <IndianRupee size={13} />
                    <span>Grant: <strong>{ps.grantBudget}</strong></span>
                  </div>
                  <DeadlineBadge deadline={ps.deadline} />
                  {ps.dpiitRequired && (
                    <span className="aps-dpiit-badge">
                      <CheckCircle2 size={11} /> DPIIT Required
                    </span>
                  )}
                </div>

                {/* CTA */}
                <a
                  href={ps.rfpLink}
                  className="aps-cta-btn"
                  onClick={(e) => { if (onApply) { e.preventDefault(); onApply(ps); } }}
                >
                  Apply / View RFP <ArrowRight size={14} />
                </a>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
