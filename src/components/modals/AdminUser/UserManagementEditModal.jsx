// src/components/modals/AdminUser/UserManagementEditModal.jsx
import { useState, useMemo, useEffect } from "react";
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
  // Derive form data from selectedUser - recalculates when selectedUser changes
  const initialFormData = useMemo(() => {
    if (!selectedUser)
      return {
        firstName: "",
        lastName: "",
        phoneNumber: "",
        role: "Agent",
      };

    // Split fullName if it exists
    const fullName =
      selectedUser.fullName ||
      `${selectedUser.firstName || ""} ${selectedUser.lastName || ""}`.trim();
    const nameParts = fullName.split(" ");

    return {
      firstName: nameParts[0] || selectedUser.firstName || "",
      lastName: nameParts.slice(1).join(" ") || selectedUser.lastName || "",
      phoneNumber: selectedUser.phoneNumber || "",
      role:
        selectedUser.roles && selectedUser.roles.length > 0
          ? selectedUser.roles[0]
          : "Agent",
    };
  }, [selectedUser]);

  const [formData, setFormData] = useState(initialFormData);

  // Update form data when initialFormData changes
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
    }
  }, [isOpen, initialFormData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.firstName || !formData.lastName) {
      alert("Please fill in all required fields");
      return;
    }

    // Create fullName for submission
    const submitData = {
      ...formData,
      fullName: `${formData.firstName} ${formData.lastName}`.trim(),
    };

    await onSubmit(submitData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      phoneNumber: "",
      role: "Agent",
    });
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
        {/* User Info Display */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Email:</strong> {selectedUser?.email}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            <strong>User ID:</strong> {selectedUser?.id}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name *"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            placeholder="John"
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

        <Input
          label="Phone Number"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          placeholder="09123456789"
        />

        <Select
          label="Role *"
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          options={roleOptions}
        />

        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> Email and password cannot be changed here.
            User must use "Forgot Password" or "Change Password" feature.
          </p>
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
