// src/services/userService.js
import api from '../api/axios';

const userService = {
  // Get all users with filters
  async getUsers(params = {}) {
    try {
      const { data } = await api.get('/user', { params });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user by ID
  async getUserById(userId) {
    try {
      const { data } = await api.get(`/user/${userId}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user by email
  async getUserByEmail(email) {
    try {
      const { data } = await api.get(`/user/email/${email}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get current user profile
  async getCurrentUser() {
    try {
      const { data } = await api.get('/user/me');
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update user profile (Self)
  async updateProfile(profileData) {
    try {
      const { data } = await api.put('/user/profile', profileData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update user profile (Admin)
  async updateUserProfile(userId, profileData) {
    try {
      const { data } = await api.put(`/user/${userId}/profile`, profileData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Approve user
  async approveUser(approvalData) {
    try {
      const { data } = await api.post('/user/approve', approvalData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Assign roles to user
  async assignRoles(roleData) {
    try {
      const { data } = await api.post('/user/assign-roles', roleData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user roles
  async getUserRoles(userId) {
    try {
      const { data } = await api.get(`/user/${userId}/roles`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all roles
  async getAllRoles() {
    try {
      const { data } = await api.get('/user/roles');
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get users by role
  async getUsersByRole(role) {
    try {
      const { data } = await api.get(`/user/role/${role}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get unapproved users
  async getUnapprovedUsers() {
    try {
      const { data } = await api.get('/user/unapproved');
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete user
  async deleteUser(userId) {
    try {
      const { data } = await api.delete(`/user/${userId}`);
      return data;
    } catch (error) {
    }
  },

  // Set 2FA status
  async setTwoFactorStatus(enabled) {
    try {
      const { data } = await api.post('/auth/2fa/status', { enabled });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default userService;