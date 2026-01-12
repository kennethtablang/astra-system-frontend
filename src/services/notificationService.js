// src/services/notificationService.js
import api from '../api/axios';

export const notificationService = {
  // Get user notifications
  async getUserNotifications(unreadOnly = false) {
    try {
      const { data } = await api.get('/notification', {
        params: { unreadOnly }
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark as read
  async markAsRead(notificationId) {
    try {
      const { data } = await api.post(`/notification/${notificationId}/read`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark all as read
  async markAllAsRead() {
    try {
      const { data } = await api.post('/notification/mark-all-read');
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get unread count
  async getUnreadCount() {
    try {
      const { data } = await api.get('/notification/unread-count');
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get audit logs
  async getAuditLogs(params = {}) {
    try {
      const { data } = await api.get('/notification/audit-logs', { params });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user audit logs
  async getUserAuditLogs(userId, limit = 50) {
    try {
      const { data } = await api.get(`/notification/audit-logs/user/${userId}`, {
        params: { limit }
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get my audit logs
  async getMyAuditLogs(limit = 50) {
    try {
      const { data } = await api.get('/notification/audit-logs/me', {
        params: { limit }
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export const reportService = {
  // Get dashboard stats
  async getDashboardStats(from, to) {
    try {
      const { data } = await api.get('/reports/dashboard-stats', {
        params: { from, to }
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Generate daily sales report
  async generateDailySalesReport(date) {
    try {
      const { data } = await api.get('/reports/daily-sales', {
        params: { date },
        responseType: 'blob'
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Generate delivery performance report
  async generateDeliveryPerformanceReport(from, to) {
    try {
      const { data } = await api.get('/reports/delivery-performance', {
        params: { from, to },
        responseType: 'blob'
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Generate agent activity report
  async generateAgentActivityReport(agentId, from, to) {
    try {
      const { data } = await api.get(`/reports/agent-activity/${agentId}`, {
        params: { from, to },
        responseType: 'blob'
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Move existing stock movement report here or keep it.
  // Generate stock movement report
  async generateStockMovementReport(warehouseId, from, to) {
    try {
      const { data } = await api.get(`/reports/stock-movement/${warehouseId}`, {
        params: { from, to },
        responseType: 'blob'
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get top selling products (JSON)
  async getTopSellingProducts(limit = 5, from = null, to = null) {
    try {
      const { data } = await api.get('/reports/top-products', {
        params: { limit, from, to }
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get daily sales report (JSON)
  async getDailySalesReport(date = null) {
    try {
      const { data } = await api.get('/reports/sales/daily', {
        params: { date }
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get monthly sales report (JSON)
  async getMonthlySalesReport(year = null, month = null) {
    try {
      const { data } = await api.get('/reports/sales/monthly', {
        params: { year, month }
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get quarterly sales report (JSON)
  async getQuarterlySalesReport(year = null, quarter = null) {
    try {
      const { data } = await api.get('/reports/sales/quarterly', {
        params: { year, quarter }
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get delivery performance data (JSON)
  async getDeliveryPerformanceData(from = null, to = null) {
    try {
      const { data } = await api.get('/reports/delivery-performance-data', {
        params: { from, to }
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get fast moving products (JSON)
  async getFastMovingProducts(limit = 5, from = null, to = null) {
    try {
      const { data } = await api.get('/reports/fast-moving-products', {
        params: { limit, from, to }
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default { notificationService, reportService };