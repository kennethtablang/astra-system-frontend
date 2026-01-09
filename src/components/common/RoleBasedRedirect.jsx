import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const RoleBasedRedirect = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Define role-based dashboards
    const dashboardRoutes = {
        Admin: "/admin/dashboard",
        DistributorAdmin: "/distributor/dashboard",
        Agent: "/agent/dashboard",
        Dispatcher: "/dispatcher/dashboard",
    };

    // Get the dashboard route for the user's role, default to /unauthorized if role not found
    // or a safe default like /dashboard if you have a generic one.
    // Using /unauthorized might loop if not careful, but if they are logged in with an unknown role, they shouldn't be here.
    // Let's default to "/admin/dashboard" if unknown to match previous behavior, OR better, check existing logic.
    // The AuthContext uses /dashboard as fallback.

    const targetPath = dashboardRoutes[user.role] || "/unauthorized";

    return <Navigate to={targetPath} replace />;
};

export default RoleBasedRedirect;
