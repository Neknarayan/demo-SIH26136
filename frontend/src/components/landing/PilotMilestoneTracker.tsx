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

// ── Types ────────────────────────────────────────────────────────────────────
export type PilotStage =
  | 'Sandbox Testing'
  | 'Field Pilot'
  | 'Departmental Clearance'
  | 'Commercial Scaling';

export type VerificationBadge = 'DPIIT Certified' | 'State Verified' | 'ISO 27001' | 'GEM Listed';

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
export const PilotMilestoneTracker: React.FC<{ pilots: any[] }> = ({ pilots }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!pilots || pilots.length === 0) return null;

  return (
    <section className="pmt-root" style={{ padding: '40px 0', background: '#fff' }}>
      <div className="landing-section-inner" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <h2 className="landing-section-title" style={{ fontSize: '2rem', marginBottom: '10px', color: '#1e293b' }}>Live Pilot Milestones</h2>
        <p className="landing-section-sub" style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '30px' }}>
          Real-time tracking of active startup pilots and outcomes
        </p>

        <div className="pmt-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {pilots.map((pilot) => {
            const pid = String(pilot.id);
            const isOpen = expanded === pid;
            
            // Map db status to stage visually
            let currentStage: PilotStage = 'Sandbox Testing';
            let progressPct = 25;
            if (pilot.status === 'completed') { currentStage = 'Departmental Clearance'; progressPct = 100; }
            else if (pilot.status === 'active') { currentStage = 'Field Pilot'; progressPct = 60; }
            
            const stageColor = STAGES[stageIndex(currentStage)]?.color ?? '#2563eb';
            const startupName = pilot.application?.startup?.name || 'Unknown Startup';
            const challengeTitle = pilot.application?.challenge?.title || 'Unknown Challenge';
            
            const badges: VerificationBadge[] = [];
            if (pilot.application?.startup?.dpiit_status) badges.push('DPIIT Certified');

            return (
              <article key={pid} className="pmt-card">
                {/* Card header */}
                <div className="pmt-card-top">
                  <div className="pmt-logo-wrap">
                    <span className="pmt-logo-fallback" aria-hidden="true" style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: '#475569' }}>
                      {startupName.charAt(0)}
                    </span>
                  </div>
                  <div className="pmt-card-info">
                    <h3 className="pmt-startup-name">{startupName}</h3>
                    <div className="pmt-badges">
                      {badges.map((b) => <BadgePill key={b} badge={b} />)}
                    </div>
                  </div>
                </div>

                {/* Challenge */}
                <p className="pmt-challenge-title">{challengeTitle}</p>

                {/* Stage rail */}
                <StageRail currentStage={currentStage} />
                <div className="pmt-stage-label" style={{ color: stageColor }}>
                  Current: {currentStage}
                </div>

                {/* Progress bar */}
                <div className="pmt-progress-wrap">
                  <div
                    className="pmt-progress-bar"
                    style={{ width: `${progressPct}%`, background: stageColor }}
                    role="progressbar"
                    aria-valuenow={progressPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <div className="pmt-progress-label">{progressPct}% complete</div>

                {/* Expandable milestones */}
                <button
                  className="pmt-expand-btn"
                  onClick={() => setExpanded(isOpen ? null : pid)}
                  aria-expanded={isOpen}
                >
                  {isOpen
                    ? <><ChevronUp size={14} /> Hide details</>
                    : <><ChevronDown size={14} /> View milestones</>
                  }
                </button>

                {isOpen && (
                  <ul className="pmt-highlights">
                    <li className="pmt-highlight-item">
                      <ShieldCheck size={13} className="pmt-highlight-icon" /> Scope: {pilot.scope}
                    </li>
                    <li className="pmt-timeline-row">
                      <span>Started: <strong>{pilot.timeline_start}</strong></span>
                      <span>Expected: <strong>{pilot.timeline_end}</strong></span>
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
