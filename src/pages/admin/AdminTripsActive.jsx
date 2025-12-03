import { useState, useEffect } from "react";
import {
  Navigation,
  MapPin,
  User,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  TrendingUp,
  Loader2,
  RefreshCw,
  Eye,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";

// UI Components
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 transition-colors ${className}`}
  >
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

const Badge = ({ children, variant = "default", className = "" }) => {
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
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  className = "",
}) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline:
      "border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium rounded-lg focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

const LoadingSpinner = ({ size = "md" }) => {
  const sizes = { md: "h-8 w-8", lg: "h-12 w-12" };
  return <Loader2 className={`animate-spin text-blue-600 ${sizes[size]}`} />;
};

// Mock API
const mockApi = {
  getActiveTrips: async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      success: true,
      data: [
        {
          id: 1,
          warehouseName: "Main Warehouse",
          dispatcherName: "Juan Dela Cruz",
          dispatcherPhone: "09123456789",
          vehicle: "ABC-1234",
          departureAt: new Date("2024-12-04T08:00:00"),
          totalStops: 12,
          completedStops: 7,
          currentLocation: "Meycauayan, Bulacan",
          lastUpdate: new Date("2024-12-04T14:30:00"),
          estimatedCompletion: new Date("2024-12-04T17:00:00"),
          stops: [
            {
              id: 101,
              storeName: "Sari-Sari Store 1",
              status: "Delivered",
              deliveredAt: new Date("2024-12-04T09:15:00"),
            },
            {
              id: 102,
              storeName: "Mini Mart Express",
              status: "Delivered",
              deliveredAt: new Date("2024-12-04T09:45:00"),
            },
            {
              id: 103,
              storeName: "Corner Store",
              status: "Delivered",
              deliveredAt: new Date("2024-12-04T10:30:00"),
            },
            {
              id: 104,
              storeName: "Lucky Store",
              status: "Delivered",
              deliveredAt: new Date("2024-12-04T11:00:00"),
            },
            {
              id: 105,
              storeName: "Sunshine Mart",
              status: "Delivered",
              deliveredAt: new Date("2024-12-04T12:15:00"),
            },
            {
              id: 106,
              storeName: "Quick Shop",
              status: "Delivered",
              deliveredAt: new Date("2024-12-04T13:00:00"),
            },
            {
              id: 107,
              storeName: "Happy Store",
              status: "Delivered",
              deliveredAt: new Date("2024-12-04T14:00:00"),
            },
            {
              id: 108,
              storeName: "Golden Mart",
              status: "InTransit",
              deliveredAt: null,
            },
            {
              id: 109,
              storeName: "Star Store",
              status: "Pending",
              deliveredAt: null,
            },
            {
              id: 110,
              storeName: "Royal Shop",
              status: "Pending",
              deliveredAt: null,
            },
            {
              id: 111,
              storeName: "Premier Store",
              status: "Pending",
              deliveredAt: null,
            },
            {
              id: 112,
              storeName: "Elite Mart",
              status: "Pending",
              deliveredAt: null,
            },
          ],
        },
        {
          id: 2,
          warehouseName: "North Warehouse",
          dispatcherName: "Maria Santos",
          dispatcherPhone: "09187654321",
          vehicle: "XYZ-5678",
          departureAt: new Date("2024-12-04T10:00:00"),
          totalStops: 8,
          completedStops: 3,
          currentLocation: "Marilao, Bulacan",
          lastUpdate: new Date("2024-12-04T14:00:00"),
          estimatedCompletion: new Date("2024-12-04T16:30:00"),
          stops: [
            {
              id: 201,
              storeName: "Fresh Market",
              status: "Delivered",
              deliveredAt: new Date("2024-12-04T11:00:00"),
            },
            {
              id: 202,
              storeName: "Daily Needs",
              status: "Delivered",
              deliveredAt: new Date("2024-12-04T12:00:00"),
            },
            {
              id: 203,
              storeName: "Grocery Plus",
              status: "Delivered",
              deliveredAt: new Date("2024-12-04T13:30:00"),
            },
            {
              id: 204,
              storeName: "Super Store",
              status: "InTransit",
              deliveredAt: null,
            },
            {
              id: 205,
              storeName: "Mega Mart",
              status: "Pending",
              deliveredAt: null,
            },
            {
              id: 206,
              storeName: "Value Shop",
              status: "Pending",
              deliveredAt: null,
            },
            {
              id: 207,
              storeName: "Best Buy Store",
              status: "Pending",
              deliveredAt: null,
            },
            {
              id: 208,
              storeName: "Top Choice",
              status: "Pending",
              deliveredAt: null,
            },
          ],
        },
        {
          id: 3,
          warehouseName: "South Warehouse",
          dispatcherName: "Pedro Reyes",
          dispatcherPhone: "09156789012",
          vehicle: "DEF-9012",
          departureAt: new Date("2024-12-04T07:30:00"),
          totalStops: 10,
          completedStops: 9,
          currentLocation: "Bocaue, Bulacan",
          lastUpdate: new Date("2024-12-04T14:45:00"),
          estimatedCompletion: new Date("2024-12-04T15:30:00"),
          stops: [
            {
              id: 301,
              storeName: "Community Store",
              status: "Delivered",
              deliveredAt: new Date("2024-12-04T08:30:00"),
            },
            {
              id: 302,
              storeName: "Neighborhood Mart",
              status: "Delivered",
              deliveredAt: new Date("2024-12-04T09:00:00"),
            },
            {
              id: 303,
              storeName: "Local Shop",
              status: "Delivered",
              deliveredAt: new Date("2024-12-04T10:00:00"),
            },
            {
              id: 304,
              storeName: "Town Store",
              status: "Delivered",
              deliveredAt: new Date("2024-12-04T11:15:00"),
            },
            {
              id: 305,
              storeName: "Village Mart",
              status: "Delivered",
              deliveredAt: new Date("2024-12-04T12:00:00"),
            },
            {
              id: 306,
              storeName: "District Shop",
              status: "Delivered",
              deliveredAt: new Date("2024-12-04T12:45:00"),
            },
            {
              id: 307,
              storeName: "Area Store",
              status: "Delivered",
              deliveredAt: new Date("2024-12-04T13:30:00"),
            },
            {
              id: 308,
              storeName: "Zone Mart",
              status: "Delivered",
              deliveredAt: new Date("2024-12-04T14:00:00"),
            },
            {
              id: 309,
              storeName: "Block Store",
              status: "Delivered",
              deliveredAt: new Date("2024-12-04T14:30:00"),
            },
            {
              id: 310,
              storeName: "Final Stop Shop",
              status: "InTransit",
              deliveredAt: null,
            },
          ],
        },
      ],
    };
  },
};

const AdminTripsActive = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchActiveTrips();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchActiveTrips();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchActiveTrips = async () => {
    try {
      setLoading(true);
      const { data } = await mockApi.getActiveTrips();
      if (data) {
        setTrips(data || []);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch active trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStopStatusBadge = (status) => {
    const statusMap = {
      Delivered: { variant: "success", icon: CheckCircle },
      InTransit: { variant: "warning", icon: Navigation },
      Pending: { variant: "default", icon: Clock },
      Failed: { variant: "danger", icon: AlertCircle },
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

  const getProgressPercentage = (completed, total) => {
    return Math.round((completed / total) * 100);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Calculate overall stats
  const stats = {
    totalTrips: trips.length,
    totalStops: trips.reduce((sum, t) => sum + t.totalStops, 0),
    completedStops: trips.reduce((sum, t) => sum + t.completedStops, 0),
    activeDispatchers: trips.length,
  };

  const overallProgress =
    stats.totalStops > 0
      ? Math.round((stats.completedStops / stats.totalStops) * 100)
      : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Active Trips
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time monitoring of ongoing deliveries
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {getTimeAgo(lastRefresh)}
            </div>
            <Button
              onClick={fetchActiveTrips}
              className="flex items-center gap-2"
              size="sm"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
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
                <Navigation className="h-8 w-8 text-blue-600" />
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
                    Completed Stops
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.completedStops}/{stats.totalStops}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Overall Progress
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overallProgress}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Trips List */}
        {loading ? (
          <Card>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            </CardContent>
          </Card>
        ) : trips.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No active trips
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  All trips have been completed or no trips are in progress
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => {
              const progress = getProgressPercentage(
                trip.completedStops,
                trip.totalStops
              );
              const currentStop = trip.stops.find(
                (s) => s.status === "InTransit"
              );

              return (
                <Card key={trip.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Trip Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                            <Navigation className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              Trip #{trip.id}
                            </h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {trip.dispatcherName}
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {trip.dispatcherPhone}
                              </div>
                              <div className="flex items-center gap-1">
                                <Package className="h-4 w-4" />
                                {trip.vehicle}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="info" className="mb-2">
                            In Progress
                          </Badge>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Started: {formatTime(trip.departureAt)}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Progress: {trip.completedStops} of {trip.totalStops}{" "}
                            stops
                          </span>
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
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

                      {/* Current Location & Status */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Current Location
                          </div>
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                            <MapPin className="h-4 w-4 text-red-500" />
                            {trip.currentLocation}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Updated {getTimeAgo(trip.lastUpdate)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Current Stop
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {currentStop
                              ? currentStop.storeName
                              : "Between stops"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Est. completion:{" "}
                            {formatTime(trip.estimatedCompletion)}
                          </div>
                        </div>
                      </div>

                      {/* Recent Stops */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Delivery Progress
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View All
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {trip.stops.slice(0, 5).map((stop, index) => (
                            <div
                              key={stop.id}
                              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {stop.storeName}
                                  </div>
                                  {stop.deliveredAt && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Delivered at{" "}
                                      {formatTime(stop.deliveredAt)}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {getStopStatusBadge(stop.status)}
                            </div>
                          ))}
                          {trip.stops.length > 5 && (
                            <div className="text-center">
                              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                Show {trip.stops.length - 5} more stops
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <Button variant="outline" size="sm">
                          Contact Dispatcher
                        </Button>
                        <Button size="sm" className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Track Live
                        </Button>
                      </div>
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

export default AdminTripsActive;
