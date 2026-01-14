// src/components/modals/Delivery/ViewDeliveryPhotosModal.jsx
import { useState, useEffect } from "react";
import {
  X,
  Camera,
  Download,
  MapPin,
  Calendar,
  User,
  FileText,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import deliveryService from "../../../services/deliveryService";
import { LoadingSpinner } from "../../ui/Loading";

const Modal = ({ isOpen, onClose, title, children, size = "2xl" }) => {
  if (!isOpen) return null;

  const sizes = {
    xl: "max-w-4xl",
    "2xl": "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
        />
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
          &#8203;
        </span>
        <div
          className={`inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full ${sizes[size]}`}
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-6 py-4 max-h-[80vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const Button = ({
  children,
  variant = "outline",
  onClick,
  disabled,
  className = "",
}) => {
  const variants = {
    outline:
      "border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
    primary: "bg-blue-600 text-white hover:bg-blue-700",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const ViewDeliveryPhotosModal = ({ isOpen, onClose, orderId }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'fullscreen'

  useEffect(() => {
    if (isOpen && orderId) {
      fetchPhotos();
    }
  }, [isOpen, orderId]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const result = await deliveryService.getDeliveryPhotos(orderId);

      if (result.success) {
        setPhotos(result.data || []);
      } else {
        toast.error("Failed to load photos");
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
      toast.error("Failed to load photos");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (photo) => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `delivery_photo_${photo.id}.jpg`;
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

  const handleDownloadAll = async () => {
    toast.info("Downloading all photos...");
    for (const photo of photos) {
      await handleDownload(photo);
      // Small delay between downloads
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    toast.success("All photos downloaded");
  };

  const openFullscreen = (index) => {
    setSelectedPhotoIndex(index);
    setViewMode("fullscreen");
  };

  const closeFullscreen = () => {
    setViewMode("grid");
    setSelectedPhotoIndex(null);
  };

  const goToPrevious = () => {
    if (selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedPhotoIndex < photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
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

  if (!orderId) return null;

  const selectedPhoto =
    selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;

  return (
    <>
      <Modal
        isOpen={isOpen && viewMode === "grid"}
        onClose={onClose}
        title={`Delivery Photos - Order #${orderId}`}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              No Photos Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              No delivery photos have been uploaded for this order yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {photos.length} photo{photos.length !== 1 ? "s" : ""} available
              </p>
              <Button
                variant="primary"
                onClick={handleDownloadAll}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download All
              </Button>
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="group relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-square"
                >
                  <img
                    src={photo.url}
                    alt={`Delivery photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2">
                    <button
                      onClick={() => openFullscreen(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 p-2 rounded-lg"
                      title="View full size"
                    >
                      <ZoomIn className="h-5 w-5 text-gray-900 dark:text-white" />
                    </button>
                    <button
                      onClick={() => handleDownload(photo)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 p-2 rounded-lg"
                      title="Download"
                    >
                      <Download className="h-5 w-5 text-gray-900 dark:text-white" />
                    </button>
                  </div>

                  {/* Photo Info Badge */}
                  <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-75 rounded px-2 py-1">
                    <p className="text-xs text-white truncate">
                      {formatDateTime(photo.uploadedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Photo Details List */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Photo Details
              </h4>
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={photo.url}
                      alt={`Photo ${index + 1}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">
                          {formatDateTime(photo.uploadedAt)}
                        </span>
                      </div>
                      {photo.uploadedByName && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">
                            {photo.uploadedByName}
                          </span>
                        </div>
                      )}
                      {photo.lat && photo.lng && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">
                            {photo.lat.toFixed(6)}, {photo.lng.toFixed(6)}
                          </span>
                        </div>
                      )}
                      {photo.notes && (
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                          <span className="text-gray-900 dark:text-white">
                            {photo.notes}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDownload(photo)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Fullscreen Photo View */}
      {viewMode === "fullscreen" && selectedPhoto && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-black bg-opacity-75">
            <div className="text-white">
              <p className="font-medium">
                Photo {selectedPhotoIndex + 1} of {photos.length}
              </p>
              <p className="text-sm text-gray-300">
                {formatDateTime(selectedPhoto.uploadedAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload(selectedPhoto)}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={closeFullscreen}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Photo */}
          <div className="flex-1 flex items-center justify-center p-4">
            <img
              src={selectedPhoto.url}
              alt="Full size"
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between p-4 bg-black bg-opacity-75">
            <button
              onClick={goToPrevious}
              disabled={selectedPhotoIndex === 0}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Photo Info */}
            {(selectedPhoto.notes ||
              selectedPhoto.uploadedByName ||
              (selectedPhoto.lat && selectedPhoto.lng)) && (
              <div className="flex-1 mx-4 p-3 bg-white bg-opacity-10 rounded-lg text-white text-sm">
                <div className="space-y-1">
                  {selectedPhoto.uploadedByName && (
                    <p>
                      <User className="inline h-4 w-4 mr-1" />
                      {selectedPhoto.uploadedByName}
                    </p>
                  )}
                  {selectedPhoto.lat && selectedPhoto.lng && (
                    <p>
                      <MapPin className="inline h-4 w-4 mr-1" />
                      {selectedPhoto.lat.toFixed(6)},{" "}
                      {selectedPhoto.lng.toFixed(6)}
                    </p>
                  )}
                  {selectedPhoto.notes && (
                    <p>
                      <FileText className="inline h-4 w-4 mr-1" />
                      {selectedPhoto.notes}
                    </p>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={goToNext}
              disabled={selectedPhotoIndex === photos.length - 1}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
