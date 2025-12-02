import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  X,
  Mail,
  Phone,
  MapPin,
  Eye,
  EyeOff,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardHeader, CardContent } from "../../components/ui/Card";
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
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { LoadingSpinner } from "../../components/ui/Loading";
import { Modal } from "../../components/ui/Modal";
import api from "../../api/axios";
import { toast } from "react-hot-toast";

const AdminUsers = () => {
  // State Management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form State for Add/Edit User
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    role: "Agent",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    isActive: true,
  });

  // Fetch Users
  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize, searchTerm, filterRole, filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        pageNumber: currentPage,
        pageSize: pageSize,
        sortBy: "createdAt",
        sortDescending: true,
      };

      // Add search parameter if search term exists
      if (searchTerm) {
        params.searchTerm = searchTerm;
      }

      // Add role filter if not "All"
      if (filterRole !== "All") {
        params.role = filterRole;
      }

      // Add status filter if not "All"
      if (filterStatus !== "All") {
        params.isActive = filterStatus === "Active";
      }

      const { data } = await api.get("/users", { params });

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
  const handleAddUser = async () => {
    try {
      const { data } = await api.post("/users", formData);

      if (data.success) {
        toast.success("User added successfully");
        setShowAddModal(false);
        resetForm();
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add user");
    }
  };

  // Handle Edit User
  const handleEditUser = async () => {
    try {
      const { data } = await api.put(`/users/${selectedUser.id}`, formData);

      if (data.success) {
        toast.success("User updated successfully");
        setShowEditModal(false);
        resetForm();
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  // Handle Delete User
  const handleDeleteUser = async () => {
    try {
      const { data } = await api.delete(`/users/${selectedUser.id}`);

      if (data.success) {
        toast.success("User deleted successfully");
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  // Open Edit Modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: "", // Don't populate password for security
      fullName: user.fullName,
      phoneNumber: user.phoneNumber || "",
      role: user.role,
      address: user.address || "",
      city: user.city || "",
      province: user.province || "",
      postalCode: user.postalCode || "",
      isActive: user.isActive,
    });
    setShowEditModal(true);
  };

  // Open Delete Modal
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      fullName: "",
      phoneNumber: "",
      role: "Agent",
      address: "",
      city: "",
      province: "",
      postalCode: "",
      isActive: true,
    });
    setSelectedUser(null);
    setShowPassword(false);
  };

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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

  // Get Status Badge
  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge variant="success">Active</Badge>
    ) : (
      <Badge variant="danger">Inactive</Badge>
    );
  };

  // Role Options
  const roleOptions = [
    { value: "All", label: "All Roles" },
    { value: "Admin", label: "Admin" },
    { value: "DistributorAdmin", label: "Distributor Admin" },
    { value: "Agent", label: "Agent" },
    { value: "Dispatcher", label: "Dispatcher" },
    { value: "Accountant", label: "Accountant" },
  ];

  // Status Options
  const statusOptions = [
    { value: "All", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  // Page Size Options
  const pageSizeOptions = [
    { value: "10", label: "10 per page" },
    { value: "25", label: "25 per page" },
    { value: "50", label: "50 per page" },
    { value: "100", label: "100 per page" },
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
              Manage all system users
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

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <Select
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value);
                  setCurrentPage(1);
                }}
                options={roleOptions}
              />

              {/* Status Filter */}
              <Select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                options={statusOptions}
              />
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
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {user.fullName}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </p>
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
                              {user.city && (
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {user.city}, {user.province}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(user.role)}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(user.isActive)}</TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
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
                <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Select
                        value={pageSize.toString()}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        options={pageSizeOptions}
                        className="w-40"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Showing {startIndex} to {endIndex} of {totalUsers} users
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

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New User"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <Input
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
          </div>

          <Select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            options={[
              { value: "Agent", label: "Agent" },
              { value: "Dispatcher", label: "Dispatcher" },
              { value: "Accountant", label: "Accountant" },
              { value: "DistributorAdmin", label: "Distributor Admin" },
              { value: "Admin", label: "Admin" },
            ]}
          />

          <Input
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
            />
            <Input
              label="Province"
              name="province"
              value={formData.province}
              onChange={handleInputChange}
            />
            <Input
              label="Postal Code"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isActive"
              className="ml-2 text-sm text-gray-700 dark:text-gray-300"
            >
              Active User
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddUser}>Add User</Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit User"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Input
                label="Password (leave blank to keep current)"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <Input
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
          </div>

          <Select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            options={[
              { value: "Agent", label: "Agent" },
              { value: "Dispatcher", label: "Dispatcher" },
              { value: "Accountant", label: "Accountant" },
              { value: "DistributorAdmin", label: "Distributor Admin" },
              { value: "Admin", label: "Admin" },
            ]}
          />

          <Input
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
            />
            <Input
              label="Province"
              name="province"
              value={formData.province}
              onChange={handleInputChange}
            />
            <Input
              label="Postal Code"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActiveEdit"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isActiveEdit"
              className="ml-2 text-sm text-gray-700 dark:text-gray-300"
            >
              Active User
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditUser}>Update User</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        title="Delete User"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete{" "}
            <strong>{selectedUser?.fullName}</strong>? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteUser}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminUsers;
