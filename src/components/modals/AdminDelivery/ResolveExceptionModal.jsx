// src/components/modals/Delivery/ResolveExceptionModal.jsx
import { useState, useEffect } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  User,
  Package,
  Loader2,
  RefreshCw,
  Truck,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Badge } from "../../ui/Badge";

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

const RESOLUTION_TYPES = [
  {
    value: "Resolved",
    label: "Issue Resolved",
    icon: CheckCircle,
    description: "Problem was resolved successfully",
  },
  {
    value: "Rescheduled",
    label: "Delivery Rescheduled",
    icon: Calendar,
    description: "Scheduled for another delivery attempt",
  },
  {
    value: "Returned",
    label: "Returned to Warehouse",
    icon: Truck,
    description: "Order returned due to unresolvable issue",
  },
  {
    value: "Cancelled",
    label: "Order Cancelled",
    icon: XCircle,
    description: "Order cancelled by customer or management",
  },
  {
    value: "PartialResolution",
    label: "Partial Resolution",
    icon: Package,
    description: "Some items delivered, others rescheduled/returned",
  },
];

export const ResolveExceptionModal = ({
  isOpen,
  onClose,
  exception,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  // Form state
  const [resolutionType, setResolutionType] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [notifyDispatcher, setNotifyDispatcher] = useState(true);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setResolutionType("");
    setResolutionNotes("");
    setFollowUpRequired(false);
    setNotifyDispatcher(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resolutionType) {
      toast.error("Please select a resolution type");
      return;
    }

    if (!resolutionNotes || resolutionNotes.trim().length < 10) {
      toast.error(
        "Please provide detailed resolution notes (at least 10 characters)"
      );
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Replace with actual API call
      // const result = await deliveryService.resolveException({
      //   exceptionId: exception.id,
      //   resolutionType,
      //   resolutionNotes: resolutionNotes.trim(),
      //   followUpRequired,
      //   notifyDispatcher,
      // });

      toast.success("Exception resolved successfully");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error resolving exception:", error);
      toast.error("Failed to resolve exception");
    } finally {
      setLoading(false);
    }
  };

  const getExceptionTypeBadge = (type) => {
    const typeMap = {
      StoreClosed: { variant: "warning", label: "Store Closed" },
      CustomerRefused: { variant: "danger", label: "Customer Refused" },
      IncorrectAddress: { variant: "info", label: "Incorrect Address" },
      DamagedGoods: { variant: "danger", label: "Damaged Goods" },
      PartialDelivery: { variant: "warning", label: "Partial Delivery" },
      DelayedDelivery: { variant: "info", label: "Delayed Delivery" },
      Other: { variant: "default", label: "Other" },
    };
    const config = typeMap[type] || typeMap.Other;
    return <Badge variant={config.variant}>{config.label}</Badge>;
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

  if (!exception) return null;

  const selectedResolution = RESOLUTION_TYPES.find(
    (t) => t.value === resolutionType
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Resolve Delivery Exception">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Exception Information */}
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 dark:text-white">
                  Order #{exception.orderId}
                </span>
                {getExceptionTypeBadge(exception.exceptionType)}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {exception.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDateTime(exception.reportedAt)}
                </div>
                {exception.reportedByName && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {exception.reportedByName}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Resolution Type Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Resolution Type *
          </label>
          <div className="grid grid-cols-1 gap-3">
            {RESOLUTION_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = resolutionType === type.value;

              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setResolutionType(type.value)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon
                      className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                        isSelected ? "text-green-600" : "text-gray-400"
                      }`}
                    />
                    <div>
                      <p
                        className={`font-medium ${
                          isSelected
                            ? "text-green-900 dark:text-green-100"
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

        {/* Selected Resolution Info */}
        {selectedResolution && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Selected:</strong> {selectedResolution.label} - Please
              provide detailed notes below
            </p>
          </div>
        )}

        {/* Resolution Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <FileText className="inline h-4 w-4 mr-1" />
            Resolution Notes *
          </label>
          <textarea
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            rows={5}
            placeholder="Provide detailed notes about how this exception was resolved. Include actions taken, communication with parties involved, and any follow-up steps..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {resolutionNotes.length} / 1000 characters (minimum 10)
          </p>
        </div>

        {/* Additional Options */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Additional Options
          </h4>

          <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <input
              type="checkbox"
              checked={followUpRequired}
              onChange={(e) => setFollowUpRequired(e.target.checked)}
              className="mt-1 rounded"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Follow-up Required
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Mark this if additional action or monitoring is needed
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <input
              type="checkbox"
              checked={notifyDispatcher}
              onChange={(e) => setNotifyDispatcher(e.target.checked)}
              className="mt-1 rounded"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Notify Dispatcher
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Send notification to the dispatcher about this resolution
              </p>
            </div>
          </label>
        </div>

        {/* Important Notice */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">Important</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Resolution will be permanently recorded in the system</li>
                <li>
                  Relevant parties will be notified based on your selections
                </li>
                <li>Order status may be updated based on resolution type</li>
                <li>Ensure all information is accurate before submitting</li>
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
            variant="success"
            disabled={
              loading || !resolutionType || resolutionNotes.trim().length < 10
            }
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Resolving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolve Exception
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
