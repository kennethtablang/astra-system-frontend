// src/components/modals/AdminDelivery/RecordDeliveryPaymentModal.jsx
import { useState, useEffect } from "react";
import { DollarSign, CreditCard, X, CheckCircle } from "lucide-react";
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import { LoadingSpinner } from "../../ui/Loading";
import { paymentService } from "../../../services/paymentService";
import { toast } from "react-hot-toast";

/**
 * Modal for recording payment after a delivery is completed.
 * Unlike the generic RecordPaymentModal, this receives the order directly.
 */
export const RecordDeliveryPaymentModal = ({
  isOpen,
  onClose,
  order,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  // Reset form when modal opens with new order
  useEffect(() => {
    if (isOpen && order) {
      const remainingBalance =
        order.remainingBalance ?? order.total - (order.totalPaid || 0);
      setAmount(remainingBalance > 0 ? remainingBalance.toFixed(2) : "");
      setMethod("Cash");
      setReference("");
      setNotes("");
    }
  }, [isOpen, order]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(value || 0);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!order) {
      toast.error("No order selected");
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    const remainingBalance =
      order.remainingBalance ?? order.total - (order.totalPaid || 0);
    if (paymentAmount > remainingBalance) {
      toast.error(
        `Amount cannot exceed remaining balance of ${formatCurrency(
          remainingBalance
        )}`
      );
      return;
    }

    try {
      setLoading(true);

      // Map method string to enum integer value
      const methodMap = {
        Cash: 0,
        GCash: 1,
        Maya: 2,
        BankTransfer: 3,
        Other: 4,
      };

      // Ensure orderId is an integer, use empty strings for optional fields
      const paymentPayload = {
        orderId: parseInt(order.id, 10),
        amount: paymentAmount,
        method: methodMap[method] ?? 0,
        reference: reference || "",
        notes: notes || "",
      };

      console.log("Recording payment with payload:", paymentPayload);

      const result = await paymentService.recordPayment(paymentPayload);

      if (result.success) {
        toast.success(result.message || "Payment recorded successfully");
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.message || "Failed to record payment");
      }
    } catch (error) {
      console.error("Record payment error:", error);
      toast.error(error.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
    toast.info(
      "Payment skipped. You can record it later from the Finance page."
    );
  };

  if (!order) return null;

  const orderTotal = order.total || 0;
  const totalPaid = order.totalPaid || 0;
  const remainingBalance = order.remainingBalance ?? orderTotal - totalPaid;
  const isPaid = remainingBalance <= 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Payment" size="md">
      <div className="space-y-6">
        {/* Order Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Order #{order.id}
            </span>
            {isPaid ? (
              <Badge variant="success">Fully Paid</Badge>
            ) : totalPaid > 0 ? (
              <Badge variant="warning">Partial Payment</Badge>
            ) : (
              <Badge variant="danger">Unpaid</Badge>
            )}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Store:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {order.storeName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Order Total:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(orderTotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Total Paid:
              </span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {formatCurrency(totalPaid)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-blue-200 dark:border-blue-700">
              <span className="font-medium text-gray-900 dark:text-white">
                Remaining Balance:
              </span>
              <span
                className={`text-lg font-bold ${
                  remainingBalance > 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                }`}
              >
                {formatCurrency(remainingBalance)}
              </span>
            </div>
          </div>
        </div>

        {isPaid ? (
          <div className="text-center py-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              This order has been fully paid.
            </p>
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  ₱
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={remainingBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Max: {formatCurrency(remainingBalance)}
              </p>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Method *
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Cash">Cash</option>
                <option value="GCash">GCash</option>
                <option value="Maya">Maya</option>
                <option value="BankTransfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Reference Number (conditional) */}
            {method !== "Cash" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Transaction ID, Check #, etc."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                disabled={loading}
                className="flex-1"
              >
                Skip for Now
              </Button>
              <Button
                type="submit"
                disabled={loading || !amount}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Recording...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Record Payment
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default RecordDeliveryPaymentModal;
