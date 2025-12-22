// src/pages/accountant/AccountantDashboard.jsx
import { useState, useEffect } from "react";
import {
    DollarSign,
    CreditCard,
    FileText,
    TrendingUp,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/Loading";
import reportService from "../../services/reportService";
import { toast } from "react-hot-toast";

const AccountantDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingPayments: 0,
        outstandingInvoices: 0,
        monthlyGrowth: 0,
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const result = await reportService.getDashboardStats();
            if (result.success && result.data) {
                setStats({
                    totalRevenue: result.data.totalRevenue || 0,
                    pendingPayments: result.data.pendingPayments || 0,
                    outstandingInvoices: result.data.outstandingInvoices || 0,
                    monthlyGrowth: result.data.monthlyGrowth || 0,
                });
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast.error("Failed to load dashboard data");
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
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Financial Overview
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Welcome back! Here's your financial summary for today.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Total Revenue
                                    </p>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        ₱{stats.totalRevenue.toLocaleString()}
                                    </h3>
                                </div>
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <span className={`flex items-center ${stats.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {stats.monthlyGrowth >= 0 ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                                    {Math.abs(stats.monthlyGrowth)}%
                                </span>
                                <span className="text-gray-600 dark:text-gray-400 ml-2">from last month</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Pending Payments
                                    </p>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        ₱{stats.pendingPayments.toLocaleString()}
                                    </h3>
                                </div>
                                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                    <CreditCard className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                            </div>
                            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                Requires attention
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Outstanding Invoices
                                    </p>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {stats.outstandingInvoices}
                                    </h3>
                                </div>
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                Awaiting payment
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Collection Rate
                                    </p>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        94.2%
                                    </h3>
                                </div>
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                +1.2% this week
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Latest financial transactions and updates</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                <DollarSign className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">Payment Received</p>
                                                <p className="text-sm text-gray-500">Order #ORD-{1000 + i}</p>
                                            </div>
                                        </div>
                                        <span className="font-semibold text-green-600">+₱5,000.00</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Common financial tasks</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                    <span>Generate Invoice</span>
                                </Button>
                                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                                    <CreditCard className="h-6 w-6 text-green-600" />
                                    <span>Record Payment</span>
                                </Button>
                                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                    <span>View Reports</span>
                                </Button>
                                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                                    <Calendar className="h-6 w-6 text-orange-600" />
                                    <span>Schedule Audit</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AccountantDashboard;
