// src/components/modals/AdminFinance/RecordPaymentModal.jsx
import { useState } from "react";
import { Search } from "lucide-react";
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { LoadingSpinner } from "../../ui/Loading";
import { paymentService } from "../../../services/paymentService";
import orderService from "../../../services/orderService";
import { toast } from "react-hot-toast";

/**
 * Modal for recording payment against an order.
 * Requires searching for an order by ID first.
 */
export const RecordPaymentModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [orderSearch, setOrderSearch] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("Cash");
    const [reference, setReference] = useState("");
    const [notes, setNotes] = useState("");

    const handleSearchOrder = async () => {
        if (!orderSearch) {
            toast.error("Please enter an order ID");
            return;
        }

        try {
            setLoading(true);
            const result = await orderService.getOrderById(parseInt(orderSearch));
            if (result.success && result.data) {
                setSelectedOrder(result.data);
                setAmount(result.data.remainingBalance?.toFixed(2) || "");
                toast.success("Order found");
            } else {
                toast.error("Order not found");
            }
        } catch {
            toast.error("Failed to find order");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedOrder) {
            toast.error("Please select an order");
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        try {
            setLoading(true);
            const result = await paymentService.recordPayment({
                orderId: selectedOrder.id,
                amount: parseFloat(amount),
                method: method,
                reference: reference || null,
                notes: notes || null,
            });

            if (result.success) {
                toast.success(result.message || "Payment recorded successfully");
                onSuccess?.();
                handleClose();
            } else {
                toast.error(result.message || "Failed to record payment");
            }
        } catch (err) {
            console.error("Record payment error:", err);
            toast.error(err.response?.data?.message || "Failed to record payment");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setOrderSearch("");
        setSelectedOrder(null);
        setAmount("");
        setMethod("Cash");
        setReference("");
        setNotes("");
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Record Payment" size="md">
            <div className="space-y-4">
                {/* Order Search */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Order ID
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={orderSearch}
                            onChange={(e) => setOrderSearch(e.target.value)}
                            placeholder="Enter order ID"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            disabled={selectedOrder !== null}
                        />
                        {!selectedOrder && (
                            <Button onClick={handleSearchOrder} disabled={loading}>
                                <Search className="h-4 w-4" />
                            </Button>
                        )}
                        {selectedOrder && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSelectedOrder(null);
                                    setOrderSearch("");
                                    setAmount("");
                                }}
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {/* Order Details */}
                {selectedOrder && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Store:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {selectedOrder.storeName}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Total:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    ₱{selectedOrder.total?.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Total Paid:
                                </span>
                                <span className="font-medium text-green-600 dark:text-green-400">
                                    ₱{selectedOrder.totalPaid?.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-blue-200 dark:border-blue-700">
                                <span className="font-medium text-gray-900 dark:text-white">
                                    Remaining Balance:
                                </span>
                                <span className="text-lg font-bold text-red-600 dark:text-red-400">
                                    ₱{selectedOrder.remainingBalance?.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Amount */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Payment Amount *
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        required
                        disabled={!selectedOrder}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="Cash">Cash</option>
                        <option value="GCash">GCash</option>
                        <option value="Maya">Maya</option>
                        <option value="BankTransfer">Bank Transfer</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                {/* Reference */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Reference Number
                    </label>
                    <input
                        type="text"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        placeholder="Transaction ID, Check #, etc."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Additional notes..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="flex-1"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !selectedOrder}
                        className="flex-1"
                    >
                        {loading ? (
                            <>
                                <LoadingSpinner size="sm" className="mr-2" />
                                Recording...
                            </>
                        ) : (
                            "Record Payment"
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default RecordPaymentModal;
