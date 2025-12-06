import { useState, useEffect } from "react";
import {
  Truck,
  User,
  Calendar,
  MapPin,
  Package,
  AlertCircle,
  Search,
  X,
  Clock,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import tripService from "../../../services/tripService";
import orderService from "../../../services/orderService";
import { warehouseService } from "../../../services/warehouseService";
import userService from "../../../services/userService";

const Modal = ({ isOpen, onClose, title, children, size = "xl" }) => {
  if (!isOpen) return null;

  const sizes = {
    md: "max-w-lg",
    lg: "max-w-2xl",
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

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
};

export const CreateTripModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [warehouseId, setWarehouseId] = useState("");
  const [dispatcherId, setDispatcherId] = useState("");
  const [departureAt, setDepartureAt] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [estimatedReturn, setEstimatedReturn] = useState("");

  const [warehouses, setWarehouses] = useState([]);
  const [dispatchers, setDispatchers] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    } else {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setWarehouseId("");
    setDispatcherId("");
    setDepartureAt("");
    setVehicle("");
    setEstimatedReturn("");
    setSelectedOrders([]);
    setSearchTerm("");
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [warehousesResult, dispatchersResult] = await Promise.all([
        warehouseService.getWarehouses(),
        userService.getUsersByRole("Dispatcher"),
      ]);

      if (warehousesResult.success) {
        setWarehouses(warehousesResult.data || []);
      }

      if (dispatchersResult.success) {
        setDispatchers(dispatchersResult.data || []);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (warehouseId) {
      fetchAvailableOrders(warehouseId);
    } else {
      setAvailableOrders([]);
    }
  }, [warehouseId]);

  const fetchAvailableOrders = async (whId) => {
    try {
      const result = await orderService.getOrdersReadyForDispatch(
        parseInt(whId)
      );
      if (result.success) {
        setAvailableOrders(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load available orders");
    }
  };

  const handleOrderToggle = (order) => {
    setSelectedOrders((prev) => {
      const exists = prev.find((o) => o.id === order.id);
      if (exists) {
        return prev.filter((o) => o.id !== order.id);
      } else {
        return [...prev, order];
      }
    });
  };

  const handleSelectAll = () => {
    const filtered = filteredOrders;
    if (selectedOrders.length === filtered.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filtered);
    }
  };

  const handleSubmit = async () => {
    if (!warehouseId) {
      toast.error("Please select a warehouse");
      return;
    }

    if (!dispatcherId) {
      toast.error("Please select a dispatcher");
      return;
    }

    if (selectedOrders.length === 0) {
      toast.error("Please select at least one order");
      return;
    }

    setSubmitting(true);
    try {
      const tripData = {
        warehouseId: parseInt(warehouseId),
        dispatcherId: dispatcherId,
        departureAt: departureAt || null,
        vehicle: vehicle || null,
        estimatedReturn: estimatedReturn || null,
        orderIds: selectedOrders.map((o) => o.id),
      };

      const result = await tripService.createTrip(tripData);

      if (result.success) {
        toast.success(
          `Trip created successfully with ${selectedOrders.length} order(s)`
        );
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.message || "Failed to create trip");
      }
    } catch (error) {
      console.error("Create trip error:", error);
      toast.error(error.response?.data?.message || "Failed to create trip");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOrders = availableOrders.filter((order) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      order.id.toString().includes(search) ||
      order.storeName?.toLowerCase().includes(search) ||
      order.storeBarangay?.toLowerCase().includes(search) ||
      order.storeCity?.toLowerCase().includes(search)
    );
  });

  const calculateTotalValue = () => {
    return selectedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Trip" size="2xl">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Warehouse *
              </label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

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

            <div className="md:col-span-2">
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

          {warehouseId && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Select Orders ({selectedOrders.length} selected)
                </h3>
                {filteredOrders.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleSelectAll}
                    className="text-xs"
                  >
                    {selectedOrders.length === filteredOrders.length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                )}
              </div>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search orders..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-80 overflow-y-auto">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {availableOrders.length === 0
                        ? "No orders ready for dispatch"
                        : "No orders match your search"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredOrders.map((order) => {
                      const isSelected = selectedOrders.find(
                        (o) => o.id === order.id
                      );
                      return (
                        <div
                          key={order.id}
                          onClick={() => handleOrderToggle(order)}
                          className={`p-4 cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                              : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-1 h-5 w-5 rounded border-2 flex items-center justify-center ${
                                  isSelected
                                    ? "bg-blue-600 border-blue-600"
                                    : "border-gray-300 dark:border-gray-600"
                                }`}
                              >
                                {isSelected && (
                                  <CheckCircle className="h-4 w-4 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    Order #{order.id}
                                  </p>
                                  {order.priority && (
                                    <Badge variant="warning">Priority</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {order.storeName}
                                </p>
                                {(order.storeBarangay || order.storeCity) && (
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {order.storeBarangay &&
                                      `${order.storeBarangay}, `}
                                    {order.storeCity}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(order.total || 0)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedOrders.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Trip Summary
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {selectedOrders.length} order(s) selected
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Total Value
                      </p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(calculateTotalValue())}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedOrders.length === 0 && warehouseId && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Please select at least one order to create a trip
                </p>
              </div>
            </div>
          )}

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
              disabled={
                submitting ||
                selectedOrders.length === 0 ||
                !warehouseId ||
                !dispatcherId
              }
              className="flex-1"
            >
              {submitting ? "Creating Trip..." : "Create Trip"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
