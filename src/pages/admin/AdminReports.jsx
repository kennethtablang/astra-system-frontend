// src/pages/admin/AdminReports.jsx
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import {
  Truck,
  Users,
  Banknote,
  ArrowRight,
  Warehouse,
  AlertCircle,
  Package
} from "lucide-react";

export const AdminReports = () => {
  const navigate = useNavigate();

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
      title: "Fast Moving Products",
      description: "Top selling products and volume analysis.",
      icon: Package,
      color: "orange",
      path: "/admin/reports/products",
    },
    {
      title: "Stock Movement",
      description: "Track inventory changes and warehouse transfers.",
      icon: Warehouse,
      color: "red",
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
