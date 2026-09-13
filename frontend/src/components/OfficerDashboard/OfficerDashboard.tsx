import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import type { Challenge, Application, Pilot, KPI, Evidence, DecisionSupport } from '../../types';
import { StatusBadge } from '../StatusBadge';
import { DecisionSupportCard } from '../DecisionSupportCard';
import {
  PlusCircle,
  FileText,
  Target,
  BarChart3,
  Check,
  X,
  Sparkles,
  Layers,
  Award
} from 'lucide-react';

export const OfficerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'applications' | 'pilots' | 'decision'>('overview');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [selectedPilot, setSelectedPilot] = useState<Pilot | null>(null);
  const [pilotKpis, setPilotKpis] = useState<KPI[]>([]);
  const [pilotEvidence, setPilotEvidence] = useState<Evidence[]>([]);
  const [decisionSupport, setDecisionSupport] = useState<DecisionSupport | null>(null);
  
  // Modals
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [showCreatePilot, setShowCreatePilot] = useState(false);
  const [pilotAppId, setPilotAppId] = useState<number | null>(null);
  const [showAddKpi, setShowAddKpi] = useState(false);
  const [showRecordDecision, setShowRecordDecision] = useState(false);

  // Form states
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    outcomes: '',
    constraints: '',
    budget_band: '₹25L - ₹50L',
    required_sector: 'Water Technology',
    dpiit_required: true,
    status: 'published' as 'draft' | 'published',
  });

  const [newPilot, setNewPilot] = useState({
    scope: '',
    timeline_start: new Date().toISOString().split('T')[0],
    timeline_end: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
  });

  const [newKpi, setNewKpi] = useState({
    name: '',
    target_value: 0,
    unit: '%',
  });

  const [newDecision, setNewDecision] = useState({
    recommendation: 'Recommend Scale',
    notes: '',
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = async () => {
    try {
      const [chData, appData, piData] = await Promise.all([
        api.getChallenges(),
        api.getApplications(),
        api.getPilots(),
      ]);
      setChallenges(chData);
      setApplications(appData);
      setPilots(piData);

      if (piData.length > 0) {
        const current = selectedPilot ? piData.find((p) => p.id === selectedPilot.id) || piData[0] : piData[0];
        setSelectedPilot(current);
        loadPilotDetails(current.id);
      }
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Error loading dashboard data');
    }
  };

  const loadPilotDetails = async (pilotId: number) => {
    try {
      const [kpis, evidence, ds] = await Promise.all([
        api.getPilotKpis(pilotId),
        api.getPilotEvidence(pilotId),
        api.getDecisionSupport(pilotId),
      ]);
      setPilotKpis(kpis);
      setPilotEvidence(evidence);
      setDecisionSupport(ds);
    } catch (err: unknown) {
      console.error('Error loading pilot details', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedPilot) {
      loadPilotDetails(selectedPilot.id);
    }
  }, [selectedPilot]);

  // Actions
  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createChallenge(newChallenge);
      showToast('success', 'Challenge created and published successfully!');
      setShowCreateChallenge(false);
      setNewChallenge({
        title: '',
        description: '',
        outcomes: '',
        constraints: '',
        budget_band: '₹25L - ₹50L',
        required_sector: 'Water Technology',
        dpiit_required: true,
        status: 'published',
      });
      loadData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to create challenge');
    }
  };

  const handleUpdateAppStatus = async (appId: number, status: string) => {
    try {
      await api.updateApplicationStatus(appId, status);
      showToast('success', `Application status updated to ${status}`);
      loadData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleCreatePilot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pilotAppId) return;
    try {
      const created = await api.createPilot({
        application_id: pilotAppId,
        scope: newPilot.scope,
        timeline_start: newPilot.timeline_start,
        timeline_end: newPilot.timeline_end,
      });
      showToast('success', 'Pilot created successfully!');
      setShowCreatePilot(false);
      loadData();
      setSelectedPilot(created);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to create pilot');
    }
  };

  const handleCreateKpi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPilot) return;
    try {
      await api.createKpi(selectedPilot.id, {
        name: newKpi.name,
        target_value: Number(newKpi.target_value),
        unit: newKpi.unit,
      });
      showToast('success', 'KPI added to pilot!');
      setShowAddKpi(false);
      setNewKpi({ name: '', target_value: 0, unit: '%' });
      loadPilotDetails(selectedPilot.id);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to add KPI');
    }
  };

  const handleUpdateEvidence = async (evidenceId: number, status: 'approved' | 'rejected') => {
    try {
      await api.updateEvidenceStatus(evidenceId, status);
      showToast('success', `Evidence marked as ${status}`);
      if (selectedPilot) {
        loadPilotDetails(selectedPilot.id);
      }
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to update evidence');
    }
  };

  const handleRecordFinalDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPilot) return;
    try {
      await api.recordDecision(selectedPilot.id, newDecision.recommendation, newDecision.notes);
      showToast('success', 'Official decision recorded successfully!');
      setShowRecordDecision(false);
      loadData();
      if (selectedPilot) {
        loadPilotDetails(selectedPilot.id);
      }
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to record decision');
    }
  };

  // Sort applications by score descending (evaluations score)
  const sortedApplications = [...applications].sort((a, b) => {
    const scoreA = a.evaluation?.score ?? -1;
    const scoreB = b.evaluation?.score ?? -1;
    return scoreB - scoreA;
  });

  const shortlistedApps = applications.filter((a) => a.status === 'shortlisted');

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
          <h1>Government Officer Control Center</h1>
          <div className="dashboard-subtitle">
            Lifecycle Administration: Challenge Publication, Shortlisting, Pilot Execution & Deterministic Decision Support
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateChallenge(true)}>
          <PlusCircle size={16} /> Create Challenge
        </button>
      </div>

      <nav className="tabs-nav">
        <button className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <Layers size={16} /> Overview
        </button>
        <button className={`tab-button ${activeTab === 'challenges' ? 'active' : ''}`} onClick={() => setActiveTab('challenges')}>
          <FileText size={16} /> Challenges ({challenges.length})
        </button>
        <button className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveTab('applications')}>
          <Sparkles size={16} /> Applications & Scoring ({applications.length})
        </button>
        <button className={`tab-button ${activeTab === 'pilots' ? 'active' : ''}`} onClick={() => setActiveTab('pilots')}>
          <Target size={16} /> Pilots & Evidence ({pilots.length})
        </button>
        <button className={`tab-button ${activeTab === 'decision' ? 'active' : ''}`} onClick={() => setActiveTab('decision')}>
          <BarChart3 size={16} /> Decision Support
        </button>
      </nav>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div>
          <div className="stat-grid">
            <div className="stat-card">
              <div>
                <div className="stat-card-title">Total Challenges</div>
                <div className="stat-card-value">{challenges.length}</div>
              </div>
              <FileText size={32} color="#3b82f6" />
            </div>
            <div className="stat-card">
              <div>
                <div className="stat-card-title">Applications Received</div>
                <div className="stat-card-value">{applications.length}</div>
              </div>
              <Sparkles size={32} color="#10b981" />
            </div>
            <div className="stat-card">
              <div>
                <div className="stat-card-title">Shortlisted Proposals</div>
                <div className="stat-card-value">{shortlistedApps.length}</div>
              </div>
              <Award size={32} color="#f59e0b" />
            </div>
            <div className="stat-card">
              <div>
                <div className="stat-card-title">Active Pilots</div>
                <div className="stat-card-value">{pilots.length}</div>
              </div>
              <Target size={32} color="#8b5cf6" />
            </div>
          </div>

          <div className="content-card" style={{ marginBottom: 24 }}>
            <h2 className="card-title" style={{ marginBottom: 12 }}>End-to-End Lifecycle Status</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>STEP 1: CHALLENGE</div>
                <div style={{ fontWeight: 600, marginTop: 4 }}>{challenges.filter((c) => c.status === 'published').length} Published</div>
              </div>
              <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>STEP 2: EVALUATION</div>
                <div style={{ fontWeight: 600, marginTop: 4 }}>{applications.filter((a) => a.evaluation).length} Scored</div>
              </div>
              <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>STEP 3: SHORTLIST</div>
                <div style={{ fontWeight: 600, marginTop: 4 }}>{shortlistedApps.length} Shortlisted</div>
              </div>
              <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>STEP 4: PILOT & KPIS</div>
                <div style={{ fontWeight: 600, marginTop: 4 }}>{pilots.length} Pilots Established</div>
              </div>
              <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>STEP 5: DECISION</div>
                <div style={{ fontWeight: 600, marginTop: 4 }}>{pilots.filter((p) => p.decision).length} Final Decisions</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHALLENGES TAB */}
      {activeTab === 'challenges' && (
        <div className="card-grid">
          {challenges.map((c) => (
            <div key={c.id} className="content-card">
              <div className="content-card-header">
                <h3 className="card-title">{c.title}</h3>
                <StatusBadge status={c.status} />
              </div>
              <div className="card-body">
                <p style={{ marginBottom: 12 }}>{c.description}</p>
                <div className="card-meta">
                  <span className="meta-chip">Sector: {c.required_sector}</span>
                  <span className="meta-chip">Budget: {c.budget_band}</span>
                  <span className="meta-chip">DPIIT: {c.dpiit_required ? 'Required' : 'Optional'}</span>
                </div>
                <div style={{ fontSize: 13, marginTop: 8 }}>
                  <strong>Expected Outcomes:</strong> {c.outcomes}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* APPLICATIONS TAB */}
      {activeTab === 'applications' && (
        <div className="table-container">
          <table className="app-table">
            <thead>
              <tr>
                <th>App ID</th>
                <th>Startup Name</th>
                <th>Challenge Title</th>
                <th>Score (0–100)</th>
                <th>Status</th>
                <th>Proposal Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedApplications.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
                    No applications submitted yet. Switch to Startup persona to submit an application!
                  </td>
                </tr>
              ) : (
                sortedApplications.map((app) => {
                  const challenge = challenges.find((c) => c.id === app.challenge_id);
                  const hasPilot = pilots.some((p) => p.application_id === app.id);

                  return (
                    <tr key={app.id}>
                      <td style={{ fontWeight: 700 }}>#{app.id}</td>
                      <td style={{ fontWeight: 600 }}>{app.startup?.name || `Startup #${app.startup_id}`}</td>
                      <td>{challenge?.title || `Challenge #${app.challenge_id}`}</td>
                      <td>
                        {app.evaluation ? (
                          <span style={{ fontWeight: 800, color: app.evaluation.score >= 70 ? '#10b981' : '#f59e0b', fontSize: 16 }}>
                            {app.evaluation.score}/100
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Pending Evaluation</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={app.status} />
                      </td>
                      <td style={{ maxWidth: 280 }}>
                        <div style={{ fontSize: 13, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={app.proposal_text}>
                          {app.proposal_text}
                        </div>
                        {app.evaluation?.notes && (
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                            <strong>Evaluator Notes:</strong> {app.evaluation.notes}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {app.status !== 'shortlisted' && app.status !== 'rejected' && (
                            <>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleUpdateAppStatus(app.id, 'shortlisted')}
                                title="Shortlist Application"
                              >
                                <Check size={14} /> Shortlist
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleUpdateAppStatus(app.id, 'rejected')}
                                title="Reject Application"
                              >
                                <X size={14} /> Reject
                              </button>
                            </>
                          )}
                          {app.status === 'shortlisted' && !hasPilot && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setPilotAppId(app.id);
                                setShowCreatePilot(true);
                              }}
                            >
                              <PlusCircle size={14} /> Create Pilot
                            </button>
                          )}
                          {hasPilot && (
                            <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>Pilot Active</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PILOTS & EVIDENCE TAB */}
      {activeTab === 'pilots' && (
        <div>
          {pilots.length === 0 ? (
            <div className="empty-state">
              <Target size={40} color="#94a3b8" />
              <div className="empty-state-title">No pilots created yet</div>
              <div className="empty-state-sub">Shortlist an application first, then click "Create Pilot".</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
              {/* Pilot list side-bar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Active Pilots</h3>
                {pilots.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPilot(p)}
                    style={{
                      padding: 16,
                      background: selectedPilot?.id === p.id ? '#eff6ff' : '#fff',
                      border: `2px solid ${selectedPilot?.id === p.id ? '#3b82f6' : '#e2e8f0'}`,
                      borderRadius: 10,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700 }}>Pilot #{p.id}</span>
                      <StatusBadge status={p.status} />
                    </div>
                    <div style={{ fontSize: 13, color: '#475569', marginBottom: 6 }}>{p.scope}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      {p.timeline_start} to {p.timeline_end}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pilot detail section */}
              {selectedPilot && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div className="content-card">
                    <div className="content-card-header">
                      <div>
                        <h2 className="card-title">Pilot #{selectedPilot.id} — Scope & Operations</h2>
                        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                          Timeline: {selectedPilot.timeline_start} to {selectedPilot.timeline_end} &bull; Status: {selectedPilot.status}
                        </div>
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => setShowAddKpi(true)}>
                        <PlusCircle size={14} /> Add Target KPI
                      </button>
                    </div>
                    <p style={{ fontSize: 14, color: '#334155' }}>{selectedPilot.scope}</p>
                  </div>

                  {/* KPIs List */}
                  <div className="content-card">
                    <h3 className="card-title" style={{ marginBottom: 16 }}>Target KPIs & Thresholds</h3>
                    {pilotKpis.length === 0 ? (
                      <div style={{ fontSize: 14, color: '#64748b', fontStyle: 'italic' }}>
                        No KPIs defined yet. Click "Add Target KPI" above.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                        {pilotKpis.map((kpi) => {
                          const hasApproved = pilotEvidence.some((e) => e.kpi_id === kpi.id && e.status === 'approved');
                          return (
                            <div
                              key={kpi.id}
                              style={{
                                padding: 14,
                                borderRadius: 8,
                                background: hasApproved ? '#ecfdf5' : '#f8fafc',
                                border: `1px solid ${hasApproved ? '#a7f3d0' : '#e2e8f0'}`,
                              }}
                            >
                              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>KPI #{kpi.id}</div>
                              <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', margin: '4px 0' }}>{kpi.name}</div>
                              <div style={{ fontSize: 13, color: '#334155' }}>
                                Target: <strong>{kpi.target_value} {kpi.unit}</strong>
                              </div>
                              <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: hasApproved ? '#059669' : '#d97706' }}>
                                {hasApproved ? '✓ EVIDENCE APPROVED' : '○ PENDING EVIDENCE'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Evidence Table */}
                  <div className="table-container">
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', fontWeight: 700, fontSize: 16 }}>
                      Submitted Evidence Verifications
                    </div>
                    <table className="app-table">
                      <thead>
                        <tr>
                          <th>Evidence ID</th>
                          <th>KPI Name</th>
                          <th>Submitted Value</th>
                          <th>Field Description</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pilotEvidence.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: 20, color: '#64748b' }}>
                              No evidence submitted yet by the startup. Switch to Startup persona to submit evidence!
                            </td>
                          </tr>
                        ) : (
                          pilotEvidence.map((ev) => {
                            const kpi = pilotKpis.find((k) => k.id === ev.kpi_id);
                            return (
                              <tr key={ev.id}>
                                <td style={{ fontWeight: 700 }}>#{ev.id}</td>
                                <td style={{ fontWeight: 600 }}>{kpi?.name || `KPI #${ev.kpi_id}`}</td>
                                <td style={{ fontWeight: 800 }}>{ev.submitted_value} {kpi?.unit}</td>
                                <td>{ev.description}</td>
                                <td><StatusBadge status={ev.status} /></td>
                                <td>
                                  {ev.status === 'pending' ? (
                                    <div style={{ display: 'flex', gap: 6 }}>
                                      <button
                                        className="btn btn-success btn-sm"
                                        onClick={() => handleUpdateEvidence(ev.id, 'approved')}
                                      >
                                        <Check size={14} /> Approve
                                      </button>
                                      <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleUpdateEvidence(ev.id, 'rejected')}
                                      >
                                        <X size={14} /> Reject
                                      </button>
                                    </div>
                                  ) : (
                                    <span style={{ fontSize: 12, color: '#64748b' }}>Processed</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* DECISION SUPPORT TAB */}
      {activeTab === 'decision' && (
        <div>
          {selectedPilot && decisionSupport ? (
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Select Pilot to Inspect Decision Support:</label>
                <select
                  className="form-select"
                  value={selectedPilot.id}
                  onChange={(e) => {
                    const found = pilots.find((p) => p.id === Number(e.target.value));
                    if (found) setSelectedPilot(found);
                  }}
                >
                  {pilots.map((p) => (
                    <option key={p.id} value={p.id}>
                      Pilot #{p.id} — {p.scope.slice(0, 45)}... ({p.status})
                    </option>
                  ))}
                </select>
              </div>

              <DecisionSupportCard
                data={decisionSupport}
                onRecordDecision={() => {
                  setNewDecision({
                    recommendation: decisionSupport.recommendation === 'Insufficient Data' ? 'Extend Pilot' : decisionSupport.recommendation,
                    notes: `Based on deterministic decision support: ${decisionSupport.explanation}`,
                  });
                  setShowRecordDecision(true);
                }}
                decisionRecorded={Boolean(selectedPilot.decision)}
              />
            </div>
          ) : (
            <div className="empty-state">
              <BarChart3 size={40} color="#94a3b8" />
              <div className="empty-state-title">No Pilot Available</div>
              <div className="empty-state-sub">Establish a pilot and define KPIs to evaluate decision support.</div>
            </div>
          )}
        </div>
      )}

      {/* CREATE CHALLENGE MODAL */}
      {showCreateChallenge && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">Create Innovation Challenge</h3>
              <button className="modal-close-btn" onClick={() => setShowCreateChallenge(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateChallenge}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Challenge Title</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Smart Water Monitoring for Municipal Networks"
                    value={newChallenge.title}
                    onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description & Problem Statement</label>
                  <textarea
                    className="form-textarea"
                    required
                    placeholder="Describe municipal problem context, sensor requirements, and goals..."
                    value={newChallenge.description}
                    onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Expected Outcomes</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Reduce non-revenue water loss by >15%"
                    value={newChallenge.outcomes}
                    onChange={(e) => setNewChallenge({ ...newChallenge, outcomes: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Technical Constraints</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Must integrate with SCADA, IP68 waterproofing"
                    value={newChallenge.constraints}
                    onChange={(e) => setNewChallenge({ ...newChallenge, constraints: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Required Sector</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={newChallenge.required_sector}
                      onChange={(e) => setNewChallenge({ ...newChallenge, required_sector: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Budget Band</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={newChallenge.budget_band}
                      onChange={(e) => setNewChallenge({ ...newChallenge, budget_band: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <input
                    type="checkbox"
                    id="dpiit_check"
                    checked={newChallenge.dpiit_required}
                    onChange={(e) => setNewChallenge({ ...newChallenge, dpiit_required: e.target.checked })}
                  />
                  <label htmlFor="dpiit_check" style={{ fontSize: 13, color: '#334155' }}>
                    DPIIT Recognition Preferred / Required
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateChallenge(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Challenge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PILOT MODAL */}
      {showCreatePilot && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">Establish Pilot for Application #{pilotAppId}</h3>
              <button className="modal-close-btn" onClick={() => setShowCreatePilot(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreatePilot}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Pilot Scope & Municipal Boundary</label>
                  <textarea
                    className="form-textarea"
                    required
                    placeholder="Define DMA sector zones, number of sensors deployed, and operational boundaries..."
                    value={newPilot.scope}
                    onChange={(e) => setNewPilot({ ...newPilot, scope: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Timeline Start</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={newPilot.timeline_start}
                      onChange={(e) => setNewPilot({ ...newPilot, timeline_start: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Timeline End</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={newPilot.timeline_end}
                      onChange={(e) => setNewPilot({ ...newPilot, timeline_end: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreatePilot(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Pilot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD KPI MODAL */}
      {showAddKpi && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">Add Target KPI to Pilot #{selectedPilot?.id}</h3>
              <button className="modal-close-btn" onClick={() => setShowAddKpi(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateKpi}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">KPI Metric Name</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Water Leakage Reduction"
                    value={newKpi.name}
                    onChange={(e) => setNewKpi({ ...newKpi, name: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Target Value (Numeric)</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      required
                      value={newKpi.target_value}
                      onChange={(e) => setNewKpi({ ...newKpi, target_value: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. %, hours, L/min"
                      value={newKpi.unit}
                      onChange={(e) => setNewKpi({ ...newKpi, unit: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddKpi(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add KPI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD DECISION MODAL */}
      {showRecordDecision && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">Record Official Final Pilot Decision</h3>
              <button className="modal-close-btn" onClick={() => setShowRecordDecision(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleRecordFinalDecision}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Final Decision / Recommendation</label>
                  <select
                    className="form-select"
                    value={newDecision.recommendation}
                    onChange={(e) => setNewDecision({ ...newDecision, recommendation: e.target.value })}
                  >
                    <option value="Recommend Scale">Recommend Scale</option>
                    <option value="Extend Pilot">Extend Pilot</option>
                    <option value="Discontinue">Discontinue</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Officer Justification & Evaluation Notes</label>
                  <textarea
                    className="form-textarea"
                    required
                    placeholder="State justification for scaling, extending, or concluding the pilot..."
                    value={newDecision.notes}
                    onChange={(e) => setNewDecision({ ...newDecision, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRecordDecision(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Final Decision in Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
