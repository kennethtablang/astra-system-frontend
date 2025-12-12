// src/pages/dispatcher/DispatcherTrips.jsx
import { useState, useEffect } from "react";
import {
    Truck,
    Search,
    Clock,
    CheckCircle,
    Play,
    MapPin,
    Package,
    Calendar,
    Navigation,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { LoadingSpinner } from "../../components/ui/Loading";
import tripService from "../../services/tripService";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const DispatcherTrips = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [trips, setTrips] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchTrips();
    }, [statusFilter]);

    const fetchTrips = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter !== "all") params.status = statusFilter;

            const result = await tripService.getTrips(params);
            if (result.success) {
                setTrips(result.data?.items || result.data || []);
            }
        } catch (error) {
            console.error("Error fetching trips:", error);
            toast.error("Failed to load trips");
        } finally {
            setLoading(false);
        }
    };

    const handleStartTrip = async (tripId) => {
        try {
            const result = await tripService.startTrip(tripId);
            if (result.success) {
                toast.success("Trip started!");
                fetchTrips();
            }
        } catch (error) {
            toast.error("Failed to start trip");
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            Pending: { variant: "warning", icon: Clock },
            InProgress: { variant: "info", icon: Truck },
            Completed: { variant: "success", icon: CheckCircle },
        };
        return statusMap[status] || { variant: "default", icon: null };
    };

    const statusOptions = [
        { value: "all", label: "All Trips" },
        { value: "Pending", label: "Pending" },
        { value: "InProgress", label: "In Progress" },
        { value: "Completed", label: "Completed" },
    ];

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            My Trips
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            View and manage your assigned trips
                        </p>
                    </div>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        options={statusOptions}
                        className="w-40"
                    />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-4 pb-4 text-center">
                            <p className="text-2xl font-bold text-orange-600">
                                {trips.filter((t) => t.status === "Pending").length}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Pending</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">
                                {trips.filter((t) => t.status === "InProgress").length}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">In Progress</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4 text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {trips.filter((t) => t.status === "Completed").length}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Trips List */}
                {trips.length === 0 ? (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    No trips assigned
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">
                                    You don't have any trips assigned yet
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {trips.map((trip) => {
                            const statusInfo = getStatusBadge(trip.status);
                            return (
                                <Card key={trip.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl ${trip.status === "InProgress"
                                                        ? "bg-blue-100 dark:bg-blue-900/30"
                                                        : "bg-gray-100 dark:bg-gray-800"
                                                    }`}>
                                                    <Truck className={`h-6 w-6 ${trip.status === "InProgress"
                                                            ? "text-blue-600"
                                                            : "text-gray-500"
                                                        }`} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                                        {trip.tripNumber || `Trip #${trip.id}`}
                                                    </h3>
                                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(trip.createdAt).toLocaleDateString()}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Package className="h-3 w-3" />
                                                            {trip.orderCount || 0} orders
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Badge variant={statusInfo.variant}>
                                                    {trip.status}
                                                </Badge>

                                                {trip.status === "Pending" && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleStartTrip(trip.id)}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <Play className="h-4 w-4" />
                                                        Start
                                                    </Button>
                                                )}

                                                {trip.status === "InProgress" && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => navigate("/dispatcher/deliveries")}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <Navigation className="h-4 w-4" />
                                                        View Deliveries
                                                    </Button>
                                                )}
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

export default DispatcherTrips;
