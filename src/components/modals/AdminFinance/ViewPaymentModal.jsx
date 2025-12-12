// src/components/modals/AdminFinance/ViewPaymentModal.jsx
import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import { LoadingSpinner } from "../../ui/Loading";
import { paymentService } from "../../../services/paymentService";
import { toast } from "react-hot-toast";

/**
 * Modal for viewing payment details.
 */
export const ViewPaymentModal = ({ isOpen, onClose, paymentId }) => {
    const [loading, setLoading] = useState(true);
    const [payment, setPayment] = useState(null);

    useEffect(() => {
        if (isOpen && paymentId) {
            fetchPaymentDetails();
        }
    }, [isOpen, paymentId]);

    const fetchPaymentDetails = async () => {
        try {
            setLoading(true);
            const result = await paymentService.getPaymentById(paymentId);
            if (result.success) {
                setPayment(result.data);
            }
        } catch {
            toast.error("Failed to load payment details");
        } finally {
            setLoading(false);
        }
    };

    const getMethodBadge = (method) => {
        const badges = {
            Cash: <Badge variant="success">Cash</Badge>,
            GCash: <Badge variant="info">GCash</Badge>,
            Maya: <Badge variant="info">Maya</Badge>,
            BankTransfer: <Badge variant="default">Bank Transfer</Badge>,
            Check: <Badge variant="warning">Check</Badge>,
            Other: <Badge variant="default">Other</Badge>,
        };
        return badges[method] || <Badge>{method}</Badge>;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(amount || 0);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Payment #${paymentId}`}
            size="md"
        >
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : !payment ? (
                <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Payment not found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Payment Info */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Order ID:
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    #{payment.orderId}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Amount:
                                </span>
                                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                    {formatCurrency(payment.amount)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Method:
                                </span>
                                {getMethodBadge(payment.method)}
                            </div>
                            {payment.reference && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Reference:
                                    </span>
                                    <span className="font-mono text-xs text-gray-900 dark:text-white">
                                        {payment.reference}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Recorded By:
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {payment.recordedByName || "Unknown"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Recorded At:
                                </span>
                                <span className="text-gray-900 dark:text-white">
                                    {new Date(payment.recordedAt).toLocaleString()}
                                </span>
                            </div>
                            {payment.notes && (
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                                    <span className="text-gray-600 dark:text-gray-400 block mb-1">
                                        Notes:
                                    </span>
                                    <p className="text-gray-900 dark:text-white">
                                        {payment.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default ViewPaymentModal;
