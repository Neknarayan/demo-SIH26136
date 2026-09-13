import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import type { Application, Challenge } from '../../types';
import { StatusBadge } from '../StatusBadge';
import { Award, CheckCircle, Clock, X } from 'lucide-react';

export const EvaluatorDashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [score, setScore] = useState<number>(85);
  const [notes, setNotes] = useState<string>('');
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = async () => {
    try {
      const [appData, chData] = await Promise.all([
        api.getApplications(),
        api.getChallenges(),
      ]);
      setApplications(appData);
      setChallenges(chData);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load evaluator data');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    try {
      await api.createEvaluation(selectedApp.id, Number(score), notes);
      showToast('success', `Application #${selectedApp.id} successfully evaluated with score ${score}/100!`);
      setShowScoreModal(false);
      setNotes('');
      loadData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Evaluation submission failed');
    }
  };

  return (
    <div>
      {notification && (
        <div className={`alert-banner alert-${notification.type}`}>
          <span>{notification.message}</span>
          <button className="modal-close-btn" onClick={() => setNotification(null)}><X size={16} /></button>
        </div>
      )}

      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>Technical Evaluation Panel</h1>
          <div className="dashboard-subtitle">
            Independent scoring and merit review for submitted startup proposals (Scale: 0–100)
          </div>
        </div>
        <div className="active-persona-pill" style={{ background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe' }}>
          <Award size={14} /> Certified Technical Evaluator
        </div>
      </div>

      <div className="table-container">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', fontWeight: 700, fontSize: 16 }}>
          Submissions for Evaluation ({applications.length})
        </div>
        <table className="app-table">
          <thead>
            <tr>
              <th>App ID</th>
              <th>Startup Name</th>
              <th>Challenge Focus</th>
              <th>Status</th>
              <th>Current Score</th>
              <th>Proposal Excerpt</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
                  No applications currently available for evaluation.
                </td>
              </tr>
            ) : (
              applications.map((app) => {
                const challenge = challenges.find((c) => c.id === app.challenge_id);
                const isEvaluated = Boolean(app.evaluation);

                return (
                  <tr key={app.id}>
                    <td style={{ fontWeight: 700 }}>#{app.id}</td>
                    <td style={{ fontWeight: 600 }}>{app.startup?.name || `Startup #${app.startup_id}`}</td>
                    <td>{challenge?.title || `Challenge #${app.challenge_id}`}</td>
                    <td><StatusBadge status={app.status} /></td>
                    <td>
                      {isEvaluated ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CheckCircle size={14} color="#10b981" />
                          <span style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>
                            {app.evaluation?.score} / 100
                          </span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#d97706' }}>
                          <Clock size={14} />
                          <span style={{ fontSize: 13, fontWeight: 600 }}>Unscored</span>
                        </div>
                      )}
                    </td>
                    <td style={{ maxWidth: 280 }}>
                      <div style={{ fontSize: 13, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={app.proposal_text}>
                        {app.proposal_text}
                      </div>
                    </td>
                    <td>
                      {isEvaluated ? (
                        <span style={{ fontSize: 12, color: '#64748b' }}>Score Recorded</span>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setSelectedApp(app);
                            setScore(85);
                            setNotes('');
                            setShowScoreModal(true);
                          }}
                        >
                          <Award size={13} /> Evaluate & Score
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* EVALUATION MODAL */}
      {showScoreModal && selectedApp && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">Evaluate Application #{selectedApp.id}</h3>
              <button className="modal-close-btn" onClick={() => setShowScoreModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleScoreSubmit}>
              <div className="modal-body">
                <div style={{ padding: 14, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Applicant:</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                    {selectedApp.startup?.name} &bull; Sector: {selectedApp.startup?.sector}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: '#64748b', fontWeight: 600 }}>Full Proposal:</div>
                  <p style={{ fontSize: 13, color: '#334155', marginTop: 4, maxHeight: 150, overflowY: 'auto' }}>
                    {selectedApp.proposal_text}
                  </p>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">Technical Merit Score (0 to 100)</label>
                    <span style={{ fontWeight: 800, fontSize: 18, color: '#2563eb' }}>{score} / 100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) => setScore(parseInt(e.target.value, 10))}
                    style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Qualitative Review Notes & Feedback</label>
                  <textarea
                    className="form-textarea"
                    required
                    placeholder="Document assessment on technical feasibility, methodology, sensor reliability, and team capability..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowScoreModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Official Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
