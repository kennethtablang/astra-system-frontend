// src/services/warehouseService.js
import api from '../api/axios';

export const warehouseService = {
  // Get all warehouses
  async getWarehouses(distributorId) {
    try {
      const { data } = await api.get('/warehouse', {
        params: { distributorId }
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get warehouse by ID
  async getWarehouseById(warehouseId) {
    try {
      const { data } = await api.get(`/warehouse/${warehouseId}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create warehouse
  async createWarehouse(warehouseData) {
    try {
      const { data } = await api.post('/warehouse', warehouseData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update warehouse
  async updateWarehouse(warehouseId, warehouseData) {
    try {
      const { data } = await api.put(`/warehouse/${warehouseId}`, warehouseData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete warehouse
  async deleteWarehouse(warehouseId) {
    try {
      const { data } = await api.delete(`/warehouse/${warehouseId}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export const distributorService = {
  // Get all distributors
  async getDistributors() {
    try {
      const { data } = await api.get('/warehouse/distributor');
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get distributor by ID
  async getDistributorById(distributorId) {
    try {
      const { data } = await api.get(`/warehouse/distributor/${distributorId}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create distributor
  async createDistributor(distributorData) {
    try {
      const { data } = await api.post('/warehouse/distributor', distributorData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update distributor
  async updateDistributor(distributorId, distributorData) {
    try {
      const { data } = await api.put(`/warehouse/distributor/${distributorId}`, distributorData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete distributor
  async deleteDistributor(distributorId) {
    try {
      const { data } = await api.delete(`/warehouse/distributor/${distributorId}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default { warehouseService, distributorService };