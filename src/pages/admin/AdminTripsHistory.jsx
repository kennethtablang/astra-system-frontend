import { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Calendar,
  User,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Loader2,
  Download,
  Eye,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";

// UI Components
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 transition-colors ${className}`}
  >
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    success:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  className = "",
}) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline:
      "border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium rounded-lg focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

const Select = ({
  value,
  onChange,
  options,
  className = "",
  disabled = false,
}) => (
  <select
    value={value}
    onChange={onChange}
    disabled={disabled}
    className={`block px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${className}`}
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

const LoadingSpinner = ({ size = "md" }) => {
  const sizes = { md: "h-8 w-8", lg: "h-12 w-12" };
  return <Loader2 className={`animate-spin text-blue-600 ${sizes[size]}`} />;
};

// Mock API
const mockApi = {
  getTripHistory: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      data: {
        items: [
          {
            id: 15,
            warehouseName: "Main Warehouse",
            dispatcherName: "Juan Dela Cruz",
            vehicle: "ABC-1234",
            status: "Completed",
            departureAt: new Date("2024-12-03T08:00:00"),
            completedAt: new Date("2024-12-03T16:30:00"),
            totalStops: 12,
            deliveredStops: 12,
            failedStops: 0,
            totalValue: 45000,
            duration: "8h 30m",
          },
          {
            id: 14,
            warehouseName: "North Warehouse",
            dispatcherName: "Maria Santos",
            vehicle: "XYZ-5678",
            status: "Completed",
            departureAt: new Date("2024-12-03T10:00:00"),
            completedAt: new Date("2024-12-03T17:00:00"),
            totalStops: 8,
            deliveredStops: 8,
            failedStops: 0,
            totalValue: 32000,
            duration: "7h 0m",
          },
          {
            id: 13,
            warehouseName: "South Warehouse",
            dispatcherName: "Pedro Reyes",
            vehicle: "DEF-9012",
            status: "Completed",
            departureAt: new Date("2024-12-02T09:00:00"),
            completedAt: new Date("2024-12-02T15:30:00"),
            totalStops: 15,
            deliveredStops: 14,
            failedStops: 1,
            totalValue: 58000,
            duration: "6h 30m",
          },
          {
            id: 12,
            warehouseName: "East Warehouse",
            dispatcherName: "Ana Lopez",
            vehicle: "GHI-3456",
            status: "Completed",
            departureAt: new Date("2024-12-02T07:30:00"),
            completedAt: new Date("2024-12-02T14:00:00"),
            totalStops: 10,
            deliveredStops: 10,
            failedStops: 0,
            totalValue: 38000,
            duration: "6h 30m",
          },
          {
            id: 11,
            warehouseName: "West Warehouse",
            dispatcherName: "Carlos Ramos",
            vehicle: "JKL-7890",
            status: "Cancelled",
            departureAt: new Date("2024-12-01T14:00:00"),
            completedAt: new Date("2024-12-01T14:15:00"),
            totalStops: 6,
            deliveredStops: 0,
            failedStops: 0,
            totalValue: 22000,
            duration: "0h 15m",
          },
          {
            id: 10,
            warehouseName: "Main Warehouse",
            dispatcherName: "Juan Dela Cruz",
            vehicle: "ABC-1234",
            status: "Completed",
            departureAt: new Date("2024-12-01T08:00:00"),
            completedAt: new Date("2024-12-01T16:00:00"),
            totalStops: 11,
            deliveredStops: 10,
            failedStops: 1,
            totalValue: 42000,
            duration: "8h 0m",
          },
          {
            id: 9,
            warehouseName: "North Warehouse",
            dispatcherName: "Maria Santos",
            vehicle: "XYZ-5678",
            status: "Completed",
            departureAt: new Date("2024-11-30T10:00:00"),
            completedAt: new Date("2024-11-30T16:30:00"),
            totalStops: 9,
            deliveredStops: 9,
            failedStops: 0,
            totalValue: 35000,
            duration: "6h 30m",
          },
          {
            id: 8,
            warehouseName: "South Warehouse",
            dispatcherName: "Pedro Reyes",
            vehicle: "DEF-9012",
            status: "Completed",
            departureAt: new Date("2024-11-30T09:00:00"),
            completedAt: new Date("2024-11-30T15:00:00"),
            totalStops: 13,
            deliveredStops: 13,
            failedStops: 0,
            totalValue: 52000,
            duration: "6h 0m",
          },
        ],
        totalCount: 8,
      },
    };
  },
};

const AdminTripsHistory = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDateRange, setFilterDateRange] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchTripHistory();
  }, []);

  const fetchTripHistory = async () => {
    try {
      setLoading(true);
      const { data } = await mockApi.getTripHistory();
      if (data) {
        setTrips(data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch trip history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Completed: { variant: "success", label: "Completed" },
      Cancelled: { variant: "danger", label: "Cancelled" },
    };
    const config = statusMap[status] || statusMap.Completed;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSuccessRate = (delivered, total) => {
    return total > 0 ? Math.round((delivered / total) * 100) : 0;
  };

  // Filter trips
  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      searchTerm === "" ||
      trip.dispatcherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.vehicle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.id.toString().includes(searchTerm);

    const matchesStatus =
      filterStatus === "All" || trip.status === filterStatus;

    let matchesDateRange = true;
    if (filterDateRange !== "All") {
      const tripDate = new Date(trip.departureAt);
      const now = new Date();
      if (filterDateRange === "Today") {
        matchesDateRange = tripDate.toDateString() === now.toDateString();
      } else if (filterDateRange === "Week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDateRange = tripDate >= weekAgo;
      } else if (filterDateRange === "Month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDateRange = tripDate >= monthAgo;
      }
    }

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Pagination
  const totalTrips = filteredTrips.length;
  const totalPages = Math.ceil(totalTrips / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(currentPage * pageSize, totalTrips);
  const paginatedTrips = filteredTrips.slice(startIndex, endIndex);

  // Calculate stats
  const stats = {
    totalTrips: trips.filter((t) => t.status === "Completed").length,
    totalStops: trips.reduce((sum, t) => sum + t.deliveredStops, 0),
    totalValue: trips.reduce(
      (sum, t) => (t.status === "Completed" ? sum + t.totalValue : sum),
      0
    ),
    avgSuccessRate:
      trips.length > 0
        ? Math.round(
            trips.reduce(
              (sum, t) => sum + getSuccessRate(t.deliveredStops, t.totalStops),
              0
            ) / trips.length
          )
        : 0,
  };

  const statusOptions = [
    { value: "All", label: "All Status" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  const dateRangeOptions = [
    { value: "All", label: "All Time" },
    { value: "Today", label: "Today" },
    { value: "Week", label: "Last 7 Days" },
    { value: "Month", label: "Last 30 Days" },
  ];

  const pageSizeOptions = [
    { value: "10", label: "10" },
    { value: "25", label: "25" },
    { value: "50", label: "50" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Trip History
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View completed and cancelled trips
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Completed Trips
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalTrips}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Deliveries
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalStops}
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Value
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(stats.totalValue)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Avg Success Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.avgSuccessRate}%
                  </p>
                </div>
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by trip ID, dispatcher, or vehicle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2">
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  options={statusOptions}
                  className="w-36"
                />
                <Select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  options={dateRangeOptions}
                  className="w-40"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trips History Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : paginatedTrips.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No trip history found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Trip Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Dispatcher
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Date & Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Deliveries
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {paginatedTrips.map((trip) => {
                        const successRate = getSuccessRate(
                          trip.deliveredStops,
                          trip.totalStops
                        );
                        return (
                          <tr
                            key={trip.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                  <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    Trip #{trip.id}
                                  </p>
                                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {trip.warehouseName}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {trip.vehicle}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {trip.dispatcherName}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">
                                <div className="flex items-center gap-1 text-gray-900 dark:text-white">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  {formatDate(trip.departureAt)}
                                </div>
                                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mt-1">
                                  <Clock className="h-3 w-3" />
                                  {trip.duration}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">
                                <div className="flex items-center gap-2">
                                  {trip.deliveredStops === trip.totalStops ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  )}
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {trip.deliveredStops}/{trip.totalStops}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {successRate}% success rate
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {formatCurrency(trip.totalValue)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(trip.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                  title="View details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                  title="Download report"
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Select
                        value={pageSize.toString()}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        options={pageSizeOptions}
                        className="w-20"
                      />
                      <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {startIndex + 1}-{endIndex} of {totalTrips}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = idx + 1;
                          } else if (currentPage <= 3) {
                            pageNum = idx + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + idx;
                          } else {
                            pageNum = currentPage - 2 + idx;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === pageNum
                                  ? "bg-blue-600 text-white"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminTripsHistory;
