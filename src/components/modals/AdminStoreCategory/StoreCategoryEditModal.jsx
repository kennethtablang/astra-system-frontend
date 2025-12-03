// src/components/modals/AdminStoreCategory/StoreCategoryEditModal.jsx
import { useState, useEffect, useMemo } from "react";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { Button } from "../../ui/Button";

export const StoreCategoryEditModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedCategory,
}) => {
  // Derive form data from selectedCategory
  const initialFormData = useMemo(() => {
    if (!selectedCategory)
      return {
        id: "",
        name: "",
        description: "",
        color: "blue",
      };

    return {
      id: selectedCategory.id,
      name: selectedCategory.name || "",
      description: selectedCategory.description || "",
      color: selectedCategory.color || "blue",
      storeCount: selectedCategory.storeCount || 0,
    };
  }, [selectedCategory]);

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
    if (!formData.name) {
      alert("Please enter category name");
      return;
    }

    await onSubmit(formData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: "",
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
      title="Edit Store Category"
      size="md"
    >
      <div className="space-y-4">
        {/* Category Info Display */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Category ID:</strong> {selectedCategory?.id}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            <strong>Stores Using:</strong> {formData.storeCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            <strong>Created:</strong>{" "}
            {selectedCategory?.createdAt &&
              new Date(selectedCategory.createdAt).toLocaleDateString()}
          </div>
        </div>

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

        {formData.storeCount > 0 && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> This category is currently being used by{" "}
              {formData.storeCount} store(s). Changes will affect all stores in
              this category.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Update Category</Button>
        </div>
      </div>
    </Modal>
  );
};
