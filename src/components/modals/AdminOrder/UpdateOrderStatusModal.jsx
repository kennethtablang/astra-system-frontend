import { useState } from "react";
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { toast } from "react-hot-toast";
import {
  CheckCircle,
  Package,
  Truck,
  MapPin,
  XCircle,
  AlertCircle,
} from "lucide-react";
import orderService from "../../../services/orderService";
import { useAuth } from "../../../contexts/AuthContext";

export const UpdateOrderStatusModal = ({
  isOpen,
  onClose,
  order,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const { user } = useAuth();

  const getAvailableActions = () => {
    if (!order) return [];

    const actions = [];
    const status = order.status;
    const isAdmin = user?.role === "Admin";
    const isDistributor = user?.role === "DistributorAdmin";
    const isDispatcher = user?.role === "Dispatcher";

    if (status === "Pending" && (isAdmin || isDistributor)) {
      actions.push({
        type: "confirm",
        label: "Confirm Order",
        icon: CheckCircle,
        color: "blue",
        description: "Confirm and assign to warehouse",
      });
    }

    if (status === "Confirmed" && (isAdmin || isDistributor)) {
      actions.push({
        type: "pack",
        label: "Mark as Packed",
        icon: Package,
        color: "purple",
        description: "Order is packed and ready for dispatch",
      });
    }

    if (status === "Packed" && (isAdmin || isDispatcher)) {
      actions.push({
        type: "dispatch",
        label: "Mark as Dispatched",
        icon: Truck,
        color: "indigo",
        description: "Order has been dispatched",
      });
    }

    if (status === "Dispatched" && (isAdmin || isDispatcher)) {
      actions.push({
        type: "in-transit",
        label: "Mark In Transit",
        icon: Truck,
        color: "blue",
        description: "Order is on the way",
      });
    }

    if (status === "InTransit" && (isAdmin || isDispatcher)) {
      actions.push({
        type: "at-store",
        label: "Mark At Store",
        icon: MapPin,
        color: "teal",
        description: "Order has arrived at store",
      });
    }

    if (status === "AtStore" && (isAdmin || isDispatcher)) {
      actions.push({
        type: "delivered",
        label: "Mark as Delivered",
        icon: CheckCircle,
        color: "green",
        description: "Order successfully delivered",
      });
    }

    if (
      ["InTransit", "AtStore", "Delivered"].includes(status) &&
      (isAdmin || isDistributor || isDispatcher)
    ) {
      actions.push({
        type: "returned",
        label: "Mark as Returned",
        icon: AlertCircle,
        color: "yellow",
        description: "Order was returned",
      });
    }

    if (
      !["Delivered", "Cancelled"].includes(status) &&
      (isAdmin || isDistributor || isDispatcher)
    ) {
      actions.push({
        type: "cancel",
        label: "Cancel Order",
        icon: XCircle,
        color: "red",
        description: "Cancel this order",
      });
    }

    return actions;
  };

  const handleAction = async (actionType) => {
    setLoading(true);
    try {
      let result;

      switch (actionType) {
        case "confirm":
          result = await orderService.confirmOrder({
            orderId: order.id,
            warehouseId: order.warehouseId,
            notes: notes || undefined,
          });
          break;

        case "pack":
          result = await orderService.markOrderAsPacked({
            orderId: order.id,
            notes: notes || undefined,
          });
          break;

        case "dispatch":
          toast.info("Please assign order to a trip first");
          setLoading(false);
          return;

        case "in-transit":
          result = await orderService.markOrderInTransit(order.id);
          break;

        case "at-store":
          result = await orderService.markOrderAtStore(order.id);
          break;

        case "delivered":
          result = await orderService.markOrderDelivered(
            order.id,
            notes || undefined
          );
          break;

        case "returned":
          if (!returnReason.trim()) {
            toast.error("Please provide a reason for return");
            setLoading(false);
            return;
          }
          result = await orderService.markOrderReturned(order.id, returnReason);
          break;

        case "cancel":
          result = await orderService.cancelOrder(
            order.id,
            notes || "Cancelled by user"
          );
          break;

        default:
          toast.error("Unknown action");
          setLoading(false);
          return;
      }

      if (result.success) {
        toast.success(`Order ${actionType} successfully`);
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.message || "Failed to update order");
      }
    } catch (error) {
      console.error("Order status update error:", error);
      toast.error("Failed to update order status");
    } finally {
      setLoading(false);
    }
  };

  const availableActions = getAvailableActions();

  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Order #${order.id}`}
      size="md"
    >
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Current Status
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {order.status}
          </p>
        </div>

        {availableActions.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No available actions for this order status
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.type}
                  onClick={() => handleAction(action.type)}
                  disabled={loading}
                  className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-6 w-6 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {action.label}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {availableActions.some((a) => a.type === "returned") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Return Reason *
            </label>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Why is this order being returned?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        )}

        {availableActions.length > 0 &&
          !availableActions.some((a) => a.type === "returned") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
