import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../theme/ThemeContext';

const API_BASE = 'http://localhost:8000';

const COLORS = {
  AUTHENTIC: '#27ae60', FAKE: '#e74c3c',
  SUSPICIOUS: '#f39c12', NO_FACES: '#95a5a6', DEMO_MODE: '#3498db'
};

export default function StatsPage({ onBack }) {
  const { theme }            = useTheme();
  const [stats,   setStats]  = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API_BASE}/api/v1/stats`),
      axios.get(`${API_BASE}/api/v1/history?limit=50`),
      axios.get(`${API_BASE}/api/v1/model/info`),
    ]).then(([s, h, m]) => {
      setStats({ ...s.data, model: m.data });
      setHistory(h.data.results || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ color: theme.text, padding: '60px', textAlign: 'center' }}>
      Loading stats...
    </div>
  );

  const total    = stats?.total_detections || 0;
  const verdicts = stats?.verdict_breakdown || {};

  return (
    <div style={{ minHeight: '100vh', background: theme.background, padding: '40px 20px', color: theme.text }}>
      <button onClick={onBack} style={{
        background: 'transparent', border: `1px solid ${theme.border}`,
        color: theme.text, padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', marginBottom: '30px'
      }}>
        ← Back
      </button>

      <h2 style={{ marginBottom: '30px' }}>📊 Detection Statistics</h2>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', maxWidth: '800px', margin: '0 auto 40px' }}>
        <StatCard label="Total Detections"   value={total}                              theme={theme} />
        <StatCard label="Avg Confidence"     value={`${((stats?.avg_confidence||0)*100).toFixed(1)}%`} theme={theme} />
        <StatCard label="Avg Process Time"   value={`${stats?.avg_processing_time||0}s`} theme={theme} />
        <StatCard label="Model"              value={stats?.model?.model || 'EfficientNet'} theme={theme} />
      </div>

      {/* Verdict Breakdown Bar */}
      {total > 0 && (
        <div style={{ maxWidth: '600px', margin: '0 auto 40px', background: theme.surface, borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', color: theme.text }}>Verdict Breakdown</h3>
          {Object.entries(verdicts).map(([v, count]) => (
            <div key={v} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85em' }}>
                <span style={{ color: theme.text }}>{v}</span>
                <span style={{ color: COLORS[v], fontWeight: 'bold' }}>{count} ({((count/total)*100).toFixed(0)}%)</span>
              </div>
              <div style={{ background: theme.border, borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(count/total)*100}%`, height: '100%',
                  background: COLORS[v], borderRadius: '10px',
                  transition: 'width 1s ease'
                }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History Table */}
      {history.length > 0 && (
        <div style={{ maxWidth: '800px', margin: '0 auto', background: theme.surface, borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}` }}>
            <h3 style={{ color: theme.text }}>Recent Detections</h3>
          </div>
          {history.map(item => (
            <div key={item.request_id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 20px', borderBottom: `1px solid ${theme.border}`
            }}>
              <span style={{ color: COLORS[item.verdict], fontWeight: 'bold', width: '100px', fontSize: '0.8em' }}>
                {item.verdict}
              </span>
              <span style={{ color: theme.text, flex: 1, fontSize: '0.85em' }}>{item.filename}</span>
              <span style={{ color: theme.textMuted, fontSize: '0.78em' }}>
                {(item.confidence * 100).toFixed(0)}%
              </span>
              <span style={{ color: theme.textMuted, fontSize: '0.78em' }}>
                {item.processing_time_sec}s
              </span>
            </div>
          ))}
        </div>
      )}

      {total === 0 && (
        <p style={{ color: theme.textMuted, textAlign: 'center', marginTop: '60px' }}>
          No detections yet. Upload a video to see stats here.
        </p>
      )}
    </div>
  );
}

function StatCard({ label, value, theme }) {
  return (
    <div style={{ background: theme.surface, borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
      <div style={{ fontSize: '0.72em', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.6em', fontWeight: 'bold', color: theme.text }}>{value}</div>
    </div>
  );
}