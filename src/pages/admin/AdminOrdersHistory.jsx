// src/pages/admin/AdminOrdersHistory.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Search,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  Filter,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { LoadingSpinner } from "../../components/ui/Loading";
import orderService from "../../services/orderService";
import { ViewOrderDetailsModal } from "../../components/modals/AdminOrder/ViewOrderDetailsModal";
import { toast } from "react-hot-toast";

const AdminOrdersHistory = () => {
  const navigate = useNavigate();

  // State Management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Delivered");
  const [dateRange, setDateRange] = useState("30days");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalDelivered: 0,
    totalCancelled: 0,
    totalReturned: 0,
    totalRevenue: 0,
  });

  // Fetch Orders
  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [currentPage, pageSize, searchTerm, filterStatus, dateRange]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        pageNumber: currentPage,
        pageSize: pageSize,
      };

      if (searchTerm) params.searchTerm = searchTerm;

      // Filter by completed statuses
      if (filterStatus === "All") {
        // For history, show Delivered, Returned, and Cancelled
        params.status = null; // Will need to handle this differently
      } else {
        params.status = filterStatus;
      }

      // Add date range filter
      const dateRanges = {
        "7days": 7,
        "30days": 30,
        "90days": 90,
        "6months": 180,
        "1year": 365,
      };

      if (dateRange !== "all" && dateRanges[dateRange]) {
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - dateRanges[dateRange]);
        params.createdFrom = fromDate.toISOString();
      }

      const result = await orderService.getOrders(params);

      if (result.success) {
        // Filter to show only completed orders
        const completedOrders = result.data.items.filter((order) =>
          ["Delivered", "Returned", "Cancelled"].includes(order.status)
        );
        setOrders(completedOrders);
        setTotalOrders(result.data.totalCount || 0);
      }
    } catch (error) {
      toast.error("Failed to fetch order history");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Calculate date range for stats
      const dateRanges = {
        "7days": 7,
        "30days": 30,
        "90days": 90,
        "6months": 180,
        "1year": 365,
      };

      let fromDate = null;
      if (dateRange !== "all" && dateRanges[dateRange]) {
        fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - dateRanges[dateRange]);
      }

      const result = await orderService.getOrderSummary(fromDate, new Date());

      if (result.success) {
        setStats({
          totalDelivered: result.data.deliveredOrders || 0,
          totalCancelled: 0, // Not in summary, would need separate call
          totalReturned: 0, // Not in summary, would need separate call
          totalRevenue: result.data.totalValue || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      Delivered: <Badge variant="success">Delivered</Badge>,
      Returned: <Badge variant="warning">Returned</Badge>,
      Cancelled: <Badge variant="danger">Cancelled</Badge>,
    };
    return badges[status] || <Badge variant="default">{status}</Badge>;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  // Pagination
  const totalPages = Math.ceil(totalOrders / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalOrders);

  // Options
  const statusOptions = [
    { value: "Delivered", label: "Delivered Only" },
    { value: "Cancelled", label: "Cancelled Only" },
    { value: "Returned", label: "Returned Only" },
    { value: "All", label: "All History" },
  ];

  const dateRangeOptions = [
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "90days", label: "Last 90 Days" },
    { value: "6months", label: "Last 6 Months" },
    { value: "1year", label: "Last Year" },
    { value: "all", label: "All Time" },
  ];

  const pageSizeOptions = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
  ];

  const handleViewOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setIsViewModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Order History
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Completed, cancelled, and returned orders
            </p>
          </div>

        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Delivered
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalDelivered}
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
                    Cancelled
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalCancelled}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Returned
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalReturned}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Revenue
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
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
                  placeholder="Search by order ID, store, or customer..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={statusOptions}
                  className="w-40"
                />
                <Select
                  value={dateRange}
                  onChange={(e) => {
                    setDateRange(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={dateRangeOptions}
                  className="w-40"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No order history found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {searchTerm || filterStatus !== "All"
                    ? "Try adjusting your search or filters"
                    : "No completed orders in the selected time period"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Store</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                                #{order.id}
                              </span>
                              {order.priority && (
                                <Badge variant="danger">Priority</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {order.storeName}
                              </p>
                              {order.storeCity && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {order.storeBarangay &&
                                    `${order.storeBarangay}, `}
                                  {order.storeCity}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {order.agentName || "—"}
                            </span>
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {order.itemCount} items
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(order.total)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(order.createdAt).toLocaleDateString()}
                              <div className="text-xs text-gray-500 dark:text-gray-500">
                                {new Date(order.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewOrder(order.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
                        {startIndex}-{endIndex} of {totalOrders}
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
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
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
        <ViewOrderDetailsModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedOrderId(null);
          }}
          orderId={selectedOrderId}
          onSuccess={() => fetchOrders()}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminOrdersHistory;
