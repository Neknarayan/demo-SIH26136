/**
 * NoticeTicker.tsx — Official circulars & amendments alert bar
 *
 * Horizontally scrolling news ticker for official procurement gazette releases,
 * deadline extensions, and policy updates. Pauses on hover.
 * Includes category-colored labels (Gazette, Deadline, Policy, Alert).
 */
import React, { useRef, useState } from 'react';
import { Bell, ExternalLink, Info, AlertTriangle, Calendar, FileText } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
export type NoticeCategory = 'Gazette' | 'Deadline' | 'Policy' | 'Alert';

export interface NoticeItem {
  id: string;
  category: NoticeCategory;
  text: string;
  date: string;
  link?: string;
}

// ── Static notices ────────────────────────────────────────────────────────────
const NOTICES: NoticeItem[] = [
  {
    id: 'N-001',
    category: 'Gazette',
    text: 'Maharashtra Gazette No. 1247: Amendment to Procurement Policy Framework for Startup Pilots — Effective 01-Oct-2026.',
    date: '2026-09-10',
    link: '#gazette-1247',
  },
  {
    id: 'N-002',
    category: 'Deadline',
    text: 'EXTENDED: Submission deadline for PS-001 (Smart Water Monitoring) extended to 15-Oct-2026. Previous deadline was 30-Sep-2026.',
    date: '2026-09-08',
    link: '#ps-001',
  },
  {
    id: 'N-003',
    category: 'Policy',
    text: 'New DPIIT certification fast-track process for Tier-2 cities now active. Startups may apply via the Startup India portal.',
    date: '2026-09-05',
    link: '#policy-dpiit',
  },
  {
    id: 'N-004',
    category: 'Alert',
    text: 'System Maintenance: GoM Procurement Portal will be offline on 21-Sep-2026 from 02:00 to 06:00 IST for scheduled upgrades.',
    date: '2026-09-04',
    link: undefined,
  },
  {
    id: 'N-005',
    category: 'Gazette',
    text: 'Circular No. 88/2026: Mandatory GeM listing requirement waived for startups with DPIIT recognition under 3 years.',
    date: '2026-09-01',
    link: '#circular-88-2026',
  },
  {
    id: 'N-006',
    category: 'Deadline',
    text: 'Reminder: PS-003 (Rural Telemedicine Kiosk) evaluation window closes 30-Sep-2026. Shortlisted startups must complete site visits.',
    date: '2026-08-28',
    link: '#ps-003',
  },
];

// ── Category config ────────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<NoticeCategory, { icon: React.ReactNode; cls: string }> = {
  Gazette:  { icon: <FileText size={11} />,     cls: 'ntk-label--gazette' },
  Deadline: { icon: <Calendar size={11} />,     cls: 'ntk-label--deadline' },
  Policy:   { icon: <Info size={11} />,         cls: 'ntk-label--policy' },
  Alert:    { icon: <AlertTriangle size={11} />, cls: 'ntk-label--alert' },
};

// ── Component ──────────────────────────────────────────────────────────────────
export const NoticeTicker: React.FC = () => {
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="ntk-root"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="marquee"
      aria-label="Official procurement notices and circulars"
    >
      {/* Fixed label on the left */}
      <div className="ntk-header-label">
        <Bell size={13} />
        <span>Official Notices</span>
      </div>

      {/* Scrolling track */}
      <div className="ntk-viewport">
        <div
          ref={trackRef}
          className={`ntk-track ${paused ? 'ntk-track--paused' : ''}`}
          aria-live="off"
        >
          {/* Duplicate list for seamless loop */}
          {[...NOTICES, ...NOTICES].map((notice, i) => {
            const cfg = CATEGORY_CONFIG[notice.category];
            return (
              <span key={`${notice.id}-${i}`} className="ntk-item">
                <span className={`ntk-label ${cfg.cls}`}>
                  {cfg.icon} {notice.category}
                </span>
                <span className="ntk-text">
                  {notice.link ? (
                    <a href={notice.link} className="ntk-link">
                      {notice.text} <ExternalLink size={11} />
                    </a>
                  ) : (
                    notice.text
                  )}
                </span>
                <span className="ntk-date">{notice.date}</span>
                <span className="ntk-sep" aria-hidden="true">◆</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Pause indicator */}
      {paused && (
        <div className="ntk-paused-hint" aria-live="polite">
          Paused — hover away to resume
        </div>
      )}
    </div>
  );
};
