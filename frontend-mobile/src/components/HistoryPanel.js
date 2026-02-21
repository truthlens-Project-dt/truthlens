import React, { useState, useEffect } from 'react';
import axios from 'axios';

const COLORS = {
  AUTHENTIC:  '#27ae60', FAKE: '#e74c3c',
  SUSPICIOUS: '#f39c12', NO_FACES: '#95a5a6', DEMO_MODE: '#3498db'
};
const EMOJI = {
  AUTHENTIC: '✅', FAKE: '❌', SUSPICIOUS: '⚠️', NO_FACES: '👤', DEMO_MODE: '🔧'
};

export default function HistoryPanel() {
  const [history, setHistory] = useState([]);
  const [open,    setOpen]    = useState(false);

  useEffect(() => {
    if (!open) return;
    axios.get('http://localhost:8000/api/v1/history?limit=10')
      .then(r => setHistory(r.data.results || []))
      .catch(() => {});
  }, [open]);

  return (
    <div style={{ margin: '0 auto 30px', maxWidth: '600px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          color: 'rgba(255,255,255,0.8)', padding: '8px 24px', borderRadius: '20px',
          cursor: 'pointer', fontSize: '0.85em'
        }}
      >
        {open ? '▲ Hide History' : '📋 Show History'}
      </button>

      {open && (
        <div style={{
          marginTop: '12px', background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px', overflow: 'hidden'
        }}>
          {history.length === 0
            ? <p style={{ color: 'rgba(255,255,255,0.4)', padding: '20px', fontSize: '0.85em' }}>No detections yet</p>
            : history.map(item => (
              <div key={item.request_id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}>
                <span>{EMOJI[item.verdict] || '❓'}</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ color: 'white', fontSize: '0.85em', fontWeight: '600' }}>
                    {item.filename}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75em' }}>
                    {(item.confidence * 100).toFixed(0)}% confidence
                  </div>
                </div>
                <span style={{
                  color: COLORS[item.verdict], fontWeight: 'bold', fontSize: '0.8em'
                }}>
                  {item.verdict}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75em' }}>
                  {item.processing_time_sec}s
                </span>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}