import { useState, useEffect } from "react";
import {
  Truck,
  Plus,
  Edit,
  Trash2,
  Search,
  MapPin,
  Calendar,
  User,
  Package,
  DollarSign,
  FileText,
  Navigation,
  Loader2,
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
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
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
      "border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-500",
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
  getTrips: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      data: {
        items: [
          {
            id: 1,
            warehouseName: "Main Warehouse",
            dispatcherName: "Juan Dela Cruz",
            status: "InProgress",
            departureAt: new Date("2024-12-03T08:00:00"),
            orderCount: 12,
            totalValue: 45000,
            vehicle: "ABC-1234",
            createdAt: new Date("2024-12-02"),
          },
          {
            id: 2,
            warehouseName: "North Warehouse",
            dispatcherName: "Maria Santos",
            status: "Created",
            departureAt: new Date("2024-12-03T10:00:00"),
            orderCount: 8,
            totalValue: 32000,
            vehicle: "XYZ-5678",
            createdAt: new Date("2024-12-02"),
          },
          {
            id: 3,
            warehouseName: "South Warehouse",
            dispatcherName: "Pedro Reyes",
            status: "Completed",
            departureAt: new Date("2024-12-02T09:00:00"),
            orderCount: 15,
            totalValue: 58000,
            vehicle: "DEF-9012",
            createdAt: new Date("2024-12-01"),
          },
          {
            id: 4,
            warehouseName: "East Warehouse",
            dispatcherName: "Ana Lopez",
            status: "InProgress",
            departureAt: new Date("2024-12-03T07:30:00"),
            orderCount: 10,
            totalValue: 38000,
            vehicle: "GHI-3456",
            createdAt: new Date("2024-12-02"),
          },
          {
            id: 5,
            warehouseName: "West Warehouse",
            dispatcherName: "Carlos Ramos",
            status: "Created",
            departureAt: new Date("2024-12-03T14:00:00"),
            orderCount: 6,
            totalValue: 22000,
            vehicle: "JKL-7890",
            createdAt: new Date("2024-12-02"),
          },
        ],
        totalCount: 5,
      },
    };
  },
  getWarehouses: async () => {
    return {
      success: true,
      data: [
        { id: 1, name: "Main Warehouse" },
        { id: 2, name: "North Warehouse" },
        { id: 3, name: "South Warehouse" },
        { id: 4, name: "East Warehouse" },
        { id: 5, name: "West Warehouse" },
      ],
    };
  },
};

const AdminTrips = () => {
  const [trips, setTrips] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterWarehouse, setFilterWarehouse] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchTrips();
    fetchWarehouses();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const { data } = await mockApi.getTrips();
      if (data) {
        setTrips(data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const { data } = await mockApi.getWarehouses();
      if (data) {
        setWarehouses(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch warehouses:", error);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Created: { variant: "default", label: "Created" },
      InProgress: { variant: "info", label: "In Progress" },
      Completed: { variant: "success", label: "Completed" },
      Cancelled: { variant: "danger", label: "Cancelled" },
    };
    const config = statusMap[status] || statusMap.Created;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter trips
  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      searchTerm === "" ||
      trip.dispatcherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.vehicle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "All" || trip.status === filterStatus;
    const matchesWarehouse =
      filterWarehouse === "All" ||
      trip.warehouseName ===
        warehouses.find((w) => w.id.toString() === filterWarehouse)?.name;
    return matchesSearch && matchesStatus && matchesWarehouse;
  });

  // Pagination
  const totalTrips = filteredTrips.length;
  const totalPages = Math.ceil(totalTrips / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(currentPage * pageSize, totalTrips);
  const paginatedTrips = filteredTrips.slice(startIndex, endIndex);

  // Calculate stats
  const stats = {
    totalTrips: trips.length,
    inProgress: trips.filter((t) => t.status === "InProgress").length,
    completed: trips.filter((t) => t.status === "Completed").length,
    totalValue: trips.reduce((sum, t) => sum + t.totalValue, 0),
  };

  const statusOptions = [
    { value: "All", label: "All Status" },
    { value: "Created", label: "Created" },
    { value: "InProgress", label: "In Progress" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  const warehouseOptions = [
    { value: "All", label: "All Warehouses" },
    ...warehouses.map((w) => ({ value: w.id.toString(), label: w.name })),
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
              Trip Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage delivery trips and routes
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Trip
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Trips
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalTrips}
                  </p>
                </div>
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.inProgress}
                  </p>
                </div>
                <Navigation className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.completed}
                  </p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
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
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by dispatcher or vehicle..."
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
                  className="w-40"
                />
                <Select
                  value={filterWarehouse}
                  onChange={(e) => setFilterWarehouse(e.target.value)}
                  options={warehouseOptions}
                  className="w-48"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trips Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : paginatedTrips.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No trips found
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
                          Departure
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Orders
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Total Value
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
                      {paginatedTrips.map((trip) => (
                        <tr
                          key={trip.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                                <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  Trip #{trip.id}
                                </p>
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {trip.warehouseName}
                                </div>
                                {trip.vehicle && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Vehicle: {trip.vehicle}
                                  </div>
                                )}
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
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {formatDateTime(trip.departureAt)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {trip.orderCount}
                              </span>
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
                                title="View manifest"
                              >
                                <FileText className="h-4 w-4" />
                              </button>
                              <button
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="Track trip"
                              >
                                <Navigation className="h-4 w-4" />
                              </button>
                              <button
                                className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title="Edit trip"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              {trip.status === "Created" && (
                                <button
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                  title="Cancel trip"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
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

export default AdminTrips;
