// src/pages/distributor/DistributorReports.jsx
import { useState, useEffect } from "react";
import {
    BarChart3,
    TrendingUp,
    DollarSign,
    Package,
    Truck,
    ShoppingCart,
    Calendar,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { LoadingSpinner } from "../../components/ui/Loading";
import reportService from "../../services/reportService";
import { toast } from "react-hot-toast";

const DistributorReports = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalDeliveries: 0,
        averageOrderValue: 0,
        completionRate: 0,
    });

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const result = await reportService.getDashboardStats();
            if (result.success && result.data) {
                setStats({
                    totalRevenue: result.data.totalRevenue || 0,
                    totalOrders: result.data.totalOrders || 0,
                    totalDeliveries: result.data.totalDeliveries || 0,
                    averageOrderValue: result.data.averageOrderValue || 0,
                    completionRate: result.data.completionRate || 0,
                });
            }
        } catch (error) {
            console.error("Error fetching report data:", error);
            toast.error("Failed to load report data");
        } finally {
            setLoading(false);
        }
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
                        Reports & Analytics
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        View performance metrics and analytics
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex flex-col">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg w-fit">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-3">
                                    ₱{stats.totalRevenue.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    Total Revenue
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex flex-col">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg w-fit">
                                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-3">
                                    {stats.totalOrders}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    Total Orders
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex flex-col">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg w-fit">
                                    <Truck className="h-5 w-5 text-purple-600" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-3">
                                    {stats.totalDeliveries}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    Deliveries
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex flex-col">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg w-fit">
                                    <Package className="h-5 w-5 text-orange-600" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-3">
                                    ₱{stats.averageOrderValue.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    Avg Order Value
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex flex-col">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg w-fit">
                                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-3">
                                    {stats.completionRate}%
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    Completion Rate
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Report Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                Sales Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <div className="text-center">
                                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Sales chart visualization
                                    </p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                        Coming soon
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                                Performance Trends
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <div className="text-center">
                                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Trend visualization
                                    </p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                        Coming soon
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Report Downloads */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border border-gray-200 dark:border-gray-700">
                                <DollarSign className="h-6 w-6 text-green-600" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    Sales Report
                                </span>
                            </button>
                            <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border border-gray-200 dark:border-gray-700">
                                <Package className="h-6 w-6 text-blue-600" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    Inventory Report
                                </span>
                            </button>
                            <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border border-gray-200 dark:border-gray-700">
                                <Truck className="h-6 w-6 text-purple-600" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    Delivery Report
                                </span>
                            </button>
                            <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border border-gray-200 dark:border-gray-700">
                                <Calendar className="h-6 w-6 text-orange-600" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    Monthly Summary
                                </span>
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default DistributorReports;
