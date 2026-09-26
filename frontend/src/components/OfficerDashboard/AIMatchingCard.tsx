import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import type { AIMatchResponse, RecommendationItem } from '../../types';

interface AIMatchingCardProps {
  challengeId: number;
}

export const AIMatchingCard: React.FC<AIMatchingCardProps> = ({ challengeId }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AIMatchResponse | null>(null);
  const [expandedStartupId, setExpandedStartupId] = useState<number | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getAIMatchingRecommendations(challengeId);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch AI recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (challengeId) {
      fetchMatches();
    }
  }, [challengeId]);

  const toggleExpand = (id: number) => {
    setExpandedStartupId(expandedStartupId === id ? null : id);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '24px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
      color: '#f8fafc',
      marginTop: '20px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>⚡</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
              AI Smart Matcher
            </h3>
            {data?.ai_service_online === false && (
              <span style={{
                fontSize: '0.75rem',
                backgroundColor: 'rgba(234, 179, 8, 0.2)',
                color: '#facc15',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid rgba(234, 179, 8, 0.3)'
              }}>
                Demo Cache
              </span>
            )}
            {data?.ai_service_online && (
              <span style={{
                fontSize: '0.75rem',
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                color: '#4ade80',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid rgba(34, 197, 94, 0.3)'
              }}>
                AI Microservice Online
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
            ML-ranked startup recommendations using sentence embeddings & domain scoring
          </p>
        </div>

        <button
          onClick={fetchMatches}
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          {loading ? 'Refreshing...' : '🔄 Re-Run Matcher'}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🤖</div>
          Evaluating semantic vector embeddings & computing suitability scores...
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '0.875rem'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Results list */}
      {!loading && data && data.recommendations && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.recommendations.map((rec: RecommendationItem) => {
            const isExpanded = expandedStartupId === rec.startup_id;
            return (
              <div
                key={rec.startup_id}
                style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '16px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(99, 102, 241, 0.2)',
                      color: '#818cf8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.875rem'
                    }}>
                      #{rec.rank}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
                        {rec.startup_name}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        ID: {rec.startup_id}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>
                        {rec.final_score.toFixed(1)}%
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Match Score</div>
                    </div>

                    <button
                      onClick={() => toggleExpand(rec.startup_id)}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#cbd5e1',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      {isExpanded ? 'Hide Details ▲' : 'View AI Breakdown ▼'}
                    </button>
                  </div>
                </div>

                {/* Score breakdown bar */}
                <div style={{
                  marginTop: '12px',
                  height: '6px',
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  display: 'flex'
                }}>
                  <div style={{ width: `${rec.final_score}%`, background: 'linear-gradient(90deg, #6366f1, #38bdf8)', height: '100%' }} />
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px dashed rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                      <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '8px 12px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Semantic NLP</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#a78bfa' }}>{rec.semantic_score.toFixed(1)}%</div>
                      </div>
                      <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '8px 12px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Tech Match</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>{rec.technology_match.toFixed(1)}%</div>
                      </div>
                      <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '8px 12px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Sector Score</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4ade80' }}>{rec.sector_match.toFixed(1)}%</div>
                      </div>
                      <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '8px 12px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Budget Alignment</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#facc15' }}>{rec.budget_score.toFixed(1)}%</div>
                      </div>
                    </div>

                    {rec.reasons && rec.reasons.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                          🧠 AI Reasoning & Key Match Factors:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.5' }}>
                          {rec.reasons.map((reason: string, idx: number) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
