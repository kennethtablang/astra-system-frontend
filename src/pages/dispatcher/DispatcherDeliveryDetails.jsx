// src/pages/dispatcher/DispatcherDeliveryDetails.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  User,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Camera,
  Navigation,
  Clock,
  Store as StoreIcon,
  ExternalLink
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/Loading";
import orderService from "../../services/orderService";
import deliveryService from "../../services/deliveryService";
import { RecordDeliveryPaymentModal } from "../../components/modals/AdminDelivery/RecordDeliveryPaymentModal";
import { toast } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { watermarkImage } from "../../utils/imageUtils";

// Fix for Leaflet default icon issues (if not globally fixed)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const mapStoreIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png", 
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25],
});

const DispatcherDeliveryDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingDelivered, setMarkingDelivered] = useState(false);
  const [reportingException, setReportingException] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Form states for marking delivered
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [deliveryPhotos, setDeliveryPhotos] = useState([]);

  // Form states for reporting exception
  const [exceptionType, setExceptionType] = useState("");
  const [exceptionDescription, setExceptionDescription] = useState("");
  const [exceptionPhotos, setExceptionPhotos] = useState([]);

  useEffect(() => {
    fetchOrderDetails();
    fetchDeliveryPhotos();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const result = await orderService.getOrderById(orderId);

      if (result.success) {
        setOrder(result.data);
      } else {
        toast.error("Failed to load order details");
        navigate("/dispatcher/deliveries");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Error loading order details");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryPhotos = async () => {
    try {
      const result = await deliveryService.getDeliveryPhotos(orderId);
      if (result.success) {
        setPhotos(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
    }
  };

  const handleMarkDelivered = async () => {
    if (deliveryPhotos.length === 0) {
      toast.error("Please upload at least one photo as proof of delivery");
      return;
    }

    try {
      setMarkingDelivered(true);

      // Get current location
      let location = null;
      try {
        location = await deliveryService.getCurrentLocation();
      } catch (error) {
        console.error("Could not get location:", error);
        toast.info("Proceeding without location data");
      }

      const result = await deliveryService.markOrderAsDelivered({
        orderId: parseInt(orderId),
        latitude: location?.latitude,
        longitude: location?.longitude,
        notes: deliveryNotes,
        recipientName: recipientName || undefined,
        recipientPhone: recipientPhone || undefined,
        photos: deliveryPhotos,
      });

      if (result.success) {
        toast.success("Order marked as delivered successfully!");
        // Refresh order details to get updated status
        await fetchOrderDetails();
        // Open payment modal
        setPaymentModalOpen(true);
      } else {
        toast.error(result.message || "Failed to mark order as delivered");
      }
    } catch (error) {
      console.error("Error marking delivered:", error);
      toast.error("Failed to mark order as delivered");
    } finally {
      setMarkingDelivered(false);
    }
  };

  const handleReportException = async () => {
    if (!exceptionType) {
      toast.error("Please select an exception type");
      return;
    }

    if (!exceptionDescription) {
      toast.error("Please provide a description");
      return;
    }

    try {
      setReportingException(true);

      const result = await deliveryService.reportDeliveryException({
        orderId: parseInt(orderId),
        exceptionType,
        description: exceptionDescription,
        photos: exceptionPhotos,
      });

      if (result.success) {
        toast.success("Exception reported successfully");
        // Reset form
        setExceptionType("");
        setExceptionDescription("");
        setExceptionPhotos([]);
      } else {
        toast.error(result.message || "Failed to report exception");
      }
    } catch (error) {
      console.error("Error reporting exception:", error);
      toast.error("Failed to report exception");
    } finally {
      setReportingException(false);
    }
  };

  // Import watermark utility (assume auto-import or manual if needed, but here we add the import at top)

  const handleFileChange = async (e, setter) => {
    const rawFiles = Array.from(e.target.files || []);
    if (rawFiles.length === 0) return;

    const toastId = toast.loading("Processing photos...");

    try {
      // Get current location for watermark
      let location = null;
      try {
        location = await deliveryService.getCurrentLocation();
      } catch (err) {
        console.warn("Location fetch failed for watermark", err);
      }

      const processedFiles = await Promise.all(rawFiles.map(async (file) => {
        try {
          // If it's a delivery photo (not exception), add watermark
          if (setter === setDeliveryPhotos) {
            const metadata = {
              lat: location?.latitude,
              lng: location?.longitude,
              address: `${order.storeBarangay || ''}, ${order.storeCity || ''}`.replace(/^, /, ''),
              orderId: order.id,
              dispatcherName: user?.fullName || 'Dispatcher',
              storeName: order.storeName
            };
            return await watermarkImage(file, metadata);
          }
          return file;
        } catch (err) {
          console.error("Watermark failed", err);
          return file; // Fallback to original
        }
      }));

      setter(prev => [...prev, ...processedFiles]);
      toast.success("Photos processed", { id: toastId });
    } catch (error) {
      console.error("Error processing photos:", error);
      toast.error("Failed to process photos", { id: toastId });
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      InTransit: { variant: "warning", label: "In Transit" },
      AtStore: { variant: "info", label: "At Store" },
      Delivered: { variant: "success", label: "Delivered" },
    };
    const config = statusMap[status] || { variant: "default", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const exceptionTypes = [
    { value: "StoreClosed", label: "Store Closed" },
    { value: "CustomerRefused", label: "Customer Refused" },
    { value: "IncorrectAddress", label: "Incorrect Address" },
    { value: "DamagedGoods", label: "Damaged Goods" },
    { value: "PartialDelivery", label: "Partial Delivery" },
    { value: "Other", label: "Other" },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Order not found
          </h3>
          <Button
            onClick={() => navigate("/dispatcher/deliveries")}
            className="mt-4"
          >
            Back to Deliveries
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dispatcher/deliveries")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Order #{order.id}
              </h1>
              {getStatusBadge(order.status)}
              {/* Payment Status Badge */}
              {order.isPaid ? (
                <Badge variant="success">Paid</Badge>
              ) : order.totalPaid > 0 ? (
                <Badge variant="warning">Partial</Badge>
              ) : (
                <Badge variant="danger">Unpaid</Badge>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Delivery details and actions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Store Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <StoreIcon className="h-5 w-5 text-blue-600" />
                  Store Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Store Name
                    </p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {order.storeName}
                    </p>
                  </div>
                  {(order.storeBarangay || order.storeCity) && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Address
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {order.storeBarangay && `${order.storeBarangay}, `}
                        {order.storeCity}
                      </p>
                    </div>
                  )}
                  <div className="h-[200px] w-full rounded-lg overflow-hidden relative z-0 mt-4 border border-gray-200 dark:border-gray-700">
                     {order.storeLatitude && order.storeLongitude ? (
                        <MapContainer
                          center={[order.storeLatitude, order.storeLongitude]}
                          zoom={15}
                          style={{ height: "100%", width: "100%" }}
                          scrollWheelZoom={false}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          <Marker position={[order.storeLatitude, order.storeLongitude]} icon={mapStoreIcon}>
                            <Popup>{order.storeName}</Popup>
                          </Marker>
                        </MapContainer>
                     ) : (
                        <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 text-gray-500">
                           Map location unavailable
                        </div>
                     )}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => {
                        const query = (order.storeLatitude && order.storeLongitude) 
                            ? `${order.storeLatitude},${order.storeLongitude}` 
                            : encodeURIComponent(order.storeName);
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, "_blank");
                    }}
                    className="w-full mt-2"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Navigation App
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Order Items
                </h3>
                <div className="space-y-3">
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
                          {item.productSku}
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
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Total
                    </span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Paid
                    </span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(order.totalPaid || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Balance
                    </span>
                    <span className={`font-bold ${(order.remainingBalance ?? (order.total - (order.totalPaid || 0))) > 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-green-600 dark:text-green-400"
                      }`}>
                      {formatCurrency(order.remainingBalance ?? (order.total - (order.totalPaid || 0)))}
                    </span>
                  </div>
                  {order.isPaid && order.paidAt && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <CheckCircle className="h-3 w-3 inline mr-1 text-green-500" />
                      Fully paid on {new Date(order.paidAt).toLocaleDateString()}
                      {order.paidByName && ` by ${order.paidByName}`}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Mark as Delivered */}
            {(order.status === "InTransit" || order.status === "AtStore") && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Mark as Delivered
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Recipient Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Who received the order?"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Recipient Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        placeholder="Contact number"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Delivery Photos * (Required)
                      </label>
                      <div className="space-y-3">
                        {/* Hidden Input */}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          capture="environment"
                          id="delivery-photo-upload"
                          onChange={(e) => handleFileChange(e, setDeliveryPhotos)}
                          className="hidden"
                        />

                        {/* Custom Button */}
                        <label
                          htmlFor="delivery-photo-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <Camera className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Tap to Take Photo
                          </span>
                          <span className="text-xs text-gray-400 mt-1">
                            (or upload from gallery)
                          </span>
                        </label>

                        {/* Preview Grid */}
                        {deliveryPhotos.length > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {Array.from(deliveryPhotos).map((file, index) => (
                              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${index}`}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newPhotos = [...deliveryPhotos];
                                    newPhotos.splice(index, 1);
                                    setDeliveryPhotos(newPhotos);
                                  }}
                                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                                >
                                  <AlertCircle className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {deliveryPhotos.length > 0 && (
                          <p className="text-sm text-green-600 text-center font-medium">
                            {deliveryPhotos.length} photo(s) ready to upload
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        placeholder="Any additional notes..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <Button
                      onClick={handleMarkDelivered}
                      disabled={markingDelivered || deliveryPhotos.length === 0}
                      className="w-full"
                    >
                      {markingDelivered ? (
                        "Processing..."
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Delivered
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Report Exception */}
            {(order.status === "InTransit" || order.status === "AtStore") && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Report Delivery Exception
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Exception Type *
                      </label>
                      <select
                        value={exceptionType}
                        onChange={(e) => setExceptionType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select type</option>
                        {exceptionTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={exceptionDescription}
                        onChange={(e) =>
                          setExceptionDescription(e.target.value)
                        }
                        placeholder="Describe the issue..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Photos (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        capture="environment"
                        onChange={(e) =>
                          handleFileChange(e, setExceptionPhotos)
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      {exceptionPhotos.length > 0 && (
                        <p className="text-sm text-blue-600 mt-2">
                          {exceptionPhotos.length} photo(s) selected
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={handleReportException}
                      disabled={reportingException}
                      variant="outline"
                      className="w-full border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      {reportingException ? (
                        "Reporting..."
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Report Exception
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Order Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Order ID
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      #{order.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Items
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {order.items?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(order.subTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tax
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(order.tax)}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Total
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Existing Photos */}
            {photos.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Delivery Photos ({photos.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {photos.map((photo) => (
                      <img
                        key={photo.id}
                        src={photo.url}
                        alt="Delivery proof"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Payment Recording Modal */}
      <RecordDeliveryPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          navigate("/dispatcher/deliveries");
        }}
        order={order}
        onSuccess={() => {
          fetchOrderDetails();
        }}
      />
    </DashboardLayout>
  );
};

export default DispatcherDeliveryDetails;
