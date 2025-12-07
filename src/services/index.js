// src/services/index.js
// Central export file for all services

import authService from './authService';
import userService from './userService';
import orderService from './orderService';
import productService from './productService';
import storeService from './storeService';
import tripService from './tripService';
import deliveryService from './deliveryService';
import inventoryService from './inventoryService';
import receiptService from './receiptService'; // NEW: Import receipt service
import { paymentService, invoiceService } from './paymentService';
import { warehouseService, distributorService } from './warehouseService';
import { notificationService, reportService } from './notificationService';

// Named exports for individual imports
export { default as authService } from './authService';
export { default as userService } from './userService';
export { default as orderService } from './orderService';
export { default as productService } from './productService';
export { default as storeService } from './storeService';
export { default as tripService } from './tripService';
export { default as deliveryService } from './deliveryService';
export { default as inventoryService } from './inventoryService';
export { default as receiptService } from './receiptService'; // NEW: Export receipt service

export { 
  paymentService, 
  invoiceService 
} from './paymentService';

export { 
  warehouseService, 
  distributorService 
} from './warehouseService';

export { 
  notificationService, 
  reportService 
} from './notificationService';

// Convenience object for easy access to all services
export const services = {
  auth: authService,
  user: userService,
  order: orderService,
  product: productService,
  store: storeService,
  trip: tripService,
  delivery: deliveryService,
  inventory: inventoryService,
  receipt: receiptService, // NEW: Add to services object
  payment: paymentService,
  invoice: invoiceService,
  warehouse: warehouseService,
  distributor: distributorService,
  notification: notificationService,
  report: reportService,
};