import React from 'react';

const BatteryIndicator = ({ level = 100 }) => {
  const normalizedLevel = Math.max(0, Math.min(100, Number(level) || 0));

  let colorClass = '#10b981'; // Green (>60%)
  let bgClass = '#d1fae5';

  if (normalizedLevel <= 30) {
    colorClass = '#ef4444'; // Red (<30%)
    bgClass = '#fee2e2';
  } else if (normalizedLevel <= 60) {
    colorClass = '#f59e0b'; // Yellow (30-60%)
    bgClass = '#fef3c7';
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '130px' }}>
      <div
        style={{
          flex: 1,
          height: '10px',
          backgroundColor: '#e5e7eb',
          borderRadius: '9999px',
          overflow: 'hidden',
          border: '1px solid #d1d5db',
        }}
      >
        <div
          style={{
            width: `${normalizedLevel}%`,
            height: '100%',
            backgroundColor: colorClass,
            borderRadius: '9999px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <span
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: colorClass,
          backgroundColor: bgClass,
          padding: '2px 6px',
          borderRadius: '4px',
          minWidth: '42px',
          textAlign: 'center',
        }}
      >
        {normalizedLevel}%
      </span>
    </div>
  );
};

export default BatteryIndicator;
