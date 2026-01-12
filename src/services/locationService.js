import api from '../api/axios';

const locationService = {
    // ==================== CITY MANAGEMENT ====================

    // Get all cities
    async getCities(params = {}) {
        try {
            const { data } = await api.get('/city', { params });
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get city by ID
    async getCityById(cityId) {
        try {
            const { data } = await api.get(`/city/${cityId}`);
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Create city
    async createCity(cityData) {
        try {
            const { data } = await api.post('/city', cityData);
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Update city
    async updateCity(cityId, cityData) {
        try {
            const { data } = await api.put(`/city/${cityId}`, cityData);
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Delete city
    async deleteCity(cityId) {
        try {
            const { data } = await api.delete(`/city/${cityId}`);
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get cities for lookup
    async getCitiesForLookup(searchTerm = '') {
        try {
            const { data } = await api.get('/city/lookup', {
                params: { searchTerm }
            });
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get provinces
    async getProvinces() {
        try {
            const { data } = await api.get('/city/provinces');
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get regions
    async getRegions() {
        try {
            const { data } = await api.get('/city/regions');
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // ==================== BARANGAY MANAGEMENT ====================

    // Get barangay by ID
    async getBarangayById(barangayId) {
        try {
            const { data } = await api.get(`/barangay/${barangayId}`);
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get barangays (with filtering)
    async getBarangays(params = {}) {
        try {
            const { data } = await api.get('/barangay', { params });
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Create barangay
    async createBarangay(barangayData) {
        try {
            const { data } = await api.post('/barangay', barangayData);
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Bulk create barangays
    async bulkCreateBarangays(bulkData) {
        try {
            const { data } = await api.post('/barangay/bulk', bulkData);
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Update barangay
    async updateBarangay(barangayId, barangayData) {
        try {
            const { data } = await api.put(`/barangay/${barangayId}`, barangayData);
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Delete barangay
    async deleteBarangay(barangayId) {
        try {
            const { data } = await api.delete(`/barangay/${barangayId}`);
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get barangays for lookup
    async getBarangaysForLookup(cityId = null, searchTerm = '') {
        try {
            const { data } = await api.get('/barangay/lookup', {
                params: { cityId, searchTerm }
            });
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get barangays by city
    async getBarangaysByCity(cityId) {
        try {
            const { data } = await api.get(`/barangay/city/${cityId}`);
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default locationService;
