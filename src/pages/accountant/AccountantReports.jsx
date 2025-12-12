// src/pages/accountant/AccountantReports.jsx
import { useState, useEffect } from "react";
import {
    BarChart3,
    TrendingUp,
    DollarSign,
    FileText,
    Download,
    Calendar,
    CreditCard,
    PieChart,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/Loading";
import reportService from "../../services/reportService";
import paymentService from "../../services/paymentService";
import { toast } from "react-hot-toast";

const AccountantReports = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalPayments: 0,
        totalInvoices: 0,
        avgPaymentValue: 0,
        collectionRate: 0,
    });

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        try {
            setLoading(true);

            // Fetch dashboard stats
            const dashboardResult = await reportService.getDashboardStats();
            if (dashboardResult.success && dashboardResult.data) {
                setStats((prev) => ({
                    ...prev,
                    totalRevenue: dashboardResult.data.totalRevenue || 0,
                    totalPayments: dashboardResult.data.totalPayments || 0,
                    totalInvoices: dashboardResult.data.totalInvoices || 0,
                    collectionRate: dashboardResult.data.collectionRate || 0,
                }));
            }

            // Also fetch payments for average calculation
            const paymentsResult = await paymentService.getPayments();
            if (paymentsResult.success) {
                const payments = paymentsResult.data?.items || paymentsResult.data || [];
                const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
                setStats((prev) => ({
                    ...prev,
                    totalPayments: payments.length,
                    avgPaymentValue: payments.length > 0 ? total / payments.length : 0,
                }));
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
                        Financial Reports
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        View financial metrics and generate reports
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
                                    <CreditCard className="h-5 w-5 text-blue-600" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-3">
                                    {stats.totalPayments}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    Total Payments
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex flex-col">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg w-fit">
                                    <FileText className="h-5 w-5 text-purple-600" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-3">
                                    {stats.totalInvoices}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    Total Invoices
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex flex-col">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg w-fit">
                                    <BarChart3 className="h-5 w-5 text-orange-600" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-3">
                                    ₱{Math.round(stats.avgPaymentValue).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    Avg Payment
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
                                    {stats.collectionRate}%
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    Collection Rate
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                Revenue Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <div className="text-center">
                                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Revenue trend chart
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
                                <PieChart className="h-5 w-5 text-purple-600" />
                                Payment Methods
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <div className="text-center">
                                    <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Payment distribution
                                    </p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                        Coming soon
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Report Generation */}
                <Card>
                    <CardHeader>
                        <CardTitle>Generate Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border border-gray-200 dark:border-gray-700">
                                <DollarSign className="h-6 w-6 text-green-600" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    Daily Sales
                                </span>
                            </button>
                            <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border border-gray-200 dark:border-gray-700">
                                <CreditCard className="h-6 w-6 text-blue-600" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    Collections
                                </span>
                            </button>
                            <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border border-gray-200 dark:border-gray-700">
                                <FileText className="h-6 w-6 text-purple-600" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    AR Aging
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

export default AccountantReports;
