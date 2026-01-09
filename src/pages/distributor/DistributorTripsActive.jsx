// src/pages/distributor/DistributorTripsActive.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Navigation,
    MapPin,
    User,
    Package,
    Clock,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    RefreshCw,
    Eye,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/Loading";
import tripService from "../../services/tripService";
import { toast } from "react-hot-toast";

const DistributorTripsActive = () => {
    const navigate = useNavigate();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [autoRefresh] = useState(true);

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
            const result = await tripService.getActiveTrips();

            if (result.success) {
                setTrips(result.data || []);
                setLastRefresh(new Date());
            }
        } catch (error) {
            console.error("Failed to fetch active trips:", error);
            toast.error("Failed to load active trips");
        } finally {
            setLoading(false);
        }
    };

    const getStopStatusBadge = (status) => {
        const statusMap = {
            Delivered: { variant: "success", icon: CheckCircle },
            InTransit: { variant: "warning", icon: Navigation },
            AtStore: { variant: "info", icon: MapPin },
            Pending: { variant: "default", icon: Clock },
            Dispatched: { variant: "info", icon: Navigation },
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

    const getProgressPercentage = (assignments) => {
        if (!assignments || assignments.length === 0) return 0;
        const completed = assignments.filter(
            (a) => a.status === "Delivered" || a.status === "Completed"
        ).length;
        return Math.round((completed / assignments.length) * 100);
    };

    const formatTime = (date) => {
        if (!date) return "Not set";
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
        totalStops: trips.reduce((sum, t) => sum + (t.assignments?.length || 0), 0),
        completedStops: trips.reduce((sum, t) => {
            const completed =
                t.assignments?.filter((a) => a.status === "Delivered").length || 0;
            return sum + completed;
        }, 0),
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
                            const progress = getProgressPercentage(trip.assignments);
                            const completedStops =
                                trip.assignments?.filter((a) => a.status === "Delivered")
                                    .length || 0;
                            const totalStops = trip.assignments?.length || 0;
                            const currentStop = trip.assignments?.find(
                                (a) => a.status === "InTransit" || a.status === "AtStore"
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
                                                                {trip.dispatcherName || "Not assigned"}
                                                            </div>
                                                            {trip.vehicle && (
                                                                <div className="flex items-center gap-1">
                                                                    <Package className="h-4 w-4" />
                                                                    {trip.vehicle}
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="h-4 w-4" />
                                                                {trip.warehouseName}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Badge variant="info" className="mb-2">
                                                        {trip.status}
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
                                                        Progress: {completedStops} of {totalStops} stops
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

                                            {/* Current Stop */}
                                            {currentStop && (
                                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                        Current Stop
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {currentStop.storeName}
                                                        </div>
                                                        {getStopStatusBadge(currentStop.status)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {currentStop.storeBarangay &&
                                                            `${currentStop.storeBarangay}, `}
                                                        {currentStop.storeCity}
                                                    </div>
                                                </div>
                                            )}

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
                                                        onClick={() => navigate(`/distributor/trips/${trip.id}`)}
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                        View All
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    {trip.assignments
                                                        ?.slice(0, 5)
                                                        .map((assignment, index) => (
                                                            <div
                                                                key={assignment.id}
                                                                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
                                                                        {assignment.sequenceNo || index + 1}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                            {assignment.storeName}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                            Order #{assignment.orderId}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {getStopStatusBadge(assignment.status)}
                                                            </div>
                                                        ))}
                                                    {trip.assignments && trip.assignments.length > 5 && (
                                                        <div className="text-center">
                                                            <button
                                                                onClick={() =>
                                                                    navigate(`/distributor/trips/${trip.id}`)
                                                                }
                                                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                                            >
                                                                Show {trip.assignments.length - 5} more stops
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate(`/distributor/trips/${trip.id}`)}
                                                >
                                                    View Details
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="flex items-center gap-2"
                                                    onClick={() =>
                                                        navigate(`/distributor/trips/${trip.id}/track`)
                                                    }
                                                >
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

export default DistributorTripsActive;
