// src/components/modals/UserManagementDeleteModal.jsx
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { AlertCircle } from "lucide-react";

export const UserManagementDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedUser,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete User" size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-500" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete{" "}
              <strong className="text-gray-900 dark:text-white">
                {selectedUser?.fullName}
              </strong>
              ? This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete User
          </Button>
        </div>
      </div>
    </Modal>
  );
};
