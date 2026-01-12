// src/services/settingsService.js
import api from '../api/axios';

const settingsService = {
    // Get all system settings
    async getSettings() {
        try {
            const { data } = await api.get('/settings');
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Update system settings
    async updateSettings(settingsData) {
        try {
            const { data } = await api.put('/settings', settingsData);
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Upload company logo
    async uploadLogo(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const { data } = await api.post('/settings/logo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default settingsService;
