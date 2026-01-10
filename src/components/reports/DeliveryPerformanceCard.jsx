import { useState, useEffect } from "react";
import { Truck, Clock, CheckCircle, TrendingUp, User } from "lucide-react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { LoadingSpinner } from "../ui/Loading";
import reportService from "../../services/reportService";
import { toast } from "react-hot-toast";

const DeliveryPerformanceCard = () => {
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState(null);
    const [dateRange, setDateRange] = useState({
        from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
        to: new Date().toISOString().split("T")[0],
    });

    useEffect(() => {
        fetchReport();
    }, [dateRange]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const response = await reportService.getDeliveryPerformanceData(dateRange.from, dateRange.to);

            if (response.success) {
                setReportData(response.data);
            }
        } catch (error) {
            console.error("Error fetching delivery performance:", error);
            toast.error("Failed to load delivery performance");
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
                    No delivery data available
                </CardContent>
            </Card>
        );
    }

    const onTimePercentage = reportData.onTimePercentage || 0;
    const isGoodPerformance = onTimePercentage >= 80;

    return (
        <Card>
            <CardHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            Delivery Performance
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(dateRange.from).toLocaleDateString()} - {new Date(dateRange.to).toLocaleDateString()}
                        </p>
                    </div>

                    {/* Date Range Selector */}
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={dateRange.from}
                            onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
                            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                            type="date"
                            value={dateRange.to}
                            onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
                            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">On-Time Rate</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {onTimePercentage.toFixed(1)}%
                        </p>
                        <Badge variant={isGoodPerformance ? "success" : "warning"} className="mt-2">
                            {isGoodPerformance ? "Good" : "Needs Improvement"}
                        </Badge>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Truck className="h-5 w-5 text-blue-600" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Deliveries</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {reportData.totalDeliveries || 0}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            {reportData.onTimeDeliveries || 0} on-time
                        </p>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-5 w-5 text-yellow-600" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Avg Time</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {reportData.averageDeliveryTimeHours?.toFixed(1) || "0"}h
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            Delivery time
                        </p>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">In Progress</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {reportData.inProgressDeliveries || 0}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            Active deliveries
                        </p>
                    </div>
                </div>

                {/* Agent Performance */}
                {reportData.agentPerformance && reportData.agentPerformance.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Agent Performance
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {reportData.agentPerformance.slice(0, 10).map((agent, index) => (
                                <div
                                    key={agent.agentId || index}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                            <User className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {agent.agentName || agent.agentId}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {agent.totalDeliveries} deliveries • {agent.averageDeliveryTimeHours?.toFixed(1)}h avg
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <Badge variant={agent.onTimePercentage >= 80 ? "success" : "warning"}>
                                            {agent.onTimePercentage?.toFixed(0)}%
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default DeliveryPerformanceCard;
