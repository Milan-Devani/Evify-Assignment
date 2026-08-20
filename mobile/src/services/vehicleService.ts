import api from './api';
import { Vehicle, ApiResponse } from '../types';

export interface GetVehiclesParams {
  fleet?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const vehicleService = {
  /**
   * Fetch all vehicles with optional filters and pagination
   */
  getAll: async (params?: GetVehiclesParams): Promise<ApiResponse<Vehicle[]>> => {
    try {
      const response = await api.get<ApiResponse<Vehicle[]>>('/vehicles', { params });
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Failed to fetch vehicles';
      throw new Error(errorMessage);
    }
  },

  /**
   * Fetch a single vehicle by ID
   */
  getOne: async (id: string): Promise<ApiResponse<Vehicle>> => {
    try {
      const response = await api.get<ApiResponse<Vehicle>>(`/vehicles/${id}`);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Failed to fetch vehicle details';
      throw new Error(errorMessage);
    }
  },
};

export default vehicleService;
