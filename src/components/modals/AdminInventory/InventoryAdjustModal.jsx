// src/components/modals/AdminInventory/InventoryAdjustModal.jsx
import { useState, useEffect } from "react";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { Button } from "../../ui/Button";

export const InventoryAdjustModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedInventory,
}) => {
  const [formData, setFormData] = useState({
    quantityAdjustment: "",
    movementType: "Adjustment",
    reference: "",
    notes: "",
  });

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.quantityAdjustment) {
      alert("Please enter adjustment quantity");
      return;
    }

    const quantity = parseInt(formData.quantityAdjustment);
    if (isNaN(quantity) || quantity === 0) {
      alert("Please enter a valid non-zero quantity");
      return;
    }

    // Prevent negative stock
    if (selectedInventory && selectedInventory.stockLevel + quantity < 0) {
      alert(
        `Adjustment would result in negative stock. Current stock: ${selectedInventory.stockLevel}`
      );
      return;
    }

    const submitData = {
      inventoryId: selectedInventory.id,
      quantityAdjustment: quantity,
      movementType: formData.movementType,
      reference: formData.reference || null,
      notes: formData.notes || null,
    };

    await onSubmit(submitData);
  };

  const resetForm = () => {
    setFormData({
      quantityAdjustment: "",
      movementType: "Adjustment",
      reference: "",
      notes: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const movementTypeOptions = [
    { value: "Adjustment", label: "Manual Adjustment" },
    { value: "Restock", label: "Restock" },
    { value: "Damage", label: "Damage/Loss" },
    { value: "Return", label: "Return" },
  ];

  const newStockLevel = selectedInventory
    ? selectedInventory.stockLevel + parseInt(formData.quantityAdjustment || 0)
    : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Adjust Inventory"
      size="md"
    >
      <div className="space-y-4">
        {/* Current Stock Info */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Product:</strong> {selectedInventory?.productName}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            <strong>SKU:</strong> {selectedInventory?.productSku}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            <strong>Warehouse:</strong> {selectedInventory?.warehouseName}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            <strong>Current Stock:</strong> {selectedInventory?.stockLevel}
          </div>
        </div>

        <Select
          label="Movement Type *"
          name="movementType"
          value={formData.movementType}
          onChange={handleInputChange}
          options={movementTypeOptions}
        />

        <div>
          <Input
            label="Quantity Adjustment *"
            name="quantityAdjustment"
            type="number"
            value={formData.quantityAdjustment}
            onChange={handleInputChange}
            required
            placeholder="Use + for addition, - for deduction (e.g., 50 or -20)"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Positive numbers to add stock, negative to deduct
          </p>
        </div>

        {formData.quantityAdjustment && (
          <div
            className={`p-3 rounded-lg ${
              newStockLevel < 0
                ? "bg-red-50 dark:bg-red-900/20"
                : newStockLevel > selectedInventory?.maxStock
                ? "bg-yellow-50 dark:bg-yellow-900/20"
                : "bg-blue-50 dark:bg-blue-900/20"
            }`}
          >
            <p
              className={`text-sm font-medium ${
                newStockLevel < 0
                  ? "text-red-800 dark:text-red-200"
                  : newStockLevel > selectedInventory?.maxStock
                  ? "text-yellow-800 dark:text-yellow-200"
                  : "text-blue-800 dark:text-blue-200"
              }`}
            >
              <strong>New Stock Level:</strong> {newStockLevel}
              {newStockLevel < 0 && " ⚠️ Invalid (negative)"}
              {newStockLevel > selectedInventory?.maxStock &&
                " ⚠️ Exceeds max stock"}
            </p>
          </div>
        )}

        <Input
          label="Reference"
          name="reference"
          value={formData.reference}
          onChange={handleInputChange}
          placeholder="e.g., PO#12345, Delivery Receipt, DR-001"
        />

        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-200 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Reason for adjustment..."
            rows="3"
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={newStockLevel < 0}>
            Adjust Stock
          </Button>
        </div>
      </div>
    </Modal>
  );
};
