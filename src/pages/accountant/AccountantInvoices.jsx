// src/pages/accountant/AccountantInvoices.jsx
import { useState, useEffect } from "react";
import {
    FileText,
    Search,
    Calendar,
    Download,
    Eye,
    Clock,
    CheckCircle,
    XCircle,
    Store,
    DollarSign,
    RefreshCw,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
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

const AccountantInvoices = () => {
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [summary, setSummary] = useState({
        totalInvoices: 0,
        totalAmount: 0,
        paidCount: 0,
        overdueCount: 0,
    });

    useEffect(() => {
        fetchInvoices();
    }, [statusFilter]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            // Using invoices endpoint if available, fallback to payments
            const result = await paymentService.getInvoices ?
                await paymentService.getInvoices() :
                await paymentService.getPayments();

            if (result.success) {
                const data = result.data?.items || result.data || [];
                setInvoices(data);

                // Calculate summary
                const total = data.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
                const paid = data.filter(inv => inv.status === "Paid" || inv.status === "Completed").length;
                const overdue = data.filter(inv => inv.status === "Overdue").length;

                setSummary({
                    totalInvoices: data.length,
                    totalAmount: total,
                    paidCount: paid,
                    overdueCount: overdue,
                });
            }
        } catch (error) {
            console.error("Error fetching invoices:", error);
            toast.error("Failed to load invoices");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            Pending: { variant: "warning" },
            Paid: { variant: "success" },
            Completed: { variant: "success" },
            Overdue: { variant: "danger" },
            Cancelled: { variant: "default" },
        };
        return statusMap[status] || { variant: "default" };
    };

    const filteredInvoices = invoices.filter((invoice) => {
        const matchesSearch =
            invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.storeName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusOptions = [
        { value: "all", label: "All Status" },
        { value: "Pending", label: "Pending" },
        { value: "Paid", label: "Paid" },
        { value: "Overdue", label: "Overdue" },
        { value: "Cancelled", label: "Cancelled" },
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
                            Invoice Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            View and manage invoices
                        </p>
                    </div>
                    <Button onClick={fetchInvoices} variant="outline" className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="text-center">
                                <FileText className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {summary.totalInvoices}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Total Invoices</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="text-center">
                                <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-green-600">
                                    ₱{summary.totalAmount.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Total Amount</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="text-center">
                                <CheckCircle className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-emerald-600">
                                    {summary.paidCount}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Paid</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="text-center">
                                <Clock className="h-6 w-6 text-red-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-red-600">
                                    {summary.overdueCount}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Overdue</p>
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
                                    placeholder="Search by invoice or order number..."
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
                        </div>
                    </CardContent>
                </Card>

                {/* Invoices Table */}
                <Card>
                    <CardContent className="p-0">
                        {filteredInvoices.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    No invoices found
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">
                                    Try adjusting your filters
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableHead>Invoice #</TableHead>
                                        <TableHead>Store</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredInvoices.map((invoice) => {
                                            const statusInfo = getStatusBadge(invoice.status);
                                            return (
                                                <TableRow key={invoice.id}>
                                                    <TableCell>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {invoice.invoiceNumber || invoice.orderNumber || `INV-${invoice.id}`}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Store className="h-4 w-4 text-gray-400" />
                                                            <span>{invoice.storeName || "N/A"}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                            <Calendar className="h-4 w-4" />
                                                            {new Date(invoice.createdAt || invoice.invoiceDate).toLocaleDateString()}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className="font-semibold text-gray-900 dark:text-white">
                                                            ₱{(invoice.totalAmount || invoice.amount)?.toLocaleString() || 0}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={statusInfo.variant}>
                                                            {invoice.status || "Pending"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                            <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors">
                                                                <Download className="h-4 w-4" />
                                                            </button>
                                                        </div>
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

export default AccountantInvoices;
