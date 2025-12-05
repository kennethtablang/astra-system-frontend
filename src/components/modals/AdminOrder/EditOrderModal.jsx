import { useState, useEffect } from "react";
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { toast } from "react-hot-toast";
import { Package, Plus, X, Calendar, AlertCircle, Search } from "lucide-react";
import orderService from "../../../services/orderService";
import productService from "../../../services/productService";

export const EditOrderModal = ({ isOpen, onClose, order, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [priority, setPriority] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (isOpen && order) {
      setPriority(order.priority || false);
      setScheduledFor(
        order.scheduledFor
          ? new Date(order.scheduledFor).toISOString().slice(0, 16)
          : ""
      );
      setItems(
        order.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }))
      );
    }
  }, [isOpen, order]);

  const handleSearchProducts = async (term) => {
    setSearchTerm(term);
    if (term.length >= 2) {
      setSearching(true);
      try {
        const result = await productService.getProductsForLookup(term);
        if (result.success) {
          setSearchResults(result.data || []);
        }
      } catch (error) {
        console.error("Product search error:", error);
      } finally {
        setSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const addProduct = (product) => {
    const existingItem = items.find((i) => i.productId === product.id);
    if (existingItem) {
      toast.error("Product already added");
      return;
    }

    setItems([
      ...items,
      {
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: 1,
        unitPrice: product.price,
      },
    ]);
    setSearchTerm("");
    setSearchResults([]);
  };

  const updateItemQuantity = (index, quantity) => {
    const newItems = [...items];
    newItems[index].quantity = Math.max(1, parseInt(quantity) || 1);
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const tax = subtotal * 0.12;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        orderId: order.id,
        priority,
        scheduledFor: scheduledFor || null,
        distributorId: order.distributorId,
        warehouseId: order.warehouseId,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      const result = await orderService.editOrder(order.id, orderData);

      if (result.success) {
        toast.success("Order updated successfully");
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.message || "Failed to update order");
      }
    } catch (error) {
      console.error("Edit order error:", error);
      toast.error("Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, tax, total } = calculateTotal();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Order #${order?.id}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Warning */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> Only pending orders can be edited. Changes
              will recalculate order totals.
            </div>
          </div>
        </div>

        {/* Order Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={priority}
                onChange={(e) => setPriority(e.target.checked)}
                className="rounded border-gray-300"
              />
              Priority Order
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Schedule For
            </label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Product Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Add Products
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchProducts(e.target.value)}
              placeholder="Search products by name or SKU..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addProduct(product)}
                  className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        SKU: {product.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600 dark:text-blue-400">
                        ₱{product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Order Items */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Order Items ({items.length})
          </h3>
          {items.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">
                No items added yet
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.productName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      SKU: {item.productSku} • ₱{item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItemQuantity(index, e.target.value)}
                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        {items.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Order Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal
                </span>
                <span className="text-gray-900 dark:text-white">
                  ₱{subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Tax (12%)
                </span>
                <span className="text-gray-900 dark:text-white">
                  ₱{tax.toFixed(2)}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Total
                  </span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    ₱{total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || items.length === 0}
            className="flex-1"
          >
            {loading ? "Updating..." : "Update Order"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
