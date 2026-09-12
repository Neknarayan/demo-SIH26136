/**
 * PilotMilestoneTracker.tsx — Procurement transparency module
 *
 * Dashboard-style component showing real-world progress of onboarded startups
 * through 4 procurement stages:
 *   Sandbox Testing -> Field Pilot -> Departmental Clearance -> Commercial Scaling
 *
 * Startup logo images use real gov4/gov5/gov6 assets as stand-ins.
 */
import React, { useState } from 'react';
import {
  FlaskConical,
  MapPin,
  ClipboardCheck,
  TrendingUp,
  ShieldCheck,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import gov4 from '../../assets/gov4.jpeg';
import gov5 from '../../assets/gov5.jpeg';
import gov6 from '../../assets/gov6.jpeg';

// ── Types ────────────────────────────────────────────────────────────────────
export type PilotStage =
  | 'Sandbox Testing'
  | 'Field Pilot'
  | 'Departmental Clearance'
  | 'Commercial Scaling';

export type VerificationBadge = 'DPIIT Certified' | 'State Verified' | 'ISO 27001' | 'GEM Listed';

export interface PilotEntry {
  id: string;
  startupName: string;
  logoSrc: string;
  department: string;
  challengeTitle: string;
  currentStage: PilotStage;
  progressPct: number;
  badges: VerificationBadge[];
  startDate: string;
  expectedCompletion: string;
  highlights: string[];
}

// ── Stage metadata ────────────────────────────────────────────────────────────
const STAGES: { key: PilotStage; icon: React.ReactNode; color: string }[] = [
  { key: 'Sandbox Testing',        icon: <FlaskConical size={16} />,   color: '#6366f1' },
  { key: 'Field Pilot',            icon: <MapPin size={16} />,         color: '#0ea5e9' },
  { key: 'Departmental Clearance', icon: <ClipboardCheck size={16} />, color: '#f59e0b' },
  { key: 'Commercial Scaling',     icon: <TrendingUp size={16} />,     color: '#16a34a' },
];

function stageIndex(s: PilotStage): number {
  return STAGES.findIndex((st) => st.key === s);
}

// ── Demo data ────────────────────────────────────────────────────────────────
const DEMO_PILOTS: PilotEntry[] = [
  {
    id: 'PLT-001',
    startupName: 'AquaSense Technologies',
    logoSrc: gov4,
    department: 'Urban Development',
    challengeTitle: 'Smart Water Monitoring for Municipal Networks',
    currentStage: 'Field Pilot',
    progressPct: 52,
    badges: ['DPIIT Certified', 'State Verified'],
    startDate: '2026-04-01',
    expectedCompletion: '2026-12-31',
    highlights: [
      '32 IoT sensors deployed across Pune Zone 3',
      'NRW reduced by 8% in sandbox phase',
      'SCADA integration complete',
    ],
  },
  {
    id: 'PLT-002',
    startupName: 'EcoUrban Systems',
    logoSrc: gov5,
    department: 'Urban Development',
    challengeTitle: 'Automated Road Distress and Pothole Mapping',
    currentStage: 'Sandbox Testing',
    progressPct: 18,
    badges: ['DPIIT Certified'],
    startDate: '2026-07-15',
    expectedCompletion: '2027-03-31',
    highlights: [
      'Model trained on 12,000 Maharashtra road images',
      'Edge device approved for BEST bus fleet',
      'Night-time recall accuracy: 91%',
    ],
  },
  {
    id: 'PLT-003',
    startupName: 'HydroVision Labs',
    logoSrc: gov6,
    department: 'Water Resources',
    challengeTitle: 'Canal Turbidity & Open-Channel Flow Monitoring',
    currentStage: 'Departmental Clearance',
    progressPct: 78,
    badges: ['State Verified', 'GEM Listed'],
    startDate: '2026-01-20',
    expectedCompletion: '2026-10-31',
    highlights: [
      'Autonomous cameras installed on 14 canal nodes',
      'Turbidity detection accuracy: 96.2%',
      'GEM onboarding completed — awaiting final tender',
    ],
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────
const BADGE_ICONS: Record<VerificationBadge, React.ReactNode> = {
  'DPIIT Certified': <BadgeCheck size={12} />,
  'State Verified':  <ShieldCheck size={12} />,
  'ISO 27001':       <ShieldCheck size={12} />,
  'GEM Listed':      <BadgeCheck size={12} />,
};

function BadgePill({ badge }: { badge: VerificationBadge }) {
  const cls =
    badge === 'DPIIT Certified' ? 'pmt-badge--dpiit' :
    badge === 'State Verified'  ? 'pmt-badge--state' :
    badge === 'GEM Listed'      ? 'pmt-badge--gem'   : 'pmt-badge--iso';
  return (
    <span className={`pmt-badge ${cls}`}>
      {BADGE_ICONS[badge]} {badge}
    </span>
  );
}

function StageRail({ currentStage }: { currentStage: PilotStage }) {
  const idx = stageIndex(currentStage);
  return (
    <div className="pmt-stage-rail">
      {STAGES.map((st, i) => (
        <React.Fragment key={st.key}>
          <div
            className={`pmt-stage-node${
              i < idx ? ' pmt-stage-node--done' :
              i === idx ? ' pmt-stage-node--active' : ''
            }`}
            title={st.key}
          >
            {st.icon}
          </div>
          {i < STAGES.length - 1 && (
            <div className={`pmt-stage-connector${i < idx ? ' pmt-stage-connector--done' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export const PilotMilestoneTracker: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section className="pmt-root">
      <div className="landing-section-inner">
        <h2 className="landing-section-title">Pilot Milestone Tracker</h2>
        <p className="landing-section-sub">
          Live procurement transparency — track onboarded startup pilots through each stage
        </p>

        <div className="pmt-grid">
          {DEMO_PILOTS.map((pilot) => {
            const isOpen = expanded === pilot.id;
            const stageColor = STAGES[stageIndex(pilot.currentStage)]?.color ?? '#2563eb';

            return (
              <article key={pilot.id} className="pmt-card">
                {/* Card header */}
                <div className="pmt-card-top">
                  <div className="pmt-logo-wrap">
                    <img src={pilot.logoSrc} alt={`${pilot.startupName} logo`} className="pmt-logo" />
                    <span className="pmt-logo-fallback" aria-hidden="true">
                      {pilot.startupName.charAt(0)}
                    </span>
                  </div>
                  <div className="pmt-card-info">
                    <h3 className="pmt-startup-name">{pilot.startupName}</h3>
                    <span className="pmt-dept">{pilot.department}</span>
                    <div className="pmt-badges">
                      {pilot.badges.map((b) => <BadgePill key={b} badge={b} />)}
                    </div>
                  </div>
                </div>

                {/* Challenge */}
                <p className="pmt-challenge-title">{pilot.challengeTitle}</p>

                {/* Stage rail */}
                <StageRail currentStage={pilot.currentStage} />
                <div className="pmt-stage-label" style={{ color: stageColor }}>
                  Current: {pilot.currentStage}
                </div>

                {/* Progress bar */}
                <div className="pmt-progress-wrap">
                  <div
                    className="pmt-progress-bar"
                    style={{ width: `${pilot.progressPct}%`, background: stageColor }}
                    role="progressbar"
                    aria-valuenow={pilot.progressPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <div className="pmt-progress-label">{pilot.progressPct}% complete</div>

                {/* Expandable milestones */}
                <button
                  className="pmt-expand-btn"
                  onClick={() => setExpanded(isOpen ? null : pilot.id)}
                  aria-expanded={isOpen}
                >
                  {isOpen
                    ? <><ChevronUp size={14} /> Hide details</>
                    : <><ChevronDown size={14} /> View milestones</>
                  }
                </button>

                {isOpen && (
                  <ul className="pmt-highlights">
                    {pilot.highlights.map((h, i) => (
                      <li key={i} className="pmt-highlight-item">
                        <ShieldCheck size={13} className="pmt-highlight-icon" /> {h}
                      </li>
                    ))}
                    <li className="pmt-timeline-row">
                      <span>Started: <strong>{pilot.startDate}</strong></span>
                      <span>Expected: <strong>{pilot.expectedCompletion}</strong></span>
                    </li>
                  </ul>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
