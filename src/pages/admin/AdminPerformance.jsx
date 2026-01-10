// src/pages/admin/AdminPerformance.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/Loading";
import { ArrowLeft, Download } from "lucide-react";
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

export const AdminPerformance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Default to first day of current month and today
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  const [fromDate, setFromDate] = useState(firstDay.toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(today.toISOString().split("T")[0]);
  const [chartData, setChartData] = useState([]);
  const [performanceStats, setPerformanceStats] = useState(null);

  useEffect(() => {
    fetchPerformanceData();
  }, [fromDate, toDate]);

  const fetchPerformanceData = async () => {
    try {
      setDataLoading(true);
      const response = await reportService.getDeliveryPerformanceData(fromDate, toDate);

      if (response.success && response.data) {
        const reportData = response.data;
        setPerformanceStats(reportData);

        // Transform agent performance data for the chart
        if (reportData.agentPerformance && reportData.agentPerformance.length > 0) {
          const agentData = reportData.agentPerformance.map(agent => ({
            name: agent.agentName || agent.agentId,
            onTime: agent.onTimeDeliveries || 0,
            late: agent.lateDeliveries || 0,
            total: agent.totalDeliveries || 0,
            onTimeRate: agent.onTimePercentage || 0
          }));
          setChartData(agentData);
        } else {
          setChartData([]);
        }
      }
    } catch (error) {
      console.error("Error fetching performance data:", error);
      toast.error("Failed to load performance data");
      setChartData([]);
    } finally {
      setDataLoading(false);
    }
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

  if (dataLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

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

        {/* Performance Summary */}
        {performanceStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Deliveries</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {performanceStats.totalDeliveries || 0}
                  </h3>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">On-Time Rate</p>
                  <h3 className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                    {performanceStats.onTimePercentage?.toFixed(1) || 0}%
                  </h3>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Delivery Time</p>
                  <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                    {performanceStats.averageDeliveryTimeHours?.toFixed(1) || 0}h
                  </h3>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                  <h3 className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                    {performanceStats.inProgressDeliveries || 0}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              {chartData.length > 0 ? (
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
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No delivery performance data available for the selected period
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agent Details Table */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Agent Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th className="px-6 py-3">Agent</th>
                        <th className="px-6 py-3">Total Deliveries</th>
                        <th className="px-6 py-3">On Time</th>
                        <th className="px-6 py-3">Late</th>
                        <th className="px-6 py-3">On-Time Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.map((agent, index) => (
                        <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                          <td className="px-6 py-4 font-medium">{agent.name}</td>
                          <td className="px-6 py-4">{agent.total}</td>
                          <td className="px-6 py-4 text-green-600 font-semibold">{agent.onTime}</td>
                          <td className="px-6 py-4 text-orange-600 font-semibold">{agent.late}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${agent.onTimeRate >= 80 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                              {agent.onTimeRate.toFixed(1)}%
                            </span>
                          </td>
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
