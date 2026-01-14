// src/pages/distributor/DistributorOrders.jsx
import { useState, useEffect } from "react";
import {
    ShoppingCart,
    Search,
    Clock,
    CheckCircle,
    Truck,
    XCircle,
    Calendar,
    Store,
    DollarSign,
    Eye,
} from "lucide-react";
import { ViewOrderDetailsModal } from "../../components/modals/AdminOrder/ViewOrderDetailsModal";
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
import { LoadingSpinner } from "../../components/ui/Loading";
import orderService from "../../services/orderService";
import { toast } from "react-hot-toast";

const DistributorOrders = () => {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = { pageSize: 50 };
            if (statusFilter !== "all") {
                params.status = statusFilter;
            }

            const result = await orderService.getOrders(params);
            if (result.success) {
                setOrders(result.data?.items || result.data || []);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            Pending: { variant: "warning", icon: Clock },
            Confirmed: { variant: "info", icon: CheckCircle },
            InTransit: { variant: "purple", icon: Truck },
            Delivered: { variant: "success", icon: CheckCircle },
            Cancelled: { variant: "danger", icon: XCircle },
        };
        return statusMap[status] || { variant: "default", icon: null };
    };

    const filteredOrders = orders.filter((order) =>
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.storeName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusOptions = [
        { value: "all", label: "All Status" },
        { value: "Pending", label: "Pending" },
        { value: "Confirmed", label: "Confirmed" },
        { value: "InTransit", label: "In Transit" },
        { value: "Delivered", label: "Delivered" },
        { value: "Cancelled", label: "Cancelled" },
    ];

    const handleViewOrder = (orderId) => {
        setSelectedOrderId(orderId);
        setIsViewModalOpen(true);
    };

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
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Orders Overview
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        View and track all orders
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {orders.length}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-orange-600">
                                    {orders.filter((o) => o.status === "Pending").length}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Pending</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">
                                    {orders.filter((o) => o.status === "Confirmed").length}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Confirmed</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-purple-600">
                                    {orders.filter((o) => o.status === "InTransit").length}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">In Transit</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">
                                    {orders.filter((o) => o.status === "Delivered").length}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Delivered</p>
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
                                className="w-40"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Orders Table */}
                <Card>
                    <CardContent className="p-0">
                        {filteredOrders.length === 0 ? (
                            <div className="text-center py-12">
                                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    No orders found
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

                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredOrders.map((order) => {
                                            const statusInfo = getStatusBadge(order.status);
                                            return (
                                                <TableRow key={order.id}>
                                                    <TableCell>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {order.orderNumber || `ORD-${order.id}`}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Store className="h-4 w-4 text-gray-400" />
                                                            <span>{order.storeName || "Unknown"}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                            <Calendar className="h-4 w-4" />
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-1 font-semibold text-gray-900 dark:text-white">
                                                            <DollarSign className="h-4 w-4 text-green-600" />
                                                            ₱{order.totalAmount?.toLocaleString() || 0}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={statusInfo.variant}>
                                                            {order.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleViewOrder(order.id);
                                                            }}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                            title="View details"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
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
            
            <ViewOrderDetailsModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedOrderId(null);
                }}
                orderId={selectedOrderId}
            />
        </DashboardLayout>
    );
};

export default DistributorOrders;
