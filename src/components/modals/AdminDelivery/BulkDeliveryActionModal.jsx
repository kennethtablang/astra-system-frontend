// src/components/modals/AdminDelivery/BulkDeliveryActionModal.jsx
import { useState } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Package,
  Navigation,
  MapPin,
  Truck,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";
import orderService from "../../../services/orderService";
import tripService from "../../../services/tripService";
import { Badge } from "../../ui/Badge";

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

const BULK_ACTIONS = [
  {
    id: "mark-in-transit",
    label: "Mark as In Transit",
    description: "Update selected orders to In Transit status",
    icon: Navigation,
    color: "blue",
    requiresConfirmation: true,
  },
  {
    id: "mark-at-store",
    label: "Mark as At Store",
    description: "Update selected orders to At Store status",
    icon: MapPin,
    color: "orange",
    requiresConfirmation: true,
  },
  {
    id: "create-trip",
    label: "Create Trip",
    description: "Create a new delivery trip with selected orders",
    icon: Truck,
    color: "purple",
    requiresConfirmation: false,
  },
  {
    id: "export",
    label: "Export Data",
    description: "Export selected orders to CSV or PDF",
    icon: Package,
    color: "green",
    requiresConfirmation: false,
  },
];

export const BulkDeliveryActionModal = ({
  isOpen,
  onClose,
  selectedOrders = [],
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [step, setStep] = useState(1); // 1: Select Action, 2: Configure, 3: Confirm

  // Create Trip specific states
  const [warehouseId, setWarehouseId] = useState("");
  const [dispatcherId, setDispatcherId] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [departureDate, setDepartureDate] = useState("");

  const handleActionSelect = (action) => {
    setSelectedAction(action);
    if (action.id === "create-trip") {
      setStep(2);
    } else if (action.requiresConfirmation) {
      setStep(3);
    } else {
      handleExecuteAction(action);
    }
  };

  const handleExecuteAction = async (action = selectedAction) => {
    if (!action) return;

    setLoading(true);
    try {
      switch (action.id) {
        case "mark-in-transit":
          await handleBulkStatusUpdate("InTransit");
          break;
        case "mark-at-store":
          await handleBulkStatusUpdate("AtStore");
          break;
        case "create-trip":
          await handleCreateTrip();
          break;
        case "export":
          await handleExport();
          break;
        default:
          toast.error("Unknown action");
      }
    } catch (error) {
      console.error("Error executing bulk action:", error);
      toast.error("Failed to execute action");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    let successCount = 0;
    let errorCount = 0;

    for (const order of selectedOrders) {
      try {
        const result = await orderService.updateOrderStatus({
          orderId: order.id,
          newStatus: status,
          notes: `Bulk update to ${status}`,
        });

        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error(`Error updating order ${order.id}:`, error);
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} order(s) updated successfully`);
      onSuccess?.();
      onClose();
    }

    if (errorCount > 0) {
      toast.error(`${errorCount} order(s) failed to update`);
    }
  };

  const handleCreateTrip = async () => {
    if (!warehouseId || !dispatcherId) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const tripData = {
        warehouseId: parseInt(warehouseId),
        dispatcherId: dispatcherId,
        orderIds: selectedOrders.map((o) => o.id),
        departureAt: departureDate || undefined,
        vehicle: vehicle || undefined,
      };

      const result = await tripService.createTrip(tripData);

      if (result.success) {
        toast.success("Trip created successfully!");
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.message || "Failed to create trip");
      }
    } catch (error) {
      console.error("Error creating trip:", error);
      toast.error("Failed to create trip");
    }
  };

  const handleExport = async () => {
    try {
      // Simple CSV export
      const headers = ["Order ID", "Store", "Status", "Total", "Created"];
      const rows = selectedOrders.map((order) => [
        order.id,
        order.storeName,
        order.status,
        order.total,
        new Date(order.createdAt).toLocaleDateString(),
      ]);

      const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
        "\n"
      );

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `deliveries_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Data exported successfully");
      onClose();
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };

  const resetModal = () => {
    setStep(1);
    setSelectedAction(null);
    setWarehouseId("");
    setDispatcherId("");
    setVehicle("");
    setDepartureDate("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen || selectedOrders.length === 0) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const totalAmount = selectedOrders.reduce(
    (sum, order) => sum + order.total,
    0
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Delivery Actions">
      <div className="space-y-6">
        {/* Summary */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedOrders.length} order(s) selected
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Total Value: {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Step 1: Select Action */}
        {step === 1 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Select an action
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {BULK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleActionSelect(action)}
                    disabled={loading}
                    className="p-4 text-left border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        className={`h-5 w-5 text-${action.color}-600 flex-shrink-0 mt-0.5`}
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {action.label}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Configure (Create Trip) */}
        {step === 2 && selectedAction?.id === "create-trip" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setStep(1)}
                className="text-blue-600 hover:text-blue-700"
              >
                ← Back
              </button>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Configure Trip
              </h4>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Warehouse ID *
              </label>
              <input
                type="number"
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                placeholder="Enter warehouse ID"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dispatcher ID *
              </label>
              <input
                type="text"
                value={dispatcherId}
                onChange={(e) => setDispatcherId(e.target.value)}
                placeholder="Enter dispatcher ID"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vehicle (Optional)
              </label>
              <input
                type="text"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                placeholder="Vehicle plate number or name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Departure Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                Orders in Trip ({selectedOrders.length})
              </h5>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {selectedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">
                      Order #{order.id}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {order.storeName}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={loading}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!warehouseId || !dispatcherId}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && selectedAction && (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900 dark:text-yellow-100">
                    Confirm Action
                  </p>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                    You are about to {selectedAction.label.toLowerCase()} for{" "}
                    {selectedOrders.length} order(s). This action cannot be
                    undone.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                Affected Orders
              </h5>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {selectedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Order #{order.id}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.storeName}
                      </p>
                    </div>
                    <Badge variant="info">{order.status}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() =>
                  selectedAction.id === "create-trip" ? setStep(2) : setStep(1)
                }
                disabled={loading}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                variant="success"
                onClick={() => handleExecuteAction()}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm & Execute
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
