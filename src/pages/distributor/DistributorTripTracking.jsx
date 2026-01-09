// src/pages/distributor/DistributorTripTracking.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Navigation,
    MapPin,
    CheckCircle,
    Clock,
    AlertCircle,
    User,
    Truck,
    Package,
    RefreshCw,
    Phone,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/Loading";
import deliveryService from "../../services/deliveryService";
import tripService from "../../services/tripService";
import { toast } from "react-hot-toast";

const DistributorTripTracking = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const intervalRef = useRef(null);

    useEffect(() => {
        fetchTrackingData();

        if (autoRefresh) {
            intervalRef.current = setInterval(() => {
                fetchTrackingData(true);
            }, 10000); // Update every 10 seconds
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [id, autoRefresh]);

    const fetchTrackingData = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const result = await deliveryService.getLiveTripTracking(id);

            if (result.success) {
                setTrackingData(result.data);
                setLastUpdate(new Date());
            } else {
                toast.error("Failed to load tracking data");
            }
        } catch (error) {
            console.error("Error fetching tracking data:", error);
            if (!silent) {
                toast.error("Error loading tracking data");
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            Pending: { variant: "default", icon: Clock, label: "Pending" },
            Dispatched: { variant: "info", icon: Navigation, label: "Dispatched" },
            InTransit: { variant: "warning", icon: Navigation, label: "In Transit" },
            AtStore: { variant: "info", icon: MapPin, label: "At Store" },
            Delivered: { variant: "success", icon: CheckCircle, label: "Delivered" },
            Failed: { variant: "danger", icon: AlertCircle, label: "Failed" },
        };
        const config = statusMap[status] || statusMap.Pending;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
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

    const getProgressPercentage = () => {
        if (!trackingData) return 0;
        if (trackingData.totalStops === 0) return 0;
        return Math.round(
            (trackingData.completedStops / trackingData.totalStops) * 100
        );
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <LoadingSpinner size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    if (!trackingData) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Tracking data not available
                    </h3>
                    <Button onClick={() => navigate("/distributor/trips")} className="mt-4">
                        Back to Trips
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    const progress = getProgressPercentage();
    const currentStop = trackingData.stops?.find(
        (s) => s.status === "InTransit" || s.status === "AtStore"
    );
    const nextStops = trackingData.stops
        ?.filter((s) => s.status === "Pending" || s.status === "Dispatched")
        .slice(0, 3);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/distributor/trips/${id}`)}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Live Trip Tracking
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Trip #{trackingData.tripId} • Last update:{" "}
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
                            onClick={() => fetchTrackingData()}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Dispatcher
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {trackingData.dispatcherName}
                                    </p>
                                </div>
                                <User className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Vehicle
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {trackingData.vehicle || "N/A"}
                                    </p>
                                </div>
                                <Truck className="h-8 w-8 text-green-600" />
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
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {trackingData.completedStops} / {trackingData.totalStops}
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
                                        Progress
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {progress}%
                                    </p>
                                </div>
                                <Navigation className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Progress Bar */}
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Delivery Progress: {trackingData.completedStops} of{" "}
                                    {trackingData.totalStops} stops
                                </span>
                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                    {progress}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Map Placeholder */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Live Location
                            </h3>

                            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
                                {trackingData.currentLatitude &&
                                    trackingData.currentLongitude ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                        <MapPin className="h-16 w-16 text-blue-600 mb-4 animate-bounce" />
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Current Location
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                            Latitude: {trackingData.currentLatitude.toFixed(6)}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            Longitude: {trackingData.currentLongitude.toFixed(6)}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                            Last updated:{" "}
                                            {getTimeAgo(trackingData.lastLocationUpdate)}
                                        </p>
                                        <div className="mt-4">
                                            <a
                                                href={`https://www.google.com/maps?q=${trackingData.currentLatitude},${trackingData.currentLongitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <Navigation className="h-4 w-4" />
                                                View on Google Maps
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Location data not available
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                            Dispatcher hasn't shared location yet
                                        </p>
                                    </div>
                                )}
                            </div>

                            {trackingData.lastLocationUpdate && (
                                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-blue-600" />
                                        <span className="text-gray-700 dark:text-gray-300">
                                            Last location update:{" "}
                                            {new Date(
                                                trackingData.lastLocationUpdate
                                            ).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Current & Next Stops */}
                    <div className="space-y-6">
                        {/* Current Stop */}
                        {currentStop && (
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Current Stop
                                    </h3>

                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                                                <span className="text-white font-semibold">
                                                    {currentStop.sequenceNo}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        Order #{currentStop.orderId}
                                                    </span>
                                                    {getStatusBadge(currentStop.status)}
                                                </div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {currentStop.storeName}
                                                </p>
                                                {currentStop.deliveredAt && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        Delivered:{" "}
                                                        {new Date(
                                                            currentStop.deliveredAt
                                                        ).toLocaleTimeString()}
                                                    </p>
                                                )}
                                                {currentStop.hasException && (
                                                    <div className="mt-2 flex items-center gap-2 text-yellow-700 dark:text-yellow-300 text-sm">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>Has delivery exception</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Next Stops */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Upcoming Stops
                                </h3>

                                {nextStops && nextStops.length > 0 ? (
                                    <div className="space-y-3">
                                        {nextStops.map((stop) => (
                                            <div
                                                key={stop.orderId}
                                                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                            >
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                                                        {stop.sequenceNo}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            Order #{stop.orderId}
                                                        </span>
                                                        {getStatusBadge(stop.status)}
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {stop.storeName}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-3" />
                                        <p className="text-gray-600 dark:text-gray-400">
                                            No more stops remaining
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* All Stops List */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            All Stops ({trackingData.stops?.length || 0})
                        </h3>

                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {trackingData.stops && trackingData.stops.length > 0 ? (
                                trackingData.stops.map((stop) => (
                                    <div
                                        key={stop.orderId}
                                        className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${stop.status === "Delivered"
                                                ? "bg-green-50 dark:bg-green-900/20"
                                                : stop.status === "InTransit" ||
                                                    stop.status === "AtStore"
                                                    ? "bg-blue-50 dark:bg-blue-900/20"
                                                    : "bg-gray-50 dark:bg-gray-700"
                                            }`}
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                            <span className="text-gray-700 dark:text-gray-300 font-semibold">
                                                {stop.sequenceNo}
                                            </span>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    Order #{stop.orderId}
                                                </span>
                                                {getStatusBadge(stop.status)}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {stop.storeName}
                                            </p>
                                            {stop.deliveredAt && (
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                    Delivered:{" "}
                                                    {new Date(stop.deliveredAt).toLocaleString()}
                                                </p>
                                            )}
                                        </div>

                                        {stop.hasException && (
                                            <div className="flex-shrink-0">
                                                <AlertCircle className="h-5 w-5 text-yellow-600" />
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400">
                                        No stops available
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default DistributorTripTracking;
