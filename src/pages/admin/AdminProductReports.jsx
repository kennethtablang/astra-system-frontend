// src/pages/admin/AdminProductReports.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/Loading";
import { ArrowLeft, Download, Package, TrendingUp, Calendar } from "lucide-react";
import reportService from "../../services/reportService";
import { toast } from "react-hot-toast";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

export const AdminProductReports = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState([]);
    const [dateRange, setDateRange] = useState({
        from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
        to: new Date().toISOString().split("T")[0],
    });

    useEffect(() => {
        fetchProductData();
    }, [dateRange]);

    const fetchProductData = async () => {
        try {
            setLoading(true);
            const response = await reportService.getTopSellingProducts(10, dateRange.from, dateRange.to);

            if (response.success && response.data) {
                // Transform data for the chart
                const products = response.data.map(product => ({
                    name: product.name,
                    category: product.categoryName,
                    sales: product.unitsSold,
                    revenue: product.totalRevenue
                }));
                setChartData(products);
            }
        } catch (error) {
            console.error("Error fetching product data:", error);
            toast.error("Failed to load product data");
            setChartData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        toast.info("Export feature: Please use 'View Reports' for detailed exports");
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/admin/reports")}
                        className="p-2"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Product Performance Report
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Top-selling products and category performance
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                            <div className="flex gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        From Date
                                    </label>
                                    <input
                                        type="date"
                                        value={dateRange.from}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        To Date
                                    </label>
                                    <input
                                        type="date"
                                        value={dateRange.to}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={handleDownload}
                                className="flex items-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Download Report
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Charts */}
                <div className="grid grid-cols-1 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Selling Products (By Volume)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[500px]">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <LoadingSpinner size="lg" />
                                </div>
                            ) : chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        layout="vertical"
                                        data={chartData}
                                        margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="name" type="category" width={110} />
                                        <Tooltip
                                            formatter={(value, name) => {
                                                if (name === 'Units Sold') return `${value} units`;
                                                return `₱${value.toLocaleString()}`;
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="sales" name="Units Sold" fill="#8884d8" radius={[0, 4, 4, 0]} />
                                        <Bar dataKey="revenue" name="Revenue (₱)" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500">
                                    No product data available for the selected period
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Product Details Table */}
                    {chartData.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                            <tr>
                                                <th className="px-6 py-3">Rank</th>
                                                <th className="px-6 py-3">Product Name</th>
                                                <th className="px-6 py-3">Category</th>
                                                <th className="px-6 py-3">Units Sold</th>
                                                <th className="px-6 py-3">Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {chartData.map((product, index) => (
                                                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                    <td className="px-6 py-4 font-medium">#{index + 1}</td>
                                                    <td className="px-6 py-4 font-medium">{product.name}</td>
                                                    <td className="px-6 py-4">{product.category}</td>
                                                    <td className="px-6 py-4">{product.sales.toLocaleString()} units</td>
                                                    <td className="px-6 py-4 font-bold text-green-600">₱{product.revenue.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};
