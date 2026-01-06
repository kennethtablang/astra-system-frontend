import api from '../api/axios';

const locationService = {
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
