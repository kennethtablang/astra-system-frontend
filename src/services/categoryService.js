// src/services/categoryService.js
import api from '../api/axios';

const categoryService = {
    // Get all categories (optional search)
    async getCategories(searchTerm = null) {
        try {
            const { data } = await api.get('/category', {
                params: { searchTerm }
            });
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get category by ID
    async getCategoryById(id) {
        try {
            const { data } = await api.get(`/category/${id}`);
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get category by name
    async getCategoryByName(name) {
        try {
            const { data } = await api.get(`/category/name/${name}`);
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get category names only
    async getCategoryNames() {
        try {
            const { data } = await api.get('/category/names');
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Create category
    async createCategory(categoryData) {
        try {
            const { data } = await api.post('/category', categoryData);
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Update category
    async updateCategory(id, categoryData) {
        try {
            const { data } = await api.put(`/category/${id}`, categoryData);
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Delete category
    async deleteCategory(id) {
        try {
            const { data } = await api.delete(`/category/${id}`);
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default categoryService;
