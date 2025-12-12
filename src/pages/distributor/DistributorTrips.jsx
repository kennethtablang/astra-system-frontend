// src/pages/distributor/DistributorTrips.jsx
import { useState, useEffect } from "react";
import {
    Truck,
    Search,
    Clock,
    CheckCircle,
    MapPin,
    User,
    Calendar,
    Package,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Select } from "../../components/ui/Select";
import { LoadingSpinner } from "../../components/ui/Loading";
import tripService from "../../services/tripService";
import { toast } from "react-hot-toast";

const DistributorTrips = () => {
    const [loading, setLoading] = useState(true);
    const [trips, setTrips] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchTrips();
    }, [statusFilter]);

    const fetchTrips = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter !== "all") {
                params.status = statusFilter;
            }

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

    const getStatusBadge = (status) => {
        const statusMap = {
            Pending: { variant: "warning", icon: Clock },
            InProgress: { variant: "info", icon: Truck },
            Completed: { variant: "success", icon: CheckCircle },
            Cancelled: { variant: "danger", icon: null },
        };
        return statusMap[status] || { variant: "default", icon: null };
    };

    const filteredTrips = trips.filter((trip) =>
        trip.tripNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.dispatcherName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusOptions = [
        { value: "all", label: "All Status" },
        { value: "Pending", label: "Pending" },
        { value: "InProgress", label: "In Progress" },
        { value: "Completed", label: "Completed" },
        { value: "Cancelled", label: "Cancelled" },
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
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Trips Overview
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        View and track delivery trips
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Truck className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {trips.length}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Trips</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                    <Clock className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {trips.filter((t) => t.status === "Pending").length}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Pending</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <Truck className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {trips.filter((t) => t.status === "InProgress").length}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">In Progress</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {trips.filter((t) => t.status === "Completed").length}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-3">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by trip number or dispatcher..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                options={statusOptions}
                                className="w-40"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Trips Table */}
                <Card>
                    <CardContent className="p-0">
                        {filteredTrips.length === 0 ? (
                            <div className="text-center py-12">
                                <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    No trips found
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">
                                    Try adjusting your filters
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableHead>Trip #</TableHead>
                                        <TableHead>Dispatcher</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Orders</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTrips.map((trip) => {
                                            const statusInfo = getStatusBadge(trip.status);
                                            return (
                                                <TableRow key={trip.id}>
                                                    <TableCell>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {trip.tripNumber || `TRIP-${trip.id}`}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-gray-400" />
                                                            <span>{trip.dispatcherName || "Unassigned"}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                            <Calendar className="h-4 w-4" />
                                                            {new Date(trip.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Package className="h-4 w-4 text-gray-400" />
                                                            <span>{trip.orderCount || 0} orders</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={statusInfo.variant}>
                                                            {trip.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default DistributorTrips;
