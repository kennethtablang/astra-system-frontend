// src/services/authService.js
import api from '../api/axios';

const authService = {
  // Login
  async login(credentials) {
    try {
      const { data } = await api.post('/auth/login', credentials);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Register
  async register(userData) {
    try {
      const { data } = await api.post('/auth/register', userData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Logout
  async logout() {
    try {
      const { data } = await api.post('/auth/logout');
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Refresh Token
  async refreshToken(refreshToken) {
    try {
      const { data } = await api.post('/auth/refresh', { refreshToken });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Forgot Password
  async forgotPassword(email) {
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Reset Password
  async resetPassword(resetData) {
    try {
      const { data } = await api.post('/auth/reset-password', resetData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Change Password
  async changePassword(passwordData) {
    try {
      const { data } = await api.post('/auth/change-password', passwordData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Confirm Email
  async confirmEmail(confirmData) {
    try {
      const { data } = await api.post('/auth/confirm-email', confirmData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Resend Confirmation
  async resendConfirmation(email) {
    try {
      const { data } = await api.post('/auth/resend-confirmation', { email });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Request 2FA Code
  async requestTwoFactorCode(email) {
    try {
      const { data } = await api.post('/auth/2fa/request', { email });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Verify 2FA Code
  async verifyTwoFactor(verifyData) {
    try {
      const { data } = await api.post('/auth/2fa/verify', verifyData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Set 2FA Enabled Status
  async setTwoFactorEnabled(enabled) {
    try {
      const { data } = await api.post('/auth/2fa/status', { enabled });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get Current User
  async getCurrentUser() {
    try {
      const { data } = await api.get('/auth/me');
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default authService;