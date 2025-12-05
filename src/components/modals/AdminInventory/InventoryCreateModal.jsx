// src/components/modals/AdminInventory/InventoryCreateModal.jsx
import { useState, useEffect } from "react";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { Button } from "../../ui/Button";
import api from "../../../api/axios";

export const InventoryCreateModal = ({ isOpen, onClose, onSubmit }) => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  const [formData, setFormData] = useState({
    productId: "",
    warehouseId: "",
    initialStock: "0",
    reorderLevel: "50",
    maxStock: "1000",
  });

  // Fetch products and warehouses on mount
  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      fetchWarehouses();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const { data } = await api.get("/product/lookup");
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoadingProducts(false);
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.productId || !formData.warehouseId) {
      alert("Please select both product and warehouse");
      return;
    }

    const initialStock = parseInt(formData.initialStock);
    const reorderLevel = parseInt(formData.reorderLevel);
    const maxStock = parseInt(formData.maxStock);

    // Validate numbers
    if (isNaN(initialStock) || initialStock < 0) {
      alert("Please enter a valid initial stock (0 or greater)");
      return;
    }

    if (isNaN(reorderLevel) || reorderLevel < 0) {
      alert("Please enter a valid reorder level (0 or greater)");
      return;
    }

    if (isNaN(maxStock) || maxStock <= 0) {
      alert("Please enter a valid max stock (greater than 0)");
      return;
    }

    if (reorderLevel >= maxStock) {
      alert("Reorder level must be less than max stock");
      return;
    }

    if (initialStock > maxStock) {
      alert("Initial stock cannot exceed max stock");
      return;
    }

    // Prepare submit data
    const submitData = {
      productId: parseInt(formData.productId),
      warehouseId: parseInt(formData.warehouseId),
      initialStock: initialStock,
      reorderLevel: reorderLevel,
      maxStock: maxStock,
    };

    await onSubmit(submitData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      productId: "",
      warehouseId: "",
      initialStock: "0",
      reorderLevel: "50",
      maxStock: "1000",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const productOptions = [
    { value: "", label: "Select Product *" },
    ...products.map((p) => ({
      value: p.id.toString(),
      label: `${p.name} (${p.sku || "No SKU"})`,
    })),
  ];

  const warehouseOptions = [
    { value: "", label: "Select Warehouse *" },
    ...warehouses.map((w) => ({
      value: w.id.toString(),
      label: w.name,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Inventory Record"
      size="lg"
    >
      <div className="space-y-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> Create an inventory record to start tracking
            stock for a product in a specific warehouse. Each product can only
            have one inventory record per warehouse.
          </p>
        </div>

        <Select
          label="Product *"
          name="productId"
          value={formData.productId}
          onChange={handleInputChange}
          options={productOptions}
          disabled={loadingProducts}
        />

        <Select
          label="Warehouse *"
          name="warehouseId"
          value={formData.warehouseId}
          onChange={handleInputChange}
          options={warehouseOptions}
          disabled={loadingWarehouses}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Initial Stock"
            name="initialStock"
            type="number"
            min="0"
            value={formData.initialStock}
            onChange={handleInputChange}
            placeholder="0"
          />
          <Input
            label="Reorder Level *"
            name="reorderLevel"
            type="number"
            min="0"
            value={formData.reorderLevel}
            onChange={handleInputChange}
            required
            placeholder="50"
          />
          <Input
            label="Max Stock *"
            name="maxStock"
            type="number"
            min="1"
            value={formData.maxStock}
            onChange={handleInputChange}
            required
            placeholder="1000"
          />
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Initial Stock:</strong> Starting quantity for this product
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            <strong>Reorder Level:</strong> Alert when stock falls below this
            number
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            <strong>Max Stock:</strong> Maximum capacity for this warehouse
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Inventory</Button>
        </div>
      </div>
    </Modal>
  );
};
