import React, { useEffect, useState } from 'react';

/**
 * Animated horizontal confidence bar.
 * Props:
 *   value    — 0 to 100 (percentage)
 *   color    — CSS color string
 *   label    — text label above bar
 */
function ConfidenceBar({ value, color, label }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Small delay so CSS transition is visible
    const timer = setTimeout(() => setWidth(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div style={{ marginBottom: '16px', textAlign: 'left' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '6px',
        fontSize: '0.85em',
        color: '#555'
      }}>
        <span>{label}</span>
        <span style={{ fontWeight: 'bold', color }}>{value.toFixed(1)}%</span>
      </div>
      <div style={{
        background: '#eee',
        borderRadius: '20px',
        height: '10px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${width}%`,
          height: '100%',
          background: color,
          borderRadius: '20px',
          transition: 'width 0.9s cubic-bezier(0.4, 0, 0.2, 1)'
        }} />
      </div>
    </div>
  );
}

export default ConfidenceBar;