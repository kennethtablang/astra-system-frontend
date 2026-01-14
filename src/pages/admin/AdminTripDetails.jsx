import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Truck,
  Package,
  User,
  Calendar,
  MapPin,
  ArrowLeft,
  Edit,
  FileText,
  Navigation,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  RefreshCw,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { ViewOrderDetailsModal } from "../../components/modals/AdminOrder/ViewOrderDetailsModal";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/Loading";
import tripService from "../../services/tripService";
import { toast } from "react-hot-toast";

const AdminTripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewOrderModalOpen, setViewOrderModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const fetchTripDetails = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const result = await tripService.getTripById(id);

      if (result.success) {
        setTrip(result.data);
      } else {
        toast.error("Failed to load trip details");
        navigate("/admin/trips");
      }
    } catch (error) {
      console.error("Error fetching trip:", error);
      toast.error("Error loading trip");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTripDetails(true);
  };

  const handleDownloadManifest = async () => {
    try {
      const pdfBlob = await tripService.generateTripManifestPdf(id);

      const url = window.URL.createObjectURL(new Blob([pdfBlob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `trip_manifest_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Manifest downloaded successfully");
    } catch (error) {
      console.error("Error downloading manifest:", error);
      toast.error("Failed to download manifest");
    }
  };

  const handleCancelTrip = async () => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this trip? Orders will be returned to packed status."
      )
    ) {
      return;
    }

    try {
      const result = await tripService.cancelTrip(id, "Cancelled by admin");
      if (result.success) {
        toast.success("Trip cancelled successfully");
        fetchTripDetails(true);
      } else {
        toast.error(result.message || "Failed to cancel trip");
      }
    } catch (error) {
      console.error("Error cancelling trip:", error);
      toast.error("Failed to cancel trip");
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

  const getOrderStatusIcon = (status) => {
    const icons = {
      Pending: <Clock className="h-4 w-4 text-yellow-600" />,
      Confirmed: <CheckCircle className="h-4 w-4 text-blue-600" />,
      Packed: <Package className="h-4 w-4 text-purple-600" />,
      Dispatched: <Truck className="h-4 w-4 text-gray-600" />,
      InTransit: <MapPin className="h-4 w-4 text-blue-600" />,
      AtStore: <MapPin className="h-4 w-4 text-blue-600" />,
      Delivered: <CheckCircle className="h-4 w-4 text-green-600" />,
      Returned: <AlertCircle className="h-4 w-4 text-yellow-600" />,
      Cancelled: <XCircle className="h-4 w-4 text-red-600" />,
    };
    return icons[status] || <Package className="h-4 w-4 text-gray-400" />;
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

  const calculateProgress = () => {
    if (!trip || !trip.assignments || trip.assignments.length === 0) return 0;
    const completed = trip.assignments.filter(
      (a) => a.status === "Delivered"
    ).length;
    return Math.round((completed / trip.assignments.length) * 100);
  };

  const getTotalValue = () => {
    if (!trip || !trip.assignments) return 0;
    return trip.assignments.reduce((sum, a) => sum + a.orderTotal, 0);
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

  if (!trip) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Trip not found
          </h3>
          <Button onClick={() => navigate("/admin/trips")} className="mt-4">
            Back to Trips
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const progress = calculateProgress();
  const totalValue = getTotalValue();
  const completedStops =
    trip.assignments?.filter((a) => a.status === "Delivered").length || 0;
  const totalStops = trip.assignments?.length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/trips")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Trip #{trip.id}
                </h1>
                {getStatusBadge(trip.status)}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {trip.warehouseName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadManifest}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
            </Button>
            {(trip.status === "Started" || trip.status === "InProgress") && (
              <Button
                size="sm"
                onClick={() => navigate(`/admin/trips/${trip.id}/track`)}
                className="flex items-center gap-2"
              >
                <Navigation className="h-4 w-4" />
                Track
              </Button>
            )}
            {trip.status === "Created" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/trips/${trip.id}/edit`)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelTrip}
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Trip Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Dispatcher
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {trip.dispatcherName || "Not assigned"}
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
                    Total Stops
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {completedStops} / {totalStops}
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
                <Navigation className="h-8 w-8 text-green-600" />
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
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    ₱{totalValue.toFixed(2)}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-orange-600" />
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
                  Delivery Progress: {completedStops} of {totalStops} stops
                </span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trip Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Trip Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Warehouse
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {trip.warehouseName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Dispatcher
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {trip.dispatcherName || "Not assigned"}
                    </p>
                  </div>
                </div>

                {trip.vehicle && (
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Vehicle
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {trip.vehicle}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Departure
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDateTime(trip.departureAt)}
                    </p>
                  </div>
                </div>

                {trip.estimatedReturn && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Est. Return
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDateTime(trip.estimatedReturn)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stops/Orders */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Delivery Stops ({trip.assignments?.length || 0})
              </h3>

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {trip.assignments && trip.assignments.length > 0 ? (
                  trip.assignments
                    .sort((a, b) => a.sequenceNo - b.sequenceNo)
                    .map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">
                            {assignment.sequenceNo}
                          </span>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-white">
                              Order #{assignment.orderId}
                            </span>
                            {getOrderStatusIcon(assignment.status)}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {assignment.storeName}
                          </p>
                          {(assignment.storeAddressLine1 || assignment.storeAddressLine2 || assignment.storeBarangay ||
                            assignment.storeCity) && (
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                {assignment.storeAddressLine1 && <span className="block">{assignment.storeAddressLine1}</span>}
                                {assignment.storeAddressLine2 && <span className="block">{assignment.storeAddressLine2}</span>}
                                {assignment.storeBarangay &&
                                  `${assignment.storeBarangay}, `}
                                {assignment.storeCity}
                              </p>
                            )}
                        </div>

                        {/* Delivery Status */}
                        <div className="flex flex-col items-center gap-1">
                          <Badge
                            variant={
                              assignment.status === "Delivered"
                                ? "success"
                                : assignment.status === "InTransit" ||
                                  assignment.status === "AtStore"
                                  ? "info"
                                  : assignment.status === "Returned" ||
                                    assignment.status === "Cancelled"
                                    ? "danger"
                                    : "warning"
                            }
                          >
                            {assignment.status === "InTransit"
                              ? "In Transit"
                              : assignment.status === "AtStore"
                                ? "At Store"
                                : assignment.status}
                          </Badge>
                        </div>

                        {/* Payment Status */}
                        <div className="flex flex-col items-center gap-1">
                          {assignment.isPaid ? (
                            <Badge variant="success">Paid</Badge>
                          ) : assignment.totalPaid > 0 ? (
                            <Badge variant="warning">Partial</Badge>
                          ) : (
                            <Badge variant="danger">Unpaid</Badge>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            ₱{assignment.orderTotal.toFixed(2)}
                          </p>
                          {assignment.totalPaid > 0 && !assignment.isPaid && (
                            <p className="text-xs text-green-600">
                              Paid: ₱{assignment.totalPaid?.toFixed(2) || "0.00"}
                            </p>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrderId(assignment.orderId);
                            setViewOrderModalOpen(true);
                          }}
                        >
                          View
                        </Button>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No stops assigned to this trip
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <ViewOrderDetailsModal
        isOpen={viewOrderModalOpen}
        onClose={() => {
          setViewOrderModalOpen(false);
          setSelectedOrderId(null);
        }}
        orderId={selectedOrderId}
        onSuccess={() => {
          fetchTripDetails(true); // Refresh trip details after order status changes
        }}
      />
    </DashboardLayout>
  );
};

export default AdminTripDetails;
