// src/components/modals/UserManagementEditModal.jsx
import { useState, useMemo } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { Button } from "../../ui/Button";

export const UserManagementEditModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedUser,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Derive form data from selectedUser - recalculates when selectedUser changes
  const initialFormData = useMemo(
    () => ({
      email: selectedUser?.email || "",
      password: "",
      fullName: selectedUser?.fullName || "",
      phoneNumber: selectedUser?.phoneNumber || "",
      role: selectedUser?.role || "Agent",
      address: selectedUser?.address || "",
      city: selectedUser?.city || "",
      province: selectedUser?.province || "",
      postalCode: selectedUser?.postalCode || "",
      isActive: selectedUser?.isActive ?? true,
    }),
    [selectedUser]
  );

  const [formData, setFormData] = useState(initialFormData);

  // Update form data when initialFormData changes
  if (isOpen && JSON.stringify(formData) !== JSON.stringify(initialFormData)) {
    setFormData(initialFormData);
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    await onSubmit(formData);
    resetForm();
  };

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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit User" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
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
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
          options={roleOptions}
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
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
          />
          <label
            htmlFor="isActiveEdit"
            className="ml-2 text-sm text-gray-700 dark:text-gray-300"
          >
            Active User
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Update User</Button>
        </div>
      </div>
    </Modal>
  );
};
