import api from '../api/axios';

const reportService = {
    // Get dashboard statistics
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

    // Generate daily sales report (Excel)
    async generateDailySalesReport(date) {
        try {
            const response = await api.get('/reports/daily-sales', {
                params: { date },
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Generate delivery performance report (Excel)
    async generateDeliveryPerformanceReport(from, to) {
        try {
            const response = await api.get('/reports/delivery-performance', {
                params: { from, to },
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Generate agent activity report (Excel)
    async generateAgentActivityReport(agentId, from, to) {
        try {
            const response = await api.get(`/reports/agent-activity/${agentId}`, {
                params: { from, to },
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Generate stock movement report (Excel)
    async generateStockMovementReport(warehouseId, from, to) {
        try {
            const response = await api.get(`/reports/stock-movement/${warehouseId}`, {
                params: { from, to },
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default reportService;
