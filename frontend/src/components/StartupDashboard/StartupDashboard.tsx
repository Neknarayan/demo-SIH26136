import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import type { Challenge, Application, Pilot, KPI, Evidence, Startup, EligibilityResult, DecisionSupport } from '../../types';
import { StatusBadge } from '../StatusBadge';
import { DecisionSupportCard } from '../DecisionSupportCard';
import {
  FileText,
  Send,
  Target,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Sparkles,
  Info,
  X
} from 'lucide-react';

import { FileUpload } from '../common/FileUpload';
import { FileViewerModal } from '../common/FileViewerModal';

export const StartupDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'challenges' | 'applications' | 'pilot' | 'decision'>('challenges');
  const [myStartup, setMyStartup] = useState<Startup | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [eligibilityMap, setEligibilityMap] = useState<Record<number, EligibilityResult>>({});
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [myPilots, setMyPilots] = useState<Pilot[]>([]);
  const [selectedPilot, setSelectedPilot] = useState<Pilot | null>(null);
  const [pilotKpis, setPilotKpis] = useState<KPI[]>([]);
  const [pilotEvidence, setPilotEvidence] = useState<Evidence[]>([]);
  const [decisionSupport, setDecisionSupport] = useState<DecisionSupport | null>(null);

  // Modals
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [proposalText, setProposalText] = useState('');
  const [appFileUrl, setAppFileUrl] = useState<string | null>(null);

  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<KPI | null>(null);
  const [evidenceValue, setEvidenceValue] = useState<number | string>('');
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [evidenceFileUrl, setEvidenceFileUrl] = useState<string | null>(null);

  const [appFileError, setAppFileError] = useState('');
  const [touched, setTouched] = useState<{proposal?: boolean}>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [viewingFile, setViewingFile] = useState<string | null>(null);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [invoiceAmount, setInvoiceAmount] = useState<number>(0);
  const [invoiceDesc, setInvoiceDesc] = useState('');
  const [invoiceFileUrl, setInvoiceFileUrl] = useState<string | null>(null);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = async () => {
    try {
      const startup = await api.getMyStartup();
      setMyStartup(startup);

      const [chData, appData, piData] = await Promise.all([
        api.getChallenges(),
        api.getApplications(undefined, startup.id),
        api.getPilots(),
      ]);
      setChallenges(chData);
      setMyApplications(appData);
      setMyPilots(piData);

      if (piData.length > 0) {
        setSelectedPilot(piData[0]);
        loadPilotDetails(piData[0].id);
      }

      // Load informational eligibility for all challenges
      const eligMap: Record<number, EligibilityResult> = {};
      for (const ch of chData) {
        try {
          const res = await api.getInformationalEligibility(ch.id);
          eligMap[ch.id] = res;
        } catch (e) {
          console.error('Eligibility check error', e);
        }
      }
      setEligibilityMap(eligMap);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load startup profile');
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
      console.error('Failed to load pilot details', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleApply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedChallenge) return;
    if (!appFileUrl) {
      setAppFileError('A proposal document (PDF) is required.');
      return;
    }
    try {
      await api.createApplication(selectedChallenge.id, proposalText, appFileUrl);
      showToast('success', 'Application submitted successfully!');
      setShowApplyModal(false);
      setShowConfirmModal(false);
      setProposalText('');
      setAppFileUrl(null);
      setAppFileError('');
      setTouched({});
      loadData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Submission failed');
    }
  };

  const handleSubmitInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestone) return;
    try {
      await api.submitInvoice(selectedMilestone.id, {
        amount: invoiceAmount,
        description: invoiceDesc,
        file_url: invoiceFileUrl
      });
      showToast('success', 'Invoice submitted successfully!');
      setShowInvoiceModal(false);
      setInvoiceAmount(0);
      setInvoiceDesc('');
      setInvoiceFileUrl(null);
      if (selectedPilot) {
        // Just reload pilot data
        const [kpis, evidence, ds, pilotsData] = await Promise.all([
          api.getPilotKpis(selectedPilot.id),
          api.getPilotEvidence(selectedPilot.id),
          api.getDecisionSupport(selectedPilot.id),
          api.getPilots()
        ]);
        setPilotKpis(kpis);
        setPilotEvidence(evidence);
        setDecisionSupport(ds);
        const updated = pilotsData.find(p => p.id === selectedPilot.id);
        if (updated) setSelectedPilot(updated);
      }
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to submit invoice');
    }
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKpi) return;
    try {
      await api.submitEvidence(selectedKpi.id, {
        submitted_value: Number(evidenceValue),
        description: evidenceDesc,
        file_ref: evidenceFileUrl || undefined
      });
      showToast('success', 'KPI evidence submitted for review!');
      setShowEvidenceModal(false);
      setEvidenceValue('');
      setEvidenceDesc('');
      setEvidenceFileUrl(null);
      if (selectedPilot) {
        loadPilotDetails(selectedPilot.id);
      }
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Evidence submission failed');
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
          <h1>Startup Innovation Portal</h1>
          <div className="dashboard-subtitle">
            {myStartup?.name} &bull; Sector: {myStartup?.sector} &bull; DPIIT Recognized: {myStartup?.dpiit_status ? 'Yes' : 'No'}
          </div>
        </div>
        <div className="active-persona-pill" style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
          <Sparkles size={14} /> Registered Startup Profile Active
        </div>
      </div>

      <nav className="tabs-nav">
        <button className={`tab-button ${activeTab === 'challenges' ? 'active' : ''}`} onClick={() => setActiveTab('challenges')}>
          <Layers size={16} /> Available Challenges ({challenges.length})
        </button>
        <button className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveTab('applications')}>
          <FileText size={16} /> My Applications ({myApplications.length})
        </button>
        <button className={`tab-button ${activeTab === 'pilot' ? 'active' : ''}`} onClick={() => setActiveTab('pilot')}>
          <Target size={16} /> My Pilot & Evidence ({myPilots.length})
        </button>
        {myPilots.length > 0 && (
          <button className={`tab-button ${activeTab === 'decision' ? 'active' : ''}`} onClick={() => setActiveTab('decision')}>
            <BarChart3 size={16} /> Decision Support Progress
          </button>
        )}
      </nav>

      {/* CHALLENGES TAB */}
      {activeTab === 'challenges' && (
        <div className="card-grid">
          {challenges.map((c) => {
            const hasApplied = myApplications.some((a) => a.challenge_id === c.id);
            const eligibility = eligibilityMap[c.id];

            return (
              <div key={c.id} className="content-card">
                <div className="content-card-header">
                  <h3 className="card-title">
                    {c.title}
                    {c.created_at && (
                      <span style={{ fontSize: 12, color: '#64748b', fontWeight: 400, marginLeft: 8 }}>
                        (Added on: {new Date(c.created_at).toLocaleDateString()})
                      </span>
                    )}
                  </h3>
                  <StatusBadge status={c.status} />
                </div>
                <div className="card-body">
                  <p style={{ marginBottom: 12 }}>{c.description}</p>
                  <div className="card-meta">
                    <span className="meta-chip">Required: {c.required_sector}</span>
                    <span className="meta-chip">Budget: {c.budget_band}</span>
                    <span className="meta-chip">DPIIT: {c.dpiit_required ? 'Required' : 'Optional'}</span>
                  </div>

                  {/* Informational Eligibility Box */}
                  {eligibility && (
                    <div className="eligibility-box">
                      <div className="eligibility-badge-group">
                        <span className={`eligibility-badge ${eligibility.sector_match ? 'eligibility-pass' : 'eligibility-fail'}`}>
                          {eligibility.sector_match ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                          {eligibility.sector_message}
                        </span>
                        <span className={`eligibility-badge ${eligibility.dpiit_match ? 'eligibility-pass' : 'eligibility-fail'}`}>
                          {eligibility.dpiit_match ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                          {eligibility.dpiit_message}
                        </span>
                      </div>
                      <div className="eligibility-guidance">
                        <Info size={12} style={{ display: 'inline', marginRight: 4 }} />
                        {eligibility.guidance}
                      </div>
                    </div>
                  )}

                  <div style={{ fontSize: 13, marginTop: 8 }}>
                    <strong>Outcomes:</strong> {c.outcomes}
                  </div>
                </div>

                <div className="card-actions">
                  {hasApplied ? (
                    <span style={{ fontSize: 13, color: '#10b981', fontWeight: 700 }}>
                      ✓ Proposal Submitted
                    </span>
                  ) : (
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      onClick={() => {
                        setSelectedChallenge(c);
                        setShowApplyModal(true);
                      }}
                    >
                      <Send size={14} /> Submit Application
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MY APPLICATIONS TAB */}
      {activeTab === 'applications' && (
        <div className="table-container">
          <table className="app-table">
            <thead>
              <tr>
                <th>App ID</th>
                <th>Challenge</th>
                <th>Status</th>
                <th>Evaluation Score</th>
                <th>Proposal Excerpt</th>
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {myApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
                    You haven't submitted any applications yet. Explore available challenges above!
                  </td>
                </tr>
              ) : (
                myApplications.map((app) => {
                  const challenge = challenges.find((c) => c.id === app.challenge_id);
                  return (
                    <tr key={app.id}>
                      <td style={{ fontWeight: 700 }}>
                        #{app.id}
                        {app.created_at && (
                          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 400, marginTop: 4 }}>
                            (Submitted on: {new Date(app.created_at).toLocaleDateString()})
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: 600 }}>{challenge?.title || `Challenge #${app.challenge_id}`}</td>
                      <td><StatusBadge status={app.status} /></td>
                      <td>
                        {app.evaluation ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ fontWeight: 800, color: app.evaluation.score >= 70 ? '#10b981' : '#f59e0b' }}>
                              {app.evaluation.score} / 100
                            </span>
                            {app.evaluation.created_at && (
                              <div style={{ fontSize: 11, color: '#64748b' }}>
                                (Reviewed on: {new Date(app.evaluation.created_at).toLocaleDateString()})
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Pending Evaluation</span>
                        )}
                      </td>
                      <td style={{ maxWidth: 300 }}>
                        <div style={{ fontSize: 13, color: '#475569', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {app.proposal_text}
                        </div>
                        {app.file_url && (
                          <div style={{ marginTop: 6 }}>
                            <button
                              onClick={() => setViewingFile(app.file_url || null)}
                              style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <FileText size={12} /> View Document
                            </button>
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: 12, color: '#64748b' }}>
                        {app.evaluation?.notes || 'No review notes yet.'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MY PILOT & EVIDENCE TAB */}
      {activeTab === 'pilot' && (
        <div>
          {myPilots.length === 0 ? (
            <div className="empty-state">
              <Clock size={40} color="#94a3b8" />
              <div className="empty-state-title">No Active Pilot Established</div>
              <div className="empty-state-sub">
                Once an officer shortlists your application and creates a pilot, you will be able to view scope and submit evidence here.
              </div>
            </div>
          ) : (
            selectedPilot && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="content-card">
                  <div className="content-card-header">
                    <div>
                      <h2 className="card-title">Deployed Pilot #{selectedPilot.id}</h2>
                      <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                        Timeline: {selectedPilot.timeline_start} to {selectedPilot.timeline_end} &bull; Status: {selectedPilot.status}
                      </div>
                    </div>
                    <StatusBadge status={selectedPilot.status} />
                  </div>
                  <p style={{ fontSize: 14, color: '#334155' }}>{selectedPilot.scope}</p>
                </div>

                {/* KPIs and Submit Evidence buttons */}
                <div className="content-card">
                  <h3 className="card-title" style={{ marginBottom: 16 }}>Target KPIs & Evidence Actions</h3>
                  {pilotKpis.length === 0 ? (
                    <div style={{ fontSize: 14, color: '#64748b', fontStyle: 'italic' }}>
                      No KPIs assigned yet by the municipal officer.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                      {pilotKpis.map((kpi) => {
                        const approvedEv = pilotEvidence.find((e) => e.kpi_id === kpi.id && e.status === 'approved');
                        const pendingEv = pilotEvidence.find((e) => e.kpi_id === kpi.id && e.status === 'pending');

                        return (
                          <div
                            key={kpi.id}
                            style={{
                              padding: 16,
                              borderRadius: 10,
                              background: approvedEv ? '#ecfdf5' : '#f8fafc',
                              border: `1px solid ${approvedEv ? '#a7f3d0' : '#e2e8f0'}`,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>KPI #{kpi.id}</div>
                              <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', margin: '6px 0' }}>{kpi.name}</div>
                              <div style={{ fontSize: 13, color: '#334155' }}>
                                Target: <strong>{kpi.target_value} {kpi.unit}</strong>
                              </div>
                              {approvedEv && (
                                <div style={{ marginTop: 8, fontSize: 12, color: '#059669', fontWeight: 700 }}>
                                  ✓ Achieved: {approvedEv.submitted_value} {kpi.unit} (Approved)
                                </div>
                              )}
                              {pendingEv && !approvedEv && (
                                <div style={{ marginTop: 8, fontSize: 12, color: '#d97706', fontWeight: 700 }}>
                                  ⏳ Evidence Under Review ({pendingEv.submitted_value} {kpi.unit})
                                </div>
                              )}
                            </div>

                            <div style={{ marginTop: 16 }}>
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ width: '100%' }}
                                onClick={() => {
                                  setSelectedKpi(kpi);
                                  setShowEvidenceModal(true);
                                }}
                              >
                                <Send size={13} /> Submit Proof of Achievement
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Evidence submissions list */}
                <div className="table-container">
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', fontWeight: 700, fontSize: 16 }}>
                    Evidence Verification History
                  </div>
                  <table className="app-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>KPI</th>
                        <th>Submitted Value</th>
                        <th>Field Notes / Documentation</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pilotEvidence.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: 20, color: '#64748b' }}>
                            No evidence submissions yet. Click "Submit Proof of Achievement" above to document KPI targets.
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
                              <td style={{ fontSize: 12, color: '#64748b' }}>
                                {new Date(ev.submitted_date).toLocaleDateString()}
                              </td>
                              <td><StatusBadge status={ev.status} /></td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Milestones & Invoices panel */}
                <div className="content-card">
                  <h3 className="card-title" style={{ marginBottom: 16 }}>Milestones & Invoices</h3>
                  {(!selectedPilot.milestones || selectedPilot.milestones.length === 0) ? (
                    <div style={{ fontSize: 14, color: '#64748b', fontStyle: 'italic' }}>
                      No milestones defined yet by the officer.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {selectedPilot.milestones.map((m) => (
                        <div key={m.id} style={{ padding: 16, border: '1px solid #e2e8f0', borderRadius: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 16 }}>{m.name} ({m.percentage_of_budget}%)</div>
                              <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>{m.description}</div>
                              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Due: {new Date(m.due_date).toLocaleDateString()}</div>
                            </div>
                            <div>
                              {m.status === 'released' ? (
                                <span style={{ padding: '4px 8px', background: '#ecfdf5', color: '#059669', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                                  Released ✓
                                </span>
                              ) : (
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => {
                                    setSelectedMilestone(m);
                                    setShowInvoiceModal(true);
                                  }}
                                >
                                  Submit Invoice
                                </button>
                              )}
                            </div>
                          </div>
                          {m.status === 'released' && m.release_notes && (
                            <div style={{ marginTop: 8, fontSize: 12, color: '#059669', fontStyle: 'italic' }}>
                              Notes: {m.release_notes}
                            </div>
                          )}
                          {m.invoices && m.invoices.length > 0 && (
                            <div style={{ marginTop: 12 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#334155' }}>Submitted Invoices</div>
                              <table className="app-table" style={{ fontSize: 12 }}>
                                <thead>
                                  <tr>
                                    <th>ID</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Notes</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {m.invoices.map(inv => (
                                    <tr key={inv.id}>
                                      <td>#{inv.id}</td>
                                      <td>₹{inv.amount.toLocaleString('en-IN')}</td>
                                      <td><StatusBadge status={inv.status} /></td>
                                      <td>{inv.review_notes || '-'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )
          )}
        </div>
      )}

      {/* DECISION SUPPORT TAB (STARTUP VIEW) */}
      {activeTab === 'decision' && selectedPilot && decisionSupport && (
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <DecisionSupportCard
            data={decisionSupport}
            decisionRecorded={Boolean(selectedPilot.decision)}
          />
        </div>
      )}

      {/* SUBMIT APPLICATION MODAL */}
      {showApplyModal && selectedChallenge && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">Apply to {selectedChallenge.title}</h3>
              <button className="modal-close-btn" onClick={() => setShowApplyModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleApply}>
              <div className="modal-body">
                <div className="eligibility-box">
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Informational Eligibility:</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    Sector: {myStartup?.sector} vs Challenge Required: {selectedChallenge.required_sector} &bull; DPIIT: {myStartup?.dpiit_status ? 'Recognized' : 'Not Recognized'}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Detailed Solution & Deployment Proposal</label>
                  <textarea
                    className="form-textarea"
                    style={{
                      minHeight: 140,
                      borderColor: touched.proposal && proposalText.length < 10 ? '#ef4444' : undefined
                    }}
                    placeholder="Describe your technical architecture, sensor deployment methodology, hardware specifications, and expected reduction in water losses..."
                    value={proposalText}
                    onChange={(e) => setProposalText(e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, proposal: true }))}
                  />
                  {touched.proposal && proposalText.length < 10 && (
                    <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>Proposal text is required (min 10 characters)</div>
                  )}
                </div>
                <FileUpload
                  label="Attach Proposal Document (PDF, max 5MB)"
                  onUploadSuccess={(url) => {
                    setAppFileUrl(url);
                    setAppFileError('');
                  }}
                />
                {appFileError && <p style={{color:'#ef4444',fontSize:'0.8rem', marginTop:'4px'}}>{appFileError}</p>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowApplyModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    setTouched({ proposal: true });
                    if (proposalText.length >= 10) {
                      setShowConfirmModal(true);
                    }
                  }}
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      {showConfirmModal && selectedChallenge && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">Confirm Submission</h3>
              <button className="modal-close-btn" onClick={() => setShowConfirmModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to submit your proposal for <strong>{selectedChallenge.title}</strong>? Once submitted, you cannot edit it.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={() => handleApply()}>
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT EVIDENCE MODAL */}
      {showEvidenceModal && selectedKpi && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">Submit Evidence for KPI: {selectedKpi.name}</h3>
              <button className="modal-close-btn" onClick={() => setShowEvidenceModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmitEvidence}>
              <div className="modal-body">
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 6, fontSize: 13, border: '1px solid #e2e8f0' }}>
                  Target Metric: <strong>{selectedKpi.target_value} {selectedKpi.unit}</strong>
                </div>
                <div className="form-group">
                  <label className="form-label">Submitted Value ({selectedKpi.unit})</label>
                  <input
                    type={!isNaN(Number(selectedKpi.target_value)) ? "number" : "text"}
                    step="any"
                    className="form-input"
                    required
                    placeholder={`e.g. ${selectedKpi.target_value}`}
                    value={evidenceValue}
                    onChange={(e) => {
                      if (!isNaN(Number(selectedKpi.target_value))) {
                        setEvidenceValue(parseFloat(e.target.value) || 0);
                      } else {
                        setEvidenceValue(e.target.value);
                      }
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Field Proof / Test Documentation Notes</label>
                  <textarea
                    className="form-textarea"
                    required
                    placeholder="Reference SCADA telemetry logs, pressure gauge readings, ultrasonic flow meter calibration certificates, and dates of measurement..."
                    value={evidenceDesc}
                    onChange={(e) => setEvidenceDesc(e.target.value)}
                  />
                </div>
                <FileUpload
                  label="Attach Evidence Document (PDF/JPG/PNG, max 5MB)"
                  onUploadSuccess={(url) => setEvidenceFileUrl(url)}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEvidenceModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Evidence for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBMIT INVOICE MODAL */}
      {showInvoiceModal && selectedMilestone && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">Submit Invoice: {selectedMilestone.name}</h3>
              <button className="modal-close-btn" onClick={() => setShowInvoiceModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmitInvoice}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    required
                    value={invoiceDesc}
                    onChange={(e) => setInvoiceDesc(e.target.value)}
                  />
                </div>
                <FileUpload
                  label="Attach Invoice Document (PDF)"
                  onUploadSuccess={(url) => setInvoiceFileUrl(url)}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInvoiceModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <FileViewerModal fileUrl={viewingFile} onClose={() => setViewingFile(null)} title="Document Viewer" />
    </div>
  );
};
