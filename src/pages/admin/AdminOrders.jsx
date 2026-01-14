// src/pages/admin/AdminOrders.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ViewOrderDetailsModal } from "../../components/modals/AdminOrder/ViewOrderDetailsModal";
import { EditOrderModal } from "../../components/modals/AdminOrder/EditOrderModal";
import { UpdateOrderStatusModal } from "../../components/modals/AdminOrder/UpdateOrderStatusModal";
import {
  ShoppingCart,
  Plus,
  Search,
  Eye,
  Download,
  RefreshCw,
  Edit,
  AlertCircle,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  Printer,
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
import receiptService from "../../services/receiptService";
import { toast } from "react-hot-toast";

const AdminOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDistributor = location.pathname.includes("/distributor");
  const createOrderPath = isDistributor ? "/distributor/orders/create" : "/admin/orders/create";

  // State Management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDate, setFilterDate] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [printing, setPrinting] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    packedOrders: 0,
    dispatchedOrders: 0,
    deliveredOrders: 0,
  });

  // Fetch Orders
  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [currentPage, pageSize, searchTerm, filterStatus, filterPriority, filterDate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        pageNumber: currentPage,
        pageSize: pageSize,
      };

      if (searchTerm) params.searchTerm = searchTerm;
      if (filterStatus !== "All") params.status = filterStatus;
      if (filterPriority !== "All")
        params.priority = filterPriority === "Priority";
      
      if (filterDate === "Today") {
          const today = new Date();
          const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
          const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
          params.createdFrom = startOfDay;
          params.createdTo = endOfDay;
      }

      const result = await orderService.getOrders(params);

      if (result.success) {
        setOrders(result.data.items || []);
        setTotalOrders(result.data.totalCount || 0);
      }
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setIsViewModalOpen(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setEditModalOpen(true);
  };

  const fetchStats = async () => {
    try {
      const result = await orderService.getOrderSummary();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  // Print Packing Receipt - For Confirmed, Packed, and Dispatched Orders
  const handlePrintPackingReceipt = async (orderId, orderStatus) => {
    // Only allow printing for Confirmed, Packed, and Dispatched orders
    const allowedStatuses = ["Confirmed", "Packed", "Dispatched"];
    if (!allowedStatuses.includes(orderStatus)) {
      toast.error(
        "Only confirmed, packed, or dispatched orders can print packing receipts"
      );
      return;
    }

    try {
      setPrinting(orderId);

      // Get receipt data from server
      const result = await receiptService.generateMobileThermalReceipt(orderId);

      if (result.success) {
        // Decode base64 receipt data
        const receiptText = atob(result.data.receiptData);

        // Create hidden iframe for printing
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        // Write receipt content to iframe
        const iframeDoc = iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(`
          <html>
            <head>
              <title>Packing Receipt - Order #${orderId}</title>
              <style>
                @page {
                  size: 58mm auto;
                  margin: 0;
                }
                body {
                  font-family: 'Courier New', monospace;
                  font-size: 12px;
                  max-width: 58mm;
                  margin: 0;
                  padding: 5px;
                  background: white;
                }
                pre {
                  margin: 0;
                  white-space: pre-wrap;
                  font-size: 11px;
                  line-height: 1.3;
                }
              </style>
            </head>
            <body>
              <pre>${receiptText}</pre>
            </body>
          </html>
        `);
        iframeDoc.close();

        // Wait for content to load then print
        iframe.onload = () => {
          try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            
            // Remove iframe after printing
            setTimeout(() => {
              document.body.removeChild(iframe);
            }, 1000);
            
            toast.success("Receipt sent to printer");
          } catch (printError) {
            console.error("Print error:", printError);
            toast.error("Failed to send to printer");
            document.body.removeChild(iframe);
          }
        };
      } else {
        toast.error(result.message || "Failed to generate packing receipt");
      }
    } catch (error) {
      console.error("Error printing packing receipt:", error);
      toast.error("Failed to print packing receipt");
    } finally {
      setPrinting(null);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      Pending: <Badge variant="warning">Pending</Badge>,
      Confirmed: <Badge variant="info">Confirmed</Badge>,
      Packed: <Badge variant="purple">Packed</Badge>,
      Dispatched: <Badge variant="default">Dispatched</Badge>,
      InTransit: <Badge variant="default">In Transit</Badge>,
      AtStore: <Badge variant="default">At Store</Badge>,
      Delivered: <Badge variant="success">Delivered</Badge>,
      Returned: <Badge variant="warning">Returned</Badge>,
      Cancelled: <Badge variant="danger">Cancelled</Badge>,
    };
    return badges[status] || <Badge variant="default">{status}</Badge>;
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      Pending: <Clock className="h-4 w-4 text-yellow-600" />,
      Confirmed: <CheckCircle className="h-4 w-4 text-blue-600" />,
      Packed: <Package className="h-4 w-4 text-purple-600" />,
      Dispatched: <Truck className="h-4 w-4 text-gray-600" />,
      InTransit: <MapPin className="h-4 w-4 text-gray-600" />,
      AtStore: <MapPin className="h-4 w-4 text-blue-600" />,
      Delivered: <CheckCircle className="h-4 w-4 text-green-600" />,
      Returned: <AlertCircle className="h-4 w-4 text-yellow-600" />,
      Cancelled: <XCircle className="h-4 w-4 text-red-600" />,
    };
    return icons[status] || <Package className="h-4 w-4 text-gray-400" />;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  // Format Date Time Safe
  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    const safeDate = dateString.endsWith("Z") ? dateString : `${dateString}Z`;
    return new Date(safeDate).toLocaleString("en-PH", {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  // Pagination
  const totalPages = Math.ceil(totalOrders / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalOrders);

  // Options
  const statusOptions = [
    { value: "All", label: "All Status" },
    { value: "Pending", label: "Pending" },
    { value: "Confirmed", label: "Confirmed" },
    { value: "Packed", label: "Packed" },
    { value: "Dispatched", label: "Dispatched" },
    { value: "InTransit", label: "In Transit" },
    { value: "Delivered", label: "Delivered" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  const dateFilterOptions = [
      { value: "All", label: "All Dates" },
      { value: "Today", label: "Today Only" }
  ];

  const priorityOptions = [
    { value: "All", label: "All Priority" },
    { value: "Priority", label: "Priority Only" },
    { value: "Regular", label: "Regular Only" },
  ];

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
              Order Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View and manage all orders with packing receipt printing
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate(createOrderPath)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Order
            </Button>

          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalOrders}
                  </p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pending
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.pendingOrders}
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
                    Confirmed
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.confirmedOrders}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Packed
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.packedOrders}
                  </p>
                </div>
                <Package className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Dispatched
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.dispatchedOrders}
                  </p>
                </div>
                <Truck className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Delivered
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.deliveredOrders}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
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
                  value={filterPriority}
                  onChange={(e) => {
                    setFilterPriority(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={priorityOptions}
                  className="w-40"
                />
                <Select
                  value={filterDate}
                  onChange={(e) => {
                    setFilterDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={dateFilterOptions}
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
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No orders found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {searchTerm || filterStatus !== "All"
                    ? "Try adjusting your search or filters"
                    : "Get started by creating your first order"}
                </p>
                <Button
                  onClick={() => navigate(createOrderPath)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Order
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Store</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow 
                            key={order.id} 
                            onClick={() => handleViewOrder(order.id)}
                            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(order.status)}
                                <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                                  #{order.id}
                                </span>
                              </div>
                              {order.priority && (
                                <Badge variant="danger">Priority</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {order.storeName}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-start gap-1">
                              <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {/* {order.storeAddressLine1 && (
                                  <div>{order.storeAddressLine1}</div>
                                )}
                                {order.storeAddressLine2 && (
                                  <div>{order.storeAddressLine2}</div>
                                )} */}
                                {order.storeBarangay && (
                                  <div>{order.storeBarangay}</div>
                                )}
                                {order.storeCity && (
                                  <div className="font-medium">
                                    {order.storeCity}
                                  </div>
                                )}
                                {!order.storeAddressLine1 && !order.storeAddressLine2 && !order.storeBarangay && !order.storeCity && (
                                  <span>—</span>
                                )}
                              </div>
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
                              {formatDateTime(order.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              {/* Print Packing Receipt Button - Only for Confirmed Orders */}
                              {(order.status === "Confirmed" ||
                                order.status === "Packed" ||
                                order.status === "Dispatched") && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePrintPackingReceipt(
                                        order.id,
                                        order.status
                                      );
                                    }}
                                    disabled={printing === order.id}
                                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Print packing receipt"
                                  >
                                    {printing === order.id ? (
                                      <LoadingSpinner size="sm" />
                                    ) : (
                                      <Printer className="h-4 w-4" />
                                    )}
                                  </button>
                                )}
                              <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewOrder(order.id);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditOrder(order);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Edit order"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(order);
                                  setStatusModalOpen(true);
                                }}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="Update status"
                              >
                                <RefreshCw className="h-4 w-4" />
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
      </div>
      <ViewOrderDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedOrderId(null);
        }}
        orderId={selectedOrderId}
        onSuccess={() => fetchOrders()}
      />
      <EditOrderModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        order={selectedOrder}
        onSuccess={() => fetchOrders()}
      />

      <UpdateOrderStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        order={selectedOrder}
        onSuccess={() => fetchOrders()}
      />
    </DashboardLayout>
  );
};

export default AdminOrders;
