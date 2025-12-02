// src/pages/admin/AdminCustomReports.jsx
import { FileSpreadsheet } from "lucide-react";

export const AdminCustomReports = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Custom Reports</h1>
          <p className="text-gray-600 mt-1">Create custom reports</p>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                Custom Reports
              </h3>
              <p className="text-gray-500 mt-2">Coming soon...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
