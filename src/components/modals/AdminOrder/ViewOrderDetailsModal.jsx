// src/components/modals/AdminOrder/ViewOrderDetailsModal.jsx
import { useState, useEffect } from "react";
import {
  Package,
  Store,
  User,
  Calendar,
  MapPin,
  TrendingUp,
  Edit,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  AlertCircle,
} from "lucide-react";
import { Modal } from "../../ui/Modal";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { LoadingSpinner } from "../../ui/Loading";
import orderService from "../../../services/orderService";
import { toast } from "react-hot-toast";

export const ViewOrderDetailsModal = ({ isOpen, onClose, orderId, onEdit }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const result = await orderService.getOrderById(orderId);
      if (result.success) {
        setOrder(result.data);
      } else {
        toast.error("Failed to load order details");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Error loading order");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Pending: { variant: "warning", icon: Clock },
      Confirmed: { variant: "info", icon: CheckCircle },
      Packed: { variant: "purple", icon: Package },
      Dispatched: { variant: "default", icon: Truck },
      InTransit: { variant: "default", icon: Truck },
      AtStore: { variant: "info", icon: MapPin },
      Delivered: { variant: "success", icon: CheckCircle },
      Returned: { variant: "warning", icon: AlertCircle },
      Cancelled: { variant: "danger", icon: XCircle },
    };

    const config = badges[status] || { variant: "default", icon: Package };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order #${orderId}`}
      size="xl"
    >
      {loading ? (
        <LoadingSpinner />
      ) : !order ? (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Failed to load order details
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Order #{order.id}
                </h2>
                {getStatusBadge(order.status)}
                {order.priority && <Badge variant="danger">Priority</Badge>}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Created {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex gap-2">
              {onEdit && order.status === "Pending" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onEdit(order);
                    onClose();
                  }}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Order
                </Button>
              )}
            </div>
          </div>

          {/* Store and Agent Info */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Store Card */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Store className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Store Information
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.storeName}
                </p>
                {(order.storeBarangay || order.storeCity) && (
                  <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>
                      {order.storeBarangay && `${order.storeBarangay}, `}
                      {order.storeCity}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Agent Card */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Agent Information
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.agentName || "Not assigned"}
                </p>
                {order.agentId && (
                  <p className="text-gray-600 dark:text-gray-400 text-xs font-mono">
                    ID: {order.agentId}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Order Items ({order.items?.length || 0})
            </h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                        SKU
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {order.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {item.productName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono">
                          {item.productSku}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(item.lineTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Order Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal
                </span>
                <span className="text-gray-900 dark:text-white">
                  {formatCurrency(order.subTotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Tax (12%)
                </span>
                <span className="text-gray-900 dark:text-white">
                  {formatCurrency(order.tax)}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Total
                  </span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {order.scheduledFor && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>Scheduled: {formatDate(order.scheduledFor)}</span>
              </div>
            )}
            {order.warehouseName && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>Warehouse: {order.warehouseName}</span>
              </div>
            )}
            {order.distributorName && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Truck className="h-4 w-4" />
                <span>Distributor: {order.distributorName}</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
