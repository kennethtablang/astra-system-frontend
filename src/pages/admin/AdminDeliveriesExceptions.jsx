// src/pages/admin/AdminDeliveriesExceptions.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Search,
  Filter,
  ArrowLeft,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Camera,
  Calendar,
  User,
  Package,
  RefreshCw,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { LoadingSpinner } from "../../components/ui/Loading";
import deliveryService from "../../services/deliveryService";
import { toast } from "react-hot-toast";

const AdminDeliveriesExceptions = () => {
  const navigate = useNavigate();

  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    resolved: 0,
    storeClosed: 0,
    customerRefused: 0,
    other: 0,
  });

  useEffect(() => {
    fetchExceptions();
  }, []);

  const fetchExceptions = async () => {
    try {
      setLoading(true);
      const result = await deliveryService.getDeliveryExceptions();

      if (result.success) {
        const exceptionsData = result.data || [];
        setExceptions(exceptionsData);
        calculateStats(exceptionsData);
      } else {
        toast.error("Failed to load exceptions");
      }
    } catch (error) {
      console.error("Error fetching exceptions:", error);
      toast.error("Failed to load exceptions");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (exceptionsData) => {
    const stats = {
      total: exceptionsData.length,
      open: exceptionsData.filter((e) => !e.resolvedAt).length,
      resolved: exceptionsData.filter((e) => e.resolvedAt).length,
      storeClosed: exceptionsData.filter(
        (e) => e.exceptionType === "StoreClosed"
      ).length,
      customerRefused: exceptionsData.filter(
        (e) => e.exceptionType === "CustomerRefused"
      ).length,
      other: exceptionsData.filter(
        (e) =>
          e.exceptionType !== "StoreClosed" &&
          e.exceptionType !== "CustomerRefused"
      ).length,
    };
    setStats(stats);
  };

  const getExceptionTypeBadge = (type) => {
    const typeMap = {
      StoreClosed: { variant: "warning", label: "Store Closed", icon: XCircle },
      CustomerRefused: {
        variant: "danger",
        label: "Customer Refused",
        icon: XCircle,
      },
      IncorrectAddress: {
        variant: "info",
        label: "Incorrect Address",
        icon: MapPin,
      },
      DamagedGoods: {
        variant: "danger",
        label: "Damaged Goods",
        icon: Package,
      },
      PartialDelivery: {
        variant: "warning",
        label: "Partial Delivery",
        icon: Package,
      },
      DelayedDelivery: {
        variant: "info",
        label: "Delayed Delivery",
        icon: Clock,
      },
      Other: { variant: "default", label: "Other", icon: AlertCircle },
    };
    const config = typeMap[type] || typeMap.Other;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (exception) => {
    if (exception.resolvedAt) {
      return (
        <Badge variant="success">
          <CheckCircle className="h-3 w-3 mr-1" />
          Resolved
        </Badge>
      );
    }
    return (
      <Badge variant="warning">
        <Clock className="h-3 w-3 mr-1" />
        Open
      </Badge>
    );
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  };

  const getTimeAgo = (date) => {
    if (!date) return "";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Filter exceptions
  const filteredExceptions = exceptions.filter((exception) => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        exception.orderId.toString().includes(search) ||
        exception.description?.toLowerCase().includes(search) ||
        exception.reportedByName?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    // Type filter
    if (filterType !== "All" && exception.exceptionType !== filterType) {
      return false;
    }

    // Status filter
    if (filterStatus === "Open" && exception.resolvedAt) {
      return false;
    }
    if (filterStatus === "Resolved" && !exception.resolvedAt) {
      return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredExceptions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredExceptions.length);
  const paginatedExceptions = filteredExceptions.slice(startIndex, endIndex);

  const exceptionTypeOptions = [
    { value: "All", label: "All Types" },
    { value: "StoreClosed", label: "Store Closed" },
    { value: "CustomerRefused", label: "Customer Refused" },
    { value: "IncorrectAddress", label: "Incorrect Address" },
    { value: "DamagedGoods", label: "Damaged Goods" },
    { value: "PartialDelivery", label: "Partial Delivery" },
    { value: "DelayedDelivery", label: "Delayed Delivery" },
    { value: "Other", label: "Other" },
  ];

  const statusOptions = [
    { value: "All", label: "All Status" },
    { value: "Open", label: "Open" },
    { value: "Resolved", label: "Resolved" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/deliveries")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Delivery Exceptions
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Monitor and resolve delivery issues
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchExceptions}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Exceptions
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Open Issues
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.open}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Resolved
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.resolved}
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
                    Resolution Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total > 0
                      ? Math.round((stats.resolved / stats.total) * 100)
                      : 0}
                    %
                  </p>
                </div>
                <Filter className="h-8 w-8 text-blue-600" />
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
                  placeholder="Search by order ID, description, or reporter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2">
                <Select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={exceptionTypeOptions}
                  className="w-48"
                />
                <Select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={statusOptions}
                  className="w-36"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exceptions List */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : paginatedExceptions.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No exceptions found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {searchTerm || filterType !== "All" || filterStatus !== "All"
                    ? "Try adjusting your search or filters"
                    : "No delivery exceptions to display"}
                </p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedExceptions.map((exception) => (
                    <div
                      key={exception.id}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          {/* Header */}
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  Order #{exception.orderId}
                                </span>
                                {getExceptionTypeBadge(exception.exceptionType)}
                                {getStatusBadge(exception)}
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Reported {getTimeAgo(exception.reportedAt)} by{" "}
                                {exception.reportedByName || "Unknown"}
                              </p>
                            </div>
                          </div>

                          {/* Description */}
                          <div className="pl-8">
                            <p className="text-gray-700 dark:text-gray-300">
                              {exception.description}
                            </p>
                          </div>

                          {/* Metadata */}
                          <div className="pl-8 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDateTime(exception.reportedAt)}
                            </div>
                            {exception.reportedByName && (
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {exception.reportedByName}
                              </div>
                            )}
                          </div>

                          {/* Resolution Info */}
                          {exception.resolvedAt && (
                            <div className="pl-8 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="font-medium text-green-900 dark:text-green-100">
                                  Resolved {getTimeAgo(exception.resolvedAt)}
                                </span>
                              </div>
                              {exception.resolution && (
                                <p className="text-sm text-green-800 dark:text-green-200 mt-2">
                                  {exception.resolution}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              navigate(`/admin/orders/${exception.orderId}`)
                            }
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="View order"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {!exception.resolvedAt && (
                            <button
                              onClick={() => {
                                // Open resolve modal
                                toast.info("Resolve modal coming soon");
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Resolve exception"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing {startIndex + 1} to {endIndex} of{" "}
                      {filteredExceptions.length} exceptions
                    </p>

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

export default AdminDeliveriesExceptions;
