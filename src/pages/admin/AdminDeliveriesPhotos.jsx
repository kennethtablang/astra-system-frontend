// src/pages/admin/AdminDeliveriesPhotos.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Search,
  Filter,
  ArrowLeft,
  Download,
  Eye,
  MapPin,
  Calendar,
  User,
  Package,
  RefreshCw,
  Grid3x3,
  List,
  ZoomIn,
  X,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { LoadingSpinner } from "../../components/ui/Loading";
import deliveryService from "../../services/deliveryService";
import orderService from "../../services/orderService";
import { toast } from "react-hot-toast";

const AdminDeliveriesPhotos = () => {
  const navigate = useNavigate();

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [stats, setStats] = useState({
    totalPhotos: 0,
    today: 0,
    withLocation: 0,
    withNotes: 0,
  });

  useEffect(() => {
    fetchAllPhotos();
  }, []);

  const fetchAllPhotos = async () => {
    try {
      setLoading(true);

      // In a real implementation, you'd have a dedicated endpoint
      // For now, we'll fetch photos from recent orders
      const ordersResult = await orderService.getOrders({
        status: "Dispatched,InTransit,AtStore,Delivered",
        pageSize: 100,
      });

      if (ordersResult.success) {
        const orders = ordersResult.data.items || [];
        const allPhotos = [];

        // Fetch photos for each order
        for (const order of orders) {
          try {
            const photoResult = await deliveryService.getDeliveryPhotos(order.id);
            if (photoResult.success && photoResult.data) {
              // Add order info to each photo
              photoResult.data.forEach((photo) => {
                allPhotos.push({
                  ...photo,
                  orderId: order.id,
                  storeName: order.storeName,
                  storeCity: order.storeCity,
                });
              });
            }
          } catch (error) {
            console.error(`Error fetching photos for order ${order.id}:`, error);
          }
        }

        // Sort by upload date (newest first)
        allPhotos.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        
        setPhotos(allPhotos);
        calculateStats(allPhotos);
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
      toast.error("Failed to load photos");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (photosData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      totalPhotos: photosData.length,
      today: photosData.filter((p) => {
        const photoDate = new Date(p.uploadedAt);
        photoDate.setHours(0, 0, 0, 0);
        return photoDate.getTime() === today.getTime();
      }).length,
      withLocation: photosData.filter((p) => p.lat && p.lng).length,
      withNotes: photosData.filter((p) => p.notes).length,
    };
    setStats(stats);
  };

  const handleDownload = async (photo) => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `delivery_${photo.orderId}_${photo.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Photo downloaded");
    } catch (error) {
      console.error("Error downloading photo:", error);
      toast.error("Failed to download photo");
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  };

  const getTimeAgo = (date) => {
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

  // Filter photos
  const filteredPhotos = photos.filter((photo) => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        photo.orderId.toString().includes(search) ||
        photo.storeName?.toLowerCase().includes(search) ||
        photo.uploadedByName?.toLowerCase().includes(search) ||
        photo.notes?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    // Date filter
    if (filterDate !== "All") {
      const photoDate = new Date(photo.uploadedAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filterDate === "Today") {
        photoDate.setHours(0, 0, 0, 0);
        if (photoDate.getTime() !== today.getTime()) return false;
      } else if (filterDate === "Week") {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (photoDate < weekAgo) return false;
      } else if (filterDate === "Month") {
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (photoDate < monthAgo) return false;
      }
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPhotos.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredPhotos.length);
  const paginatedPhotos = filteredPhotos.slice(startIndex, endIndex);

  const dateOptions = [
    { value: "All", label: "All Time" },
    { value: "Today", label: "Today" },
    { value: "Week", label: "Last 7 Days" },
    { value: "Month", label: "Last 30 Days" },
  ];

  const pageSizeOptions = [
    { value: "24", label: "24" },
    { value: "48", label: "48" },
    { value: "96", label: "96" },
  ];

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
                Delivery Photos
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                View and manage all delivery photo documentation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAllPhotos}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-600 shadow"
                    : "hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-600 shadow"
                    : "hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Photos
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalPhotos}
                  </p>
                </div>
                <Camera className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Uploaded Today
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.today}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    With Location
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.withLocation}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    With Notes
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.withNotes}
                  </p>
                </div>
                <Package className="h-8 w-8 text-orange-600" />
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
                  placeholder="Search by order ID, store, uploader, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <Select
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value);
                  setCurrentPage(1);
                }}
                options={dateOptions}
                className="w-40"
              />
            </div>
          </CardContent>
        </Card>

        {/* Photos Display */}
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : paginatedPhotos.length === 0 ? (
              <div className="text-center py-12">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No photos found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {searchTerm || filterDate !== "All"
                    ? "Try adjusting your search or filters"
                    : "No delivery photos have been uploaded yet"}
                </p>
              </div>
            ) : (
              <>
                {/* Grid View */}
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {paginatedPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="group relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-square cursor-pointer"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <img
                          src={photo.url}
                          alt={`Delivery ${photo.orderId}`}
                          className="w-full h-full object-cover"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPhoto(photo);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 p-2 rounded-lg"
                            title="View full size"
                          >
                            <ZoomIn className="h-5 w-5 text-gray-900 dark:text-white" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(photo);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 p-2 rounded-lg"
                            title="Download"
                          >
                            <Download className="h-5 w-5 text-gray-900 dark:text-white" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/orders/${photo.orderId}`);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 p-2 rounded-lg"
                            title="View order"
                          >
                            <Eye className="h-5 w-5 text-gray-900 dark:text-white" />
                          </button>
                        </div>

                        {/* Info Badge */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                          <p className="text-white text-xs font-medium truncate">
                            Order #{photo.orderId}
                          </p>
                          <p className="text-white text-xs opacity-75">
                            {getTimeAgo(photo.uploadedAt)}
                          </p>
                        </div>

                        {/* Location Badge */}
                        {photo.lat && photo.lng && (
                          <div className="absolute top-2 right-2 bg-purple-600 rounded-full p-1.5">
                            <MapPin className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* List View */
                  <div className="space-y-3">
                    {paginatedPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <img
                          src={photo.url}
                          alt={`Delivery ${photo.orderId}`}
                          className="w-24 h-24 object-cover rounded cursor-pointer"
                          onClick={() => setSelectedPhoto(photo)}
                        />
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                Order #{photo.orderId}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {photo.storeName}
                                {photo.storeCity && ` - ${photo.storeCity}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDateTime(photo.uploadedAt)}
                            </div>
                            {photo.uploadedByName && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {photo.uploadedByName}
                              </div>
                            )}
                            {photo.lat && photo.lng && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                Location Available
                              </div>
                            )}
                          </div>

                          {photo.notes && (
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {photo.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownload(photo)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/orders/${photo.orderId}`)}
                            className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
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
                        {startIndex + 1}-{endIndex} of {filteredPhotos.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === pageNum
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
                          setCurrentPage((prev) => Math.min(totalPages, prev + 1))
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

      {/* Fullscreen Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[60] bg-black flex flex-col"
          onClick={() => setSelectedPhoto(null)}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-black bg-opacity-75">
            <div className="text-white">
              <p className="font-medium">Order #{selectedPhoto.orderId}</p>
              <p className="text-sm text-gray-300">
                {formatDateTime(selectedPhoto.uploadedAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(selectedPhoto);
                }}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPhoto(null);
                }}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Photo */}
          <div
            className="flex-1 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.url}
              alt="Full size"
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Info Footer */}
          <div className="p-4 bg-black bg-opacity-75 text-white">
            <div className="max-w-4xl mx-auto space-y-2 text-sm">
              {selectedPhoto.storeName && (
                <p>
                  <Package className="inline h-4 w-4 mr-1" />
                  {selectedPhoto.storeName}
                  {selectedPhoto.storeCity && ` - ${selectedPhoto.storeCity}`}
                </p>
              )}
              {selectedPhoto.uploadedByName && (
                <p>
                  <User className="inline h-4 w-4 mr-1" />
                  {selectedPhoto.uploadedByName}
                </p>
              )}
              {selectedPhoto.lat && selectedPhoto.lng && (
                <p>
                  <MapPin className="inline h-4 w-4 mr-1" />
                  {selectedPhoto.lat.toFixed(6)}, {selectedPhoto.lng.toFixed(6)}
                </p>
              )}
              {selectedPhoto.notes && <p>{selectedPhoto.notes}</p>}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDeliveriesPhotos;