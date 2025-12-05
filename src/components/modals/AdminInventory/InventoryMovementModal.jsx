// src/components/modals/AdminInventory/InventoryMovementModal.jsx
import { useState, useEffect } from "react";
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { LoadingSpinner } from "../../ui/Loading";
import { History, TrendingUp, TrendingDown, Package } from "lucide-react";
import inventoryService from "../../../services/inventoryService";
import { toast } from "react-hot-toast";

export const InventoryMovementModal = ({
  isOpen,
  onClose,
  selectedInventory,
}) => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && selectedInventory) {
      fetchMovements();
    }
  }, [isOpen, selectedInventory]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const result = await inventoryService.getInventoryMovements(
        selectedInventory.id,
        50
      );

      if (result.success) {
        setMovements(result.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch movement history");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getMovementIcon = (type) => {
    const icons = {
      Restock: <TrendingUp className="h-4 w-4 text-green-600" />,
      Order: <TrendingDown className="h-4 w-4 text-red-600" />,
      Adjustment: <Package className="h-4 w-4 text-blue-600" />,
      Damage: <TrendingDown className="h-4 w-4 text-red-600" />,
      Return: <TrendingUp className="h-4 w-4 text-green-600" />,
    };
    return icons[type] || <History className="h-4 w-4 text-gray-600" />;
  };

  const getQuantityColor = (quantity) => {
    return quantity > 0
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Inventory Movement History"
      size="lg"
    >
      <div className="space-y-4">
        {/* Product Info */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Product:</strong> {selectedInventory?.productName} (
            {selectedInventory?.productSku})
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            <strong>Warehouse:</strong> {selectedInventory?.warehouseName}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            <strong>Current Stock:</strong> {selectedInventory?.stockLevel}
          </div>
        </div>

        {/* Movement List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : movements.length === 0 ? (
          <div className="text-center py-12">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              No movement history
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              No stock movements have been recorded yet
            </p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-2">
            {movements.map((movement) => (
              <div
                key={movement.id}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getMovementIcon(movement.movementType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {movement.movementType}
                        </span>
                        <span
                          className={`font-semibold ${getQuantityColor(
                            movement.quantity
                          )}`}
                        >
                          {movement.quantity > 0
                            ? `+${movement.quantity}`
                            : movement.quantity}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(movement.movementDate).toLocaleString()}
                      </div>
                      {movement.reference && (
                        <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          <strong>Ref:</strong> {movement.reference}
                        </div>
                      )}
                      {movement.notes && (
                        <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          {movement.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Before
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {movement.previousStock}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      After
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {movement.newStock}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
