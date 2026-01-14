// src/components/modals/AdminOrder/ViewOrderDetailsModal.jsx - WITH PAYMENT RECORDING
import { useState, useEffect } from "react";
import {
  X,
  Package,
  Store,
  MapPin,
  Calendar,
  User,
  DollarSign,
  Printer,
  CheckCircle,
  Truck,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import { toast } from "react-hot-toast";
import orderService from "../../../services/orderService";
import receiptService from "../../../services/receiptService";
import { RecordDeliveryPaymentModal } from "../AdminDelivery/RecordDeliveryPaymentModal";
import deliveryService from "../../../services/deliveryService";
import { getImageUrl } from "../../../utils/imageUrl";

const Modal = ({ isOpen, onClose, title, children, size = "xl" }) => {
  if (!isOpen) return null;

  const sizes = {
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
        />
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
          &#8203;
        </span>
        <div
          className={`inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full ${sizes[size]}`}
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    success:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
};

const Button = ({
  children,
  variant = "primary",
  onClick,
  disabled,
  className = "",
}) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    outline:
      "border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
    success: "bg-green-600 text-white hover:bg-green-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const ViewOrderDetailsModal = ({
  isOpen,
  onClose,
  orderId,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [printing, setPrinting] = useState(false);
  const [markingAtStore, setMarkingAtStore] = useState(false);
  const [markingDelivered, setMarkingDelivered] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [exception, setException] = useState(null);
  const [loadingException, setLoadingException] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const result = await orderService.getOrderById(orderId);
      if (result.success) {
        setOrder(result.data);
      } else {
        toast.error("Failed to load order details");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Error loading order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && orderId) {
      fetchDeliveryPhotos();
      fetchExceptionDetails();
    }
  }, [isOpen, orderId]);

  const fetchExceptionDetails = async () => {
    try {
      setLoadingException(true);
      const result = await deliveryService.getDeliveryExceptions(orderId);
      if (result.success && result.data && result.data.length > 0) {
        // Assuming we show the most recent exception
        setException(result.data[0]);
      } else {
        setException(null);
      }
    } catch (error) {
      console.error("Error fetching exceptions:", error);
    } finally {
      setLoadingException(false);
    }
  };

  const fetchDeliveryPhotos = async () => {
    try {
      setLoadingPhotos(true);
      const result = await deliveryService.getDeliveryPhotos(orderId);
      if (result.success) {
        setPhotos(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleMarkAtStore = async () => {
    if (!window.confirm("Mark this order as arrived at store?")) {
      return;
    }

    try {
      setMarkingAtStore(true);
      const result = await orderService.markOrderAtStore(orderId);

      if (result.success) {
        toast.success("Order marked as at store");
        await fetchOrderDetails();
        onSuccess?.();
      } else {
        toast.error(result.message || "Failed to update order");
      }
    } catch (error) {
      console.error("Error marking order at store:", error);
      toast.error("Failed to update order status");
    } finally {
      setMarkingAtStore(false);
    }
  };

  const handlePrintReceipt = async () => {
    try {
      setPrinting(true);

      // Get thermal receipt data
      const result = await receiptService.generateMobileThermalReceipt(orderId);

      if (result.success) {
        // Try to print via browser's print dialog
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Receipt - Order #${orderId}</title>
                <style>
                  body {
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    width: 58mm;
                    margin: 0;
                    padding: 10px;
                  }
                  @media print {
                    body { margin: 0; padding: 5px; }
                  }
                </style>
              </head>
              <body>
                <pre>${atob(result.data.receiptData)}</pre>
                <script>
                  window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 100);
                  }
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        }

        toast.success("Receipt sent to printer");
      } else {
        toast.error("Failed to generate receipt");
      }
    } catch (error) {
      console.error("Error printing receipt:", error);
      toast.error("Failed to print receipt");
    } finally {
      setPrinting(false);
    }
  };

  const handleMarkDelivered = async () => {
    if (!window.confirm("Mark this order as delivered?")) {
      return;
    }

    try {
      setMarkingDelivered(true);
      const result = await orderService.markOrderDelivered(orderId);

      if (result.success) {
        toast.success("Order marked as delivered");
        await fetchOrderDetails();
        onSuccess?.();
      } else {
        toast.error(result.message || "Failed to update order");
      }
    } catch (error) {
      console.error("Error marking order as delivered:", error);
      toast.error("Failed to update order status");
    } finally {
      setMarkingDelivered(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Pending: { variant: "warning", label: "Pending" },
      Confirmed: { variant: "info", label: "Confirmed" },
      Packed: { variant: "default", label: "Packed" },
      Dispatched: { variant: "info", label: "Dispatched" },
      InTransit: { variant: "info", label: "In Transit" },
      AtStore: { variant: "info", label: "At Store" },
      Delivered: { variant: "success", label: "Delivered" },
      Returned: { variant: "warning", label: "Returned" },
      Cancelled: { variant: "danger", label: "Cancelled" },
    };
    const config = statusMap[status] || statusMap.Pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    const safeDate = date.endsWith("Z") ? date : `${date}Z`;
    return new Date(safeDate).toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Order Details">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </Modal>
    );
  }

  if (!order) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Order Details">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Failed to load order details
          </p>
        </div>
      </Modal>
    );
  }

  // Determine available actions based on status
  const canMarkAtStore = order.status === "InTransit";
  const canPrintReceipt =
    order.status === "AtStore" || order.status === "Delivered";
  const canMarkDelivered = order.status === "AtStore";
  const canReceivePayment =
    order.status === "Delivered" &&
    (order.remainingBalance > 0 || (order.totalPaid || 0) < order.total);

  const handlePaymentSuccess = () => {
    fetchOrderDetails();
    onSuccess?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order #${order.id}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Order ##{order.id}
              </h2>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Created {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          {canMarkAtStore && (
            <Button
              variant="primary"
              onClick={handleMarkAtStore}
              disabled={markingAtStore}
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              {markingAtStore ? "Updating..." : "Mark At Store"}
            </Button>
          )}

          {canPrintReceipt && (
            <Button
              variant="outline"
              onClick={handlePrintReceipt}
              disabled={printing}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              {printing ? "Printing..." : "Print Receipt"}
            </Button>
          )}

          {canMarkDelivered && (
            <Button
              variant="success"
              onClick={handleMarkDelivered}
              disabled={markingDelivered}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              {markingDelivered ? "Updating..." : "Mark Delivered"}
            </Button>
          )}

          {canReceivePayment && (
            <Button
              variant="primary"
              onClick={() => setPaymentModalOpen(true)}
              className="flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Receive Payment
            </Button>
          )}
        </div>

        {/* Status Info */}
        {order.status === "InTransit" && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Order In Transit
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Click "Mark At Store" when the order arrives at the store
                  location.
                </p>
              </div>
            </div>
          </div>
        )}

        {order.status === "AtStore" && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Order At Store
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Print the receipt and complete the delivery.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Exception Details */}
        {exception && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-100 dark:border-red-900">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Delivery Exception
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Type</span>
                    <p className="font-medium text-red-700 dark:text-red-300 mt-1">
                        {exception.exceptionType?.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                 </div>
                 <div>
                    <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Reported At</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        {formatDateTime(exception.createdAt)}
                    </p>
                 </div>
              </div>

              <div>
                 <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Description</span>
                 <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 bg-white dark:bg-gray-800 p-3 rounded-md border border-red-100 dark:border-red-900/30">
                    {exception.description}
                 </p>
              </div>

              {exception.photos && exception.photos.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2 block">Photos</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {exception.photos.map((photo) => (
                        <a
                          key={photo.id}
                          href={getImageUrl(photo.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block group relative aspect-square rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                        >
                          <img
                            src={getImageUrl(photo.url)}
                            alt="Exception Proof"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
              )}
            </div>
          </div>
        )}

        {/* Order Info Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Store Info with Location */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Store className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Store Information
              </h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Store Name</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.storeName}
                </p>
              </div>

              {/* Delivery Location - NEW SECTION */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-start gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Delivery Location
                  </p>
                </div>
                <div className="ml-6 space-y-1">
                  {order.storeAddressLine1 && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Address 1:{" "}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {order.storeAddressLine1}
                      </span>
                    </div>
                  )}
                  {order.storeAddressLine2 && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                         Address 2:{" "}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {order.storeAddressLine2}
                      </span>
                    </div>
                  )}
                  {order.storeBarangay && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Barangay:{" "}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {order.storeBarangay}
                      </span>
                    </div>
                  )}
                  {order.storeCity && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        City:{" "}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {order.storeCity}
                      </span>
                    </div>
                  )}
                  {!order.storeAddressLine1 && !order.storeAddressLine2 && !order.storeBarangay && !order.storeCity && (
                    <span className="text-gray-500 dark:text-gray-400 italic">
                      No location information
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Agent Info */}
          {order.agentName && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Agent
                </h3>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {order.agentName}
              </p>
            </div>
          )}

          {/* Scheduled Date */}
          {order.scheduledFor && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Scheduled For
                </h3>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDateTime(order.scheduledFor)}
              </p>
            </div>
          )}

          {/* Priority */}
          {order.priority && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                  Priority Order
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Proof of Delivery Section */}
        {order.status === "Delivered" && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Proof of Delivery
              </h3>
            </div>

            {loadingPhotos ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                Loading proof...
              </div>
            ) : (
              <div className="space-y-4">
                {/* Recipient Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {order.receivedBy && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Received By: </span>
                      <span className="font-medium text-gray-900 dark:text-white">{order.receivedBy}</span>
                    </div>
                  )}
                </div>

                {/* Photos Grid */}
                {photos.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attached Photos:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {photos.map((photo) => (
                        <a
                          key={photo.id}
                          href={getImageUrl(photo.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block group relative aspect-square rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                        >
                          <img
                            src={getImageUrl(photo.url)}
                            alt="Proof of Delivery"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span>No proof of delivery photos attached</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Order Items */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Order Items ({order.items?.length || 0})
          </h3>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                    Product
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {order.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          SKU: {item.productSku}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Order Total
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(order.subTotal)}
              </span>
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-600 flex justify-between">
              <span className="font-semibold text-gray-900 dark:text-white">
                Total
              </span>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(order.total)}
              </span>
            </div>
            {order.status === "Delivered" && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Paid</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {formatCurrency(order.totalPaid || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Balance
                  </span>
                  <span
                    className={`font-bold ${(order.remainingBalance ||
                      order.total - (order.totalPaid || 0)) > 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-green-600 dark:text-green-400"
                      }`}
                  >
                    {formatCurrency(
                      order.remainingBalance ??
                      order.total - (order.totalPaid || 0)
                    )}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Payment Modal */}
      <RecordDeliveryPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        order={order}
        onSuccess={handlePaymentSuccess}
      />
    </Modal>
  );
};
