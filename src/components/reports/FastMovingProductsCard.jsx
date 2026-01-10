import { useState, useEffect } from "react";
import { Package, TrendingUp, Layers } from "lucide-react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { LoadingSpinner } from "../ui/Loading";
import reportService from "../../services/reportService";
import { toast } from "react-hot-toast";

const FastMovingProductsCard = () => {
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState([]);
    const [dateRange, setDateRange] = useState({
        from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
        to: new Date().toISOString().split("T")[0],
    });
    const [limit, setLimit] = useState(5);

    useEffect(() => {
        fetchReport();
    }, [dateRange, limit]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const response = await reportService.getFastMovingProducts(dateRange.from, dateRange.to, limit);

            if (response.success) {
                setReportData(response.data || []);
            }
        } catch (error) {
            console.error("Error fetching fast moving products:", error);
            toast.error("Failed to load fast moving products");
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

    if (!reportData || reportData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Fast Moving Products
                    </h3>
                </CardHeader>
                <CardContent className="py-8 text-center text-gray-500">
                    No product data available
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Fast Moving Products by Category
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(dateRange.from).toLocaleDateString()} - {new Date(dateRange.to).toLocaleDateString()}
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-3">
                        <select
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value={3}>Top 3</option>
                            <option value={5}>Top 5</option>
                            <option value={10}>Top 10</option>
                        </select>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={dateRange.from}
                                onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
                                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <span className="text-gray-500 text-sm">to</span>
                            <input
                                type="date"
                                value={dateRange.to}
                                onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
                                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                <div className="space-y-6">
                    {reportData.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="border-b last:border-b-0 pb-6 last:pb-0">
                            {/* Category Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <Layers className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                                            {category.categoryName}
                                        </h4>
                                        <p className="text-sm text-gray-500">
                                            {category.categoryUnitsSold?.toLocaleString()} units • ₱{category.categoryRevenue?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant="info">
                                    {category.categoryPercentage?.toFixed(1)}% of sales
                                </Badge>
                            </div>

                            {/* Products in Category */}
                            <div className="space-y-2">
                                {category.topProducts && category.topProducts.map((product, productIndex) => (
                                    <div
                                        key={product.id || productIndex}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <Badge variant={productIndex === 0 ? "success" : "default"}>
                                                #{productIndex + 1}
                                            </Badge>
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                <Package className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    SKU: {product.sku} • {product.unitsSold} units sold
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                ₱{product.totalRevenue?.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                @₱{product.price?.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default FastMovingProductsCard;
