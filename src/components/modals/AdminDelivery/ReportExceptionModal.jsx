// src/components/modals/Delivery/ReportExceptionModal.jsx
import { useState, useEffect } from "react";
import {
  X,
  AlertCircle,
  Camera,
  FileText,
  Loader2,
  XCircle,
  Clock,
  MapPin,
  Package,
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
    danger: "bg-red-600 text-white hover:bg-red-700",
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

const EXCEPTION_TYPES = [
  {
    value: "StoreClosed",
    label: "Store Closed",
    icon: XCircle,
    description: "Store is closed or not operating",
  },
  {
    value: "CustomerRefused",
    label: "Customer Refused",
    icon: XCircle,
    description: "Customer refused to accept delivery",
  },
  {
    value: "IncorrectAddress",
    label: "Incorrect Address",
    icon: MapPin,
    description: "Address is wrong or cannot be located",
  },
  {
    value: "DamagedGoods",
    label: "Damaged Goods",
    icon: Package,
    description: "Products are damaged or defective",
  },
  {
    value: "PartialDelivery",
    label: "Partial Delivery",
    icon: Package,
    description: "Only some items could be delivered",
  },
  {
    value: "DelayedDelivery",
    label: "Delayed Delivery",
    icon: Clock,
    description: "Delivery delayed due to circumstances",
  },
  {
    value: "Other",
    label: "Other",
    icon: AlertCircle,
    description: "Other delivery issue",
  },
];

export const ReportExceptionModal = ({ isOpen, onClose, order, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  // Form state
  const [exceptionType, setExceptionType] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setExceptionType("");
    setDescription("");
    setPhotos([]);
    setPhotoPreviews([]);
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

    if (!exceptionType) {
      toast.error("Please select an exception type");
      return;
    }

    if (!description || description.trim().length < 10) {
      toast.error(
        "Please provide a detailed description (at least 10 characters)"
      );
      return;
    }

    setLoading(true);
    try {
      const result = await deliveryService.reportDeliveryException({
        orderId: order.id,
        exceptionType: exceptionType,
        description: description.trim(),
        photos: photos.length > 0 ? photos : undefined,
      });

      if (result.success) {
        toast.success("Exception reported successfully");
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.message || "Failed to report exception");
      }
    } catch (error) {
      console.error("Error reporting exception:", error);
      toast.error(
        error.response?.data?.message || "Failed to report exception"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  const selectedType = EXCEPTION_TYPES.find((t) => t.value === exceptionType);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report Delivery Exception">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Information */}
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Order #{order.id}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {order.storeName}
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-2">
                Report any issues encountered during delivery
              </p>
            </div>
          </div>
        </div>

        {/* Exception Type Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Exception Type *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {EXCEPTION_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = exceptionType === type.value;

              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setExceptionType(type.value)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon
                      className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                        isSelected ? "text-red-600" : "text-gray-400"
                      }`}
                    />
                    <div>
                      <p
                        className={`font-medium ${
                          isSelected
                            ? "text-red-900 dark:text-red-100"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {type.label}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Type Info */}
        {selectedType && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Selected:</strong> {selectedType.label} - Please provide
              detailed information below
            </p>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <FileText className="inline h-4 w-4 mr-1" />
            Detailed Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Provide a detailed description of the issue. Include specific details like time, conditions, or any relevant circumstances..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {description.length} / 1000 characters (minimum 10)
          </p>
        </div>

        {/* Exception Photos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Camera className="inline h-4 w-4 mr-1" />
              Supporting Photos (Optional)
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
              id="exception-photos"
            />
            <label
              htmlFor="exception-photos"
              className={`flex flex-col items-center justify-center cursor-pointer ${
                photos.length >= 5 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Camera className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {photos.length === 0
                  ? "Click to upload photos documenting the issue"
                  : "Add more photos"}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Photos help resolve the issue faster
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

        {/* Important Notice */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">Important Notice</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Exceptions are logged and reviewed by management</li>
                <li>Be as detailed and accurate as possible</li>
                <li>Photos provide valuable evidence for resolution</li>
                <li>This report will be sent to the admin team immediately</li>
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
          <Button
            type="submit"
            variant="danger"
            disabled={
              loading || !exceptionType || description.trim().length < 10
            }
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Reporting...
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 mr-2" />
                Report Exception
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
