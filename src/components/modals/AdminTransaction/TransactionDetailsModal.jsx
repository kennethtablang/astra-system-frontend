import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import { CheckCircle } from "lucide-react";
import { LoadingSpinner } from "../../ui/Loading";

export const TransactionDetailsModal = ({
  isOpen,
  onClose,
  transaction,
  loading,
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount || 0);
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transaction Details">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      ) : transaction ? (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-100">
                Payment Reconciled
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                This transaction has been verified and collected.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-gray-500 dark:text-gray-400">
                Transaction ID
              </span>
              <span className="font-mono font-medium text-gray-900 dark:text-white">
                #{transaction.id}
              </span>
            </div>
            <div>
              <span className="block text-gray-500 dark:text-gray-400">
                Amount
              </span>
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                {formatCurrency(transaction.amount)}
              </span>
            </div>
            <div>
              <span className="block text-gray-500 dark:text-gray-400">
                Order ID
              </span>
              <span className="font-mono text-gray-900 dark:text-white">
                #{transaction.orderId}
              </span>
            </div>
            <div>
              <span className="block text-gray-500 dark:text-gray-400">
                Method
              </span>
              <span className="text-gray-900 dark:text-white">
                {transaction.method}
              </span>
            </div>
            <div>
              <span className="block text-gray-500 dark:text-gray-400">
                Collected By
              </span>
              <span className="text-gray-900 dark:text-white">
                {transaction.recordedByName}
              </span>
            </div>
            <div>
              <span className="block text-gray-500 dark:text-gray-400">
                Date Collected
              </span>
              <span className="text-gray-900 dark:text-white">
                {formatDateTime(transaction.recordedAt)}
              </span>
            </div>
          </div>

          {transaction.isReconciled && (
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Reconciliation Details
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-gray-500 dark:text-gray-400">
                    Reconciled At
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDateTime(
                      transaction.reconciledAt || transaction.recordedAt
                    )}
                  </span>
                </div>
                {transaction.reconciliationNotes && (
                  <div className="col-span-2">
                    <span className="block text-gray-500 dark:text-gray-400">
                      Notes
                    </span>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      {transaction.reconciliationNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Transaction not found
        </div>
      )}
    </Modal>
  );
};
