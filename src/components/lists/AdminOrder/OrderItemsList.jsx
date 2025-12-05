// src/components/lists/AdminOrder/OrderItemsList.jsx
import { Plus, Minus, Trash2, ShoppingCart, AlertCircle } from "lucide-react";
import { Card, CardContent } from "../../ui/Card";

export const OrderItemsList = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  inventoryWarnings = {},
}) => {
  return (
    <Card>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Order Items
        </h3>
      </div>

      {items.length === 0 ? (
        <CardContent className="py-12">
          <div className="text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No items added yet
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Search for products or scan barcodes to add items
            </p>
          </div>
        </CardContent>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {items.map((item) => (
            <div key={item.productId} className="p-4">
              <div className="flex items-start gap-4">
                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    SKU: {item.sku}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Stock: {item.stockLevel} units
                    {item.warehouseName && ` (${item.warehouseName})`}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    ₱{item.unitPrice.toFixed(2)} each
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() =>
                      onUpdateQuantity(
                        item.productId,
                        item.quantity - 1,
                        item.stockLevel
                      )
                    }
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </button>

                  <span className="w-12 text-center font-medium text-gray-900 dark:text-white">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      onUpdateQuantity(
                        item.productId,
                        item.quantity + 1,
                        item.stockLevel
                      )
                    }
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    disabled={item.quantity >= item.stockLevel}
                  >
                    <Plus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                {/* Line Total */}
                <div className="text-right min-w-[100px] flex-shrink-0">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ₱{(item.quantity * item.unitPrice).toFixed(2)}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => onRemoveItem(item.productId)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
                  title="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Inventory Warning */}
              {inventoryWarnings[item.productId] && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-yellow-800 dark:text-yellow-200">
                    {inventoryWarnings[item.productId].message}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
