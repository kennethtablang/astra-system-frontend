// src/pages/dispatcher/DispatcherOrders.jsx
import { useState, useEffect } from "react";
import {
    Package,
    Search,
    Clock,
    CheckCircle,
    Truck,
    Store,
    Calendar,
    DollarSign,
    MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Select } from "../../components/ui/Select";
import { LoadingSpinner } from "../../components/ui/Loading";
import orderService from "../../services/orderService";
import { toast } from "react-hot-toast";

const DispatcherOrders = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = { pageSize: 50 };
            if (statusFilter !== "all") params.status = statusFilter;

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
            Pending: { variant: "warning" },
            Confirmed: { variant: "info" },
            InTransit: { variant: "purple" },
            Delivered: { variant: "success" },
            Cancelled: { variant: "danger" },
        };
        return statusMap[status] || { variant: "default" };
    };

    const filteredOrders = orders.filter((order) =>
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.storeName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusOptions = [
        { value: "all", label: "All Orders" },
        { value: "Confirmed", label: "Confirmed" },
        { value: "InTransit", label: "In Transit" },
        { value: "Delivered", label: "Delivered" },
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
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Orders for Delivery
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        View orders assigned to your trips
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-4 pb-4 text-center">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {orders.length}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">
                                {orders.filter((o) => o.status === "Confirmed").length}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Ready</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4 text-center">
                            <p className="text-2xl font-bold text-purple-600">
                                {orders.filter((o) => o.status === "InTransit").length}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">In Transit</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4 text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {orders.filter((o) => o.status === "Delivered").length}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Delivered</p>
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
                                    placeholder="Search by order or store..."
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

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    No orders found
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">
                                    No orders match your criteria
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {filteredOrders.map((order) => {
                            const statusInfo = getStatusBadge(order.status);
                            return (
                                <Card
                                    key={order.id}
                                    className="hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => navigate(`/dispatcher/deliveries/${order.id}`)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl ${order.status === "InTransit"
                                                        ? "bg-purple-100 dark:bg-purple-900/30"
                                                        : order.status === "Delivered"
                                                            ? "bg-green-100 dark:bg-green-900/30"
                                                            : "bg-blue-100 dark:bg-blue-900/30"
                                                    }`}>
                                                    {order.status === "InTransit" ? (
                                                        <Truck className="h-6 w-6 text-purple-600" />
                                                    ) : order.status === "Delivered" ? (
                                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                                    ) : (
                                                        <Package className="h-6 w-6 text-blue-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                                        {order.orderNumber || `Order #${order.id}`}
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <Store className="h-3 w-3" />
                                                            {order.storeName || "Unknown Store"}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {order.storeAddress || "No address"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <Badge variant={statusInfo.variant}>
                                                    {order.status}
                                                </Badge>
                                                <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">
                                                    ₱{order.totalAmount?.toLocaleString() || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DispatcherOrders;
