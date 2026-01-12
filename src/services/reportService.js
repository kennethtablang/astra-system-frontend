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
    },

    // NEW: Get daily sales report data
    async getDailySalesReport(date) {
        try {
            const { data } = await api.get('/reports/sales/daily', {
                params: { date }
            });
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    //  // Get weekly sales report
    async getWeeklySalesReport(date) {
        try {
            const { data } = await api.get('/reports/sales/weekly', { params: { date } });
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // NEW: Get monthly sales report data
    async getMonthlySalesReport(year, month) {
        try {
            const { data } = await api.get('/reports/sales/monthly', {
                params: { year, month }
            });
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // NEW: Get quarterly sales report data
    async getQuarterlySalesReport(year, quarter) {
        try {
            const { data } = await api.get('/reports/sales/quarterly', {
                params: { year, quarter }
            });
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // NEW: Get delivery performance data
    async getDeliveryPerformanceData(from, to) {
        try {
            const { data } = await api.get('/reports/delivery-performance-data', {
                params: { from, to }
            });
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // NEW: Get fast moving products by category
    async getFastMovingProducts(from, to, limit = 5) {
        try {
            const { data } = await api.get('/reports/fast-moving-products', {
                params: { from, to, limit }
            });
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // NEW: Get top selling products
    async getTopSellingProducts(limit = 5, from, to) {
        try {
            const { data } = await api.get('/reports/top-products', {
                params: { limit, from, to }
            });
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default reportService;
