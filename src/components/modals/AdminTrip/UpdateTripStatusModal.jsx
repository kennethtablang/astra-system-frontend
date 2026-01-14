import { useState } from "react";
import {
  X,
  Truck,
  Play,
  Navigation,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import tripService from "../../../services/tripService";

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
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
}) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    outline:
      "border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const UpdateTripStatusModal = ({ isOpen, onClose, trip, onSuccess }) => {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const getAvailableStatuses = () => {
    const currentStatus = trip?.status;
    const statusFlow = {
      Created: [
        { value: "Assigned", label: "Assign Trip", icon: Truck, color: "blue" },
      ],
      Assigned: [
        { value: "Started", label: "Start Trip", icon: Play, color: "green" },
      ],
      Started: [
        {
          value: "InProgress",
          label: "Mark In Progress",
          icon: Navigation,
          color: "orange",
        },
      ],
      InProgress: [
        {
          value: "Completed",
          label: "Complete Trip",
          icon: CheckCircle,
          color: "green",
        },
      ],
    };

    return statusFlow[currentStatus] || [];
  };

  const availableStatuses = getAvailableStatuses();

  const validateTripCompletion = async () => {
    try {
      const result = await tripService.getTripById(trip.id);
      if (result.success && result.data.orders) {
        const pendingOrders = result.data.orders.filter(
          (order) =>
            !["Delivered", "Returned", "Cancelled"].includes(order.status)
        );

        if (pendingOrders.length > 0) {
          toast.error(
            "Cannot complete trip. There are still packages that are not delivered yet."
          );
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("Error validating trip completion:", error);
      toast.error("Failed to validate trip status");
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!selectedStatus) {
      toast.error("Please select a status");
      return;
    }

    setLoading(true);
    try {
      // Validation for Completed status
      if (selectedStatus === "Completed") {
        const isValid = await validateTripCompletion();
        if (!isValid) {
          setLoading(false);
          return;
        }
      }

      const result = await tripService.updateTripStatus({
        tripId: trip.id,
        newStatus: selectedStatus,
        notes: notes || null,
      });

      if (result.success) {
        toast.success(`Trip status updated to ${selectedStatus}`);
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.message || "Failed to update trip status");
      }
    } catch (error) {
      console.error("Error updating trip status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update trip status"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickUpdate = async (status) => {
    setLoading(true);
    try {
      // Validation for Completed status
      if (status === "Completed") {
        const isValid = await validateTripCompletion();
        if (!isValid) {
          setLoading(false);
          return;
        }
      }

      const result = await tripService.updateTripStatus({
        tripId: trip.id,
        newStatus: status,
        notes: null,
      });

      if (result.success) {
        toast.success(`Trip ${status.toLowerCase()}`);
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.message || "Failed to update trip status");
      }
    } catch (error) {
      console.error("Error updating trip status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update trip status"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!trip) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Trip Status"
      size="md"
    >
      <div className="space-y-6">
        {/* Current Status */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Current Status
          </p>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-600"></div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {trip.status}
            </p>
          </div>
        </div>

        {/* Available Status Actions */}
        {availableStatuses.length > 0 ? (
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Quick Actions
            </p>
            <div className="space-y-2">
              {availableStatuses.map((status) => {
                const Icon = status.icon;
                return (
                  <button
                    key={status.value}
                    onClick={() => handleQuickUpdate(status.value)}
                    disabled={loading}
                    className={`w-full flex items-center gap-3 p-4 border-2 rounded-lg transition-colors ${
                      loading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <div
                      className={`h-10 w-10 rounded-full bg-${status.color}-100 dark:bg-${status.color}-900 flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className={`h-5 w-5 text-${status.color}-600`} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {status.label}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Change status to {status.value}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              {trip.status === "Completed"
                ? "This trip is already completed"
                : trip.status === "Cancelled"
                ? "This trip is cancelled"
                : "No status updates available"}
            </p>
          </div>
        )}

        {/* Advanced Options */}
        {availableStatuses.length > 0 && (
          <details className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              Advanced Options
            </summary>
            <div className="p-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select status</option>
                  {availableStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any notes about this status change..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !selectedStatus}
                  className="flex-1"
                >
                  {loading ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </div>
          </details>
        )}

        {/* Trip Info */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Trip ID</p>
              <p className="font-medium text-gray-900 dark:text-white">
                #{trip.id}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Dispatcher</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {trip.dispatcherName || "Not assigned"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Orders</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {trip.orderCount}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Warehouse</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {trip.warehouseName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Demo Component
export default function UpdateTripStatusModalDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTrip, setCurrentTrip] = useState({
    id: 123,
    status: "Created",
    dispatcherName: "Juan Dela Cruz",
    orderCount: 8,
    warehouseName: "Main Warehouse",
  });

  const statuses = [
    "Created",
    "Assigned",
    "Started",
    "InProgress",
    "Completed",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Trip Status Update Modal
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Test Different Trip Statuses
              </label>
              <select
                value={currentTrip.status}
                onChange={(e) =>
                  setCurrentTrip({ ...currentTrip, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <Button onClick={() => setIsOpen(true)} className="w-full">
              Open Status Update Modal
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> This modal uses the real tripService API.
              Change the status above to see different available actions!
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Status Flow
          </h3>
          <div className="flex items-center justify-between flex-wrap gap-2">
            {statuses.map((status, index) => (
              <div key={status} className="flex items-center">
                <div
                  className={`px-4 py-2 rounded-lg ${
                    currentTrip.status === status
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {status}
                </div>
                {index < statuses.length - 1 && (
                  <div className="mx-2 text-gray-400">→</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Integration Instructions
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>1.</strong> Import the UpdateTripStatusModal component
            </p>
            <p>
              <strong>2.</strong> Add state:{" "}
              <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                const [showStatusModal, setShowStatusModal] = useState(false)
              </code>
            </p>
            <p>
              <strong>3.</strong> Add the modal to your component with trip data
            </p>
            <p>
              <strong>4.</strong> Call onSuccess callback to refresh your trips
              list
            </p>
          </div>
        </div>
      </div>

      <UpdateTripStatusModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        trip={currentTrip}
        onSuccess={() => {
          toast.success("Status updated! Refreshing trips...");
          // In real usage, call fetchTrips() here
        }}
      />
    </div>
  );
}
