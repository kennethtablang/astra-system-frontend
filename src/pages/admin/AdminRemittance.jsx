// src/pages/admin/AdminRemittance.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    DollarSign,
    Users,
    CheckCircle,
    Clock,
    RefreshCw,
    ChevronDown,
    ChevronRight,
    Check,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardHeader, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/Loading";
import { ReconciliationModal } from "../../components/modals/AdminRemittance/ReconciliationModal";
import { paymentService } from "../../services/paymentService";
import { toast } from "react-hot-toast";

/**
 * AdminRemittance page for managing dispatcher cash remittance to distributor.
 * Shows unreconciled payments grouped by dispatcher/trip.
 */
const AdminRemittance = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [dispatchers, setDispatchers] = useState([]);
    const [expandedDispatcher, setExpandedDispatcher] = useState(null);
    const [summary, setSummary] = useState({
        totalUnreconciled: 0,
        totalAmount: 0,
        dispatcherCount: 0,
    });

    // Reconciliation modal
    const [reconcileModalOpen, setReconcileModalOpen] = useState(false);
    const [selectedDispatcher, setSelectedDispatcher] = useState(null);

    useEffect(() => {
        fetchUnreconciledPayments();
    }, []);

    const fetchUnreconciledPayments = async () => {
        try {
            setLoading(true);

            // Fetch unreconciled payments
            const result = await paymentService.getUnreconciledPayments();

            if (result.success) {
                const payments = result.data || [];

                // Group by dispatcher
                const dispatcherMap = new Map();
                payments.forEach((payment) => {
                    const dispatcherId = payment.recordedById || "unknown";
                    if (!dispatcherMap.has(dispatcherId)) {
                        dispatcherMap.set(dispatcherId, {
                            id: dispatcherId,
                            name: payment.recordedByName || "Unknown",
                            payments: [],
                            totalAmount: 0,
                        });
                    }
                    const dispatcher = dispatcherMap.get(dispatcherId);
                    dispatcher.payments.push(payment);
                    dispatcher.totalAmount += payment.amount || 0;
                });

                const dispatcherList = Array.from(dispatcherMap.values());
                setDispatchers(dispatcherList);

                // Calculate summary
                setSummary({
                    totalUnreconciled: payments.length,
                    totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
                    dispatcherCount: dispatcherList.length,
                });
            }
        } catch (err) {
            console.error("Failed to fetch unreconciled payments:", err);
            toast.error("Failed to load remittance data");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(amount || 0);
    };

    const formatDateTime = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleString("en-PH", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
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

    const toggleDispatcherExpand = (dispatcherId) => {
        setExpandedDispatcher(
            expandedDispatcher === dispatcherId ? null : dispatcherId
        );
    };

    const handleOpenReconcileModal = (dispatcher) => {
        setSelectedDispatcher(dispatcher);
        setReconcileModalOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Dispatcher Remittance
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Confirm cash collections from dispatchers
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchUnreconciledPayments}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Pending Remittance
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(summary.totalAmount)}
                                    </p>
                                </div>
                                <DollarSign className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Unreconciled Payments
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {summary.totalUnreconciled}
                                    </p>
                                </div>
                                <Clock className="h-8 w-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Dispatchers Pending
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {summary.dispatcherCount}
                                    </p>
                                </div>
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Dispatcher List */}
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Dispatchers with Pending Collections
                        </h2>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <LoadingSpinner size="lg" />
                            </div>
                        ) : dispatchers.length === 0 ? (
                            <div className="text-center py-12">
                                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    All Clear!
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">
                                    No pending remittances from dispatchers
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {dispatchers.map((dispatcher) => (
                                    <div key={dispatcher.id}>
                                        {/* Dispatcher Header */}
                                        <div
                                            className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                            onClick={() => toggleDispatcherExpand(dispatcher.id)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {dispatcher.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {dispatcher.payments.length} payment(s) pending
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                                        {formatCurrency(dispatcher.totalAmount)}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Expected
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenReconcileModal(dispatcher);
                                                    }}
                                                >
                                                    <Check className="h-4 w-4 mr-1" />
                                                    Confirm
                                                </Button>
                                                {expandedDispatcher === dispatcher.id ? (
                                                    <ChevronDown className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Expanded Payment Details */}
                                        {expandedDispatcher === dispatcher.id && (
                                            <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-4">
                                                <table className="min-w-full">
                                                    <thead>
                                                        <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                                            <th className="text-left py-2">Payment ID</th>
                                                            <th className="text-left py-2">Order</th>
                                                            <th className="text-left py-2">Amount</th>
                                                            <th className="text-left py-2">Method</th>
                                                            <th className="text-left py-2">Recorded</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                                        {dispatcher.payments.map((payment) => (
                                                            <tr
                                                                key={payment.paymentId}
                                                                className="text-sm"
                                                            >
                                                                <td className="py-2 font-mono text-gray-900 dark:text-white">
                                                                    #{payment.paymentId}
                                                                </td>
                                                                <td className="py-2">
                                                                    <button
                                                                        onClick={() =>
                                                                            navigate(`/admin/orders/${payment.orderId}`)
                                                                        }
                                                                        className="text-blue-600 hover:underline"
                                                                    >
                                                                        Order #{payment.orderId}
                                                                    </button>
                                                                </td>
                                                                <td className="py-2 font-semibold text-green-600 dark:text-green-400">
                                                                    {formatCurrency(payment.amount)}
                                                                </td>
                                                                <td className="py-2">{getMethodBadge(payment.method)}</td>
                                                                <td className="py-2 text-gray-600 dark:text-gray-400">
                                                                    {formatDateTime(payment.recordedAt)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Link to Payments */}
                <div className="flex justify-end">
                    <Button
                        variant="outline"
                        onClick={() => navigate("/admin/finance/payments")}
                    >
                        View All Payments
                    </Button>
                </div>
            </div>

            {/* Reconciliation Modal */}
            <ReconciliationModal
                isOpen={reconcileModalOpen}
                onClose={() => setReconcileModalOpen(false)}
                dispatcher={selectedDispatcher}
                onSuccess={() => {
                    fetchUnreconciledPayments();
                    setSelectedDispatcher(null);
                }}
            />
        </DashboardLayout>
    );
};

export default AdminRemittance;
