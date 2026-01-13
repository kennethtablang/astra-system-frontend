// src/pages/dispatcher/DispatcherDeliveries.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  MapPin,
  Phone,
  Navigation,
  Clock,
  CheckCircle,
  AlertCircle,
  Camera,
  User,
  Truck,
  RefreshCw,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/Loading";
import { useAuth } from "../../contexts/AuthContext";
import tripService from "../../services/tripService";
import deliveryService from "../../services/deliveryService";
import { toast } from "react-hot-toast";

// Fix for Leaflet default icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom Icons
const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3603/3603850.png", // Example user/truck icon
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const storeIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png", // Example store icon
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const DispatcherDeliveries = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTrip, setActiveTrip] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationSharing, setLocationSharing] = useState(false);
  const [lastLocationUpdate, setLastLocationUpdate] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [arrivedAtStore, setArrivedAtStore] = useState(false);

  useEffect(() => {
    fetchMyActiveTrips();
  }, [user]);

  const fetchMyActiveTrips = async () => {
    try {
      setLoading(true);

      const userId = user?.userId || user?.UserId || user?.id;

      if (!userId) {
        toast.error("User information not available");
        return;
      }

      const result = await tripService.getActiveTrips(userId);

      if (result.success && result.data && result.data.length > 0) {
        // Get the first active trip (assuming one trip at a time per dispatcher)
        const trip = result.data[0];
        setActiveTrip(trip);

        // Fetch tracking data
        const trackingResult = await deliveryService.getLiveTripTracking(trip.id);
        if (trackingResult.success) {
          setTracking(trackingResult.data);
        }
      } else {
        setActiveTrip(null);
        setTracking(null);
      }
    } catch (error) {
      console.error("Failed to fetch active trips:", error);
      toast.error("Failed to load your deliveries");
    } finally {
      setLoading(false);
    }
  };

  const startLocationSharing = async () => {
    // Initial location fetch for map even before sharing is started
    deliveryService.getCurrentLocation()
      .then(loc => setCurrentLocation(loc))
      .catch(err => console.log("Init location error", err));

    if (!activeTrip) {
      toast.error("No active trip to share location for");
      return;
    }

    try {
      const location = await deliveryService.getCurrentLocation();

      const result = await deliveryService.updateLocation({
        tripId: activeTrip.id,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: location.timestamp,
        speed: location.speed,
        accuracy: location.accuracy,
      });

      if (result.success) {
        setLocationSharing(true);
        setLastLocationUpdate(new Date());
        toast.success("Location sharing started");

        // Start periodic location updates
        startLocationTracking();
      } else {
        toast.error("Failed to start location sharing");
      }
    } catch (error) {
      console.error("Error starting location sharing:", error);
      toast.error("Unable to access location. Please enable location services.");
    }
  };

  const startLocationTracking = () => {
    const stopTracking = deliveryService.startLocationTracking(
      activeTrip.id,
      (result) => {
        if (result.success) {
          setLastLocationUpdate(new Date());
        } else {
          console.error("Location update failed:", result.error);
        }

        // Update local state for map and geofencing
        if (result.location) {
          setCurrentLocation({
            latitude: result.location.latitude,
            longitude: result.location.longitude
          });

          // Check Geofence
          const currentStop = getCurrentStop();
          if (currentStop) {
            checkGeofence(
              result.location.latitude,
              result.location.longitude,
              currentStop.storeLatitude,
              currentStop.storeLongitude,
              currentStop.storeName
            );
          }
        }
      },
      5000 // Update every 5 seconds for smoother tracking/geofencing
    );

    // Store stop function to call on component unmount
    return stopTracking;
  };

  const stopLocationSharing = () => {
    setLocationSharing(false);
    toast.info("Location sharing stopped");
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Dispatched: { variant: "default", icon: Clock, label: "Dispatched" },
      InTransit: { variant: "warning", icon: Navigation, label: "In Transit" },
      AtStore: { variant: "info", icon: MapPin, label: "At Store" },
      Delivered: { variant: "success", icon: CheckCircle, label: "Delivered" },
    };
    const config = statusMap[status] || statusMap.Dispatched;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const checkGeofence = (lat, lng, storeLat, storeLng, storeName) => {
    if (!storeLat || !storeLng) return;

    if (deliveryService.isNearStore(lat, lng, storeLat, storeLng)) {
      if (!arrivedAtStore) { // Check state to prevent spamming
        setArrivedAtStore(true);
        toast.success(`You have arrived at ${storeName}!`, {
          duration: 5000,
          icon: "📍"
        });
      }
    } else {
      setArrivedAtStore(false); // Reset if they leave the area
    }
  };

  const getCurrentStop = () => {
    if (!tracking || !tracking.stops) return null;
    return tracking.stops.find(
      (s) => s.status === "InTransit" || s.status === "AtStore"
    );
  };

  const getNextStops = () => {
    if (!tracking || !tracking.stops) return [];
    const currentStop = getCurrentStop();
    return tracking.stops
      .filter(
        (s) =>
          (s.status === "Dispatched" || s.status === "InTransit") &&
          s.orderId !== currentStop?.orderId
      )
      .slice(0, 3);
  };

  const getCompletedStops = () => {
    if (!tracking || !tracking.stops) return [];
    return tracking.stops.filter((s) => s.status === "Delivered");
  };

  const calculateProgress = () => {
    if (!tracking || tracking.totalStops === 0) return 0;
    return Math.round((tracking.completedStops / tracking.totalStops) * 100);
  };

  const getTimeAgo = (date) => {
    if (!date) return "Never";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const currentStop = getCurrentStop();
  const nextStops = getNextStops();
  const completedStops = getCompletedStops();
  const progress = calculateProgress();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Deliveries
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your current delivery route
            </p>
          </div>
          <div className="flex gap-2">
             {activeTrip && (
                 <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                        try {
                            // Call optimize endpoint
                            const result = await tripService.optimizeTrip(activeTrip.id);
                            if(result.success) {
                                toast.success("Route optimized!");
                                fetchMyActiveTrips(); // Refresh to get new sequence
                            } else {
                                toast.error(result.message || "Optimization failed");
                            }
                        } catch(err) {
                            console.error(err);
                            toast.error("Failed to optimize");
                        }
                    }}
                    className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Navigation className="h-4 w-4" />
                    Optimize Route
                  </Button>
             )}
            <Button
                variant="outline"
                size="sm"
                onClick={fetchMyActiveTrips}
                className="flex items-center gap-2"
            >
                <RefreshCw className="h-4 w-4" />
                Refresh
            </Button>
          </div>
        </div>

        {/* Map Section */}
        {activeTrip && (
          <Card>
            <CardContent className="p-0 h-[300px] relative z-0">
              {currentLocation ? (
                <MapContainer
                  center={[currentLocation.latitude, currentLocation.longitude]}
                  zoom={15}
                  style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {/* User Marker */}
                  <Marker position={[currentLocation.latitude, currentLocation.longitude]} icon={userIcon}>
                    <Popup>Your Location</Popup>
                  </Marker>

                  {/* Current Stop Marker */}
                  {currentStop && currentStop.storeLatitude && currentStop.storeLongitude && (
                    <Marker
                      position={[currentStop.storeLatitude, currentStop.storeLongitude]}
                      icon={storeIcon}
                    >
                      <Popup>
                        <b>{currentStop.storeName}</b><br />
                        Stop #{currentStop.sequenceNo}
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <LoadingSpinner size="md" />
                    <p className="mt-2 text-sm text-gray-500">Acquiring GPS location...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : !activeTrip ? (
          <Card>
            <CardContent className="text-center py-12">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                No Active Trip
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                You don't have any active deliveries at the moment
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Trip Info & Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trip Details */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Trip #{activeTrip.id}
                    </h3>
                    <Badge variant="info">{activeTrip.status}</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {activeTrip.warehouseName}
                      </span>
                    </div>
                    {activeTrip.vehicle && (
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {activeTrip.vehicle}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {user?.fullName}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Progress
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {tracking?.completedStops || 0} of{" "}
                          {tracking?.totalStops || 0} stops
                        </span>
                        <span className="text-sm font-semibold text-blue-600">
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        <p className="text-2xl font-bold text-green-600">
                          {completedStops.length}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Completed
                        </p>
                      </div>
                      <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <p className="text-2xl font-bold text-blue-600">
                          {nextStops.length}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Remaining
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location Sharing */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Location Sharing
                  </h3>
                  <div className="space-y-3">
                    {locationSharing ? (
                      <>
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-sm text-green-800 dark:text-green-200">
                            Location sharing active
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Last update: {getTimeAgo(lastLocationUpdate)}
                        </p>
                        <Button
                          variant="outline"
                          onClick={stopLocationSharing}
                          className="w-full"
                        >
                          Stop Sharing
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                          <span className="text-sm text-yellow-800 dark:text-yellow-200">
                            Location sharing off
                          </span>
                        </div>
                        <Button onClick={startLocationSharing} className="w-full">
                          <Navigation className="h-4 w-4 mr-2" />
                          Start Sharing Location
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Stop */}
            {currentStop && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Current Stop
                    </h3>
                    {getStatusBadge(currentStop.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Store Name
                        </p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {currentStop.storeName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Order Number
                        </p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          #{currentStop.orderId}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Sequence
                        </p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          Stop {currentStop.sequenceNo} of {tracking?.totalStops}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Button
                        onClick={() =>
                          navigate(`/dispatcher/deliveries/${currentStop.orderId}`)
                        }
                        className="w-full"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (currentStop.storeLatitude && currentStop.storeLongitude) {
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&destination=${currentStop.storeLatitude},${currentStop.storeLongitude}`,
                              "_blank"
                            );
                          } else {
                            // Fallback to search query
                            window.open(
                              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                currentStop.storeName
                              )}`,
                              "_blank"
                            );
                          }
                        }}
                        className="w-full"
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Get Directions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Stops */}
            {nextStops.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Upcoming Stops
                  </h3>
                  <div className="space-y-3">
                    {nextStops.map((stop) => (
                      <div
                        key={stop.orderId}
                        onClick={() =>
                          navigate(`/dispatcher/deliveries/${stop.orderId}`)
                        }
                        className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">
                            {stop.sequenceNo}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {stop.storeName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Order #{stop.orderId}
                          </p>
                        </div>
                        {getStatusBadge(stop.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Completed Stops */}
            {completedStops.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Completed Stops ({completedStops.length})
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {completedStops.map((stop) => (
                      <div
                        key={stop.orderId}
                        className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                      >
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {stop.storeName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Order #{stop.orderId}
                          </p>
                        </div>
                        {stop.deliveredAt && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(stop.deliveredAt).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DispatcherDeliveries;