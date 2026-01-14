// src/components/modals/Delivery/ViewDeliveryDetailsModal.jsx
import { useState, useEffect } from "react";
import {
  X,
  Package,
  MapPin,
  User,
  Calendar,
  DollarSign,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  Camera,
  Navigation,
  Phone,
  Store as StoreIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import orderService from "../../../services/orderService";
import deliveryService from "../../../services/deliveryService";
import { Badge } from "../../ui/Badge";
import { LoadingSpinner } from "../../ui/Loading";

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
          <div className="px-6 py-4 max-h-[80vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const Button = ({
  children,
  variant = "outline",
  onClick,
  disabled,
  className = "",
}) => {
  const variants = {
    outline:
      "border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
    primary: "bg-blue-600 text-white hover:bg-blue-700",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const ViewDeliveryDetailsModal = ({ isOpen, onClose, orderId }) => {
  const [order, setOrder] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchDeliveryDetails();
    }
  }, [isOpen, orderId]);

  const fetchDeliveryDetails = async () => {
    try {
      setLoading(true);

      // Fetch order details
      const orderResult = await orderService.getOrderById(orderId);
      if (orderResult.success) {
        setOrder(orderResult.data);
      }

      // Fetch delivery photos
      const photosResult = await deliveryService.getDeliveryPhotos(orderId);
      if (photosResult.success) {
        setPhotos(photosResult.data || []);
      }
    } catch (error) {
      console.error("Error fetching delivery details:", error);
      toast.error("Failed to load delivery details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Pending: { variant: "default", label: "Pending" },
      Confirmed: { variant: "info", label: "Confirmed" },
      Packed: { variant: "default", label: "Packed" },
      Dispatched: { variant: "info", label: "Dispatched" },
      InTransit: { variant: "warning", label: "In Transit" },
      AtStore: { variant: "info", label: "At Store" },
      Delivered: { variant: "success", label: "Delivered" },
      Returned: { variant: "danger", label: "Returned" },
      Cancelled: { variant: "danger", label: "Cancelled" },
    };
    const config = statusMap[status] || statusMap.Pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusTimeline = () => {
    if (!order) return [];

    const timeline = [
      { status: "Pending", label: "Order Created", time: order.createdAt },
    ];

    if (
      order.status === "Confirmed" ||
      order.status === "Packed" ||
      order.status === "Dispatched" ||
      order.status === "InTransit" ||
      order.status === "AtStore" ||
      order.status === "Delivered"
    ) {
      timeline.push({
        status: "Confirmed",
        label: "Confirmed",
        time: order.updatedAt,
      });
    }

    if (
      order.status === "Packed" ||
      order.status === "Dispatched" ||
      order.status === "InTransit" ||
      order.status === "AtStore" ||
      order.status === "Delivered"
    ) {
      timeline.push({
        status: "Packed",
        label: "Packed",
        time: order.updatedAt,
      });
    }

    if (
      order.status === "Dispatched" ||
      order.status === "InTransit" ||
      order.status === "AtStore" ||
      order.status === "Delivered"
    ) {
      timeline.push({
        status: "Dispatched",
        label: "Dispatched",
        time: order.updatedAt,
      });
    }

    if (
      order.status === "InTransit" ||
      order.status === "AtStore" ||
      order.status === "Delivered"
    ) {
      timeline.push({
        status: "InTransit",
        label: "In Transit",
        time: order.updatedAt,
      });
    }

    if (order.status === "Delivered") {
      timeline.push({
        status: "Delivered",
        label: "Delivered",
        time: order.updatedAt,
      });
    }

    return timeline;
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
      year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  };

  if (!orderId) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Delivery Details - Order #${orderId}`}
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : !order ? (
        <div className="text-center py-12">
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
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Order #{order.id}
                </h2>
                {getStatusBadge(order.status)}
                {order.priority && <Badge variant="warning">Priority</Badge>}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Created: {formatDateTime(order.createdAt)}
              </p>
            </div>
          </div>

          {/* Store & Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <StoreIcon className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Store Information
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Store Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.storeName}
                  </p>
                </div>
                {(order.storeBarangay || order.storeCity) && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Location</p>
                    <p className="text-gray-900 dark:text-white">
                      {order.storeAddressLine1 && <span className="block">{order.storeAddressLine1}</span>}
                      {order.storeAddressLine2 && <span className="block">{order.storeAddressLine2}</span>}
                      {order.storeBarangay && `${order.storeBarangay}, `}
                      {order.storeCity}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Delivery Information
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Warehouse</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.warehouseName || "Not assigned"}
                  </p>
                </div>
                {order.agentName && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Agent</p>
                    <p className="text-gray-900 dark:text-white">
                      {order.agentName}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Delivery Timeline
            </h3>
            <div className="space-y-3">
              {getStatusTimeline().map((item, index) => {
                const isLast = index === getStatusTimeline().length - 1;
                return (
                  <div key={item.status} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isLast ? "bg-blue-600" : "bg-green-600"
                        }`}
                      >
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      {!isLast && (
                        <div className="w-0.5 h-full min-h-[30px] bg-gray-300 dark:bg-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDateTime(item.time)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Order Items ({order.items?.length || 0})
            </h3>
            <div className="space-y-2">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.productName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      SKU: {item.productSku}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      x{item.quantity}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrency(item.lineTotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Total */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(order.subTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(order.tax)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Total
                  </span>
                  <span className="font-bold text-lg text-gray-900 dark:text-white">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Photos */}
          {photos.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Camera className="h-5 w-5 text-blue-600" />
                Delivery Photos ({photos.length})
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={photo.url}
                      alt="Delivery proof"
                      className="w-full h-24 object-cover rounded-lg group-hover:opacity-75 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black bg-opacity-50 rounded-full p-2">
                        <Camera className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Full Photo View */}
              {selectedPhoto && (
                <div
                  className="fixed inset-0 z-[60] bg-black bg-opacity-90 flex items-center justify-center p-4"
                  onClick={() => setSelectedPhoto(null)}
                >
                  <div className="relative max-w-4xl max-h-full">
                    <button
                      onClick={() => setSelectedPhoto(null)}
                      className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100"
                    >
                      <X className="h-6 w-6" />
                    </button>
                    <img
                      src={selectedPhoto.url}
                      alt="Full size"
                      className="max-w-full max-h-[90vh] object-contain"
                    />
                    {selectedPhoto.notes && (
                      <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg">
                        <p className="text-sm">{selectedPhoto.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
