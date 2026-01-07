// src/pages/admin/AdminProductReports.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/Loading";
import { ArrowLeft, Download, Package, TrendingUp } from "lucide-react";
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
    const [loading, setLoading] = useState(false);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        generateMockData();
    }, []);

    const generateMockData = () => {
        // Generate mock fast moving products data
        const categories = ["Beverages", "Snacks", "Canned Goods", "Household", "Personal Care"];
        const products = [
            { name: "Coke 1.5L", category: "Beverages", sales: 1200 },
            { name: "SkyFlakes", category: "Snacks", sales: 950 },
            { name: "Century Tuna", category: "Canned Goods", sales: 850 },
            { name: "Sprite 1.5L", category: "Beverages", sales: 800 },
            { name: "Head & Shoulders", category: "Personal Care", sales: 720 },
            { name: "Piattos", category: "Snacks", sales: 650 },
            { name: "Surf Powder", category: "Household", sales: 600 },
            { name: "Nature Spring", category: "Beverages", sales: 550 },
        ];
        setChartData(products);
    };

    const handleDownload = async () => {
        toast.success("Feature coming soon: Download Product Report");
        // Implement report generation logic here later or use existing stock report
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
                            Top selling products and category performance
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                            <div className="flex items-center gap-2 text-gray-600">
                                <TrendingUp className="h-5 w-5" />
                                <span className="text-sm font-medium">Top Moving Items (Last 30 Days)</span>
                            </div>
                            <Button
                                onClick={handleDownload}
                                disabled={loading}
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
                            <CardTitle>Fast Moving Products (By Volume)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[500px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={chartData}
                                    margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip formatter={(value) => `${value} units`} />
                                    <Legend />
                                    <Bar dataKey="sales" name="Units Sold" fill="#8884d8" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};
