// src/services/deliveryService.js
import api from '../api/axios';

const deliveryService = {
  // Upload delivery photo
  async uploadDeliveryPhoto(photoData) {
    try {
      const formData = new FormData();
      formData.append('orderId', photoData.orderId);
      formData.append('photo', photoData.photo);
      if (photoData.lat) formData.append('lat', photoData.lat);
      if (photoData.lng) formData.append('lng', photoData.lng);
      if (photoData.notes) formData.append('notes', photoData.notes);

      const { data } = await api.post('/delivery/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get delivery photos
  async getDeliveryPhotos(orderId) {
    try {
      const { data } = await api.get(`/delivery/order/${orderId}/photos`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update location
  async updateLocation(locationData) {
    try {
      const { data } = await api.post('/delivery/location', locationData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get live trip tracking
  async getLiveTripTracking(tripId) {
    try {
      const { data } = await api.get(`/delivery/trip/${tripId}/tracking`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark order as delivered
  async markOrderAsDelivered(deliveryData) {
    try {
      const formData = new FormData();
      formData.append('orderId', deliveryData.orderId);
      if (deliveryData.latitude) formData.append('latitude', deliveryData.latitude);
      if (deliveryData.longitude) formData.append('longitude', deliveryData.longitude);
      if (deliveryData.notes) formData.append('notes', deliveryData.notes);
      if (deliveryData.recipientName) formData.append('recipientName', deliveryData.recipientName);
      if (deliveryData.recipientPhone) formData.append('recipientPhone', deliveryData.recipientPhone);
      
      if (deliveryData.photos && deliveryData.photos.length > 0) {
        deliveryData.photos.forEach(photo => {
          formData.append('photos', photo);
        });
      }

      const { data } = await api.post('/delivery/mark-delivered', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Report delivery exception
  async reportDeliveryException(exceptionData) {
    try {
      const formData = new FormData();
      formData.append('orderId', exceptionData.orderId);
      formData.append('exceptionType', exceptionData.exceptionType);
      formData.append('description', exceptionData.description);
      
      if (exceptionData.photos && exceptionData.photos.length > 0) {
        exceptionData.photos.forEach(photo => {
          formData.append('photos', photo);
        });
      }

      const { data } = await api.post('/delivery/exception', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Record delivery attempt
  async recordDeliveryAttempt(attemptData) {
    try {
      const { data } = await api.post('/delivery/attempt', attemptData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get delivery exceptions
  async getDeliveryExceptions(orderId) {
    try {
      const { data } = await api.get('/delivery/exceptions', {
        params: { orderId }
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default deliveryService;