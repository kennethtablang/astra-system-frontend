// src/pages/admin/AdminStoreCity.jsx
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { DollarSign } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";

const AdminStoreCity = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cities and Municipalities List
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of cities and municipalities
          </p>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                City and Municipality Management
              </h3>
              <p className="text-gray-500 mt-2">Coming soon...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminStoreCity;
