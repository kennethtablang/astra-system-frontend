// src/pages/admin/AdminRoles.jsx
import { useState, useEffect } from "react";
import {
  Shield,
  Users,
  Briefcase,
  Truck,
  Calculator,
  Building2,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { LoadingSpinner } from "../../components/ui/Loading";
import userService from "../../services/userService";
import { toast } from "react-hot-toast";

// Role definitions with metadata
const roleDefinitions = {
  Admin: {
    icon: Shield,
    color: "red",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    textColor: "text-red-600 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800",
    description: "Full system access. Can manage all users, settings, and configurations.",
    permissions: ["All system permissions", "User management", "System settings", "Role assignment"],
  },
  DistributorAdmin: {
    icon: Building2,
    color: "purple",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    textColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-800",
    description: "Manages distributor operations including warehouses and inventory.",
    permissions: ["Warehouse management", "Inventory control", "Order oversight", "Report access"],
  },
  Agent: {
    icon: Briefcase,
    color: "blue",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
    description: "Creates and manages orders for assigned stores.",
    permissions: ["Create orders", "View stores", "Track deliveries", "View products"],
  },
  Dispatcher: {
    icon: Truck,
    color: "orange",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    textColor: "text-orange-600 dark:text-orange-400",
    borderColor: "border-orange-200 dark:border-orange-800",
    description: "Handles deliveries, manages trips, and confirms order completion.",
    permissions: ["View assigned trips", "Update delivery status", "Record payments", "Upload photos"],
  },
  Accountant: {
    icon: Calculator,
    color: "green",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-600 dark:text-green-400",
    borderColor: "border-green-200 dark:border-green-800",
    description: "Manages financial operations, payments, and invoices.",
    permissions: ["View payments", "Generate invoices", "Reconcile transactions", "Financial reports"],
  },
};

const AdminRoles = () => {
  const [roles, setRoles] = useState([]);
  const [roleUsers, setRoleUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedRole, setExpandedRole] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState({});

  // Fetch all roles on mount
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const result = await userService.getAllRoles();
      if (result.success) {
        setRoles(result.data || []);
        // Fetch user counts for each role
        await fetchAllRoleUsers(result.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch roles");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRoleUsers = async (rolesList) => {
    const usersMap = {};
    for (const role of rolesList) {
      try {
        const result = await userService.getUsersByRole(role);
        if (result.success) {
          usersMap[role] = result.data || [];
        }
      } catch (error) {
        console.error(`Error fetching users for role ${role}:`, error);
        usersMap[role] = [];
      }
    }
    setRoleUsers(usersMap);
  };

  const toggleRoleExpand = (role) => {
    setExpandedRole(expandedRole === role ? null : role);
  };

  const getRoleConfig = (role) => {
    return roleDefinitions[role] || {
      icon: Users,
      color: "gray",
      bgColor: "bg-gray-100 dark:bg-gray-900/30",
      textColor: "text-gray-600 dark:text-gray-400",
      borderColor: "border-gray-200 dark:border-gray-800",
      description: "Custom role",
      permissions: [],
    };
  };

  const getBadgeVariant = (role) => {
    const variants = {
      Admin: "danger",
      DistributorAdmin: "purple",
      Agent: "info",
      Dispatcher: "warning",
      Accountant: "success",
    };
    return variants[role] || "default";
  };

  // Calculate total users
  const totalUsers = Object.values(roleUsers).reduce(
    (sum, users) => sum + users.length,
    0
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Roles & Permissions
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View system roles and their assigned users
            </p>
          </div>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Users className="h-4 w-4" />
            Manage Users
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Total Roles
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {roles.length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalUsers}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Admins
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {roleUsers["Admin"]?.length || 0}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Roles List */}
        <div className="space-y-4">
          {roles.map((role) => {
            const config = getRoleConfig(role);
            const Icon = config.icon;
            const users = roleUsers[role] || [];
            const isExpanded = expandedRole === role;

            return (
              <Card key={role} className={`border-l-4 ${config.borderColor}`}>
                <CardContent className="p-0">
                  {/* Role Header */}
                  <button
                    onClick={() => toggleRoleExpand(role)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${config.bgColor}`}>
                        <Icon className={`h-6 w-6 ${config.textColor}`} />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {role}
                          </h3>
                          <Badge variant={getBadgeVariant(role)}>
                            {users.length} {users.length === 1 ? "user" : "users"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {config.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-700">
                      {/* Permissions */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/30">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          Permissions
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {config.permissions.map((perm, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-white dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 rounded-md border border-gray-200 dark:border-gray-600"
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Users List */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Users with this role
                          </h4>
                          <Link
                            to={`/admin/users?role=${role}`}
                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            View all <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>

                        {users.length === 0 ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                            No users assigned to this role
                          </p>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {users.slice(0, 10).map((user) => (
                              <div
                                key={user.id}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                    <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                                      {user.fullName?.charAt(0) || user.email?.charAt(0) || "U"}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      {user.fullName || "No name"}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                      <span className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        {user.email}
                                      </span>
                                      {user.phoneNumber && (
                                        <span className="flex items-center gap-1">
                                          <Phone className="h-3 w-3" />
                                          {user.phoneNumber}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <Badge variant={user.isApproved ? "success" : "warning"}>
                                  {user.isApproved ? "Active" : "Pending"}
                                </Badge>
                              </div>
                            ))}
                            {users.length > 10 && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 text-center pt-2">
                                +{users.length - 10} more users
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {roles.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Shield className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No Roles Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  System roles will appear here once configured.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminRoles;
