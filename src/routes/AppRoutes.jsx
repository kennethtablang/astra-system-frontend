// src/routes/AppRoutes.jsx - FIXED VERSION
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";

// Auth Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Unauthorized from "../pages/Unauthorized";
import NotFound from "../pages/NotFound";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminRoles from "../pages/admin/AdminRoles";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminOrderCreate from "../pages/admin/AdminOrderCreate";
import AdminOrdersPending from "../pages/admin/AdminOrdersPending";
import AdminOrdersHistory from "../pages/admin/AdminOrdersHistory";
import AdminTrips from "../pages/admin/AdminTrips";
import AdminTripsActive from "../pages/admin/AdminTripsActive";
import AdminTripsHistory from "../pages/admin/AdminTripsHistory";
import AdminTripDetails from "../pages/admin/AdminTripDetails";
import AdminTripTracking from "../pages/admin/AdminTripTracking";

// Delivery Pages (Admin role access)
import AdminDeliveries from "../pages/admin/AdminDeliveries";
import AdminDeliveriesExceptions from "../pages/admin/AdminDeliveriesExceptions";
import AdminDeliveriesLive from "../pages/admin/AdminDeliveriesLive";
import AdminDeliveriesPhotos from "../pages/admin/AdminDeliveriesPhotos";

// Dispatcher specific pages (shown in admin interface for testing/demo)
import DispatcherDeliveries from "../pages/admin/DispatcherDeliveries";
import DispatcherDeliveryDetails from "../pages/admin/DispatcherDeliveryDetails";

import AdminStores from "../pages/admin/AdminStores";
import AdminStoreCity from "../pages/admin/AdminStoreCity";
import AdminStoreBarangay from "../pages/admin/AdminStoreBarangay";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminProductCategories from "../pages/admin/AdminProductCategories";
import AdminInventory from "../pages/admin/AdminInventory";
import AdminDistributors from "../pages/admin/AdminDistributors";
import AdminRoutes from "../pages/admin/AdminRoutes";
import AdminFinance from "../pages/admin/AdminFinance";
import { AdminPayments } from "../pages/admin/AdminPayments";
import { AdminInvoices } from "../pages/admin/AdminInvoices";
import { AdminTransactions } from "../pages/admin/AdminTransactions";
import { AdminReports } from "../pages/admin/AdminReports";
import { AdminSalesReports } from "../pages/admin/AdminSalesReports";
import { AdminPerformance } from "../pages/admin/AdminPerformance";
import { AdminCustomReports } from "../pages/admin/AdminCustomReports";
import { AdminSettings } from "../pages/admin/AdminSettings";
import { AdminSettingsGeneral } from "../pages/admin/AdminSettingsGeneral";
import { AdminSettingsNotifications } from "../pages/admin/AdminSettingsNotifications";
import { AdminSettingsSecurity } from "../pages/admin/AdminSettingsSecurity";
import { AdminProfileSettings } from "../pages/admin/AdminProfileSettings";

// Agent Pages
import AgentDashboard from "../pages/agent/AgentDashboard";
import AgentOrdersList from "../pages/agent/AgentOrdersList";
import AgentCreateOrder from "../pages/agent/AgentCreateOrder";
import AgentOrderDetail from "../pages/agent/AgentOrderDetail";
import AgentStoresList from "../pages/agent/AgentStoresList";

// Dispatcher Pages (Actual dispatcher role)
import DispatcherDashboard from "../pages/dispatcher/DispatcherDashboard";

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          !isAuthenticated ? <Login /> : <Navigate to="/admin/dashboard" />
        }
      />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        <Route path="/admin/profile" element={<AdminProfileSettings />} />

        {/* User Management */}
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/roles" element={<AdminRoles />} />

        {/* Order Management */}
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/orders/pending" element={<AdminOrdersPending />} />
        <Route path="/admin/orders/history" element={<AdminOrdersHistory />} />
        <Route path="/admin/orders/create" element={<AdminOrderCreate />} />

        {/* Trip Management */}
        <Route path="/admin/trips" element={<AdminTrips />} />
        <Route path="/admin/trips/active" element={<AdminTripsActive />} />
        <Route path="/admin/trips/history" element={<AdminTripsHistory />} />
        <Route path="/admin/trips/:id" element={<AdminTripDetails />} />
        <Route path="/admin/trips/:id/track" element={<AdminTripTracking />} />

        {/* Delivery Management */}
        <Route path="/admin/deliveries" element={<AdminDeliveries />} />
        <Route
          path="/admin/deliveries/exceptions"
          element={<AdminDeliveriesExceptions />}
        />
        <Route
          path="/admin/deliveries/live"
          element={<AdminDeliveriesLive />}
        />
        <Route
          path="/admin/deliveries/photos"
          element={<AdminDeliveriesPhotos />}
        />

        {/* Dispatcher View (Admin Testing) - These are demo/testing routes */}
        <Route
          path="/admin/deliveries-dispatcher"
          element={<DispatcherDeliveries />}
        />
        <Route
          path="/admin/deliveries/details-dispatcher/:orderId"
          element={<DispatcherDeliveryDetails />}
        />

        {/* Store Management */}
        <Route path="/admin/stores" element={<AdminStores />} />
        <Route path="/admin/stores/city" element={<AdminStoreCity />} />
        <Route path="/admin/stores/barangay" element={<AdminStoreBarangay />} />

        {/* Product Management */}
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route
          path="/admin/products/categories"
          element={<AdminProductCategories />}
        />
        <Route path="/admin/products/inventory" element={<AdminInventory />} />

        {/* Distributor & Routes */}
        <Route path="/admin/distributors" element={<AdminDistributors />} />
        <Route path="/admin/routes" element={<AdminRoutes />} />

        {/* Financial Management */}
        <Route path="/admin/finance" element={<AdminFinance />} />
        <Route path="/admin/finance/payments" element={<AdminPayments />} />
        <Route path="/admin/finance/invoices" element={<AdminInvoices />} />
        <Route
          path="/admin/finance/transactions"
          element={<AdminTransactions />}
        />

        {/* Reports */}
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/reports/sales" element={<AdminSalesReports />} />
        <Route
          path="/admin/reports/performance"
          element={<AdminPerformance />}
        />
        <Route path="/admin/reports/custom" element={<AdminCustomReports />} />

        {/* Settings */}
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route
          path="/admin/settings/general"
          element={<AdminSettingsGeneral />}
        />
        <Route
          path="/admin/settings/notifications"
          element={<AdminSettingsNotifications />}
        />
        <Route
          path="/admin/settings/security"
          element={<AdminSettingsSecurity />}
        />
      </Route>

      {/* Agent Routes */}
      <Route element={<ProtectedRoute allowedRoles={["Agent"]} />}>
        <Route path="/agent/dashboard" element={<AgentDashboard />} />
        <Route path="/agent/orders" element={<AgentOrdersList />} />
        <Route path="/agent/orders/create" element={<AgentCreateOrder />} />
        <Route path="/agent/orders/:id" element={<AgentOrderDetail />} />
        <Route path="/agent/stores" element={<AgentStoresList />} />
      </Route>

      {/* Dispatcher Routes - Actual dispatcher interface */}
      <Route element={<ProtectedRoute allowedRoles={["Dispatcher"]} />}>
        <Route path="/dispatcher/dashboard" element={<DispatcherDashboard />} />
        <Route
          path="/dispatcher/deliveries"
          element={<DispatcherDeliveries />}
        />
        <Route
          path="/dispatcher/deliveries/:orderId"
          element={<DispatcherDeliveryDetails />}
        />
      </Route>

      {/* Fallback Routes */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
