import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardHeader, CardContent } from "../../components/ui/Card";
import { LoadingSpinner } from "../../components/ui/Loading";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import reportService from "../../services/reportService";
import { toast } from "react-hot-toast";

const AdminReportDashboard = () => {
    const [salesData, setSalesData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [deliveryPerformance, setDeliveryPerformance] = useState([]);
    const [loading, setLoading] = useState(true);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    useEffect(() => {
        fetchAllReports();
    }, []);

    const fetchAllReports = async () => {
        setLoading(true);
        try {
            // Fetch multiple reports in parallel
            const [salesRes, topProdRes, deliveryRes] = await Promise.all([
                reportService.getDailySalesReport(),
                reportService.getTopSellingProducts(5),
                reportService.getDeliveryPerformanceData()
            ]);

            setSalesData(salesRes.data || []);
            setTopProducts(topProdRes.data || []);
            setDeliveryPerformance(deliveryRes.data || []);

        } catch (error) {
            console.error(error);
            toast.error("Failed to load report data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-screen items-center justify-center">
                    <LoadingSpinner />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Advanced Analytics
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Visual insights into your business performance
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sales Chart */}
                    <Card className="col-span-1 lg:col-span-2">
                        <CardHeader>
                            <h3 className="text-lg font-bold">Daily Sales Performance</h3>
                        </CardHeader>
                        <CardContent className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="totalSales" stroke="#8884d8" name="Total Sales (₱)" />
                                    <Line type="monotone" dataKey="orderCount" stroke="#82ca9d" name="Order Count" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Top Products Chart */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-bold">Top Selling Products</h3>
                        </CardHeader>
                        <CardContent className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topProducts} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="productName" type="category" width={100} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="totalSold" fill="#8884d8" name="Units Sold" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Delivery Performance Chart */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-bold">Delivery Status Distribution</h3>
                        </CardHeader>
                        <CardContent className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={deliveryPerformance}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {deliveryPerformance.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminReportDashboard;
