import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";

// Auth Pages
// import Login from "../pages/auth/Login";
// import Register from "../pages/auth/Register";
// import ForgotPassword from "../pages/auth/ForgotPassword";
// import Unauthorized from "../pages/Unauthorized";
// import NotFound from "../pages/NotFound";

// Admin Pages
// import AdminDashboard from "../pages/admin/Dashboard";
// import AdminUsers from "../pages/admin/Users";
// import AdminOrders from "../pages/admin/Orders";

// Agent Pages
// import AgentDashboard from "../pages/agent/Dashboard";
// import AgentOrders from "../pages/agent/Orders";
// import AgentStores from "../pages/agent/Stores";

// Dispatcher Pages
// import DispatcherDashboard from "../pages/dispatcher/Dashboard";
// import DispatcherTrips from "../pages/dispatcher/Trips";

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
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
      </Route>

      {/* Agent Routes */}
      <Route element={<ProtectedRoute allowedRoles={["Agent"]} />}>
        <Route path="/agent/dashboard" element={<AgentDashboard />} />
        <Route path="/agent/orders" element={<AgentOrders />} />
        <Route path="/agent/stores" element={<AgentStores />} />
      </Route>

      {/* Dispatcher Routes */}
      <Route element={<ProtectedRoute allowedRoles={["Dispatcher"]} />}>
        <Route path="/dispatcher/dashboard" element={<DispatcherDashboard />} />
        <Route path="/dispatcher/trips" element={<DispatcherTrips />} />
      </Route>

      {/* Fallback Routes */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
