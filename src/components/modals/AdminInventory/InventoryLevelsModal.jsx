// src/components/modals/AdminInventory/InventoryLevelsModal.jsx
import { useState, useEffect } from "react";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";

export const InventoryLevelsModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedInventory,
}) => {
  const [formData, setFormData] = useState({
    reorderLevel: "",
    maxStock: "",
  });

  useEffect(() => {
    if (isOpen && selectedInventory) {
      setFormData({
        reorderLevel: selectedInventory.reorderLevel?.toString() || "0",
        maxStock: selectedInventory.maxStock?.toString() || "1000",
      });
    }
  }, [isOpen, selectedInventory]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const reorderLevel = parseInt(formData.reorderLevel);
    const maxStock = parseInt(formData.maxStock);

    if (isNaN(reorderLevel) || reorderLevel < 0) {
      alert("Please enter a valid reorder level");
      return;
    }

    if (isNaN(maxStock) || maxStock <= 0) {
      alert("Please enter a valid max stock");
      return;
    }

    if (reorderLevel >= maxStock) {
      alert("Reorder level must be less than max stock");
      return;
    }

    const submitData = {
      inventoryId: selectedInventory.id,
      reorderLevel: reorderLevel,
      maxStock: maxStock,
    };

    await onSubmit(submitData);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Inventory Levels"
      size="md"
    >
      <div className="space-y-4">
        {/* Product Info */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Product:</strong> {selectedInventory?.productName}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            <strong>Current Stock:</strong> {selectedInventory?.stockLevel}
          </div>
        </div>

        <Input
          label="Reorder Level *"
          name="reorderLevel"
          type="number"
          min="0"
          value={formData.reorderLevel}
          onChange={handleInputChange}
          required
          placeholder="Minimum stock before reorder alert"
        />

        <Input
          label="Maximum Stock *"
          name="maxStock"
          type="number"
          min="1"
          value={formData.maxStock}
          onChange={handleInputChange}
          required
          placeholder="Maximum stock capacity"
        />

        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Tip:</strong> Set reorder level to trigger low stock alerts.
            Max stock helps prevent overstocking.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Update Levels</Button>
        </div>
      </div>
    </Modal>
  );
};
