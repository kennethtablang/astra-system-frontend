// src/pages/admin/AdminPayments.jsx
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { DollarSign } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";

export const AdminPayments = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">Manage payment transactions</p>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Payments</h3>
              <p className="text-gray-500 mt-2">Coming soon...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
