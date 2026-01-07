// src/pages/admin/AdminSettingsNotifications.jsx
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Bell } from "lucide-react";

export const AdminSettingsNotifications = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notification Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage alerts and email preferences
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="py-16">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-full">
                  <Bell className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Coming Soon
                </h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  Notification preferences will be available in a future update. You currently receive all critical system alerts by default.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
