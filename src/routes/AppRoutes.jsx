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

// Agent Pages
import AgentDashboard from "../pages/agent/AgentDashboard";
import AgentOrdersList from "../pages/agent/AgentOrdersList";
import AgentCreateOrder from "../pages/agent/AgentCreateOrder";
import AgentOrderDetail from "../pages/agent/AgentOrderDetail";
import AgentStoresList from "../pages/agent/AgentStoresList";

// Dispatcher Pages
import DispatcherDashboard from "../pages/dispatcher/DispatcherDashboard";

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
      />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      {/* Agent Routes */}
      <Route element={<ProtectedRoute allowedRoles={["Agent"]} />}>
        <Route path="/agent/dashboard" element={<AgentDashboard />} />
        <Route path="/agent/orders" element={<AgentOrdersList />} />
        <Route path="/agent/orders/create" element={<AgentCreateOrder />} />
        <Route path="/agent/orders/:id" element={<AgentOrderDetail />} />
        <Route path="/agent/stores" element={<AgentStoresList />} />
      </Route>

      {/* Dispatcher Routes */}
      <Route element={<ProtectedRoute allowedRoles={["Dispatcher"]} />}>
        <Route path="/dispatcher/dashboard" element={<DispatcherDashboard />} />
      </Route>

      {/* Fallback Routes */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
