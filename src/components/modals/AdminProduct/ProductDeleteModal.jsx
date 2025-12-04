// src/components/modals/AdminProduct/ProductDeleteModal.jsx
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { AlertCircle } from "lucide-react";

export const ProductDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedProduct,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Product" size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-500" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete{" "}
              <strong className="text-gray-900 dark:text-white">
                {selectedProduct?.name}
              </strong>
              ?
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              This action cannot be undone. The product will be permanently
              removed from the system.
            </p>
            {selectedProduct?.sku && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                SKU: {selectedProduct.sku}
              </p>
            )}
          </div>
        </div>

        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">
            <strong>Warning:</strong> Products that have been used in orders
            cannot be deleted. Only products without any order history can be
            removed.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete Product
          </Button>
        </div>
      </div>
    </Modal>
  );
};
