// src/pages/admin/AdminFinance.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  FileText,
  CreditCard,
  RefreshCw,
  Eye,
  Plus,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/Loading";
import { RecordPaymentModal } from "../../components/modals/AdminFinance/RecordPaymentModal";
import { ViewPaymentModal } from "../../components/modals/AdminFinance/ViewPaymentModal";
import { paymentService, invoiceService } from "../../services/paymentService";

// Main Finance Page
const AdminFinance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [viewPaymentOpen, setViewPaymentOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  // Stats
  const [arSummary, setArSummary] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [overdueInvoices, setOverdueInvoices] = useState([]);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);

      // Fetch AR Summary
      const arResult = await invoiceService.getARSummary();
      if (arResult.success) {
        setArSummary(arResult.data);
      }

      // Fetch Recent Payments
      const paymentsResult = await paymentService.getPayments({
        pageNumber: 1,
        pageSize: 10,
        sortBy: "RecordedAt",
        sortDescending: true,
      });
      if (paymentsResult.success) {
        setRecentPayments(paymentsResult.data.items || []);
      }

      // Fetch Overdue Invoices
      const overdueResult = await invoiceService.getOverdueInvoices();
      if (overdueResult.success) {
        setOverdueInvoices(overdueResult.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch finance data:", err);
      toast.error("Failed to load finance data");
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Finance Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track payments, invoices, and accounts receivable
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/finance/remittance")}
            >
              <Users className="h-4 w-4 mr-2" />
              Remittance
            </Button>
            <Button onClick={() => setRecordPaymentOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
            <Button variant="outline" onClick={fetchFinanceData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Total Outstanding
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(arSummary?.totalOutstanding)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Current (0-30d)
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(arSummary?.current)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Overdue
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {arSummary?.overdueInvoices || 0}
                      </p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Total Invoices
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {arSummary?.totalInvoices || 0}
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Payments */}
            <Card>
              <CardContent className="p-0">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Recent Payments
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/admin/finance/payments")}
                  >
                    View All
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Payment ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Order
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Method
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Recorded By
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Date
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {recentPayments.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-4 py-8 text-center">
                            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">
                              No payments recorded yet
                            </p>
                          </td>
                        </tr>
                      ) : (
                        recentPayments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-4 py-3">
                              <span className="font-mono text-sm text-gray-900 dark:text-white">
                                #{payment.id}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() =>
                                  navigate(`/admin/orders/${payment.orderId}`)
                                }
                                className="font-mono text-sm text-blue-600 hover:underline"
                              >
                                #{payment.orderId}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                {formatCurrency(payment.amount)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {getMethodBadge(payment.method)}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-900 dark:text-white">
                                {payment.recordedByName || "Unknown"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(
                                  payment.recordedAt
                                ).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => {
                                  setSelectedPaymentId(payment.id);
                                  setViewPaymentOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Overdue Invoices */}
            {overdueInvoices.length > 0 && (
              <Card>
                <CardContent className="p-0">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      Overdue Invoices ({overdueInvoices.length})
                    </h2>
                  </div>
                  <div className="p-4 space-y-3">
                    {overdueInvoices.slice(0, 5).map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Invoice #{invoice.id} - {invoice.storeName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Due:{" "}
                            {new Date(invoice.issuedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(invoice.totalAmount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Modals */}
        <RecordPaymentModal
          isOpen={recordPaymentOpen}
          onClose={() => setRecordPaymentOpen(false)}
          onSuccess={fetchFinanceData}
        />

        <ViewPaymentModal
          isOpen={viewPaymentOpen}
          onClose={() => {
            setViewPaymentOpen(false);
            setSelectedPaymentId(null);
          }}
          paymentId={selectedPaymentId}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminFinance;
