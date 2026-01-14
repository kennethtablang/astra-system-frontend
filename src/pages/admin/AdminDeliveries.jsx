// src/pages/admin/AdminDeliveries.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Search,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Navigation,
  Camera,
  Eye,
  RefreshCw,
  Truck,
  XCircle,
  DollarSign,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { LoadingSpinner } from "../../components/ui/Loading";
import orderService from "../../services/orderService";
import deliveryService from "../../services/deliveryService";
import { RecordDeliveryPaymentModal } from "../../components/modals/AdminDelivery/RecordDeliveryPaymentModal";
import { toast } from "react-hot-toast";

const AdminDeliveries = () => {
  const navigate = useNavigate();

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterTrip] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    inTransit: 0,
    deliveredToday: 0,
    exceptions: 0,
  });

  // Payment modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);

  useEffect(() => {
    fetchDeliveries();
  }, [currentPage, pageSize, filterStatus, filterTrip]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const params = {
        pageNumber: currentPage,
        pageSize: pageSize,
        sortBy: "createdAt",
        sortDescending: true,
      };

      // Filter by status
      if (filterStatus !== "All") {
        params.status = filterStatus;
      } else {
        // Show only delivery-related statuses
        params.status = "Dispatched,InTransit,AtStore,Delivered,Returned";
      }

      const result = await orderService.getOrders(params);

      if (result.success) {
        const orders = result.data.items || [];
        setDeliveries(orders);
        setTotalDeliveries(result.data.totalCount || 0);
        calculateStats(orders);
      }
    } catch (error) {
      console.error("Failed to fetch deliveries:", error);
      toast.error("Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (deliveriesData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      totalDeliveries: deliveriesData.length,
      inTransit: deliveriesData.filter(
        (d) => d.status === "InTransit" || d.status === "AtStore"
      ).length,
      deliveredToday: deliveriesData.filter((d) => {
        if (d.status !== "Delivered") return false;
        const updatedDate = new Date(d.updatedAt);
        updatedDate.setHours(0, 0, 0, 0);
        return updatedDate.getTime() === today.getTime();
      }).length,
      exceptions: 0, // Would need to fetch from delivery exceptions
    };
    setStats(stats);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Pending: { variant: "default", icon: Clock, label: "Pending" },
      Dispatched: { variant: "info", icon: Truck, label: "Dispatched" },
      InTransit: { variant: "warning", icon: Navigation, label: "In Transit" },
      AtStore: { variant: "info", icon: MapPin, label: "At Store" },
      Delivered: { variant: "success", icon: CheckCircle, label: "Delivered" },
      Returned: { variant: "danger", icon: XCircle, label: "Returned" },
    };
    const config = statusMap[status] || statusMap.Pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewPhotos = async (orderId) => {
    try {
      const result = await deliveryService.getDeliveryPhotos(orderId);
      if (result.success && result.data.length > 0) {
        // Navigate to photos view or open modal
        navigate(`/admin/deliveries/${orderId}/photos`);
      } else {
        toast.info("No photos available for this delivery");
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
      toast.error("Failed to load photos");
    }
  };

  const handleRecordPayment = (order) => {
    setSelectedOrderForPayment(order);
    setPaymentModalOpen(true);
  };

  const getPaymentStatusBadge = (order) => {
    const total = order.total || 0;
    const paid = order.totalPaid || 0;
    const remaining = order.remainingBalance ?? (total - paid);

    if (remaining <= 0) {
      return <Badge variant="success">Paid</Badge>;
    } else if (paid > 0) {
      return <Badge variant="warning">Partial</Badge>;
    } else {
      return <Badge variant="danger">Unpaid</Badge>;
    }
  };

  const filteredDeliveries = deliveries.filter((delivery) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      delivery.id.toString().includes(search) ||
      delivery.storeName?.toLowerCase().includes(search) ||
      delivery.storeCity?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(totalDeliveries / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalDeliveries);

  const statusOptions = [
    { value: "All", label: "All Status" },
    { value: "Dispatched", label: "Dispatched" },
    { value: "InTransit", label: "In Transit" },
    { value: "AtStore", label: "At Store" },
    { value: "Delivered", label: "Delivered" },
    { value: "Returned", label: "Returned" },
  ];

  const pageSizeOptions = [
    { value: "10", label: "10" },
    { value: "25", label: "25" },
    { value: "50", label: "50" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              All Deliveries
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor and manage all delivery orders
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDeliveries}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              onClick={() => navigate("/admin/deliveries/live")}
              className="flex items-center gap-2"
            >
              <Navigation className="h-4 w-4" />
              Live Tracking
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Deliveries
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalDeliveries}
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
                    In Transit
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.inTransit}
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
                    Delivered Today
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.deliveredToday}
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
                    Exceptions
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.exceptions}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
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
                  placeholder="Search by order ID, store name, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/admin/deliveries/exceptions")}
                  className="flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  Exceptions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deliveries Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredDeliveries.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No deliveries found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {searchTerm || filterStatus !== "All"
                    ? "Try adjusting your search or filters"
                    : "No deliveries to display"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Order Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Store
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Updated
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredDeliveries.map((delivery) => (
                        <tr
                          key={delivery.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  Order #{delivery.id}
                                </p>
                                {delivery.priority && (
                                  <Badge variant="warning" className="mt-1">
                                    Priority
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {delivery.storeName}
                              </p>
                              {(delivery.storeAddressLine1 || delivery.storeAddressLine2 || delivery.storeBarangay ||
                                delivery.storeCity) && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {delivery.storeAddressLine1 && <span className="block">{delivery.storeAddressLine1}</span>}
                                    {delivery.storeAddressLine2 && <span className="block">{delivery.storeAddressLine2}</span>}
                                    {delivery.storeBarangay &&
                                      `${delivery.storeBarangay}, `}
                                    {delivery.storeCity}
                                  </p>
                                )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(delivery.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {formatCurrency(delivery.total)}
                              </div>
                              <div className="mt-1">
                                {getPaymentStatusBadge(delivery)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDateTime(delivery.updatedAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() =>
                                  navigate(`/admin/orders/${delivery.id}`)
                                }
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleViewPhotos(delivery.id)}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="View photos"
                              >
                                <Camera className="h-4 w-4" />
                              </button>
                              {(delivery.status === "InTransit" ||
                                delivery.status === "AtStore") && (
                                  <button
                                    onClick={() =>
                                      navigate(
                                        `/admin/deliveries/track/${delivery.id}`
                                      )
                                    }
                                    className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                    title="Track delivery"
                                  >
                                    <Navigation className="h-4 w-4" />
                                  </button>
                                )}
                              {delivery.status === "Delivered" &&
                                (delivery.remainingBalance > 0 ||
                                  (delivery.totalPaid || 0) < delivery.total) && (
                                  <button
                                    onClick={() => handleRecordPayment(delivery)}
                                    className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                    title="Record payment"
                                  >
                                    <DollarSign className="h-4 w-4" />
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
                        {startIndex}-{endIndex} of {totalDeliveries}
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

      {/* Payment Recording Modal */}
      <RecordDeliveryPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setSelectedOrderForPayment(null);
        }}
        order={selectedOrderForPayment}
        onSuccess={() => {
          fetchDeliveries();
        }}
      />
    </DashboardLayout>
  );
};

export default AdminDeliveries;
