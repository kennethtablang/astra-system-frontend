import { useState, useEffect } from "react";
import { Users, CheckCircle } from "lucide-react";
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { LoadingSpinner } from "../../ui/Loading";
import { paymentService } from "../../../services/paymentService";
import { toast } from "react-hot-toast";

export const ReconciliationModal = ({
    isOpen,
    onClose,
    dispatcher,
    onSuccess,
}) => {
    const [selectedPayments, setSelectedPayments] = useState([]);
    const [reconcileNotes, setReconcileNotes] = useState("");
    const [reconciling, setReconciling] = useState(false);

    // Initialize state when modal opens or dispatcher changes
    useEffect(() => {
        if (isOpen && dispatcher) {
            // Default to selecting all payments
            setSelectedPayments(dispatcher.payments.map((p) => p.paymentId));
            setReconcileNotes("");
        }
    }, [isOpen, dispatcher]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(amount || 0);
    };

    const togglePaymentSelection = (paymentId) => {
        setSelectedPayments((prev) =>
            prev.includes(paymentId)
                ? prev.filter((id) => id !== paymentId)
                : [...prev, paymentId]
        );
    };

    const getSelectedTotal = () => {
        if (!dispatcher) return 0;
        return dispatcher.payments
            .filter((p) => selectedPayments.includes(p.paymentId))
            .reduce((sum, p) => sum + (p.amount || 0), 0);
    };

    const handleReconcile = async () => {
        if (selectedPayments.length === 0) {
            toast.error("Please select at least one payment to reconcile");
            return;
        }

        try {
            setReconciling(true);

            // Reconcile each selected payment
            let successCount = 0;
            let failCount = 0;

            for (const paymentId of selectedPayments) {
                try {
                    const result = await paymentService.reconcilePayment({
                        paymentId: paymentId,
                        notes: reconcileNotes || `Remittance confirmed`,
                    });
                    if (result.success) {
                        successCount++;
                    } else {
                        failCount++;
                    }
                } catch {
                    failCount++;
                }
            }

            if (successCount > 0) {
                toast.success(`${successCount} payment(s) reconciled successfully`);
            }
            if (failCount > 0) {
                toast.error(`${failCount} payment(s) failed to reconcile`);
            }

            // Cleanup and notify parent
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error("Reconciliation error:", err);
            toast.error("Failed to reconcile payments");
        } finally {
            setReconciling(false);
        }
    };

    if (!dispatcher) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Confirm Remittance"
            size="lg"
        >
            <div className="space-y-6">
                {/* Dispatcher Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {dispatcher.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {dispatcher.payments.length} payment(s) to confirm
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                            Expected Amount:
                        </span>
                        <span className="font-bold text-lg text-gray-900 dark:text-white">
                            {formatCurrency(dispatcher.totalAmount)}
                        </span>
                    </div>
                </div>

                {/* Payment Selection */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Select Payments to Reconcile
                        </h4>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setSelectedPayments(
                                    selectedPayments.length ===
                                        dispatcher.payments.length
                                        ? []
                                        : dispatcher.payments.map((p) => p.paymentId)
                                )
                            }
                        >
                            {selectedPayments.length ===
                                dispatcher.payments.length
                                ? "Deselect All"
                                : "Select All"}
                        </Button>
                    </div>
                    <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                        {dispatcher.payments.map((payment) => (
                            <div
                                key={payment.paymentId}
                                className={`flex items-center gap-3 p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedPayments.includes(payment.paymentId)
                                    ? "bg-green-50 dark:bg-green-900/20"
                                    : ""
                                    }`}
                                onClick={() => togglePaymentSelection(payment.paymentId)}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedPayments.includes(payment.paymentId)}
                                    onChange={() => togglePaymentSelection(payment.paymentId)}
                                    className="h-4 w-4 text-blue-600 rounded"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <span className="font-mono text-sm text-gray-900 dark:text-white">
                                            Payment #{payment.paymentId}
                                        </span>
                                        <span className="font-semibold text-green-600">
                                            {formatCurrency(payment.amount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>Order #{payment.orderId}</span>
                                        <span>{payment.method}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Selected Total */}
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                            Selected Total ({selectedPayments.length} payments):
                        </span>
                        <span className="text-xl font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(getSelectedTotal())}
                        </span>
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes (Optional)
                    </label>
                    <textarea
                        value={reconcileNotes}
                        onChange={(e) => setReconcileNotes(e.target.value)}
                        placeholder="Any notes about this remittance..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={reconciling}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleReconcile}
                        disabled={reconciling || selectedPayments.length === 0}
                        className="flex-1"
                    >
                        {reconciling ? (
                            <>
                                <LoadingSpinner size="sm" className="mr-2" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirm Receipt
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
