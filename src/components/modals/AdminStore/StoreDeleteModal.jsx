// src/components/modals/AdminStore/StoreDeleteModal.jsx
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { AlertCircle } from "lucide-react";

export const StoreDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedStore,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Store" size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-500" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete{" "}
              <strong className="text-gray-900 dark:text-white">
                {selectedStore?.name}
              </strong>
              ?
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              This action cannot be undone. The store will be permanently
              removed from the system.
            </p>
            {selectedStore?.ownerName && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Owner: {selectedStore.ownerName}
              </p>
            )}
          </div>
        </div>

        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">
            <strong>Warning:</strong> Stores with existing orders cannot be
            deleted. Only stores without any order history can be removed.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete Store
          </Button>
        </div>
      </div>
    </Modal>
  );
};
