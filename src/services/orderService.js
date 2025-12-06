// src/services/orderService.js
import api from '../api/axios';

const orderService = {
  // Get all orders with filters
  async getOrders(params = {}) {
    try {
      const { data } = await api.get('/order', { params });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get order by ID
  async getOrderById(orderId) {
    try {
      const { data } = await api.get(`/order/${orderId}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create order
  async createOrder(orderData) {
    try {
      const { data } = await api.post('/order', orderData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Batch create orders
  async batchCreateOrders(ordersData) {
    try {
      const { data } = await api.post('/order/batch', ordersData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update order status
  async updateOrderStatus(statusData) {
    try {
      const { data } = await api.put('/order/status', statusData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Confirm order - SIMPLIFIED
  async confirmOrder(orderId, notes) {
    try {
      const { data } = await api.post(`/order/${orderId}/confirm`, { 
        notes: notes || undefined 
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark order as packed - SIMPLIFIED
  async markOrderAsPacked(orderId, notes) {
    try {
      const { data } = await api.post(`/order/${orderId}/pack-simple`, { 
        notes: notes || undefined 
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Cancel order
  async cancelOrder(orderId, reason) {
    try {
      const { data } = await api.post(`/order/${orderId}/cancel`, null, {
        params: { reason }
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get order summary
  async getOrderSummary(from, to) {
    try {
      const { data } = await api.get('/order/summary', {
        params: { from, to }
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get orders by status
  async getOrdersByStatus(status) {
    try {
      const { data } = await api.get(`/order/status/${status}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get orders ready for dispatch
  async getOrdersReadyForDispatch(warehouseId) {
    try {
      const { data } = await api.get('/order/ready-for-dispatch', {
        params: { warehouseId }
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Generate pick list
  async generatePickList(warehouseId, orderIds) {
    try {
      const { data } = await api.post(`/order/pick-list`, orderIds, {
        params: { warehouseId },
        responseType: 'blob'
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Generate packing slip
  async generatePackingSlip(orderId) {
    try {
      const { data } = await api.get(`/order/${orderId}/packing-slip`, {
        responseType: 'blob'
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Edit order (Pending orders only)
  async editOrder(orderId, orderData) {
    try {
      const { data } = await api.put(`/order/${orderId}`, orderData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Dispatch order (Assign to trip)
  async dispatchOrder(orderId, tripId) {
    try {
      const { data } = await api.post(`/order/${orderId}/dispatch`, { orderId, tripId });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark order in transit - SIMPLIFIED
  async markOrderInTransit(orderId) {
    try {
      const { data } = await api.post(`/order/${orderId}/in-transit-simple`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark order at store - SIMPLIFIED
  async markOrderAtStore(orderId) {
    try {
      const { data } = await api.post(`/order/${orderId}/at-store-simple`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark order delivered - SIMPLIFIED
  async markOrderDelivered(orderId, notes) {
    try {
      const { data } = await api.post(`/order/${orderId}/delivered-simple`, { 
        notes: notes || undefined 
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark order returned - SIMPLIFIED
  async markOrderReturned(orderId, reason) {
    try {
      const { data } = await api.post(`/order/${orderId}/returned-simple`, { 
        reason 
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default orderService;