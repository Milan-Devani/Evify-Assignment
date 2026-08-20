import React from 'react';

const STATUS_CONFIG = {
  active: {
    label: 'Active',
    bg: '#d1fae5',
    color: '#065f46',
    dot: '#10b981',
  },
  charging: {
    label: 'Charging',
    bg: '#fef3c7',
    color: '#92400e',
    dot: '#f59e0b',
  },
  maintenance: {
    label: 'Maintenance',
    bg: '#fee2e2',
    color: '#991b1b',
    dot: '#ef4444',
  },
  inactive: {
    label: 'Inactive',
    bg: '#f3f4f6',
    color: '#4b5563',
    dot: '#9ca3af',
  },
};

const StatusBadge = ({ status = 'active' }) => {
  const currentStatus = (status || 'active').toLowerCase();
  const config = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.inactive;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: config.bg,
        color: config.color,
        textTransform: 'capitalize',
        width: 'fit-content',
      }}
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: config.dot,
        }}
      />
      {config.label}
    </span>
  );
};

export default StatusBadge;
