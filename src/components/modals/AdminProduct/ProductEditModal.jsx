// src/components/modals/AdminProduct/ProductEditModal.jsx
import { useState, useEffect, useMemo } from "react";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { Button } from "../../ui/Button";
import api from "../../../api/axios";

export const ProductEditModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedProduct,
}) => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Derive form data from selectedProduct
  const initialFormData = useMemo(() => {
    if (!selectedProduct)
      return {
        id: "",
        sku: "",
        name: "",
        category: "",
        price: "0",
        unitOfMeasure: "",
        isPerishable: false,
        isBarcoded: false,
        barcode: "",
      };

    return {
      id: selectedProduct.id,
      sku: selectedProduct.sku || "",
      name: selectedProduct.name || "",
      category: selectedProduct.category || "",
      price: selectedProduct.price?.toString() || "0",
      unitOfMeasure: selectedProduct.unitOfMeasure || "",
      isPerishable: selectedProduct.isPerishable || false,
      isBarcoded: selectedProduct.isBarcoded || false,
      barcode: selectedProduct.barcode || "",
    };
  }, [selectedProduct]);

  const [formData, setFormData] = useState(initialFormData);

  // Update form data when initialFormData changes
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      fetchCategories();
    }
  }, [isOpen, initialFormData]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const { data } = await api.get("/product/categories");
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

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.sku || !formData.name || !formData.price) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate barcode if product is barcoded
    if (formData.isBarcoded && !formData.barcode) {
      alert("Please enter a barcode for barcoded products");
      return;
    }

    // Convert price to number
    const submitData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
    };

    await onSubmit(submitData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: "",
      sku: "",
      name: "",
      category: "",
      price: "0",
      unitOfMeasure: "",
      isPerishable: false,
      isBarcoded: false,
      barcode: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const categoryOptions = [
    { value: "", label: "Select Category" },
    ...categories.map((c) => ({ value: c, label: c })),
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
        {/* Product Info Display */}
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
            name="category"
            value={formData.category}
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
