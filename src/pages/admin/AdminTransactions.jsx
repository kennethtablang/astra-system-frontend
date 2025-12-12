// src/pages/admin/AdminTransactions.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Search,
  Filter,
  Download,
  CheckCircle,
  Eye,
  ArrowUpRight,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";
import { LoadingSpinner } from "../../components/ui/Loading";


import { TransactionDetailsModal } from "../../components/modals/AdminTransaction/TransactionDetailsModal";
import { ViewOrderDetailsModal } from "../../components/modals/AdminOrder/ViewOrderDetailsModal";
import { paymentService } from "../../services/paymentService";
import { toast } from "react-hot-toast";

export const AdminTransactions = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalTransactions, setTotalTransactions] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("All");

  // View modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [viewOrderOpen, setViewOrderOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, pageSize, filterMethod]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        pageNumber: currentPage,
        pageSize: pageSize,
        sortBy: "RecordedAt",
        sortDescending: true,
        isReconciled: true, // Only fetch reconciled payments (Transactions)
      };

      if (filterMethod !== "All") {
        params.method = filterMethod;
      }

      const result = await paymentService.getPayments(params);

      if (result.success) {
        setTransactions(result.data.items || []);
        setTotalTransactions(result.data.totalCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      toast.error("Failed to load transactions");
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

  const filteredTransactions = transactions.filter((t) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      t.id.toString().includes(search) ||
      t.orderId?.toString().includes(search) ||
      t.reference?.toLowerCase().includes(search) ||
      t.recordedByName?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(totalTransactions / pageSize);

  const methodOptions = [
    { value: "All", label: "All Methods" },
    { value: "Cash", label: "Cash" },
    { value: "GCash", label: "GCash" },
    { value: "Maya", label: "Maya" },
    { value: "BankTransfer", label: "Bank Transfer" },
    { value: "Check", label: "Check" },
    { value: "Other", label: "Other" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Transaction History
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View confirmed and reconciled payments
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTransactions}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transaction ID, order ID, or reference..."
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
                  className="w-40"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <ArrowUpRight className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No transactions found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  No reconciled payments found matching your filters
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Date
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
                          Collected By
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredTransactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-mono text-sm text-gray-900 dark:text-white">
                              #{tx.id}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDateTime(tx.recordedAt)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedOrderId(tx.orderId);
                                setViewOrderOpen(true);
                              }}
                              className="text-blue-600 hover:underline font-mono text-sm"
                            >
                              #{tx.orderId}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(tx.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getMethodBadge(tx.method)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {tx.recordedByName || "Unknown"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => {
                                setSelectedTransaction(tx);
                                setViewModalOpen(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Total: {totalTransactions} transactions
                    </span>
                    <div className="flex gap-2">
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

      {/* View Details Modal */}
      {/* View Details Modal */}
      <TransactionDetailsModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        transaction={selectedTransaction}
        loading={false}
      />

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
