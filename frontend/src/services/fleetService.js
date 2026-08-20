import api from './api';

export const fleetService = {
  getAll: async () => {
    const response = await api.get('/fleets');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/fleets', data);
    return response.data;
  },
};

export default fleetService;
