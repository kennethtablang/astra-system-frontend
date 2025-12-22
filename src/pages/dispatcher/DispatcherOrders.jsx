// src/pages/dispatcher/DispatcherOrders.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    Eye,
    AlertCircle,
    XCircle,
    ArrowRight
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
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { LoadingSpinner } from "../../components/ui/Loading";
import orderService from "../../services/orderService";
import { toast } from "react-hot-toast";

const DispatcherOrders = () => {
    const navigate = useNavigate();

    // State
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalOrders, setTotalOrders] = useState(0);

    const [stats, setStats] = useState({
        total: 0,
        ready: 0,
        inTransit: 0,
        delivered: 0
    });

    useEffect(() => {
        fetchOrders();
    }, [currentPage, pageSize, statusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = {
                pageNumber: currentPage,
                pageSize: pageSize
            };

            if (statusFilter !== "All") {
                params.status = statusFilter;
            } else {
                // For dispatchers, we're primarily interested in active/delivery related statuses
                // But showing all allows them to see history too
            }

            const result = await orderService.getOrders(params);

            if (result.success) {
                const fetchedOrders = result.data?.items || result.data || [];
                setOrders(fetchedOrders);
                setTotalOrders(result.data?.totalCount || fetchedOrders.length);

                // Calculate basic stats from the fetched batch or separate endpoint if available
                // For now, simple calculation based on current view or if backend supports summary
                updateStats(fetchedOrders);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const updateStats = (currentOrders) => {
        // ideally this should come from an API summary endpoint
        setStats({
            total: totalOrders || currentOrders.length,
            ready: currentOrders.filter(o => o.status === "Confirmed" || o.status === "Packed").length,
            inTransit: currentOrders.filter(o => o.status === "InTransit").length,
            delivered: currentOrders.filter(o => o.status === "Delivered").length
        });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            Pending: { variant: "warning", label: "Pending" },
            Confirmed: { variant: "info", label: "Confirmed" },
            Packed: { variant: "purple", label: "Packed" },
            Dispatched: { variant: "default", label: "Dispatched" },
            InTransit: { variant: "purple", label: "In Transit" },
            AtStore: { variant: "default", label: "At Store" },
            Delivered: { variant: "success", label: "Delivered" },
            Returned: { variant: "warning", label: "Returned" },
            Cancelled: { variant: "danger", label: "Cancelled" },
        };
        const config = statusMap[status] || { variant: "default", label: status };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getStatusIcon = (status) => {
        const icons = {
            Pending: <Clock className="h-4 w-4 text-yellow-600" />,
            Confirmed: <CheckCircle className="h-4 w-4 text-blue-600" />,
            Packed: <Package className="h-4 w-4 text-purple-600" />,
            Dispatched: <Truck className="h-4 w-4 text-gray-600" />,
            InTransit: <Truck className="h-4 w-4 text-purple-600" />,
            AtStore: <MapPin className="h-4 w-4 text-blue-600" />,
            Delivered: <CheckCircle className="h-4 w-4 text-green-600" />,
            Returned: <AlertCircle className="h-4 w-4 text-yellow-600" />,
            Cancelled: <XCircle className="h-4 w-4 text-red-600" />,
        };
        return icons[status] || <Package className="h-4 w-4 text-gray-400" />;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(amount);
    };

    const formatDateTime = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Filter Logic (Client-side search for now if API doesn't support complex search)
    const filteredOrders = orders.filter((order) => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            order.id.toString().includes(search) ||
            order.storeName?.toLowerCase().includes(search) ||
            order.storeCity?.toLowerCase().includes(search)
        );
    });

    const statusOptions = [
        { value: "All", label: "All Orders" },
        { value: "Confirmed", label: "Confirmed" },
        { value: "Packed", label: "Packed" },
        { value: "InTransit", label: "In Transit" },
        { value: "Delivered", label: "Delivered" },
    ];

    const pageSizeOptions = [
        { value: "10", label: "10" },
        { value: "20", label: "20" },
        { value: "50", label: "50" },
    ];

    // Pagination Calculations
    const totalPages = Math.ceil(totalOrders / pageSize);
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, totalOrders);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Orders Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Track and manage order deliveries
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalOrders}</p>
                                </div>
                                <Package className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Ready</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.ready}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">In Transit</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inTransit}</p>
                                </div>
                                <Truck className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Delivered</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.delivered}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by ID, Store, or Location..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    options={statusOptions}
                                    className="w-40"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders Table */}
                <Card>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <LoadingSpinner size="lg" />
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    No orders found
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">
                                    Try adjusting your filters
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableHead>Order ID</TableHead>
                                            <TableHead>Store Detail</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredOrders.map((order) => (
                                                <TableRow key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(order.status)}
                                                            <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                                                                #{order.id}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {order.storeName}
                                                            </p>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {order.itemCount} items
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-start gap-1">
                                                            <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                                {order.storeBarangay && (
                                                                    <div>{order.storeBarangay}</div>
                                                                )}
                                                                {order.storeCity && (
                                                                    <div className="font-medium">
                                                                        {order.storeCity}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                                                    <TableCell>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {formatCurrency(order.total)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            {formatDateTime(order.createdAt)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => navigate(`/dispatcher/deliveries/${order.id}`)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                                title="View Details"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Select
                                                value={pageSize.toString()}
                                                onChange={(e) => {
                                                    setPageSize(Number(e.target.value));
                                                    setCurrentPage(1);
                                                }}
                                                options={pageSizeOptions}
                                                className="w-20"
                                            />
                                            <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                                {startIndex}-{endIndex} of {totalOrders}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                            >
                                                Previous
                                            </Button>

                                            <div className="flex items-center gap-1">
                                                {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                                                    let pageNum;
                                                    if (totalPages <= 5) {
                                                        pageNum = idx + 1;
                                                    } else if (currentPage <= 3) {
                                                        pageNum = idx + 1;
                                                    } else if (currentPage >= totalPages - 2) {
                                                        pageNum = totalPages - 4 + idx;
                                                    } else {
                                                        pageNum = currentPage - 2 + idx;
                                                    }

                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => setCurrentPage(pageNum)}
                                                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                                                    ? "bg-blue-600 text-white"
                                                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default DispatcherOrders;
