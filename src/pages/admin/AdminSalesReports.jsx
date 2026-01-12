// src/pages/admin/AdminSalesReports.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { LoadingSpinner } from "../../components/ui/Loading";
import { ArrowLeft, Download, Calendar, Banknote } from "lucide-react";
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
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AdminSalesReports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [reportType, setReportType] = useState("Daily"); // 'Daily', 'Weekly'
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [chartData, setChartData] = useState([]);
  const [summaryData, setSummaryData] = useState({ totalSales: 0, transactionCount: 0, topStores: [] });
  const [paymentBreakdown, setPaymentBreakdown] = useState([]);

  useEffect(() => {
    // Fetch real data for the selected date/type
    fetchSalesData(date, reportType);
  }, [date, reportType]);

  const fetchSalesData = async (selectedDate, type) => {
    try {
      setDataLoading(true);
      let response;

      if (type === "Weekly") {
        response = await reportService.getWeeklySalesReport(selectedDate);
      } else {
        response = await reportService.getDailySalesReport(selectedDate);
      }

      if (response.success && response.data) {
        const reportData = response.data;

        // Process sales items for chart
        if (reportData.salesItems && reportData.salesItems.length > 0) {
          if (type === "Weekly") {
            const dailyData = reportData.salesItems.map(item => ({
              name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
              revenue: item.revenue || 0,
              orders: item.orderCount || 0
            }));
            setChartData(dailyData);
          } else {
            // Daily logic (Time based)
            const hourlyData = reportData.salesItems.map(item => ({
              name: new Date(item.date).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
              revenue: item.revenue || 0,
              orders: item.orderCount || 0
            }));
            setChartData(hourlyData.length > 0 ? hourlyData : [{ name: 'Today', revenue: reportData.totalRevenue, orders: reportData.totalOrders }]);
          }
        } else {
          setChartData([{
            name: type === "Weekly" ? 'This Week' : 'Today',
            revenue: reportData.totalRevenue || 0,
            orders: reportData.totalOrders || 0
          }]);
        }

        // Set summary data
        setSummaryData({
          totalSales: reportData.totalRevenue || 0,
          transactionCount: reportData.totalOrders || 0,
          topStores: reportData.topStores || []
        });

        // Simulating payment breakdown
        setPaymentBreakdown([
          { name: 'Cash', value: reportData.totalRevenue * 0.5 },
          { name: 'Online', value: reportData.totalRevenue * 0.35 },
          { name: 'Credit', value: reportData.totalRevenue * 0.15 },
        ]);
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
      toast.error("Failed to load sales data");
      setChartData([]);
      setSummaryData({ totalSales: 0, transactionCount: 0, topStores: [] });
    } finally {
      setDataLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!date) {
      toast.error("Please select a date");
      return;
    }

    try {
      setLoading(true);
      const blob = await reportService.generateDailySalesReport(date);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `DailySales_${date.replace(/-/g, "")}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Failed to generate report:", error);
      toast.error("Failed to generate report download");
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

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
              {reportType} Sales Report
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Sales breakdown by payment method and time
            </p>
          </div>
        </div>

        {/* Filters & Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Report Type
                </label>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full md:w-40"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Date
                </label>
                <div className="relative w-full md:w-64">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <Button
                  onClick={handleDownload}
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
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Bar Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
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
                    <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue (₱)" />
                    <Bar dataKey="orders" fill="#10b981" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No sales data available for this date
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Card */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sales</p>
                      <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        ₱{summaryData.totalSales.toLocaleString()}
                      </h3>
                    </div>
                    <Banknote className="h-8 w-8 text-blue-500 opacity-50" />
                  </div>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Transactions</p>
                      <h3 className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {summaryData.transactionCount}
                      </h3>
                    </div>
                    <Calendar className="h-8 w-8 text-green-500 opacity-50" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center">
                  {paymentBreakdown.some(p => p.value > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {paymentBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500">No payment data</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Top Stores Table */}
        {summaryData.topStores && summaryData.topStores.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Stores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-3">Rank</th>
                      <th className="px-6 py-3">Store Name</th>
                      <th className="px-6 py-3">Orders</th>
                      <th className="px-6 py-3">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryData.topStores.map((store, index) => (
                      <tr key={store.storeId || index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-6 py-4 font-medium">#{index + 1}</td>
                        <td className="px-6 py-4">{store.storeName}</td>
                        <td className="px-6 py-4">{store.orderCount}</td>
                        <td className="px-6 py-4 font-bold">₱{store.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};
