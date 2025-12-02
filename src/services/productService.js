// src/services/productService.js
import api from '../api/axios';

const productService = {
  // Get all products with filters
  async getProducts(params = {}) {
    try {
      const { data } = await api.get('/product', { params });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get product by ID
  async getProductById(productId) {
    try {
      const { data } = await api.get(`/product/${productId}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get product by SKU
  async getProductBySku(sku) {
    try {
      const { data } = await api.get(`/product/sku/${sku}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get products for lookup
  async getProductsForLookup(searchTerm) {
    try {
      const { data } = await api.get('/product/lookup', {
        params: { searchTerm }
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create product
  async createProduct(productData) {
    try {
      const { data } = await api.post('/product', productData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update product
  async updateProduct(productId, productData) {
    try {
      const { data } = await api.put(`/product/${productId}`, productData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete product
  async deleteProduct(productId) {
    try {
      const { data } = await api.delete(`/product/${productId}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Bulk update prices
  async bulkUpdatePrices(priceData) {
    try {
      const { data } = await api.post('/product/bulk-price-update', priceData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get product categories
  async getCategories() {
    try {
      const { data } = await api.get('/product/categories');
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Generate barcode
  async generateBarcode(barcodeData) {
    try {
      const { data } = await api.post('/product/barcode', barcodeData, {
        responseType: 'blob'
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default productService;