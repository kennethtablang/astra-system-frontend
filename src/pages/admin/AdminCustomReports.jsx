// src/pages/admin/AdminCustomReports.jsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { LoadingSpinner } from "../../components/ui/Loading";
import { ArrowLeft, Download, Calendar, Users, Warehouse } from "lucide-react";
import reportService from "../../services/reportService";
import userService from "../../services/userService";
import { warehouseService } from "../../services/warehouseService";
import { toast } from "react-hot-toast";

export const AdminCustomReports = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportType = searchParams.get("type") || "agent"; // 'agent' or 'stock'

  const [loading, setLoading] = useState(false);
  const [fetchingOptions, setFetchingOptions] = useState(false);

  // Options
  const [agents, setAgents] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  // Form State
  const [selectedId, setSelectedId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    // Reset selection when type changes
    setSelectedId("");

    // Set default dates
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setFromDate(firstDay.toISOString().split("T")[0]);
    setToDate(today.toISOString().split("T")[0]);

    // Fetch options
    fetchOptions();
  }, [reportType]);

  const fetchOptions = async () => {
    try {
      setFetchingOptions(true);
      if (reportType === "agent") {
        // Fetch agents (mocking role "Agent" if backend supports it, or fetching all users)
        // Adjust based on your API capability. Assuming basic fetch for now.
        const result = await userService.getUsers(); // Or getUsersByRole('Agent')
        if (result.success) {
          // Filter for agents if possible, or assume result is list
          const items = result.data.items || result.data || [];
          setAgents(items.map(u => ({ value: u.id, label: u.fullName || u.userName })));
        }
      } else {
        // Fetch warehouses
        const result = await warehouseService.getWarehouses();
        if (result.success) {
          const items = result.data || [];
          setWarehouses(items.map(w => ({ value: w.id, label: w.name })));
        }
      }
    } catch (error) {
      console.error("Failed to fetch options:", error);
      toast.error("Failed to load options");
    } finally {
      setFetchingOptions(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedId || !fromDate || !toDate) {
      toast.error("Please fill in all fields");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      toast.error("Start date cannot be after end date");
      return;
    }

    try {
      setLoading(true);
      let blob;
      let filename;

      if (reportType === "agent") {
        blob = await reportService.generateAgentActivityReport(selectedId, fromDate, toDate);
        filename = `AgentActivity_${selectedId}_${fromDate.replace(/-/g, "")}_${toDate.replace(/-/g, "")}.xlsx`;
      } else {
        blob = await reportService.generateStockMovementReport(selectedId, fromDate, toDate);
        filename = `StockMovement_${selectedId}_${fromDate.replace(/-/g, "")}_${toDate.replace(/-/g, "")}.xlsx`;
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Failed to generate report:", error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const isAgent = reportType === "agent";
  const title = isAgent ? "Agent Activity Report" : "Stock Movement Report";
  const description = isAgent
    ? "Review orders, store visits, and performance for a specific agent"
    : "Track inventory changes, inbound, and outbound stock for a warehouse";
  const Icon = isAgent ? Users : Warehouse;
  const color = isAgent ? "purple" : "orange";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className={`p-4 bg-${color}-50 dark:bg-${color}-900/20 rounded-full`}>
                <Icon className={`h-12 w-12 text-${color}-600 dark:text-${color}-400`} />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Report Parameters
                </h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  Select the {isAgent ? "agent" : "warehouse"} and time period to analyze.
                </p>
              </div>

              <div className="w-full max-w-sm space-y-4">

                {/* Selector */}
                <div className="space-y-2 text-left">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isAgent ? "Select Agent" : "Select Warehouse"}
                  </label>
                  {fetchingOptions ? (
                    <div className="h-10 w-full bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    <Select
                      value={selectedId}
                      onChange={(e) => setSelectedId(e.target.value)}
                      options={[{ value: "", label: "Select..." }, ...(isAgent ? agents : warehouses)]}
                      className="w-full"
                    />
                  )}
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-left">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Start Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      End Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={loading || !selectedId}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {loading ? "Generating..." : "Download Report"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout >
  );
};
