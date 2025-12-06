// src/components/modals/AdminTrip/EditTripModal.jsx
import { useState, useEffect } from "react";
import { Truck, User, Calendar, Clock, X, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import tripService from "../../../services/tripService";
import userService from "../../../services/userService";

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
}) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    outline:
      "border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
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

export const EditTripModal = ({ isOpen, onClose, tripId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [trip, setTrip] = useState(null);

  const [dispatcherId, setDispatcherId] = useState("");
  const [departureAt, setDepartureAt] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [estimatedReturn, setEstimatedReturn] = useState("");

  const [dispatchers, setDispatchers] = useState([]);

  useEffect(() => {
    if (isOpen && tripId) {
      fetchTripDetails();
      fetchDispatchers();
    }
  }, [isOpen, tripId]);

  const fetchTripDetails = async () => {
    setLoading(true);
    try {
      const result = await tripService.getTripById(tripId);
      if (result.success) {
        const tripData = result.data;
        setTrip(tripData);
        setDispatcherId(tripData.dispatcherId || "");
        setDepartureAt(
          tripData.departureAt
            ? new Date(tripData.departureAt).toISOString().slice(0, 16)
            : ""
        );
        setVehicle(tripData.vehicle || "");
        setEstimatedReturn(
          tripData.estimatedReturn
            ? new Date(tripData.estimatedReturn).toISOString().slice(0, 16)
            : ""
        );
      } else {
        toast.error("Failed to load trip details");
      }
    } catch (error) {
      console.error("Error fetching trip:", error);
      toast.error("Failed to load trip details");
    } finally {
      setLoading(false);
    }
  };

  const fetchDispatchers = async () => {
    try {
      const result = await userService.getUsersByRole("Dispatcher");
      if (result.success) {
        setDispatchers(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching dispatchers:", error);
    }
  };

  const handleSubmit = async () => {
    if (!dispatcherId) {
      toast.error("Please select a dispatcher");
      return;
    }

    setSubmitting(true);
    try {
      const updateData = {
        tripId: parseInt(tripId),
        dispatcherId,
        departureAt: departureAt || null,
        vehicle: vehicle || null,
        estimatedReturn: estimatedReturn || null,
      };

      const result = await tripService.updateTrip(tripId, updateData);

      if (result.success) {
        toast.success("Trip updated successfully");
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.message || "Failed to update trip");
      }
    } catch (error) {
      console.error("Update trip error:", error);
      toast.error(error.response?.data?.message || "Failed to update trip");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Trip #${tripId}`}>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-medium mb-1">Important</p>
                <p>
                  You can only edit trips that haven't started yet. Once a trip
                  is in progress, changes are limited.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Dispatcher *
              </label>
              <select
                value={dispatcherId}
                onChange={(e) => setDispatcherId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select dispatcher</option>
                {dispatchers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Truck className="inline h-4 w-4 mr-1" />
                Vehicle
              </label>
              <input
                type="text"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                placeholder="Vehicle plate number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Departure Time
              </label>
              <input
                type="datetime-local"
                value={departureAt}
                onChange={(e) => setDepartureAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Estimated Return
              </label>
              <input
                type="datetime-local"
                value={estimatedReturn}
                onChange={(e) => setEstimatedReturn(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !dispatcherId}
              className="flex-1"
            >
              {submitting ? "Updating..." : "Update Trip"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
