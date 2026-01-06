//src/components/modals/AdminProduct/ProductAddModal.jsx
import { useState, useEffect } from "react";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { Button } from "../../ui/Button";
import api from "../../../api/axios";

import { getImageUrl } from "../../../utils/imageUrl";

export const ProductEditModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedProduct,
}) => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    sku: "",
    name: "",
    categoryId: null,
    price: "0",
    unitOfMeasure: "",
    isPerishable: false,
    isBarcoded: false,
    barcode: "",
  });

  // Update form when selectedProduct changes
  useEffect(() => {
    if (isOpen && selectedProduct) {
      setFormData({
        id: selectedProduct.id,
        sku: selectedProduct.sku || "",
        name: selectedProduct.name || "",
        categoryId: selectedProduct.categoryId || null,
        price: selectedProduct.price?.toString() || "0",
        unitOfMeasure: selectedProduct.unitOfMeasure || "",
        isPerishable: selectedProduct.isPerishable || false,
        isBarcoded: selectedProduct.isBarcoded || false,
        barcode: selectedProduct.barcode || "",
      });
      // Set initial preview from existing product image
      setImagePreview(selectedProduct.imageUrl ? getImageUrl(selectedProduct.imageUrl) : null);
      setSelectedImage(null);
      setRemoveImage(false);
      fetchCategories();
    }
  }, [isOpen, selectedProduct]);

  // Clean up preview url when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (selectedImage && imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [selectedImage, imagePreview]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const { data } = await api.get("/category");
      if (data.success) {
        setCategories(data.data || []);
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
      setRemoveImage(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setRemoveImage(true);
    // Reset file input if possible, but state control is sufficient
    const fileInput = document.getElementById("edit-product-image");
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async () => {
    if (!formData.sku || !formData.name || !formData.price) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.isBarcoded && !formData.barcode) {
      alert("Please enter a barcode for barcoded products");
      return;
    }

    const submitData = new FormData();
    submitData.append("id", formData.id);
    submitData.append("sku", formData.sku);
    submitData.append("name", formData.name);
    if (formData.categoryId) {
      submitData.append("categoryId", formData.categoryId);
    }
    submitData.append("price", formData.price);
    if (formData.unitOfMeasure) {
      submitData.append("unitOfMeasure", formData.unitOfMeasure);
    }
    submitData.append("isPerishable", formData.isPerishable);
    submitData.append("isBarcoded", formData.isBarcoded);
    if (formData.isBarcoded && formData.barcode) {
      submitData.append("barcode", formData.barcode);
    }

    // Image handling
    submitData.append("removeImage", removeImage);
    if (selectedImage) {
      submitData.append("image", selectedImage);
    }

    await onSubmit(submitData);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const categoryOptions = [
    { value: "", label: "Select Category" },
    ...categories.map((c) => ({ value: c.id.toString(), label: c.name })),
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Product" size="lg">
      <div className="space-y-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Product ID:</strong> {selectedProduct?.id}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            <strong>Created:</strong>{" "}
            {selectedProduct?.createdAt &&
              new Date(selectedProduct.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Image Upload */}
        <div className="flex justify-center mb-4">
          <div className="relative group">
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

            <div className="absolute -bottom-2 -right-2 flex gap-1">
              <label
                htmlFor="edit-product-image"
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-lg"
                title="Change Image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
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

              {imagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg"
                  title="Remove Image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              )}
            </div>

            <input
              type="file"
              id="edit-product-image"
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
            value={formData.categoryId?.toString() || ""}
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
          min="0"
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

        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> Changing the SKU may affect existing orders
            and inventory records. Proceed with caution.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Update Product</Button>
        </div>
      </div>
    </Modal>
  );
};
