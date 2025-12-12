// src/pages/admin/AdminSettings.jsx
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import {
  Settings,
  User,
  Shield,
  Bell,
  ChevronRight,
  Monitor
} from "lucide-react";

export const AdminSettings = () => {
  const navigate = useNavigate();

  const settingSections = [
    {
      title: "General Settings",
      description: "App preferences and display settings",
      icon: Monitor,
      path: "/admin/settings/general",
      color: "blue"
    },
    {
      title: "Profile Information",
      description: "Update your personal details",
      icon: User,
      path: "/admin/profile",
      color: "green"
    },
    {
      title: "Security",
      description: "Password and authentication settings",
      icon: Shield,
      path: "/admin/settings/security",
      color: "red"
    },
    {
      title: "Notifications",
      description: "Manage alerts and email preferences",
      icon: Bell,
      path: "/admin/settings/notifications",
      color: "yellow"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your application preferences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingSections.map((section) => (
            <Card
              key={section.title}
              className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => navigate(section.path)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-${section.color}-50 dark:bg-${section.color}-900/20 group-hover:bg-${section.color}-100 dark:group-hover:bg-${section.color}-900/30 transition-colors`}>
                    <section.icon className={`h-6 w-6 text-${section.color}-600 dark:text-${section.color}-400`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {section.description}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};
