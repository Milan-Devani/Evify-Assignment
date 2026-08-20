export type VehicleStatus = 'active' | 'charging' | 'maintenance' | 'inactive';

export interface Fleet {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Vehicle {
  _id: string;
  registrationNumber: string;
  model: string;
  status: VehicleStatus;
  fleet: Fleet | string;
  batteryLevel: number;
  lastMaintenance?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  pagination?: PaginationData;
  data: T;
  error?: string;
  message?: string;
}

export type RootStackParamList = {
  VehicleList: undefined;
  VehicleDetail: { vehicleId: string; registrationNumber: string };
};
