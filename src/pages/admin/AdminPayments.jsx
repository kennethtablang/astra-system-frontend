// src/pages/admin/AdminPayments.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  Search,
  RefreshCw,
  Eye,
  Calendar,
  Filter,
  CreditCard,
  CheckCircle,
  Clock,
  Download,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardHeader, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { LoadingSpinner } from "../../components/ui/Loading";
import { Modal } from "../../components/ui/Modal";
import { ViewOrderDetailsModal } from "../../components/modals/AdminOrder/ViewOrderDetailsModal";
import { paymentService } from "../../services/paymentService";
import { toast } from "react-hot-toast";

export const AdminPayments = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPayments, setTotalPayments] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("All");
  const [filterReconciled, setFilterReconciled] = useState("All");

  // View modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [viewOrderOpen, setViewOrderOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, [currentPage, pageSize, filterMethod, filterReconciled]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {
        pageNumber: currentPage,
        pageSize: pageSize,
        sortBy: "RecordedAt",
        sortDescending: true,
      };

      if (filterMethod !== "All") {
        params.method = filterMethod;
      }

      if (filterReconciled !== "All") {
        params.isReconciled = filterReconciled === "Reconciled";
      }

      const result = await paymentService.getPayments(params);

      if (result.success) {
        setPayments(result.data.items || []);
        setTotalPayments(result.data.totalCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount || 0);
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMethodBadge = (method) => {
    const badges = {
      Cash: <Badge variant="success">Cash</Badge>,
      GCash: <Badge variant="info">GCash</Badge>,
      Maya: <Badge variant="info">Maya</Badge>,
      BankTransfer: <Badge variant="default">Bank Transfer</Badge>,
      Check: <Badge variant="warning">Check</Badge>,
      Other: <Badge variant="default">Other</Badge>,
    };
    return badges[method] || <Badge>{method}</Badge>;
  };

  const handleViewPayment = async (paymentId) => {
    try {
      setLoadingPayment(true);
      setViewModalOpen(true);

      const result = await paymentService.getPaymentById(paymentId);
      if (result.success) {
        setSelectedPayment(result.data);
      } else {
        toast.error("Failed to load payment details");
      }
    } catch (error) {
      console.error("Error loading payment:", error);
      toast.error("Failed to load payment details");
    } finally {
      setLoadingPayment(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      payment.id.toString().includes(search) ||
      payment.orderId?.toString().includes(search) ||
      payment.recordedByName?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(totalPayments / pageSize);

  const methodOptions = [
    { value: "All", label: "All Methods" },
    { value: "Cash", label: "Cash" },
    { value: "GCash", label: "GCash" },
    { value: "Maya", label: "Maya" },
    { value: "BankTransfer", label: "Bank Transfer" },
    { value: "Check", label: "Check" },
    { value: "Other", label: "Other" },
  ];

  const reconciledOptions = [
    { value: "All", label: "All Status" },
    { value: "Reconciled", label: "Reconciled" },
    { value: "Pending", label: "Pending" },
  ];

  const pageSizeOptions = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "50", label: "50" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Payments
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View and manage all payment transactions
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPayments}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/finance/remittance")}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Remittance
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by payment ID, order ID, or recorder..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={filterMethod}
                  onChange={(e) => {
                    setFilterMethod(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={methodOptions}
                  className="w-36"
                />
                <Select
                  value={filterReconciled}
                  onChange={(e) => {
                    setFilterReconciled(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={reconciledOptions}
                  className="w-36"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No payments found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {searchTerm || filterMethod !== "All" || filterReconciled !== "All"
                    ? "Try adjusting your search or filters"
                    : "No payments recorded yet"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Payment ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Recorded By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Date
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredPayments.map((payment) => (
                        <tr
                          key={payment.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-mono text-sm text-gray-900 dark:text-white">
                              #{payment.id}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedOrderId(payment.orderId);
                                setViewOrderOpen(true);
                              }}
                              className="text-blue-600 hover:underline font-mono text-sm"
                            >
                              #{payment.orderId}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              {formatCurrency(payment.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getMethodBadge(payment.method)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {payment.isReconciled ? (
                              <Badge variant="success">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Reconciled
                              </Badge>
                            ) : (
                              <Badge variant="warning">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 dark:text-white">
                              {payment.recordedByName || "Unknown"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDateTime(payment.recordedAt)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => handleViewPayment(payment.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
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
                      <span className="text-gray-700 dark:text-gray-300">
                        of {totalPayments} payments
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
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Page {currentPage} of {totalPages || 1}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages || 1, prev + 1)
                          )
                        }
                        disabled={currentPage >= totalPages}
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

      {/* View Payment Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedPayment(null);
        }}
        title={`Payment #${selectedPayment?.id || ""}`}
        size="md"
      >
        {loadingPayment ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : selectedPayment ? (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Order ID:
                  </span>
                  <button
                    onClick={() => {
                      setViewModalOpen(false);
                      navigate(`/admin/orders/${selectedPayment.orderId}`);
                    }}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    #{selectedPayment.orderId}
                  </button>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Amount:
                  </span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(selectedPayment.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Method:
                  </span>
                  {getMethodBadge(selectedPayment.method)}
                </div>
                {selectedPayment.reference && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Reference:
                    </span>
                    <span className="font-mono text-xs text-gray-900 dark:text-white">
                      {selectedPayment.reference}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Status:
                  </span>
                  {selectedPayment.isReconciled ? (
                    <Badge variant="success">Reconciled</Badge>
                  ) : (
                    <Badge variant="warning">Pending</Badge>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Recorded By:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedPayment.recordedByName || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Recorded At:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDateTime(selectedPayment.recordedAt)}
                  </span>
                </div>
                {selectedPayment.notes && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400 block mb-1">
                      Notes:
                    </span>
                    <p className="text-gray-900 dark:text-white">
                      {selectedPayment.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setViewModalOpen(false);
                  setSelectedPayment(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Payment not found
          </div>
        )}
      </Modal>

      <ViewOrderDetailsModal
        isOpen={viewOrderOpen}
        onClose={() => {
          setViewOrderOpen(false);
          setSelectedOrderId(null);
        }}
        orderId={selectedOrderId}
      />
    </DashboardLayout>
  );
};

export default AdminPayments;
