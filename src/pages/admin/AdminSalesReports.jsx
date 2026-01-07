// src/pages/admin/AdminSalesReports.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
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
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [chartData, setChartData] = useState([]);
  const [summaryData, setSummaryData] = useState({ totalSales: 0, transactionCount: 0 });

  useEffect(() => {
    // Generate mock data for the selected date on load/change
    generateMockData(date);
  }, [date]);

  const generateMockData = (selectedDate) => {
    // Mock data simulation - normally this would come from API
    // We will simulate hours of the day
    const hours = ["8AM", "10AM", "12PM", "2PM", "4PM", "6PM"];
    const mock = hours.map(hour => ({
      name: hour,
      cash: Math.floor(Math.random() * 5000) + 1000,
      online: Math.floor(Math.random() * 3000) + 500,
      credit: Math.floor(Math.random() * 2000) + 100
    }));

    setChartData(mock);

    const total = mock.reduce((acc, curr) => acc + curr.cash + curr.online + curr.credit, 0);
    const transactions = mock.reduce((acc) => acc + Math.floor(Math.random() * 10) + 1, 0);

    setSummaryData({ totalSales: total, transactionCount: transactions });
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
              Daily Sales Report
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
              <CardTitle>Sales Over Time</CardTitle>
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
                  <Bar dataKey="cash" stackId="a" fill="#3b82f6" name="Cash" />
                  <Bar dataKey="online" stackId="a" fill="#10b981" name="Online" />
                  <Bar dataKey="credit" stackId="a" fill="#f59e0b" name="Credit" />
                </BarChart>
              </ResponsiveContainer>
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
                <CardTitle>Reconciled Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Cash', value: summaryData.totalSales * 0.6 },
                          { name: 'Online', value: summaryData.totalSales * 0.3 },
                          { name: 'Credit', value: summaryData.totalSales * 0.1 },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-3">Time</th>
                    <th className="px-6 py-3">Cash</th>
                    <th className="px-6 py-3">Online</th>
                    <th className="px-6 py-3">Credit</th>
                    <th className="px-6 py-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row, index) => (
                    <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="px-6 py-4 font-medium">{row.name}</td>
                      <td className="px-6 py-4">₱{row.cash.toLocaleString()}</td>
                      <td className="px-6 py-4">₱{row.online.toLocaleString()}</td>
                      <td className="px-6 py-4">₱{row.credit.toLocaleString()}</td>
                      <td className="px-6 py-4 font-bold">₱{(row.cash + row.online + row.credit).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
