// src/pages/dispatcher/DispatcherTrips.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Truck,
    Search,
    MapPin,
    Calendar,
    Package,
    DollarSign,
    FileText,
    Navigation,
    Play,
    Eye,
    CheckCircle,
    Clock,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { TripDetailsModal } from "../../components/modals/AdminTrip/TripDetailsModal";
import { UpdateTripStatusModal } from "../../components/modals/AdminTrip/UpdateTripStatusModal";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { LoadingSpinner } from "../../components/ui/Loading";
import tripService from "../../services/tripService";
import { toast } from "react-hot-toast";

const DispatcherTrips = () => {
    const navigate = useNavigate();

    // State
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalTrips, setTotalTrips] = useState(0);

    // Modals state
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);

    const [stats, setStats] = useState({
        totalTrips: 0,
        inProgress: 0,
        completed: 0,
        totalValue: 0,
    });

    useEffect(() => {
        fetchTrips();
    }, [currentPage, pageSize, filterStatus]);

    const fetchTrips = async () => {
        try {
            setLoading(true);
            const params = {
                pageNumber: currentPage,
                pageSize: pageSize,
            };

            if (filterStatus !== "All") {
                params.status = filterStatus;
            }

            // API call to get trips
            const result = await tripService.getTrips(params);

            if (result.success) {
                setTrips(result.data.items || []);
                setTotalTrips(result.data.totalCount || 0);

                // Calculate stats
                calculateStats(result.data.items || []);
            }
        } catch (error) {
            console.error("Failed to fetch trips:", error);
            toast.error("Failed to load trips");
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (tripsData) => {
        const stats = {
            totalTrips: tripsData.length,
            inProgress: tripsData.filter(
                (t) => t.status === "Started" || t.status === "InProgress"
            ).length,
            completed: tripsData.filter((t) => t.status === "Completed").length,
            totalValue: tripsData.reduce((sum, t) => sum + (t.totalValue || 0), 0),
        };
        setStats(stats);
    };

    const handleGenerateManifest = async (tripId) => {
        try {
            const pdfBlob = await tripService.generateTripManifestPdf(tripId);

            // Create download link
            const url = window.URL.createObjectURL(new Blob([pdfBlob]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `trip_manifest_${tripId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success("Manifest downloaded successfully");
        } catch (error) {
            console.error("Error generating manifest:", error);
            toast.error("Failed to generate manifest");
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            Created: { variant: "default", label: "Created" },
            Assigned: { variant: "info", label: "Assigned" },
            Started: { variant: "info", label: "Started" },
            InProgress: { variant: "info", label: "In Progress" },
            Completed: { variant: "success", label: "Completed" },
            Cancelled: { variant: "danger", label: "Cancelled" },
        };
        const config = statusMap[status] || statusMap.Created;
        return <Badge variant={config.variant}>{config.label}</Badge>;
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
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Filter trips by search term (frontend filtering for search term as per pattern)
    const filteredTrips = trips.filter((trip) => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            trip.vehicle?.toLowerCase().includes(search) ||
            trip.id.toString().includes(search) ||
            trip.warehouseName?.toLowerCase().includes(search)
        );
    });

    // Pagination
    const totalPages = Math.ceil(totalTrips / pageSize);
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, totalTrips);

    const statusOptions = [
        { value: "All", label: "All Status" },
        { value: "Assigned", label: "Assigned" },
        { value: "Started", label: "Started" },
        { value: "InProgress", label: "In Progress" },
        { value: "Completed", label: "Completed" },
    ];

    const pageSizeOptions = [
        { value: "10", label: "10" },
        { value: "25", label: "25" },
        { value: "50", label: "50" },
    ];

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
                            View and manage your assigned delivery trips
                        </p>
                    </div>
                    {/* No Create Button for Dispatcher */}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Total Trips
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
                                        In Progress
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {stats.inProgress}
                                    </p>
                                </div>
                                <Navigation className="h-8 w-8 text-orange-600" />
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
                                        {stats.completed}
                                    </p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Total Value
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(stats.totalValue)}
                                    </p>
                                </div>
                                <DollarSign className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by trip ID, vehicle, or warehouse..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Select
                                    value={filterStatus}
                                    onChange={(e) => {
                                        setFilterStatus(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    options={statusOptions}
                                    className="w-40"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Trips Table */}
                <Card>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <LoadingSpinner size="lg" />
                            </div>
                        ) : filteredTrips.length === 0 ? (
                            <div className="text-center py-12">
                                <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    No trips found
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">
                                    {searchTerm || filterStatus !== "All"
                                        ? "Try adjusting your search or filters"
                                        : "You don't have any trips assigned yet"}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                                                    Trip Details
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                                                    Departure
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                                                    Orders
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                                                    Total Value
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {filteredTrips.map((trip) => (
                                                <tr
                                                    key={trip.id}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                                                                <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-white">
                                                                    Trip #{trip.id}
                                                                </p>
                                                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                                    <MapPin className="h-3 w-3 mr-1" />
                                                                    {trip.warehouseName}
                                                                </div>
                                                                {trip.vehicle && (
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                        Vehicle: {trip.vehicle}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-gray-400" />
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                {formatDateTime(trip.departureAt)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <Package className="h-4 w-4 text-gray-400" />
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {trip.orderCount}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {formatCurrency(trip.totalValue || 0)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(trip.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {/* Status Update Button */}
                                                            {(trip.status === "Assigned" ||
                                                                trip.status === "Started" ||
                                                                trip.status === "InProgress") && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedTrip(trip);
                                                                            setShowStatusModal(true);
                                                                        }}
                                                                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                                        title="Update status"
                                                                    >
                                                                        <Play className="h-4 w-4" />
                                                                    </button>
                                                                )}

                                                            {/* View Details Button */}
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedTripId(trip.id);
                                                                    setShowDetailsModal(true);
                                                                }}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                                title="View details"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>

                                                            {/* Download Manifest Button */}
                                                            <button
                                                                onClick={() => handleGenerateManifest(trip.id)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                                title="Download manifest"
                                                            >
                                                                <FileText className="h-4 w-4" />
                                                            </button>

                                                            {/* Track/Navigate Button */}
                                                            {(trip.status === "Started" ||
                                                                trip.status === "InProgress") && (
                                                                    <button
                                                                        onClick={() =>
                                                                            navigate(`/dispatcher/deliveries`)
                                                                        }
                                                                        className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                                                        title="Track/Manage Deliveries"
                                                                    >
                                                                        <Navigation className="h-4 w-4" />
                                                                    </button>
                                                                )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Select
                                                value={pageSize.toString()}
                                                onChange={(e) => {
                                                    setPageSize(Number(e.target.value));
                                                    setCurrentPage(1);
                                                }}
                                                options={pageSizeOptions}
                                                className="w-20"
                                            />
                                            <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                                {startIndex}-{endIndex} of {totalTrips}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setCurrentPage((prev) => Math.max(1, prev - 1))
                                                }
                                                disabled={currentPage === 1}
                                            >
                                                Previous
                                            </Button>

                                            <div className="flex items-center gap-1">
                                                {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                                                    let pageNum;
                                                    if (totalPages <= 5) {
                                                        pageNum = idx + 1;
                                                    } else if (currentPage <= 3) {
                                                        pageNum = idx + 1;
                                                    } else if (currentPage >= totalPages - 2) {
                                                        pageNum = totalPages - 4 + idx;
                                                    } else {
                                                        pageNum = currentPage - 2 + idx;
                                                    }

                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => setCurrentPage(pageNum)}
                                                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                                                    ? "bg-blue-600 text-white"
                                                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setCurrentPage((prev) =>
                                                        Math.min(totalPages, prev + 1)
                                                    )
                                                }
                                                disabled={currentPage === totalPages}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <UpdateTripStatusModal
                isOpen={showStatusModal}
                onClose={() => {
                    setShowStatusModal(false);
                    setSelectedTrip(null);
                }}
                trip={selectedTrip}
                onSuccess={() => {
                    fetchTrips(); // Refresh the trips list
                }}
            />

            <TripDetailsModal
                isOpen={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false);
                    setSelectedTripId(null);
                }}
                tripId={selectedTripId}
            />
        </DashboardLayout>
    );
};

export default DispatcherTrips;
