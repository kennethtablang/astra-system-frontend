// src/components/sidebars/AdminOrder/OrderSummarySidebar.jsx
import { CheckCircle } from "lucide-react";
import { Card, CardContent } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";

export const OrderSummarySidebar = ({
  items,
  storeType,
  selectedStore,
  priority,
  scheduledFor,
  onPriorityChange,
  onScheduleChange,
  onSubmit,
  loading = false,
}) => {
  // Calculate totals
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const tax = subtotal * 0.12; // 12% VAT
  const total = subtotal + tax;
  const totalItems = items.length;
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card className="sticky top-6">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Order Summary
        </h3>

        {/* Totals */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
            <span className="text-gray-900 dark:text-white font-medium">
              ₱{subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Tax (12%)</span>
            <span className="text-gray-900 dark:text-white font-medium">
              ₱{tax.toFixed(2)}
            </span>
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900 dark:text-white">
                Total
              </span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ₱{total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Order Options */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={priority}
                onChange={(e) => onPriorityChange(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <span>Priority Order</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Schedule Delivery (Optional)
            </label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => onScheduleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={onSubmit}
          disabled={items.length === 0 || loading}
          className="w-full flex items-center justify-center gap-2"
        >
          <CheckCircle className="h-5 w-5" />
          {loading ? "Creating Order..." : "Create Order"}
        </Button>

        {/* Order Info */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Items</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {totalItems}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Total Units
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {totalUnits}
            </span>
          </div>

          {storeType === "existing" && selectedStore && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Customer</span>
              <span className="font-medium text-gray-900 dark:text-white truncate ml-2">
                {selectedStore.name}
              </span>
            </div>
          )}

          {storeType === "new" && (
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-800 dark:text-yellow-200">
              Cash on Delivery
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
