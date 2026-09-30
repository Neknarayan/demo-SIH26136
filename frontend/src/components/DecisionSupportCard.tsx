import React from 'react';
import type { DecisionSupport } from '../types';
import { HelpCircle, CheckCircle2 } from 'lucide-react';

interface DecisionSupportCardProps {
  data: DecisionSupport;
  onRecordDecision?: () => void;
  decisionRecorded?: boolean;
}

export const DecisionSupportCard: React.FC<DecisionSupportCardProps> = ({
  data,
  onRecordDecision,
  decisionRecorded = false,
}) => {
  const getBannerClass = (rec: string) => {
    switch (rec) {
      case 'Recommend Scale':
        return 'rec-scale';
      case 'Extend Pilot':
        return 'rec-extend';
      case 'Discontinue':
        return 'rec-discontinue';
      default:
        return 'rec-insufficient';
    }
  };

  const pct = Math.round(data.achievement_ratio * 100);

  return (
    <div className="decision-card">
      <div className="decision-header">
        <span className="decision-title">Deterministic Decision Support Engine</span>
        <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
          <HelpCircle size={14} /> Rule-Based / Zero-AI
        </span>
      </div>

      <div className="decision-meter-container">
        <div className="decision-percentage">{pct}%</div>
        <div className="decision-stats">
          <div className="decision-stats-count">
            {data.approved_kpis} of {data.total_kpis} KPIs Achieved
          </div>
          <div className="decision-stats-sub">
            Thresholds: &ge;70% Scale &bull; 40-69% Extend &bull; &lt;40% Discontinue
          </div>
        </div>
      </div>

      <div className={`recommendation-banner ${getBannerClass(data.recommendation)}`}>
        {data.recommendation}
      </div>

      <div className="decision-explanation">
        <strong>Why?</strong> {data.explanation}
      </div>

      {onRecordDecision && !decisionRecorded && (
        <div style={{ marginTop: 8 }}>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={onRecordDecision}>
            <CheckCircle2 size={16} /> Record Official Final Decision
          </button>
        </div>
      )}

      {decisionRecorded && (
        <div style={{ fontSize: 12, color: '#38bdf8', textAlign: 'center', fontWeight: 600 }}>
          ✓ Final Decision Recorded
        </div>
      )}
    </div>
  );
};
