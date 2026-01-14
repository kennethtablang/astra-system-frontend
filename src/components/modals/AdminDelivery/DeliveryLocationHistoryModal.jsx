// src/components/modals/AdminDelivery/DeliveryLocationHistoryModal.jsx
import { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Navigation,
  Clock,
  TrendingUp,
  Activity,
  Calendar,
  User,
  Truck,
} from "lucide-react";
import { toast } from "react-hot-toast";
import deliveryService from "../../../services/deliveryService";
import { LoadingSpinner } from "../../ui/Loading";
import { Badge } from "../../ui/Badge";

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

export const DeliveryLocationHistoryModal = ({ isOpen, onClose, tripId }) => {
  const [tracking, setTracking] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    if (isOpen && tripId) {
      fetchLocationHistory();
    }
  }, [isOpen, tripId]);

  const fetchLocationHistory = async () => {
    try {
      setLoading(true);

      // Fetch tracking data
      const trackingResult = await deliveryService.getLiveTripTracking(tripId);
      if (trackingResult.success) {
        setTracking(trackingResult.data);
      }

      // Fetch location history from backend
      const historyResult = await deliveryService.getTripLocationHistory(tripId);
      if (historyResult.success) {
        setLocationHistory(historyResult.data);
      } else {
        setLocationHistory([]);
      }
    } catch (error) {
      console.error("Error fetching location history:", error);
      toast.error("Failed to load location history");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  };

  const formatTimeAgo = (date) => {
    if (!date) return "";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const openInMaps = (lat, lng) => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      "_blank"
    );
  };

  const calculateTotalDistance = () => {
    if (locationHistory.length < 2) return 0;

    let total = 0;
    for (let i = 1; i < locationHistory.length; i++) {
      const prev = locationHistory[i - 1];
      const curr = locationHistory[i];
      total += deliveryService.calculateDistance(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude
      );
    }
    return total.toFixed(2);
  };

  const calculateAverageSpeed = () => {
    if (locationHistory.length === 0) return 0;
    const sum = locationHistory.reduce((acc, loc) => acc + (loc.speed || 0), 0);
    return (sum / locationHistory.length).toFixed(1);
  };

  const getEventBadge = (event) => {
    const eventMap = {
      "Current Location": { variant: "info", icon: Navigation },
      "Stop Completed": { variant: "success", icon: MapPin },
      "In Transit": { variant: "warning", icon: Activity },
    };
    const config = eventMap[event] || { variant: "default", icon: MapPin };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {event}
      </Badge>
    );
  };

  if (!tripId) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Location History - Trip #${tripId}`}
      size="2xl"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Trip Summary */}
          {tracking && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {tracking.dispatcherName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {tracking.vehicle || "No vehicle assigned"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Last Update
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {tracking.lastLocationUpdate
                      ? formatTimeAgo(tracking.lastLocationUpdate)
                      : "No updates"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Distance
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {calculateTotalDistance()} km
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Avg Speed
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {calculateAverageSpeed()} km/h
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Location Updates
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {locationHistory.length}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Location Timeline */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              Location Timeline
            </h4>

            {locationHistory.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No location history available
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {locationHistory.map((location, index) => {
                  const isFirst = index === 0;
                  const isLast = index === locationHistory.length - 1;

                  return (
                    <div key={location.id} className="flex gap-4">
                      {/* Timeline indicator */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full ${isFirst
                              ? "bg-green-600"
                              : isLast
                                ? "bg-blue-600"
                                : "bg-gray-400"
                            }`}
                        />
                        {!isLast && (
                          <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 mt-1" />
                        )}
                      </div>

                      {/* Location details */}
                      <div
                        className={`flex-1 pb-4 ${selectedLocation?.id === location.id
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : ""
                          } p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
                        onClick={() => setSelectedLocation(location)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getEventBadge(location.event)}
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTimeAgo(location.timestamp)}
                              </span>
                            </div>

                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatDateTime(location.timestamp)}
                            </p>

                            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>
                                  {location.latitude.toFixed(6)},{" "}
                                  {location.longitude.toFixed(6)}
                                </span>
                              </div>
                              {location.speed > 0 && (
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  <span>{location.speed.toFixed(1)} km/h</span>
                                </div>
                              )}
                            </div>

                            {location.accuracy && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                Accuracy: ±{location.accuracy.toFixed(1)}m
                              </p>
                            )}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openInMaps(location.latitude, location.longitude);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Open in Google Maps"
                          >
                            <Navigation className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Location Details */}
          {selectedLocation && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Selected Location Details
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Timestamp</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDateTime(selectedLocation.timestamp)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Event</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedLocation.event}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Coordinates
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedLocation.latitude.toFixed(6)},{" "}
                    {selectedLocation.longitude.toFixed(6)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Speed</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedLocation.speed
                      ? `${selectedLocation.speed.toFixed(1)} km/h`
                      : "N/A"}
                  </p>
                </div>
              </div>
              <Button
                onClick={() =>
                  openInMaps(
                    selectedLocation.latitude,
                    selectedLocation.longitude
                  )
                }
                className="w-full mt-3"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Open in Google Maps
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
