// src/components/modals/Delivery/UploadDeliveryPhotoModal.jsx
import { useState, useEffect } from "react";
import {
  X,
  Camera,
  MapPin,
  FileText,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import deliveryService from "../../../services/deliveryService";

const Modal = ({ isOpen, onClose, title, children, size = "lg" }) => {
  if (!isOpen) return null;

  const sizes = {
    md: "max-w-lg",
    lg: "max-w-2xl",
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
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

const Button = ({
  children,
  variant = "primary",
  onClick,
  disabled,
  className = "",
  type = "button",
}) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    outline:
      "border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const UploadDeliveryPhotoModal = ({
  isOpen,
  onClose,
  order,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Form state
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState(null);
  const [useLocation, setUseLocation] = useState(true);

  useEffect(() => {
    if (isOpen) {
      resetForm();
      if (useLocation) {
        captureLocation();
      }
    }
  }, [isOpen, useLocation]);

  const resetForm = () => {
    setPhoto(null);
    setPhotoPreview(null);
    setNotes("");
    setLocation(null);
  };

  const captureLocation = async () => {
    if (!useLocation) return;

    setGettingLocation(true);
    try {
      const loc = await deliveryService.getCurrentLocation();
      setLocation(loc);
    } catch (error) {
      console.error("Error getting location:", error);
      toast.error("Unable to get location");
    } finally {
      setGettingLocation(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    setPhoto(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!photo) {
      toast.error("Please select a photo to upload");
      return;
    }

    setLoading(true);
    try {
      const result = await deliveryService.uploadDeliveryPhoto({
        orderId: order.id,
        photo: photo,
        lat: useLocation ? location?.latitude : undefined,
        lng: useLocation ? location?.longitude : undefined,
        notes: notes || undefined,
      });

      if (result.success) {
        toast.success("Photo uploaded successfully!");
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.message || "Failed to upload photo");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error(error.response?.data?.message || "Failed to upload photo");
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Delivery Photo">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Information */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Camera className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Order #{order.id}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {order.storeName}
              </p>
            </div>
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            <Camera className="inline h-4 w-4 mr-1" />
            Delivery Photo *
          </label>

          {!photoPreview ? (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                  <Camera className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-base font-medium text-gray-900 dark:text-white mb-1">
                  Take Photo or Upload
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Click to open camera or select from gallery
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Max file size: 10MB
                </span>
              </label>
            </div>
          ) : (
            <div className="relative">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
                <CheckCircle className="inline h-4 w-4 mr-1" />
                Photo ready to upload
              </div>
            </div>
          )}
        </div>

        {/* Location Options */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useLocation}
              onChange={(e) => setUseLocation(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Include location data
            </span>
          </label>

          {useLocation && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin
                  className={`h-5 w-5 ${
                    location ? "text-green-600" : "text-gray-400"
                  }`}
                />
                <div className="flex-1">
                  {gettingLocation ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Getting location...
                      </span>
                    </div>
                  ) : location ? (
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Location captured
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Lat: {location.latitude.toFixed(6)}, Lng:{" "}
                        {location.longitude.toFixed(6)}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Location unavailable
                      </p>
                      <button
                        type="button"
                        onClick={captureLocation}
                        className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                      >
                        Try again
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FileText className="inline h-4 w-4 mr-1" />
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add any notes about this photo..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            e.g., "Front view of store", "Signature received", etc.
          </p>
        </div>

        {/* Info Notice */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Photo Upload Tips</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Ensure the photo is clear and well-lit</li>
                <li>
                  Capture relevant details (store front, products, signature)
                </li>
                <li>Location data helps verify delivery</li>
                <li>Photos serve as proof of delivery</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !photo} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
