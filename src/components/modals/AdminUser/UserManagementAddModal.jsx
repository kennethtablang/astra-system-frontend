// src/components/modals/AdminUser/UserManagementAddModal.jsx
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { Button } from "../../ui/Button";
import api from "../../../api/axios";

export const UserManagementAddModal = ({ isOpen, onClose, onSubmit }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [distributors, setDistributors] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loadingDistributors, setLoadingDistributors] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    middleName: "",
    lastName: "",
    phoneNumber: "",
    role: "Agent",
    distributorId: null,
    warehouseId: null,
    isActive: true,
  });

  // Fetch distributors and warehouses on mount
  useEffect(() => {
    if (isOpen) {
      fetchDistributors();
      fetchWarehouses();
    }
  }, [isOpen]);

  const fetchDistributors = async () => {
    try {
      setLoadingDistributors(true);
      const { data } = await api.get("/warehouse/distributor");
      if (data.success) {
        setDistributors(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch distributors:", error);
    } finally {
      setLoadingDistributors(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      setLoadingWarehouses(true);
      const { data } = await api.get("/warehouse");
      if (data.success) {
        setWarehouses(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch warehouses:", error);
    } finally {
      setLoadingWarehouses(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (
      !formData.email ||
      !formData.password ||
      !formData.firstName ||
      !formData.lastName
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    await onSubmit(formData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      firstName: "",
      middleName: "",
      lastName: "",
      phoneNumber: "",
      role: "Agent",
      distributorId: null,
      warehouseId: null,
      isActive: true,
    });
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const roleOptions = [
    { value: "Agent", label: "Agent" },
    { value: "Dispatcher", label: "Dispatcher" },
    { value: "Accountant", label: "Accountant" },
    { value: "DistributorAdmin", label: "Distributor Admin" },
    { value: "Admin", label: "Admin" },
  ];

  const distributorOptions = [
    { value: "", label: "None" },
    ...distributors.map((d) => ({ value: d.id.toString(), label: d.name })),
  ];

  const warehouseOptions = [
    { value: "", label: "None" },
    ...warehouses.map((w) => ({
      value: w.id.toString(),
      label: `${w.name} (${w.distributorName || "No Distributor"})`,
    })),
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New User" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="First Name *"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            placeholder="John"
          />
          <Input
            label="Middle Name"
            name="middleName"
            value={formData.middleName}
            onChange={handleInputChange}
            placeholder="Michael"
          />
          <Input
            label="Last Name *"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
            placeholder="Doe"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email *"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="john.doe@example.com"
          />
          <Input
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder="09123456789"
          />
        </div>

        <div className="relative">
          <Input
            label="Password *"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange}
            required
            placeholder="Minimum 8 characters"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Password must be at least 8 characters with uppercase, lowercase,
            number, and special character
          </p>
        </div>

        <Select
          label="Role *"
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          options={roleOptions}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Distributor"
            name="distributorId"
            value={formData.distributorId || ""}
            onChange={handleInputChange}
            options={distributorOptions}
            disabled={loadingDistributors}
          />
          <Select
            label="Warehouse"
            name="warehouseId"
            value={formData.warehouseId || ""}
            onChange={handleInputChange}
            options={warehouseOptions}
            disabled={loadingWarehouses}
          />
        </div>

        <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
          />
          <label
            htmlFor="isActive"
            className="ml-2 text-sm text-gray-700 dark:text-gray-200"
          >
            Auto-approve user (user can login immediately)
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add User</Button>
        </div>
      </div>
    </Modal>
  );
};
