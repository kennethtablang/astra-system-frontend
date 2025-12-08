// src/components/modals/Delivery/MarkDeliveredModal.jsx
import { useState, useEffect } from "react";
import {
  X,
  CheckCircle,
  Camera,
  MapPin,
  User,
  Phone,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import deliveryService from "../../../services/deliveryService";

const Modal = ({ isOpen, onClose, title, children, size = "lg" }) => {
  if (!isOpen) return null;

  const sizes = {
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
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
    success: "bg-green-600 text-white hover:bg-green-700",
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

export const MarkDeliveredModal = ({ isOpen, onClose, order, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Form state
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (isOpen) {
      resetForm();
      captureLocation();
    }
  }, [isOpen]);

  const resetForm = () => {
    setRecipientName("");
    setRecipientPhone("");
    setNotes("");
    setPhotos([]);
    setPhotoPreviews([]);
    setLocation(null);
  };

  const captureLocation = async () => {
    setGettingLocation(true);
    try {
      const loc = await deliveryService.getCurrentLocation();
      setLocation(loc);
      toast.success("Location captured successfully");
    } catch (error) {
      console.error("Error getting location:", error);
      toast.error("Unable to get location. Please enable location services.");
    } finally {
      setGettingLocation(false);
    }
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + photos.length > 5) {
      toast.error("Maximum 5 photos allowed");
      return;
    }

    setPhotos([...photos, ...files]);

    // Create preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPhotoPreviews([...photoPreviews, ...newPreviews]);
  };

  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    
    // Revoke the URL to free memory
    URL.revokeObjectURL(photoPreviews[index]);
    
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (photos.length === 0) {
      toast.error("Please upload at least one photo as proof of delivery");
      return;
    }

    if (!location) {
      const confirm = window.confirm(
        "Location not available. Continue without location data?"
      );
      if (!confirm) return;
    }

    setLoading(true);
    try {
      const result = await deliveryService.markOrderAsDelivered({
        orderId: order.id,
        latitude: location?.latitude,
        longitude: location?.longitude,
        notes: notes || undefined,
        recipientName: recipientName || undefined,
        recipientPhone: recipientPhone || undefined,
        photos: photos,
      });

      if (result.success) {
        toast.success("Order marked as delivered successfully!");
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.message || "Failed to mark order as delivered");
      }
    } catch (error) {
      console.error("Error marking delivered:", error);
      toast.error(
        error.response?.data?.message || "Failed to mark order as delivered"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mark Order as Delivered">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Information */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
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

        {/* Location Status */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin
                className={`h-5 w-5 ${
                  location ? "text-green-600" : "text-gray-400"
                }`}
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {location ? "Location Captured" : "Getting Location..."}
                </p>
                {location && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Lat: {location.latitude.toFixed(6)}, Lng:{" "}
                    {location.longitude.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
            {!location && (
              <button
                type="button"
                onClick={captureLocation}
                disabled={gettingLocation}
                className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                {gettingLocation ? "Retrying..." : "Retry"}
              </button>
            )}
          </div>
        </div>

        {/* Recipient Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Recipient Information (Optional)
          </h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Recipient Name
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Who received the order?"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="inline h-4 w-4 mr-1" />
              Recipient Phone
            </label>
            <input
              type="tel"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              placeholder="Contact number"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Delivery Photos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Camera className="inline h-4 w-4 mr-1" />
              Delivery Photos *
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {photos.length}/5 photos
            </span>
          </div>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <input
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={handlePhotoChange}
              disabled={photos.length >= 5}
              className="hidden"
              id="delivery-photos"
            />
            <label
              htmlFor="delivery-photos"
              className={`flex flex-col items-center justify-center cursor-pointer ${
                photos.length >= 5 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Camera className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {photos.length === 0
                  ? "Click to upload photos or take picture"
                  : "Add more photos"}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Required - At least 1 photo
              </span>
            </label>
          </div>

          {/* Photo Previews */}
          {photoPreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {photoPreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delivery Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FileText className="inline h-4 w-4 mr-1" />
            Delivery Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Any additional notes about the delivery..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Validation Warning */}
        {photos.length === 0 && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Please upload at least one photo as proof of delivery before submitting.
              </p>
            </div>
          </div>
        )}

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
          <Button
            type="submit"
            variant="success"
            disabled={loading || photos.length === 0}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Delivered
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};