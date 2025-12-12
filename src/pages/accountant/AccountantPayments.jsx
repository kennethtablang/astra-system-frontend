// src/pages/accountant/AccountantPayments.jsx
import { useState, useEffect } from "react";
import {
    DollarSign,
    Search,
    Calendar,
    CreditCard,
    CheckCircle,
    Clock,
    XCircle,
    Filter,
    Store,
    RefreshCw,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/Loading";
import paymentService from "../../services/paymentService";
import { toast } from "react-hot-toast";

const AccountantPayments = () => {
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [methodFilter, setMethodFilter] = useState("all");
    const [summary, setSummary] = useState({
        totalPayments: 0,
        totalAmount: 0,
        pendingAmount: 0,
        completedCount: 0,
    });

    useEffect(() => {
        fetchPayments();
    }, [statusFilter, methodFilter]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter !== "all") params.status = statusFilter;
            if (methodFilter !== "all") params.method = methodFilter;

            const result = await paymentService.getPayments(params);
            if (result.success) {
                const data = result.data?.items || result.data || [];
                setPayments(data);

                // Calculate summary
                const total = data.reduce((sum, p) => sum + (p.amount || 0), 0);
                const pending = data.filter(p => p.status === "Pending").reduce((sum, p) => sum + (p.amount || 0), 0);
                const completed = data.filter(p => p.status === "Completed" || p.status === "Confirmed").length;

                setSummary({
                    totalPayments: data.length,
                    totalAmount: total,
                    pendingAmount: pending,
                    completedCount: completed,
                });
            }
        } catch (error) {
            console.error("Error fetching payments:", error);
            toast.error("Failed to load payments");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            Pending: { variant: "warning", icon: Clock },
            Confirmed: { variant: "success", icon: CheckCircle },
            Completed: { variant: "success", icon: CheckCircle },
            Failed: { variant: "danger", icon: XCircle },
            Cancelled: { variant: "danger", icon: XCircle },
        };
        return statusMap[status] || { variant: "default", icon: null };
    };

    const getMethodBadge = (method) => {
        const methodMap = {
            Cash: "default",
            Card: "info",
            BankTransfer: "purple",
            Check: "warning",
        };
        return methodMap[method] || "default";
    };

    const filteredPayments = payments.filter((payment) =>
        payment.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.storeName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusOptions = [
        { value: "all", label: "All Status" },
        { value: "Pending", label: "Pending" },
        { value: "Confirmed", label: "Confirmed" },
        { value: "Completed", label: "Completed" },
        { value: "Failed", label: "Failed" },
    ];

    const methodOptions = [
        { value: "all", label: "All Methods" },
        { value: "Cash", label: "Cash" },
        { value: "Card", label: "Card" },
        { value: "BankTransfer", label: "Bank Transfer" },
        { value: "Check", label: "Check" },
    ];

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Payment Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Track and manage all payments
                        </p>
                    </div>
                    <Button onClick={fetchPayments} variant="outline" className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <DollarSign className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {summary.totalPayments}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Payments</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-600">
                                        ₱{summary.totalAmount.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Amount</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                    <Clock className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-orange-600">
                                        ₱{summary.pendingAmount.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Pending</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-emerald-600">
                                        {summary.completedCount}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-3">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by order number or store..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                options={statusOptions}
                                className="w-36"
                            />
                            <Select
                                value={methodFilter}
                                onChange={(e) => setMethodFilter(e.target.value)}
                                options={methodOptions}
                                className="w-40"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Payments Table */}
                <Card>
                    <CardContent className="p-0">
                        {filteredPayments.length === 0 ? (
                            <div className="text-center py-12">
                                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    No payments found
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">
                                    Try adjusting your filters
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableHead>Order #</TableHead>
                                        <TableHead>Store</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPayments.map((payment) => {
                                            const statusInfo = getStatusBadge(payment.status);
                                            return (
                                                <TableRow key={payment.id}>
                                                    <TableCell>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {payment.orderNumber || `PAY-${payment.id}`}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Store className="h-4 w-4 text-gray-400" />
                                                            <span>{payment.storeName || "N/A"}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                            <Calendar className="h-4 w-4" />
                                                            {new Date(payment.createdAt || payment.paymentDate).toLocaleDateString()}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={getMethodBadge(payment.paymentMethod)}>
                                                            {payment.paymentMethod || "Cash"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className="font-semibold text-green-600 dark:text-green-400">
                                                            ₱{payment.amount?.toLocaleString() || 0}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={statusInfo.variant}>
                                                            {payment.status || "Pending"}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default AccountantPayments;
