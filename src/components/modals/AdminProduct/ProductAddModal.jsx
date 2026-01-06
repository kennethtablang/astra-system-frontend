// src/components/modals/AdminProduct/ProductAddModal.jsx
import { useState, useEffect } from "react";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { Button } from "../../ui/Button";
import api from "../../../api/axios";

export const ProductAddModal = ({ isOpen, onClose, onSubmit }) => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    categoryId: "", // Keep as string for select, convert on submit
    price: "",
    unitOfMeasure: "",
    isPerishable: false,
    isBarcoded: false,
    barcode: "",
  });

  // Fetch categories on mount
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Clean up preview url
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const { data } = await api.get("/category");
      if (data.success) {
        // Filter only active categories
        const activeCategories = (data.data || []).filter(
          (cat) => cat.isActive
        );
        setCategories(activeCategories);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.sku || !formData.name || !formData.price) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate price is positive
    if (parseFloat(formData.price) <= 0) {
      alert("Price must be greater than zero");
      return;
    }

    // Validate barcode if product is barcoded
    if (formData.isBarcoded && !formData.barcode) {
      alert("Please enter a barcode for barcoded products");
      return;
    }

    // Create FormData object
    const submitData = new FormData();
    submitData.append("sku", formData.sku.trim());
    submitData.append("name", formData.name.trim());
    if (formData.categoryId) {
      submitData.append("categoryId", formData.categoryId);
    }
    submitData.append("price", formData.price);
    if (formData.unitOfMeasure) {
      submitData.append("unitOfMeasure", formData.unitOfMeasure.trim());
    }
    submitData.append("isPerishable", formData.isPerishable);
    submitData.append("isBarcoded", formData.isBarcoded);
    if (formData.isBarcoded && formData.barcode) {
      submitData.append("barcode", formData.barcode.trim());
    }

    if (selectedImage) {
      submitData.append("image", selectedImage);
    }

    await onSubmit(submitData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      sku: "",
      name: "",
      categoryId: "",
      price: "",
      unitOfMeasure: "",
      isPerishable: false,
      isBarcoded: false,
      barcode: "",
    });
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const categoryOptions = [
    { value: "", label: "Select Category (Optional)" },
    ...categories.map((c) => ({
      value: c.id.toString(),
      label: c.name,
    })),
  ];

  const unitOptions = [
    { value: "", label: "Select Unit" },
    { value: "pcs", label: "Pieces" },
    { value: "box", label: "Box" },
    { value: "pack", label: "Pack" },
    { value: "bottle", label: "Bottle" },
    { value: "can", label: "Can" },
    { value: "kg", label: "Kilogram" },
    { value: "g", label: "Gram" },
    { value: "L", label: "Liter" },
    { value: "mL", label: "Milliliter" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Product"
      size="lg"
    >
      <div className="space-y-4">
        {/* Image Upload */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 overflow-hidden">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    No image
                  </span>
                </div>
              )}
            </div>
            <label
              htmlFor="product-image"
              className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-lg transform translate-x-1/4 translate-y-1/4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </label>
            <input
              type="file"
              id="product-image"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="SKU *"
            name="sku"
            value={formData.sku}
            onChange={handleInputChange}
            required
            placeholder="e.g., BEV-001"
          />
          <Input
            label="Product Name *"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="e.g., Coca Cola 1L"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Category"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleInputChange}
            options={categoryOptions}
            disabled={loadingCategories}
          />
          <Select
            label="Unit of Measure"
            name="unitOfMeasure"
            value={formData.unitOfMeasure}
            onChange={handleInputChange}
            options={unitOptions}
          />
        </div>

        <Input
          label="Price *"
          name="price"
          type="number"
          min="0.01"
          step="0.01"
          value={formData.price}
          onChange={handleInputChange}
          required
          placeholder="0.00"
        />

        <div className="space-y-3">
          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <input
              type="checkbox"
              id="isPerishable"
              name="isPerishable"
              checked={formData.isPerishable}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
            />
            <label
              htmlFor="isPerishable"
              className="ml-2 text-sm text-gray-700 dark:text-gray-200"
            >
              Perishable Product
            </label>
          </div>

          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <input
              type="checkbox"
              id="isBarcoded"
              name="isBarcoded"
              checked={formData.isBarcoded}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
            />
            <label
              htmlFor="isBarcoded"
              className="ml-2 text-sm text-gray-700 dark:text-gray-200"
            >
              Has Barcode
            </label>
          </div>

          {formData.isBarcoded && (
            <Input
              label="Barcode *"
              name="barcode"
              value={formData.barcode}
              onChange={handleInputChange}
              required
              placeholder="Enter barcode"
            />
          )}
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Tip:</strong> SKU should be unique. Use a consistent format
            like category code followed by a number (e.g., BEV-001 for
            beverages).
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Product</Button>
        </div>
      </div>
    </Modal>
  );
};
