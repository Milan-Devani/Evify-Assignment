import api from './api';

const adminService = {
  /**
   * Create a new admin user
   * @param {Object} adminData - { firstName, lastName, phone, password, confirmPassword, role, address }
   */
  createAdmin: async (adminData) => {
    const response = await api.post('/auth/create-admin', adminData);
    return response.data;
  },

  /**
   * Fetch all created admins
   */
  listAdmins: async () => {
    const response = await api.get('/auth/admins');
    return response.data;
  },
};

export default adminService;
