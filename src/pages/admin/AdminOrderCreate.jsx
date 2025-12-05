// src/pages/admin/AdminOrderCreate.jsx
// Add this route to your AppRoutes.jsx:
// <Route path="/admin/orders/create" element={<AdminOrderCreate />} />
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Scan,
  Store as StoreIcon,
  X,
  AlertCircle,
  Package,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StoreTypeSelectionModal } from "../../components/modals/AdminOrder/StoreTypeSelectionModal";
import { StoreSearchModal } from "../../components/modals/AdminOrder/StoreSearchModal";
import { BarcodeScannerModal } from "../../components/modals/AdminOrder/BarcodeScannerModal";
import { NewStoreForm } from "../../components/forms/AdminOrder/NewStoreForm";
import { OrderItemsList } from "../../components/lists/AdminOrder/OrderItemsList";
import { OrderSummarySidebar } from "../../components/sidebars/AdminOrder/OrderSummarySidebar";
import productService from "../../services/productService";
import inventoryService from "../../services/inventoryService";
import orderService from "../../services/orderService";
import storeService from "../../services/storeService";
import { toast } from "react-hot-toast";

const AdminOrderCreate = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  // Modal States
  const [showStoreTypeModal, setShowStoreTypeModal] = useState(true);
  const [showStoreSearchModal, setShowStoreSearchModal] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  // Order States
  const [storeType, setStoreType] = useState(null); // 'existing' or 'new'
  const [selectedStore, setSelectedStore] = useState(null);
  const [newStoreData, setNewStoreData] = useState({
    name: "",
    ownerName: "",
    phone: "",
    barangay: "",
    city: "",
    creditLimit: 0,
  });

  // Product Search & Cart
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [inventoryWarnings, setInventoryWarnings] = useState({});

  // Order Options
  const [selectedWarehouse, setSelectedWarehouse] = useState(1); // Default warehouse
  const [priority, setPriority] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Handle Store Type Selection
  const handleStoreTypeSelect = (type) => {
    setStoreType(type);
    setShowStoreTypeModal(false);

    if (type === "existing") {
      setShowStoreSearchModal(true);
    }
  };

  // Handle Store Selection
  const handleStoreSelect = (store) => {
    setSelectedStore(store);
    setShowStoreSearchModal(false);
  };

  // Product Search
  const handleProductSearch = async (term) => {
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

  // Add Product to Order
  const addProductToOrder = async (product) => {
    try {
      // Check inventory
      const inventoryResult = await inventoryService.getInventories({
        productId: product.id,
        warehouseId: selectedWarehouse,
        pageSize: 1,
      });

      if (
        !inventoryResult.success ||
        !inventoryResult.data.items ||
        inventoryResult.data.items.length === 0
      ) {
        toast.error(`${product.name} is not available in inventory`);
        return;
      }

      const inventory = inventoryResult.data.items[0];

      if (inventory.stockLevel === 0) {
        toast.error(`${product.name} is out of stock`);
        setInventoryWarnings({
          ...inventoryWarnings,
          [product.id]: {
            type: "out_of_stock",
            message: "This product is out of stock",
          },
        });
        return;
      }

      // Check if product already in cart
      const existingItem = orderItems.find(
        (item) => item.productId === product.id
      );

      if (existingItem) {
        updateQuantity(
          product.id,
          existingItem.quantity + 1,
          inventory.stockLevel
        );
      } else {
        setOrderItems([
          ...orderItems,
          {
            productId: product.id,
            sku: product.sku,
            name: product.name,
            unitPrice: product.price,
            quantity: 1,
            stockLevel: inventory.stockLevel,
            warehouseName: inventory.warehouseName,
          },
        ]);
        toast.success(`${product.name} added to order`);
      }

      // Clear search
      setSearchTerm("");
      setSearchResults([]);
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    }
  };

  // Update Quantity
  const updateQuantity = (productId, newQuantity, stockLevel) => {
    if (newQuantity > stockLevel) {
      toast.error("Insufficient stock");
      setInventoryWarnings({
        ...inventoryWarnings,
        [productId]: {
          type: "insufficient_stock",
          message: `Only ${stockLevel} units available`,
        },
      });
      return;
    }

    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    setOrderItems(
      orderItems.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );

    // Clear warning
    const newWarnings = { ...inventoryWarnings };
    delete newWarnings[productId];
    setInventoryWarnings(newWarnings);
  };

  // Remove Item
  const removeItem = (productId) => {
    setOrderItems(orderItems.filter((item) => item.productId !== productId));
    const newWarnings = { ...inventoryWarnings };
    delete newWarnings[productId];
    setInventoryWarnings(newWarnings);
    toast.success("Item removed");
  };

  // Submit Order
  const handleSubmitOrder = async () => {
    // Validations
    if (orderItems.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    if (storeType === "existing" && !selectedStore) {
      toast.error("Please select a store");
      return;
    }

    if (storeType === "new") {
      if (!newStoreData.name || !newStoreData.ownerName || !newStoreData.city) {
        toast.error("Please fill in required customer information");
        return;
      }
    }

    setSubmitting(true);

    try {
      let storeId = null;

      // Create new store if needed
      if (storeType === "new") {
        const storeResult = await storeService.createStore(newStoreData);
        if (!storeResult.success) {
          toast.error("Failed to create store");
          return;
        }
        storeId = storeResult.data.id;
      } else {
        storeId = selectedStore.id;
      }

      // Prepare order data
      const orderData = {
        storeId: storeId,
        warehouseId: selectedWarehouse,
        priority: priority,
        scheduledFor: scheduledFor || null,
        items: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      // Create order
      const result = await orderService.createOrder(orderData);

      if (result.success) {
        toast.success("Order created successfully!");
        navigate("/admin/orders");
      } else {
        toast.error(result.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(error.response?.data?.message || "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  // Reset and go back
  const handleCancel = () => {
    if (orderItems.length > 0) {
      if (!window.confirm("Are you sure? All items will be lost.")) {
        return;
      }
    }
    navigate("/admin/orders");
  };

  // If store type not selected yet
  if (!storeType) {
    return (
      <DashboardLayout>
        <StoreTypeSelectionModal
          isOpen={showStoreTypeModal}
          onClose={() => navigate("/admin/orders")}
          onSelectType={handleStoreTypeSelect}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create Order
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {storeType === "existing"
                ? "Existing Store (Suki)"
                : "New Customer (Walk-in)"}
            </p>
          </div>
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Product Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Store Information */}
            {storeType === "existing" && (
              <Card>
                <CardContent className="p-6">
                  {selectedStore ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <StoreIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {selectedStore.name}
                          </p>
                          {selectedStore.ownerName && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Owner: {selectedStore.ownerName}
                            </p>
                          )}
                          {selectedStore.city && (
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {selectedStore.city}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowStoreSearchModal(true)}
                      >
                        Change Store
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setShowStoreSearchModal(true)}
                      className="w-full"
                    >
                      Select Store
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {storeType === "new" && (
              <NewStoreForm
                formData={newStoreData}
                onChange={setNewStoreData}
              />
            )}

            {/* Product Search */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Add Products
                </h3>

                <div className="flex gap-3 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => handleProductSearch(e.target.value)}
                      placeholder="Search products by name or SKU..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <Button onClick={() => setShowBarcodeScanner(true)}>
                    <Scan className="h-5 w-5 mr-2" />
                    Scan
                  </Button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700 max-h-64 overflow-y-auto">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => addProductToOrder(product)}
                        className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Package className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {product.sku}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ₱{product.price.toFixed(2)}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {searching && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                    Searching...
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <OrderItemsList
              items={orderItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              inventoryWarnings={inventoryWarnings}
            />
          </div>

          {/* Right Column - Order Summary */}
          <OrderSummarySidebar
            items={orderItems}
            storeType={storeType}
            selectedStore={selectedStore}
            priority={priority}
            scheduledFor={scheduledFor}
            onPriorityChange={setPriority}
            onScheduleChange={setScheduledFor}
            onSubmit={handleSubmitOrder}
            loading={submitting}
          />
        </div>
      </div>

      {/* Modals */}
      <StoreSearchModal
        isOpen={showStoreSearchModal}
        onClose={() => setShowStoreSearchModal(false)}
        onSelectStore={handleStoreSelect}
      />

      <BarcodeScannerModal
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onProductFound={addProductToOrder}
      />
    </DashboardLayout>
  );
};

export default AdminOrderCreate;
