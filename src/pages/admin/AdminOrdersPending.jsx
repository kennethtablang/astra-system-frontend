// src/pages/admin/AdminOrdersPending.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Search,
  Eye,
  CheckCircle,
  Edit,
  XCircle,
  AlertCircle,
  Package,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { ViewOrderDetailsModal } from "../../components/modals/AdminOrder/ViewOrderDetailsModal";
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
import { toast } from "react-hot-toast";

const AdminOrdersPending = () => {
  const navigate = useNavigate();

  // State Management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Fetch Pending Orders
  useEffect(() => {
    fetchPendingOrders();
  }, [currentPage, pageSize, searchTerm]);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const params = {
        pageNumber: currentPage,
        pageSize: pageSize,
        status: "Pending",
      };

      if (searchTerm) params.searchTerm = searchTerm;

      const result = await orderService.getOrders(params);

      if (result.success) {
        setOrders(result.data.items || []);
        setTotalOrders(result.data.totalCount || 0);
      }
    } catch (error) {
      toast.error("Failed to fetch pending orders");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const handleViewOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setIsViewModalOpen(true);
  };

  const handleEditOrder = (order) => {
    // Navigate to edit page with order data
    navigate(`/admin/orders/edit/${order.id}`, { state: { order } });
  };

  // Calculate time since order
  const getTimeSinceOrder = (createdAt) => {
    const now = new Date();
    const orderDate = new Date(createdAt);
    const diffMs = now - orderDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return "Just now";
  };

  // Get urgency indicator
  const getUrgencyColor = (createdAt, priority) => {
    const now = new Date();
    const orderDate = new Date(createdAt);
    const diffHours = Math.floor((now - orderDate) / 3600000);

    if (priority) return "text-red-600 dark:text-red-400";
    if (diffHours > 24) return "text-red-600 dark:text-red-400";
    if (diffHours > 12) return "text-yellow-600 dark:text-yellow-400";
    return "text-blue-600 dark:text-blue-400";
  };

  // Pagination
  const totalPages = Math.ceil(totalOrders / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalOrders);

  const pageSizeOptions = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Pending Orders
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Orders awaiting confirmation
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pending Orders
              </p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                {totalOrders}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
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
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No pending orders
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {searchTerm
                    ? "No orders match your search"
                    : "All orders have been processed"}
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
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock
                                className={`h-4 w-4 ${getUrgencyColor(
                                  order.createdAt,
                                  order.priority
                                )}`}
                              />
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
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {order.itemCount} items
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(order.total)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`text-sm font-medium ${getUrgencyColor(
                                order.createdAt,
                                order.priority
                              )}`}
                            >
                              {getTimeSinceOrder(order.createdAt)}
                            </span>
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            {order.scheduledFor ? (
                              <div className="text-sm">
                                <p className="text-gray-900 dark:text-white">
                                  {new Date(
                                    order.scheduledFor
                                  ).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                  {new Date(
                                    order.scheduledFor
                                  ).toLocaleTimeString()}
                                </p>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500 dark:text-gray-500">
                                ASAP
                              </span>
                            )}
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

        {/* Info Banner */}
        {orders.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Note:</strong> Pending orders require confirmation
                  before they can be packed and dispatched. Click on an order to
                  view details and confirm.
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <ViewOrderDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedOrderId(null);
        }}
        orderId={selectedOrderId}
        onEdit={handleEditOrder}
      />
    </DashboardLayout>
  );
};

export default AdminOrdersPending;
