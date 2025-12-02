// src/pages/admin/AdminOrdersHistory.jsx
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { FileText } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";

const AdminOrdersHistory = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
          <p className="text-gray-600 mt-1">View past orders</p>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                Order History
              </h3>
              <p className="text-gray-500 mt-2">Coming soon...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminOrdersHistory;
