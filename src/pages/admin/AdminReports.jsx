// src/pages/admin/AdminReports.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { LoadingSpinner } from "../../components/ui/Loading";
import {
  BarChart3,
  TrendingUp,
  Package,
  Truck,
  Users,
  Banknote,
  FileBarChart,
  ArrowRight,
  Calendar,
  Warehouse,
  AlertCircle
} from "lucide-react";
import reportService from "../../services/reportService";
import { toast } from "react-hot-toast";

export const AdminReports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const result = await reportService.getDashboardStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount || 0);
  };

  const formatPercent = (value) => {
    return `${((value || 0) * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const reports = [
    {
      title: "Daily Sales Report",
      description: "Generate and download daily sales breakdown by payment method.",
      icon: Banknote,
      color: "blue",
      path: "/admin/reports/sales",
    },
    {
      title: "Delivery Performance",
      description: "Analyze success rates, return rates, and dispatcher performance.",
      icon: Truck,
      color: "green",
      path: "/admin/reports/performance",
    },
    {
      title: "Agent Activity",
      description: "Review agent order volume and store vistis.",
      icon: Users,
      color: "purple",
      path: "/admin/reports/custom?type=agent",
    },
    {
      title: "Stock Movement",
      description: "Track inventory changes and warehouse transfers.",
      icon: Warehouse,
      color: "orange",
      path: "/admin/reports/custom?type=stock",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            System performance overview and downloadable reports
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Revenue
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {formatCurrency(stats?.totalRevenue)}
                  </h3>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Banknote className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    On-Time Delivery
                  </p>
                  <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {formatPercent(stats?.onTimeDeliveryRate)}
                  </h3>
                </div>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Active Trips
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats?.activeTrips || 0}
                  </h3>
                </div>
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Truck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Detailed Stats
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {stats?.totalOrders} Orders
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stats?.deliveredToday} Delivered Today
                  </p>
                </div>
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Generation Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Available Reports
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map((report) => (
              <Card
                key={report.title}
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => navigate(report.path)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-${report.color}-50 dark:bg-${report.color}-900/20 group-hover:bg-${report.color}-100 dark:group-hover:bg-${report.color}-900/30 transition-colors`}>
                      <report.icon className={`h-6 w-6 text-${report.color}-600 dark:text-${report.color}-400`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {report.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {report.description}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 dark:text-blue-300">
            For advanced custom reporting including raw data exports, please contact system administration. All generated reports are in Excel format (.xlsx) for compatibility.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};
