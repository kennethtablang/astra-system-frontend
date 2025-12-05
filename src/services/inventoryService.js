// src/services/inventoryService.js
import api from '../api/axios';

const inventoryService = {
  // Get all inventory with filters
  async getInventories(params = {}) {
    try {
      const { data } = await api.get('/inventory', { params });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get inventory by ID
  async getInventoryById(inventoryId) {
    try {
      const { data } = await api.get(`/inventory/${inventoryId}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get inventory summary
  async getInventorySummary(warehouseId = null) {
    try {
      const params = warehouseId ? { warehouseId } : {};
      const { data } = await api.get('/inventory/summary', { params });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get inventory movements (history)
  async getInventoryMovements(inventoryId, limit = 50) {
    try {
      const { data } = await api.get(`/inventory/${inventoryId}/movements`, {
        params: { limit }
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create inventory
  async createInventory(inventoryData) {
    try {
      const { data } = await api.post('/inventory', inventoryData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Adjust inventory (add or deduct stock)
  async adjustInventory(adjustmentData) {
    try {
      const { data } = await api.post('/inventory/adjust', adjustmentData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Restock inventory (simplified restock operation)
  async restockInventory(restockData) {
    try {
      const { data } = await api.post('/inventory/restock', restockData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update inventory levels (reorder point, max stock)
  async updateInventoryLevels(levelsData) {
    try {
      const { data } = await api.put('/inventory/levels', levelsData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete inventory
  async deleteInventory(inventoryId) {
    try {
      const { data } = await api.delete(`/inventory/${inventoryId}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default inventoryService;