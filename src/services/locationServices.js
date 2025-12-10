// src/services/locationServices.js
import api from '../api/axios';

/**
 * Location Service - Manages cities and barangays
 * Provides comprehensive CRUD operations for location hierarchy
 */
const locationServices = {
  // ==================== CITY OPERATIONS ====================
  
  // Get all cities with filters
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

  // Get city by name
  async getCityByName(name) {
    try {
      const { data } = await api.get(`/city/name/${encodeURIComponent(name)}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get cities for lookup (simple list for dropdowns)
  async getCitiesForLookup(searchTerm = null) {
    try {
      const params = searchTerm ? { searchTerm } : {};
      const { data } = await api.get('/city/lookup', { params });
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

  // ==================== BARANGAY OPERATIONS ====================
  
  // Get all barangays with filters
  async getBarangays(params = {}) {
    try {
      const { data } = await api.get('/barangay', { params });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get barangay by ID
  async getBarangayById(barangayId) {
    try {
      const { data } = await api.get(`/barangay/${barangayId}`);
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
  },

  // Get barangays for lookup (simple list for dropdowns)
  async getBarangaysForLookup(cityId = null, searchTerm = null) {
    try {
      const params = {};
      if (cityId) params.cityId = cityId;
      if (searchTerm) params.searchTerm = searchTerm;
      
      const { data } = await api.get('/barangay/lookup', { params });
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
};

export default locationServices;

// ==================== COMPATIBILITY LAYER ====================
// These are helper methods for backward compatibility with old Store modal usage
// They wrap the new API endpoints to maintain compatibility

export const getStoreCitiesLookup = async () => {
  try {
    const { data } = await api.get('/city/lookup');
    // Transform the response to match the old format expected by modals
    if (data.success && Array.isArray(data.data)) {
      return {
        success: true,
        data: data.data.map(city => city.name)
      };
    }
    return data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getStoreBarangaysLookup = async (cityName = null) => {
  try {
    let params = {};
    
    // If cityName is provided, we need to get the city ID first
    if (cityName) {
      const cityResponse = await api.get(`/city/name/${encodeURIComponent(cityName)}`);
      if (cityResponse.data.success && cityResponse.data.data) {
        params.cityId = cityResponse.data.data.id;
      }
    }
    
    const { data } = await api.get('/barangay/lookup', { params });
    
    // Transform the response to match the old format
    if (data.success && Array.isArray(data.data)) {
      return {
        success: true,
        data: data.data.map(barangay => ({
          barangay: barangay.name,
          storeCount: barangay.storeCount || 0
        }))
      };
    }
    return data;
  } catch (error) {
    throw error.response?.data || error;
  }
};