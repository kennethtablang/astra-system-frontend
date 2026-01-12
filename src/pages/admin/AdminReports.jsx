// src/pages/admin/AdminReports.jsx
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import {
  AlertCircle,
} from "lucide-react";
import SalesReportCard from "../../components/reports/SalesReportCard";
import DeliveryPerformanceCard from "../../components/reports/DeliveryPerformanceCard";
import FastMovingProductsCard from "../../components/reports/FastMovingProductsCard";

export const AdminReports = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive system performance and analytics reports
          </p>
        </div>

        {/* Sales Reports */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Sales Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SalesReportCard period="daily" />
            <SalesReportCard period="weekly" />
            <SalesReportCard period="monthly" />
            <SalesReportCard period="quarterly" />
          </div>
        </div>

        {/* Delivery Performance */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Delivery Metrics
          </h2>
          <DeliveryPerformanceCard />
        </div>

        {/* Fast Moving Products */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Product Analytics
          </h2>
          <FastMovingProductsCard />
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 dark:text-blue-300">
            All reports are generated in real-time based on your selected date ranges. For Excel exports of historical data, use the individual export buttons in each report section.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};
