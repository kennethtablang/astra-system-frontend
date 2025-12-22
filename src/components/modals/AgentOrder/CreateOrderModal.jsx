import { useState, useEffect } from "react";
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { toast } from "react-hot-toast";
import {
  Store,
  Package,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { StoreSelectionModal } from "./StoreSelectionModal";
import { ProductSelectionModal } from "./ProductSelectionModal";
import orderService from "../../../services/orderService";

export const CreateOrderModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [items, setItems] = useState([]);
  const [priority, setPriority] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedStore(null);
      setItems([]);
      setPriority(false);
      setScheduledFor("");
    }
  }, [isOpen]);

  const handleSelectStore = (store) => {
    setSelectedStore(store);
    setStoreModalOpen(false);
  };

  const handleAddProduct = (product) => {
    // Check if product already exists
    const existingItem = items.find((item) => item.productId === product.id);
    if (existingItem) {
      toast.error("Product already added to order");
      return;
    }

    const newItem = {
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity: 1,
      unitPrice: product.price,
    };

    setItems((prev) => [...prev, newItem]);
    toast.success(`${product.name} added to order`);
  };

  const handleUpdateQuantity = (index, quantity) => {
    const newItems = [...items];
    const qty = Math.max(1, parseInt(quantity) || 1);
    newItems[index].quantity = qty;
    setItems(newItems);
  };

  const handleRemoveItem = (index) => {
    const removedItem = items[index];
    setItems((prev) => prev.filter((_, i) => i !== index));
    toast.success(`${removedItem.productName} removed from order`);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.12; // 12% VAT
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!selectedStore) {
      toast.error("Please select a store");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        storeId: selectedStore.id,
        priority,
        scheduledFor: scheduledFor || new Date().toISOString(),
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const result = await orderService.createOrder(orderData);

      if (result.success) {
        toast.success("Order created successfully!");
        onSuccess?.(result.data);
        onClose();
      } else {
        toast.error(result.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(error.response?.data?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const total = calculateTotal();

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Create New Order"
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Store Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Store
            </label>
            {selectedStore ? (
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Store className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedStore.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedStore.barangayName}, {selectedStore.cityName}
                    </p>
                    {selectedStore.ownerName && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Owner: {selectedStore.ownerName}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStoreModalOpen(true)}
                >
                  Change
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStoreModalOpen(true)}
                className="w-full"
              >
                <Store className="h-4 w-4 mr-2" />
                Select Store
              </Button>
            )}
          </div>

          {/* Order Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Order Items ({items.length})
              </label>
              <Button
                type="button"
                size="sm"
                onClick={() => setProductModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            {items.length > 0 ? (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={`${item.productId}-${index}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.productName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        SKU: {item.productSku} •{" "}
                        {formatCurrency(item.unitPrice)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                          Qty
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(index, e.target.value)
                          }
                          className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center"
                        />
                      </div>
                      <div className="text-right min-w-[100px]">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Subtotal
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Order Summary */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Order Summary
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Subtotal
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Tax (12%)
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {formatCurrency(tax)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          Total
                        </span>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  No products added yet
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setProductModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            )}
          </div>

          {/* Additional Options */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Additional Options
            </h3>

            {/* Priority */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={priority}
                onChange={(e) => setPriority(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Mark as priority order
              </span>
            </label>

            {/* Scheduled Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Schedule Delivery (Optional)
              </label>
              <input
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Warning */}
          {items.length > 0 && !selectedStore && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Please select a store before creating the order.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || !selectedStore || items.length === 0}
            >
              {loading ? "Creating..." : "Create Order"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Store Selection Modal */}
      <StoreSelectionModal
        isOpen={storeModalOpen}
        onClose={() => setStoreModalOpen(false)}
        onSelectStore={handleSelectStore}
      />

      {/* Product Selection Modal */}
      <ProductSelectionModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSelectProduct={handleAddProduct}
        excludeProductIds={items.map((item) => item.productId)}
      />
    </>
  );
};
