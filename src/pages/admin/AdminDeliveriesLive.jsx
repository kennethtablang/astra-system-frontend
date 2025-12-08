// src/pages/admin/AdminDeliveriesLive.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Navigation,
  MapPin,
  Truck,
  User,
  Clock,
  Package,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/Loading";
import tripService from "../../services/tripService";
import deliveryService from "../../services/deliveryService";
import { toast } from "react-hot-toast";

const AdminDeliveriesLive = () => {
  const navigate = useNavigate();

  const [activeTrips, setActiveTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchActiveTrips();

    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchActiveTrips(true);
      }, 30000); // Update every 30 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh]);

  const fetchActiveTrips = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const result = await tripService.getActiveTrips();

      if (result.success) {
        const trips = result.data || [];

        // Fetch tracking data for each active trip
        const tripsWithTracking = await Promise.all(
          trips.map(async (trip) => {
            try {
              const trackingResult = await deliveryService.getLiveTripTracking(
                trip.id
              );
              return {
                ...trip,
                tracking: trackingResult.success ? trackingResult.data : null,
              };
            } catch (error) {
              console.error(
                `Error fetching tracking for trip ${trip.id}:`,
                error
              );
              return { ...trip, tracking: null };
            }
          })
        );

        setActiveTrips(tripsWithTracking);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch active trips:", error);
      if (!silent) {
        toast.error("Failed to load active trips");
      }
    } finally {
      setLoading(false);
    }
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

  const getStatusBadge = (status) => {
    const statusMap = {
      Started: { variant: "info", label: "Started" },
      InProgress: { variant: "warning", label: "In Progress" },
    };
    const config = statusMap[status] || { variant: "default", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStopStatusIcon = (status) => {
    const icons = {
      Dispatched: <Clock className="h-4 w-4 text-gray-400" />,
      InTransit: <Navigation className="h-4 w-4 text-blue-600" />,
      AtStore: <MapPin className="h-4 w-4 text-orange-600" />,
      Delivered: <CheckCircle className="h-4 w-4 text-green-600" />,
    };
    return icons[status] || <Package className="h-4 w-4 text-gray-400" />;
  };

  const calculateProgress = (tracking) => {
    if (!tracking || tracking.totalStops === 0) return 0;
    return Math.round((tracking.completedStops / tracking.totalStops) * 100);
  };

  const getCurrentStop = (tracking) => {
    if (!tracking || !tracking.stops) return null;
    return tracking.stops.find(
      (s) => s.status === "InTransit" || s.status === "AtStore"
    );
  };

  const getTotalStats = () => {
    const stats = {
      totalTrips: activeTrips.length,
      totalStops: 0,
      completedStops: 0,
      activeDispatchers: new Set(),
    };

    activeTrips.forEach((trip) => {
      if (trip.tracking) {
        stats.totalStops += trip.tracking.totalStops || 0;
        stats.completedStops += trip.tracking.completedStops || 0;
      }
      if (trip.dispatcherId) {
        stats.activeDispatchers.add(trip.dispatcherId);
      }
    });

    return {
      ...stats,
      activeDispatchers: stats.activeDispatchers.size,
    };
  };

  const stats = getTotalStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/deliveries")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Live Delivery Tracking
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Real-time monitoring of active deliveries • Last update:{" "}
                {getTimeAgo(lastUpdate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchActiveTrips()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Active Trips
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalTrips}
                  </p>
                </div>
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Active Dispatchers
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.activeDispatchers}
                  </p>
                </div>
                <User className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Stops
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalStops}
                  </p>
                </div>
                <Package className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.completedStops}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Trips */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : activeTrips.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                No Active Trips
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                There are no delivery trips in progress at the moment
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeTrips.map((trip) => {
              const tracking = trip.tracking;
              const progress = calculateProgress(tracking);
              const currentStop = getCurrentStop(tracking);

              return (
                <Card key={trip.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Trip Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              Trip #{trip.id}
                            </h3>
                            {getStatusBadge(trip.status)}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {trip.warehouseName}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/trips/${trip.id}/track`)
                          }
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Track
                        </Button>
                      </div>

                      {/* Dispatcher Info */}
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {tracking?.dispatcherName ||
                              trip.dispatcherName ||
                              "Unassigned"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {tracking?.vehicle ||
                              trip.vehicle ||
                              "No vehicle assigned"}
                          </p>
                        </div>
                      </div>

                      {/* Progress */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Progress: {tracking?.completedStops || 0} of{" "}
                            {tracking?.totalStops || 0} stops
                          </span>
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Location Info */}
                      {tracking && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          {tracking.currentLatitude &&
                          tracking.currentLongitude ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  Last Known Location
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Lat: {tracking.currentLatitude.toFixed(6)}, Lng:{" "}
                                {tracking.currentLongitude.toFixed(6)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                Updated:{" "}
                                {getTimeAgo(tracking.lastLocationUpdate)}
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-sm">
                                Location not available
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Current Stop */}
                      {currentStop && (
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-semibold text-sm">
                              {currentStop.sequenceNo}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  Current Stop
                                </span>
                                {getStopStatusIcon(currentStop.status)}
                              </div>
                              <p className="text-sm text-gray-900 dark:text-white">
                                {currentStop.storeName}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Order #{currentStop.orderId}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Next Stops */}
                      {tracking && tracking.stops && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Upcoming Stops
                          </h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {tracking.stops
                              .filter(
                                (s) =>
                                  s.status === "Dispatched" ||
                                  (s.status !== "Delivered" &&
                                    s.orderId !== currentStop?.orderId)
                              )
                              .slice(0, 3)
                              .map((stop) => (
                                <div
                                  key={stop.orderId}
                                  className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm"
                                >
                                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-medium">
                                    {stop.sequenceNo}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-white truncate">
                                      {stop.storeName}
                                    </p>
                                  </div>
                                  {getStopStatusIcon(stop.status)}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDeliveriesLive;
