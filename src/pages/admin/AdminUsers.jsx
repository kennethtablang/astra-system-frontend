// src/pages/admin/AdminUsers.jsx
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Users } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";

const AdminUsers = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all system users
          </p>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Users Page
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Coming soon...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
