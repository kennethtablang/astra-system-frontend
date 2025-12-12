// src/pages/distributor/DistributorDashboard.jsx
import { useState, useEffect } from "react";
import {
    Home,
    Warehouse,
    Package,
    Truck,
    ShoppingCart,
    AlertTriangle,
    TrendingUp,
    Users,
    DollarSign,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { LoadingSpinner } from "../../components/ui/Loading";
import { warehouseService, distributorService } from "../../services/warehouseService";
import inventoryService from "../../services/inventoryService";
import reportService from "../../services/reportService";
import { toast } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";

const DistributorDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalWarehouses: 0,
        totalProducts: 0,
        lowStockItems: 0,
        activeTrips: 0,
        pendingOrders: 0,
        totalInventoryValue: 0,
    });
    const [warehouses, setWarehouses] = useState([]);
    const [lowStockAlerts, setLowStockAlerts] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch warehouses for current distributor
            const warehouseResult = await warehouseService.getWarehouses(user?.distributorId);
            if (warehouseResult.success) {
                setWarehouses(warehouseResult.data || []);
                setStats((prev) => ({
                    ...prev,
                    totalWarehouses: warehouseResult.data?.length || 0,
                }));
            }

            // Fetch inventory summary
            const inventorySummary = await inventoryService.getInventorySummary(user?.distributorId);
            if (inventorySummary.success && inventorySummary.data) {
                setStats((prev) => ({
                    ...prev,
                    totalProducts: inventorySummary.data.totalProducts || 0,
                    lowStockItems: inventorySummary.data.lowStockCount || 0,
                    totalInventoryValue: inventorySummary.data.totalValue || 0,
                }));
                setLowStockAlerts(inventorySummary.data.lowStockItems || []);
            }

            // Fetch dashboard stats for orders/trips
            const dashboardStats = await reportService.getDashboardStats();
            if (dashboardStats.success && dashboardStats.data) {
                setStats((prev) => ({
                    ...prev,
                    activeTrips: dashboardStats.data.activeTrips || 0,
                    pendingOrders: dashboardStats.data.pendingOrders || 0,
                }));
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: "Warehouses",
            value: stats.totalWarehouses,
            icon: Warehouse,
            color: "blue",
            href: "/distributor/warehouses",
        },
        {
            title: "Products",
            value: stats.totalProducts,
            icon: Package,
            color: "green",
            href: "/distributor/inventory",
        },
        {
            title: "Low Stock Alerts",
            value: stats.lowStockItems,
            icon: AlertTriangle,
            color: stats.lowStockItems > 0 ? "red" : "gray",
            href: "/distributor/inventory?filter=low-stock",
        },
        {
            title: "Active Trips",
            value: stats.activeTrips,
            icon: Truck,
            color: "purple",
            href: "/distributor/trips",
        },
        {
            title: "Pending Orders",
            value: stats.pendingOrders,
            icon: ShoppingCart,
            color: "orange",
            href: "/distributor/orders",
        },
        {
            title: "Inventory Value",
            value: `₱${stats.totalInventoryValue.toLocaleString()}`,
            icon: DollarSign,
            color: "emerald",
            href: "/distributor/reports",
        },
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
            green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
            red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
            purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
            orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
            emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
            gray: "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400",
        };
        return colors[color] || colors.gray;
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
                        Distributor Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Welcome back! Here's an overview of your distribution operations.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card
                                key={stat.title}
                                className="hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => window.location.href = stat.href}
                            >
                                <CardContent className="pt-4 pb-4">
                                    <div className="flex flex-col">
                                        <div className={`p-2 rounded-lg w-fit ${getColorClasses(stat.color)}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-3">
                                            {stat.value}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            {stat.title}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Warehouses List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Warehouse className="h-5 w-5 text-blue-600" />
                                Your Warehouses
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {warehouses.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                    No warehouses found
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {warehouses.slice(0, 5).map((warehouse) => (
                                        <div
                                            key={warehouse.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {warehouse.name}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {warehouse.address}
                                                </p>
                                            </div>
                                            <Badge variant="info">
                                                {warehouse.productCount || 0} items
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Low Stock Alerts */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                Low Stock Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {lowStockAlerts.length === 0 ? (
                                <div className="text-center py-4">
                                    <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                    <p className="text-gray-500 dark:text-gray-400">
                                        All stock levels are healthy!
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {lowStockAlerts.slice(0, 5).map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {item.productName}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {item.warehouseName}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="danger">
                                                    {item.currentStock} left
                                                </Badge>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Reorder: {item.reorderPoint}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <button
                                onClick={() => window.location.href = "/distributor/inventory"}
                                className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                            >
                                <Package className="h-6 w-6 text-blue-600" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    View Inventory
                                </span>
                            </button>
                            <button
                                onClick={() => window.location.href = "/distributor/trips"}
                                className="flex flex-col items-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                            >
                                <Truck className="h-6 w-6 text-purple-600" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    View Trips
                                </span>
                            </button>
                            <button
                                onClick={() => window.location.href = "/distributor/orders"}
                                className="flex flex-col items-center gap-2 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
                            >
                                <ShoppingCart className="h-6 w-6 text-orange-600" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    View Orders
                                </span>
                            </button>
                            <button
                                onClick={() => window.location.href = "/distributor/reports"}
                                className="flex flex-col items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                            >
                                <TrendingUp className="h-6 w-6 text-green-600" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    View Reports
                                </span>
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default DistributorDashboard;
