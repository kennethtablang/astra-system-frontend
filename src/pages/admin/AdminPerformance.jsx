// src/pages/admin/AdminPerformance.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/Loading";
import { ArrowLeft, Download, Calendar, TrendingUp } from "lucide-react";
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
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export const AdminPerformance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Default to first and last day of current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  const [fromDate, setFromDate] = useState(firstDay.toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(today.toISOString().split("T")[0]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    generateMockData();
  }, [fromDate, toDate]);

  const generateMockData = () => {
    // Generate mock performance data
    const drivers = ["Driver A", "Driver B", "Driver C", "Driver D", "Driver E"];
    const mock = drivers.map(driver => ({
      name: driver,
      onTime: Math.floor(Math.random() * 50) + 20,
      late: Math.floor(Math.random() * 10),
      failed: Math.floor(Math.random() * 2)
    }));
    setChartData(mock);
  };

  const handleGenerate = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select a date range");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      toast.error("Start date cannot be after end date");
      return;
    }

    try {
      setLoading(true);
      const blob = await reportService.generateDeliveryPerformanceReport(fromDate, toDate);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `DeliveryPerformance_${fromDate.replace(/-/g, "")}_${toDate.replace(/-/g, "")}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Failed to generate report:", error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
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
              Delivery Performance Report
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Analyze dispatchers, success rates, and delivery times
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
              <div className="flex gap-4 w-full md:w-auto">
                <div className="space-y-2 flex-1 md:flex-none">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2 flex-1 md:flex-none">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {loading ? "Generating..." : "Download Excel"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Dispatcher Performance</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="onTime" name="On Time" fill="#10b981" />
                  <Bar dataKey="late" name="Late" fill="#f59e0b" />
                  <Bar dataKey="failed" name="Failed" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
