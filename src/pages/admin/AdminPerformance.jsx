// src/pages/admin/AdminPerformance.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/Loading";
import { ArrowLeft, Download, Calendar, TrendingUp } from "lucide-react";
import reportService from "../../services/reportService";
import { toast } from "react-hot-toast";

export const AdminPerformance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Default to first and last day of current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  const [fromDate, setFromDate] = useState(firstDay.toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(today.toISOString().split("T")[0]);

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

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-full">
                  <TrendingUp className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Select Date Range
                  </h3>
                  <p className="text-sm text-gray-500 max-w-sm">
                    Choose the period for analysis. The report calculates metrics based on deliveries completed within this range.
                  </p>
                </div>

                <div className="w-full max-w-sm space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 text-left">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Start Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="date"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        End Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="date"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {loading ? "Generating..." : "Download Report"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
