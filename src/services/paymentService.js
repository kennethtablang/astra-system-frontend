// src/services/paymentService.js
import api from '../api/axios';

export const paymentService = {
  // Get all payments with filters
  async getPayments(params = {}) {
    try {
      const { data } = await api.get('/payment', { params });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get payment by ID
  async getPaymentById(paymentId) {
    try {
      const { data } = await api.get(`/payment/${paymentId}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Record payment
  async recordPayment(paymentData) {
    try {
      const { data } = await api.post('/payment', paymentData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get payments by order
  async getPaymentsByOrder(orderId) {
    try {
      const { data } = await api.get(`/payment/order/${orderId}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Reconcile payment
  async reconcilePayment(reconcileData) {
    try {
      const { data } = await api.post('/payment/reconcile', reconcileData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get cash collection summary
  async getCashCollectionSummary(params = {}) {
    try {
      const { data } = await api.get('/payment/cash-collection', { params });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get unreconciled payments
  async getUnreconciledPayments() {
    try {
      const { data } = await api.get('/payment/unreconciled');
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get order balance
  async getOrderBalance(orderId) {
    try {
      const { data } = await api.get(`/payment/order/${orderId}/balance`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export const invoiceService = {
  // Get invoice by ID
  async getInvoiceById(invoiceId) {
    try {
      const { data } = await api.get(`/payment/invoice/${invoiceId}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get invoice by order ID
  async getInvoiceByOrderId(orderId) {
    try {
      const { data } = await api.get(`/payment/invoice/order/${orderId}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Generate invoice
  async generateInvoice(invoiceData) {
    try {
      const { data } = await api.post('/payment/invoice', invoiceData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Generate invoice PDF
  async generateInvoicePdf(invoiceId) {
    try {
      const { data } = await api.get(`/payment/invoice/${invoiceId}/pdf`, {
        responseType: 'blob'
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get AR summary
  async getARSummary() {
    try {
      const { data } = await api.get('/payment/ar/summary');
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get AR aging report
  async getARAgingReport() {
    try {
      const { data } = await api.get('/payment/ar/aging');
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get overdue invoices
  async getOverdueInvoices() {
    try {
      const { data } = await api.get('/payment/invoice/overdue');
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get invoices by store
  async getInvoicesByStore(storeId) {
    try {
      const { data } = await api.get(`/payment/invoice/store/${storeId}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default { paymentService, invoiceService };