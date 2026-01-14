import { useState, useEffect } from "react";
import {
  X,
  Truck,
  User,
  Calendar,
  MapPin,
  Package,
  Clock,
  Navigation,
  CheckCircle,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { toast } from "react-hot-toast";
import tripService from "../../../services/tripService";

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
  variant = "outline",
  onClick,
  disabled,
  className = "",
}) => {
  const variants = {
    outline:
      "border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
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

export const TripDetailsModal = ({ isOpen, onClose, tripId }) => {
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    if (isOpen && tripId) {
      fetchTripDetails();
    }
  }, [isOpen, tripId]);

  const fetchTripDetails = async () => {
    setLoading(true);
    try {
      const result = await tripService.getTripById(tripId);
      if (result.success) {
        setTrip(result.data);
      } else {
        toast.error("Failed to load trip details");
      }
    } catch (error) {
      console.error("Error fetching trip:", error);
      toast.error("Error loading trip details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Created: { variant: "default", icon: Package },
      Assigned: { variant: "info", icon: User },
      Started: { variant: "info", icon: Navigation },
      InProgress: { variant: "info", icon: Navigation },
      Completed: { variant: "success", icon: CheckCircle },
      Cancelled: { variant: "danger", icon: AlertCircle },
    };
    const config = statusMap[status] || statusMap.Created;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getOrderStatusBadge = (status) => {
    const statusMap = {
      Pending: { variant: "warning", icon: Clock },
      Confirmed: { variant: "info", icon: CheckCircle },
      Packed: { variant: "default", icon: Package },
      Dispatched: { variant: "info", icon: Truck },
      InTransit: { variant: "info", icon: Navigation },
      AtStore: { variant: "info", icon: MapPin },
      Delivered: { variant: "success", icon: CheckCircle },
      Returned: { variant: "warning", icon: AlertCircle },
      Cancelled: { variant: "danger", icon: X },
    };
    const config = statusMap[status] || statusMap.Pending;
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

  const formatDateTime = (date) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  };

  const calculateTotalValue = () => {
    if (!trip || !trip.assignments) return 0;
    return trip.assignments.reduce(
      (sum, assignment) => sum + (assignment.orderTotal || 0),
      0
    );
  };

  const getCompletedStops = () => {
    if (!trip || !trip.assignments) return 0;
    return trip.assignments.filter((a) => a.status === "Delivered").length;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Trip #${tripId}`}
      size="2xl"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading trip details...
            </p>
          </div>
        </div>
      ) : !trip ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Failed to load trip details
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Trip Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Trip #{trip.id}
                </h2>
                {getStatusBadge(trip.status)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Created {formatDateTime(trip.createdAt)}
              </p>
            </div>
          </div>

          {/* Trip Info Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Warehouse */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Warehouse
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {trip.warehouseName}
              </p>
            </div>

            {/* Dispatcher */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Dispatcher
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {trip.dispatcherName || "Not assigned"}
              </p>
            </div>

            {/* Departure */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Departure
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {formatDateTime(trip.departureAt)}
              </p>
            </div>

            {/* Vehicle */}
            {trip.vehicle && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Vehicle
                  </h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {trip.vehicle}
                </p>
              </div>
            )}

            {/* Estimated Return */}
            {trip.estimatedReturn && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Estimated Return
                  </h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {formatDateTime(trip.estimatedReturn)}
                </p>
              </div>
            )}
          </div>

          {/* Progress Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Delivery Progress
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {getCompletedStops()} of {trip.assignments?.length || 0} stops
                  completed
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Value
                </p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(calculateTotalValue())}
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    trip.assignments?.length > 0
                      ? (getCompletedStops() / trip.assignments.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Stops/Assignments */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Navigation className="h-5 w-5 text-blue-600" />
              Trip Stops ({trip.assignments?.length || 0})
            </h3>
            {!trip.assignments || trip.assignments.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">
                  No stops assigned
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {trip.assignments
                  .sort((a, b) => a.sequenceNo - b.sequenceNo)
                  .map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400">
                        {assignment.sequenceNo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {assignment.storeName}
                          </p>
                          {getOrderStatusBadge(assignment.status)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Order #{assignment.orderId}
                        </p>
                        {(assignment.storeAddressLine1 || assignment.storeAddressLine2 || assignment.storeBarangay || assignment.storeCity) && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {assignment.storeAddressLine1 && <span className="block">{assignment.storeAddressLine1}</span>}
                            {assignment.storeAddressLine2 && <span className="block">{assignment.storeAddressLine2}</span>}
                            {assignment.storeBarangay &&
                              `${assignment.storeBarangay}, `}
                            {assignment.storeCity}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(assignment.orderTotal || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
