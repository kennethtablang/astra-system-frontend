import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Store } from "lucide-react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { LoadingSpinner } from "../ui/Loading";
import reportService from "../../services/reportService";
import { toast } from "react-hot-toast";

const SalesReportCard = ({ period = "daily" }) => {
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedQuarter, setSelectedQuarter] = useState(Math.floor((new Date().getMonth()) / 3) + 1);

    useEffect(() => {
        fetchReport();
    }, [period, selectedDate, selectedMonth, selectedYear, selectedQuarter]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            let response;

            if (period === "daily") {
                response = await reportService.getDailySalesReport(selectedDate);
            } else if (period === "monthly") {
                response = await reportService.getMonthlySalesReport(selectedYear, selectedMonth);
            } else if (period === "quarterly") {
                response = await reportService.getQuarterlySalesReport(selectedYear, selectedQuarter);
            }

            if (response.success) {
                setReportData(response.data);
            }
        } catch (error) {
            console.error("Error fetching sales report:", error);
            toast.error("Failed to load sales report");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <LoadingSpinner />
                </CardContent>
            </Card>
        );
    }

    if (!reportData) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-gray-500">
                    No sales data available
                </CardContent>
            </Card>
        );
    }

    const isPositiveGrowth = reportData.revenueGrowthPercentage >= 0;

    return (
        <Card>
            <CardHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Sales Report - {reportData.reportType}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(reportData.startDate).toLocaleDateString()} - {new Date(reportData.endDate).toLocaleDateString()}
                        </p>
                    </div>

                    {/* Date Selector */}
                    {period === "daily" && (
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                    )}
                    {period === "monthly" && (
                        <div className="flex gap-2">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                    <option key={month} value={month}>
                                        {new Date(2000, month - 1).toLocaleDateString("en-US", { month: "long" })}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                min="2020"
                                max="2030"
                                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-24"
                            />
                        </div>
                    )}
                    {period === "quarterly" && (
                        <div className="flex gap-2">
                            <select
                                value={selectedQuarter}
                                onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value={1}>Q1</option>
                                <option value={2}>Q2</option>
                                <option value={3}>Q3</option>
                                <option value={4}>Q4</option>
                            </select>
                            <input
                                type="number"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                min="2020"
                                max="2030"
                                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-24"
                            />
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-5 w-5 text-blue-600" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            ₱{reportData.totalRevenue?.toLocaleString() || "0"}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                            {isPositiveGrowth ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className={`text-sm font-medium ${isPositiveGrowth ? "text-green-600" : "text-red-600"}`}>
                                {Math.abs(reportData.revenueGrowthPercentage).toFixed(1)}%
                            </span>
                            <span className="text-xs text-gray-500">vs previous period</span>
                        </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <ShoppingCart className="h-5 w-5 text-green-600" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Orders</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {reportData.totalOrders?.toLocaleString() || "0"}
                        </p>
                        <div className="mt-2">
                            <span className="text-xs text-gray-500">Orders placed</span>
                        </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Avg Order Value</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            ₱{reportData.averageOrderValue?.toLocaleString() || "0"}
                        </p>
                        <div className="mt-2">
                            <span className="text-xs text-gray-500">Per order</span>
                        </div>
                    </div>
                </div>

                {/* Top Stores */}
                {reportData.topStores && reportData.topStores.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Store className="h-4 w-4" />
                            Top Performing Stores
                        </h4>
                        <div className="space-y-2">
                            {reportData.topStores.map((store, index) => (
                                <div
                                    key={store.storeId}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <Badge variant={index === 0 ? "success" : "default"}>
                                            #{index + 1}
                                        </Badge>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {store.storeName}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {store.orderCount} orders
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        ₱{store.revenue?.toLocaleString() || "0"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default SalesReportCard;
