// src/components/modals/AdminOrder/StoreTypeSelectionModal.jsx
import { StoreIcon, User, CheckCircle, AlertCircle } from "lucide-react";
import { Modal } from "../../ui/Modal";

export const StoreTypeSelectionModal = ({ isOpen, onClose, onSelectType }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Order" size="xl">
      <div className="space-y-6">
        <p className="text-center text-gray-600 dark:text-gray-400">
          Choose store type to continue
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Existing Store (Suki) */}
          <button
            onClick={() => onSelectType("existing")}
            className="group relative bg-white dark:bg-gray-800 p-8 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-lg"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <StoreIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Existing Store
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Create order for registered suki stores
                </p>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 w-full">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Credit terms available</span>
                </div>
              </div>
            </div>
          </button>

          {/* New Store (Walk-in) */}
          <button
            onClick={() => onSelectType("new")}
            className="group relative bg-white dark:bg-gray-800 p-8 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-all hover:shadow-lg"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center group-hover:bg-green-500 transition-colors">
                <User className="h-8 w-8 text-green-600 dark:text-green-400 group-hover:text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  New Customer
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Quick order for walk-in customers
                </p>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 w-full">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span>Cash on delivery only</span>
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> For existing stores, credit terms and
              payment methods will be pre-configured. New customers will require
              immediate payment upon delivery.
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
