import { VehicleStatus } from '../types';

export const STATUS_COLORS: Record<VehicleStatus, { bg: string; text: string; dot: string }> = {
  active: {
    bg: '#E8F5E9',
    text: '#2E7D32',
    dot: '#4CAF50',
  },
  charging: {
    bg: '#FFF3E0',
    text: '#E65100',
    dot: '#FF9800',
  },
  maintenance: {
    bg: '#FFEBEE',
    text: '#C62828',
    dot: '#F44336',
  },
  inactive: {
    bg: '#F5F5F5',
    text: '#616161',
    dot: '#9E9E9E',
  },
};

export const getStatusColor = (status: VehicleStatus) => {
  return STATUS_COLORS[status] || STATUS_COLORS.inactive;
};

export const getBatteryColor = (level: number): string => {
  if (level > 60) return '#4CAF50';
  if (level >= 30) return '#FF9800';
  return '#F44336';
};
