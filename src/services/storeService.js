// src/services/storeService.js - FIXED
import api from '../api/axios';

const storeService = {
  // Get all stores with filters
  async getStores(params = {}) {
    try {
      const { data } = await api.get('/store', { params });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get store by ID
  async getStoreById(storeId) {
    try {
      const { data } = await api.get(`/store/${storeId}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get stores for lookup
  async getStoresForLookup(searchTerm) {
    try {
      const { data } = await api.get('/store/lookup', {
        params: { searchTerm }
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create store
  async createStore(storeData) {
    try {
      const { data } = await api.post('/store', storeData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update store
  async updateStore(storeId, storeData) {
    try {
      const { data } = await api.put(`/store/${storeId}`, storeData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete store
  async deleteStore(storeId) {
    try {
      const { data } = await api.delete(`/store/${storeId}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update credit limit
  async updateCreditLimit(creditData) {
    try {
      const { data } = await api.post('/store/credit-limit', creditData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get store with balance
  async getStoreWithBalance(storeId) {
    try {
      const { data } = await api.get(`/store/${storeId}/balance`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get stores with outstanding balance
  async getStoresWithOutstandingBalance() {
    try {
      const { data } = await api.get('/store/outstanding-balances');
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default storeService;