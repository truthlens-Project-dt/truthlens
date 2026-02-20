import React from 'react';
import ConfidenceBar from './ConfidenceBar';

const VERDICT_CONFIG = {
  AUTHENTIC:  { emoji: '✅', color: '#27ae60', bg: '#eafaf1', label: 'Authentic Video' },
  FAKE:       { emoji: '❌', color: '#e74c3c', bg: '#fdedec', label: 'Deepfake Detected' },
  SUSPICIOUS: { emoji: '⚠️', color: '#f39c12', bg: '#fef9e7', label: 'Suspicious' },
  NO_FACES:   { emoji: '👤', color: '#95a5a6', bg: '#f2f3f4', label: 'No Faces Found' },
  DEMO_MODE:  { emoji: '🔧', color: '#3498db', bg: '#eaf4fc', label: 'Demo Mode' },
};

function ResultCard({ result, onReset }) {
  const cfg = VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG['DEMO_MODE'];

  const confidencePct    = (result.confidence    * 100);
  const fakeProbabilityPct = (result.fake_probability * 100);

  return (
    <div style={{
      background: cfg.bg,
      borderRadius: '20px',
      padding: '36px 40px',
      margin: '30px auto',
      maxWidth: '600px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      textAlign: 'left'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
        <span style={{ fontSize: '2.5em' }}>{cfg.emoji}</span>
        <div>
          <div style={{ fontSize: '0.75em', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Analysis Result
          </div>
          <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: cfg.color }}>
            {cfg.label}
          </div>
        </div>
      </div>

      {/* Animated Bars */}
      <ConfidenceBar
        label="Confidence"
        value={confidencePct}
        color={cfg.color}
      />
      <ConfidenceBar
        label="Fake Probability"
        value={fakeProbabilityPct}
        color={fakeProbabilityPct > 50 ? '#e74c3c' : '#27ae60'}
      />

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        margin: '24px 0'
      }}>
        {[
          { label: 'Frames Analyzed', value: result.frames_analyzed },
          { label: 'Total Frames',    value: result.total_frames },
          result.processing_time_sec !== undefined && {
            label: 'Processing Time', value: `${result.processing_time_sec}s`
          },
          result.file_size_mb !== undefined && {
            label: 'File Size', value: `${result.file_size_mb} MB`
          },
        ].filter(Boolean).map((item, i) => (
          <div key={i} style={{
            background: 'white',
            padding: '14px 16px',
            borderRadius: '12px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '0.72em', color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {item.label}
            </div>
            <div style={{ fontSize: '1.4em', fontWeight: 'bold', color: '#333', marginTop: '4px' }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filename */}
      <p style={{ color: '#aaa', fontSize: '0.82em' }}>📁 {result.filename}</p>
      {result.message && (
        <p style={{ color: '#aaa', fontSize: '0.82em', marginTop: '4px' }}>{result.message}</p>
      )}

      {/* Reset Button */}
      <button
        onClick={onReset}
        style={{
          marginTop: '24px',
          background: cfg.color,
          color: 'white',
          border: 'none',
          padding: '12px 32px',
          borderRadius: '50px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '0.95em',
          boxShadow: `0 4px 15px ${cfg.color}55`,
          transition: 'transform 0.2s'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
        onMouseOut={e  => e.currentTarget.style.transform = 'scale(1)'}
      >
        🔄 Try Another Video
      </button>
    </div>
  );
}

export default ResultCard;