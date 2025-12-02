// src/pages/admin/AdminSettingsNotifications.jsx
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Bell } from "lucide-react";

export const AdminSettingsNotifications = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notification Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure notifications
          </p>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Notifications
              </h3>
              <p className="text-gray-500 mt-2">Coming soon...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
