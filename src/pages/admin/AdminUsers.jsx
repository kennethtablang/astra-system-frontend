// src/pages/admin/AdminUsers.jsx
import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Phone,
  MapPin,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { LoadingSpinner } from "../../components/ui/Loading";
import { UserManagementAddModal } from "../../components/modals/AdminUser/UserManagementAddModal";
import { UserManagementEditModal } from "../../components/modals/AdminUser/UserManagementEditModal";
import { UserManagementDeleteModal } from "../../components/modals/AdminUser/UserManagementDeleteModal";
import api from "../../api/axios";
import { toast } from "react-hot-toast";

const AdminUsers = () => {
  // State Management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterApproval, setFilterApproval] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch Users
  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize, searchTerm, filterRole, filterApproval]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        pageNumber: currentPage,
        pageSize: pageSize,
      };

      if (searchTerm) params.searchTerm = searchTerm;
      if (filterRole !== "All") params.role = filterRole;
      if (filterApproval !== "All")
        params.isApproved = filterApproval === "Approved";

      const { data } = await api.get("/user", { params });

      if (data.success) {
        setUsers(data.data.items || []);
        setTotalUsers(data.data.totalCount || 0);
      }
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Add User
  const handleAddUser = async (formData) => {
    try {
      // Map form data to backend RegisterRequestDto format
      const registerData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName || formData.fullName?.split(" ")[0] || "",
        middleName: formData.middleName || "",
        lastName:
          formData.lastName ||
          formData.fullName?.split(" ").slice(1).join(" ") ||
          "",
        phoneNumber: formData.phoneNumber || "",
        role: formData.role,
        distributorId: formData.distributorId || null,
        warehouseId: formData.warehouseId || null,
      };

      const { data } = await api.post("/auth/register", registerData);

      if (data.success) {
        // If you want to auto-approve, call approve endpoint
        if (formData.isActive) {
          await api.post("/user/approve", {
            userId: data.data.userId,
            isApproved: true,
            message: "Auto-approved by admin",
          });
        }

        toast.success("User added successfully");
        setShowAddModal(false);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add user");
      console.error(error);
    }
  };

  // Handle Edit User
  const handleEditUser = async (formData) => {
    try {
      // Split fullName into parts
      const nameParts = formData.fullName?.split(" ") || [];
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const updateData = {
        firstName: firstName,
        lastName: lastName,
        phoneNumber: formData.phoneNumber || "",
      };

      // Update profile
      const { data } = await api.put("/user/profile", updateData);

      if (data.success) {
        // If role changed, assign new role
        if (formData.role && formData.role !== selectedUser.role) {
          await api.post("/user/assign-roles", {
            userId: selectedUser.id,
            roles: [formData.role],
          });
        }

        // If password provided, change it (admin would need special endpoint)
        // Note: The current API doesn't have admin password change, only user change-password

        toast.success("User updated successfully");
        setShowEditModal(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
      console.error(error);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async () => {
    try {
      const { data } = await api.delete(`/user/${selectedUser.id}`);
      if (data.success) {
        toast.success("User deleted successfully");
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
      console.error(error);
    }
  };

  // Handle Approve User
  const handleApproveUser = async (user) => {
    try {
      const { data } = await api.post("/user/approve", {
        userId: user.id,
        isApproved: true,
        message: "Approved by admin",
      });

      if (data.success) {
        toast.success(`User ${user.fullName} approved successfully`);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve user");
      console.error(error);
    }
  };

  // Handle Reject User
  const handleRejectUser = async (user) => {
    try {
      const { data } = await api.post("/user/approve", {
        userId: user.id,
        isApproved: false,
        message: "Registration rejected by admin",
      });

      if (data.success) {
        toast.success(`User ${user.fullName} rejected`);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject user");
      console.error(error);
    }
  };

  // Open Edit Modal
  const openEditModal = (user) => {
    setSelectedUser({
      ...user,
      fullName: user.fullName || `${user.firstName} ${user.lastName}`.trim(),
    });
    setShowEditModal(true);
  };

  // Open Delete Modal
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Pagination Calculations
  const totalPages = Math.ceil(totalUsers / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalUsers);

  // Get Role Badge Variant
  const getRoleBadgeVariant = (role) => {
    const variants = {
      Admin: "danger",
      DistributorAdmin: "purple",
      Agent: "info",
      Dispatcher: "warning",
      Accountant: "success",
    };
    return variants[role] || "default";
  };

  // Get Approval Badge
  const getApprovalBadge = (isApproved) => {
    return isApproved ? (
      <Badge variant="success">Approved</Badge>
    ) : (
      <Badge variant="warning">Pending</Badge>
    );
  };

  // Options
  const roleOptions = [
    { value: "All", label: "All Roles" },
    { value: "Admin", label: "Admin" },
    { value: "DistributorAdmin", label: "Distributor Admin" },
    { value: "Agent", label: "Agent" },
    { value: "Dispatcher", label: "Dispatcher" },
    { value: "Accountant", label: "Accountant" },
  ];

  const approvalOptions = [
    { value: "All", label: "All Users" },
    { value: "Approved", label: "Approved" },
    { value: "Pending", label: "Pending Approval" },
  ];

  const pageSizeOptions = [
    { value: "10", label: "10" },
    { value: "25", label: "25" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              User Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all system users and permissions
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalUsers}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Approved
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users.filter((u) => u.isApproved).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pending
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users.filter((u) => !u.isApproved).length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Admins
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users.filter((u) => u.roles?.includes("Admin")).length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2">
                <Select
                  value={filterRole}
                  onChange={(e) => {
                    setFilterRole(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={roleOptions}
                  className="w-40"
                />
                <Select
                  value={filterApproval}
                  onChange={(e) => {
                    setFilterApproval(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={approvalOptions}
                  className="w-40"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No users found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableHead>User</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-600 dark:text-blue-400 font-medium">
                                  {user.fullName?.charAt(0) ||
                                    user.email?.charAt(0) ||
                                    "U"}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {user.fullName ||
                                    `${user.firstName} ${user.lastName}`.trim() ||
                                    "No name"}
                                </p>
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {user.phoneNumber && (
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {user.phoneNumber}
                                </div>
                              )}
                              {(user.distributorId || user.warehouseId) && (
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {user.distributorName ||
                                    user.warehouseName ||
                                    "Assigned"}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {user.roles && user.roles.length > 0 ? (
                                user.roles.map((role, idx) => (
                                  <Badge
                                    key={idx}
                                    variant={getRoleBadgeVariant(role)}
                                    className="mr-1"
                                  >
                                    {role}
                                  </Badge>
                                ))
                              ) : (
                                <Badge variant="default">No Role</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {getApprovalBadge(user.isApproved)}
                              {user.emailConfirmed && (
                                <div className="text-xs text-green-600 dark:text-green-400 flex items-center">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Email Verified
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(
                                user.createdAt || Date.now()
                              ).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              {!user.isApproved && (
                                <>
                                  <button
                                    onClick={() => handleApproveUser(user)}
                                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                    title="Approve user"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRejectUser(user)}
                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Reject user"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => openEditModal(user)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Edit user"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(user)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Select
                        value={pageSize.toString()}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        options={pageSizeOptions}
                        className="w-20"
                      />
                      <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {startIndex}-{endIndex} of {totalUsers}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = idx + 1;
                          } else if (currentPage <= 3) {
                            pageNum = idx + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + idx;
                          } else {
                            pageNum = currentPage - 2 + idx;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === pageNum
                                  ? "bg-blue-600 text-white"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <UserManagementAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddUser}
      />

      <UserManagementEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSubmit={handleEditUser}
        selectedUser={selectedUser}
      />

      <UserManagementDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
        selectedUser={selectedUser}
      />
    </DashboardLayout>
  );
};

export default AdminUsers;
