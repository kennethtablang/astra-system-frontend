// src/components/modals/AdminStoreCategory/StoreCategoryAddModal.jsx
import { useState } from "react";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { Button } from "../../ui/Button";

export const StoreCategoryAddModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "blue",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name) {
      alert("Please enter category name");
      return;
    }

    await onSubmit(formData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      color: "blue",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const colorOptions = [
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
    { value: "purple", label: "Purple" },
    { value: "yellow", label: "Yellow" },
    { value: "red", label: "Red" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Store Category"
      size="md"
    >
      <div className="space-y-4">
        <Input
          label="Category Name *"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          placeholder="e.g., Sari-Sari Store"
        />

        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-200 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Brief description of this store category..."
            rows="3"
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <Select
          label="Color Tag *"
          name="color"
          value={formData.color}
          onChange={handleInputChange}
          options={colorOptions}
        />

        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Tip:</strong> Categories help organize stores by type.
            Choose a color that visually distinguishes this category from
            others.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Category</Button>
        </div>
      </div>
    </Modal>
  );
};
