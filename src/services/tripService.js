// src/services/tripService.js
import api from '../api/axios';

const tripService = {
  // Get all trips with filters
  async getTrips(params = {}) {
    try {
      const { data } = await api.get('/trip', { params });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get trip by ID
  async getTripById(tripId) {
    try {
      const { data } = await api.get(`/trip/${tripId}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create trip
  async createTrip(tripData) {
    try {
      const { data } = await api.post('/trip', tripData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update trip
  async updateTrip(tripId, tripData) {
    try {
      const { data } = await api.put(`/trip/${tripId}`, tripData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update trip status
  async updateTripStatus(statusData) {
    try {
      const { data } = await api.put('/trip/status', statusData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Reorder trip assignments
  async reorderTripAssignments(reorderData) {
    try {
      const { data } = await api.post('/trip/reorder', reorderData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Cancel trip
  async cancelTrip(tripId, reason) {
    try {
      const { data } = await api.post(`/trip/${tripId}/cancel`, null, {
        params: { reason }
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get trip manifest
  async getTripManifest(tripId) {
    try {
      const { data } = await api.get(`/trip/${tripId}/manifest`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Generate trip manifest PDF
  async generateTripManifestPdf(tripId) {
    try {
      const { data } = await api.get(`/trip/${tripId}/manifest/pdf`, {
        responseType: 'blob'
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get active trips
  async getActiveTrips(dispatcherId) {
    try {
      const { data } = await api.get('/trip/active', {
        params: { dispatcherId }
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Suggest trip sequence
  async suggestTripSequence(orderIds) {
    try {
      const { data } = await api.post('/trip/suggest-sequence', orderIds);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default tripService;