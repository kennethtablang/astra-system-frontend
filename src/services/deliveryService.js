// src/services/deliveryService.js
import api from '../api/axios';

const deliveryService = {
  // ==================== DELIVERY PHOTOS ====================
  
  // Upload delivery photo
  async uploadDeliveryPhoto(photoData) {
    try {
      const formData = new FormData();
      formData.append('orderId', photoData.orderId);
      formData.append('photo', photoData.photo);
      
      if (photoData.lat) {
        formData.append('lat', photoData.lat);
      }
      if (photoData.lng) {
        formData.append('lng', photoData.lng);
      }
      if (photoData.notes) {
        formData.append('notes', photoData.notes);
      }

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

  // Get delivery photos for an order
  async getDeliveryPhotos(orderId) {
    try {
      const { data } = await api.get(`/delivery/order/${orderId}/photos`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== LOCATION TRACKING ====================
  
  // Update current location
  async updateLocation(locationData) {
    try {
      const { data } = await api.post('/delivery/location', {
        tripId: locationData.tripId,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        timestamp: locationData.timestamp || new Date().toISOString(),
        speed: locationData.speed,
        accuracy: locationData.accuracy
      });
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

  // ==================== DELIVERY COMPLETION ====================
  
  // Mark order as delivered
  async markOrderAsDelivered(deliveryData) {
    try {
      const formData = new FormData();
      formData.append('orderId', deliveryData.orderId);
      
      if (deliveryData.latitude) {
        formData.append('latitude', deliveryData.latitude);
      }
      if (deliveryData.longitude) {
        formData.append('longitude', deliveryData.longitude);
      }
      if (deliveryData.notes) {
        formData.append('notes', deliveryData.notes);
      }
      if (deliveryData.recipientName) {
        formData.append('recipientName', deliveryData.recipientName);
      }
      if (deliveryData.recipientPhone) {
        formData.append('recipientPhone', deliveryData.recipientPhone);
      }
      
      // Append photos
      if (deliveryData.photos && deliveryData.photos.length > 0) {
        deliveryData.photos.forEach((photo) => {
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

  // ==================== DELIVERY EXCEPTIONS ====================
  
  // Report delivery exception
  async reportDeliveryException(exceptionData) {
    try {
      const formData = new FormData();
      formData.append('orderId', exceptionData.orderId);
      formData.append('exceptionType', exceptionData.exceptionType);
      formData.append('description', exceptionData.description);
      
      // Append exception photos
      if (exceptionData.photos && exceptionData.photos.length > 0) {
        exceptionData.photos.forEach((photo) => {
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

  // Get delivery exceptions
  async getDeliveryExceptions(orderId = null) {
    try {
      const params = orderId ? { orderId } : {};
      const { data } = await api.get('/delivery/exceptions', { params });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== DELIVERY ATTEMPTS ====================
  
  // Record delivery attempt
  async recordDeliveryAttempt(attemptData) {
    try {
      const { data } = await api.post('/delivery/attempt', {
        orderId: attemptData.orderId,
        attemptResult: attemptData.attemptResult,
        notes: attemptData.notes,
        attemptedAt: attemptData.attemptedAt || new Date().toISOString()
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== HELPER FUNCTIONS ====================
  
  // Get current geolocation
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed,
            timestamp: new Date(position.timestamp).toISOString()
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  },

  // Start location tracking for a trip
  startLocationTracking(tripId, callback, intervalMs = 30000) {
    let intervalId = null;
    let isTracking = false;

    const track = async () => {
      if (!isTracking) return;

      try {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const locationData = {
                tripId,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                timestamp: new Date().toISOString(),
                speed: position.coords.speed,
                accuracy: position.coords.accuracy
              };

              const result = await deliveryService.updateLocation(locationData);
              
              if (callback) {
                callback({ success: true, location: locationData, result });
              }
            },
            (error) => {
              console.error('Geolocation error:', error);
              if (callback) {
                callback({ success: false, error: error.message });
              }
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        }
      } catch (error) {
        console.error('Location tracking error:', error);
        if (callback) {
          callback({ success: false, error: error.message });
        }
      }
    };

    // Start tracking
    isTracking = true;
    track(); // Initial track
    intervalId = setInterval(track, intervalMs);

    // Return stop function
    return () => {
      isTracking = false;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
  },

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  },

  // Validate if dispatcher is near the store (within 100 meters)
  isNearStore(dispatcherLat, dispatcherLon, storeLat, storeLon, thresholdKm = 0.1) {
    if (!storeLat || !storeLon) return true; // Skip validation if store coordinates not available
    
    const distance = this.calculateDistance(
      dispatcherLat,
      dispatcherLon,
      storeLat,
      storeLon
    );
    return distance <= thresholdKm;
  }
};

export default deliveryService;