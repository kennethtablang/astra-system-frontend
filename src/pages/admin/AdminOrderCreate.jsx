// src/pages/admin/AdminOrderCreate.jsx - UPDATED
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Scan,
  Store as StoreIcon,
  X,
  Package,
  MapPin,
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
import { getImageUrl } from "../../utils/imageUrl";

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
    barangayId: "",
    cityId: "",
    creditLimit: 0,
  });

  // Product Search & Cart
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [inventoryWarnings, setInventoryWarnings] = useState({});

  // Product Grid State
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const result = await productService.getCategories();
      if (result.success) {
        setCategories(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async (categoryId = null) => {
    setLoadingProducts(true);
    try {
      const params = { pageSize: 100, sortBy: 'name' }; // Fetch a reasonable amount
      if (categoryId) params.categoryId = categoryId;

      const result = await productService.getProducts(params);
      if (result.success) {
        setProducts(result.data.items || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleCategorySelect = (categoryId) => {
    setActiveCategory(categoryId);
    fetchProducts(categoryId === "all" ? null : categoryId);
  };

  // Order Options
  const [selectedWarehouse] = useState(1); // Default warehouse
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

      // Clear search but don't reset grid
      if (searchTerm) {
        setSearchTerm("");
        fetchProducts(activeCategory === "all" ? null : activeCategory);
      }
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
      if (
        !newStoreData.name ||
        !newStoreData.ownerName ||
        !newStoreData.cityId
      ) {
        toast.error("Please fill in required customer information");
        return;
      }
    }

    setSubmitting(true);

    try {
      let storeId = null;

      // Create new store if needed
      if (storeType === "new") {
        const storePayload = {
          name: newStoreData.name,
          ownerName: newStoreData.ownerName,
          phone: newStoreData.phone || null,
          barangayId: newStoreData.barangayId
            ? parseInt(newStoreData.barangayId)
            : null,
          cityId: newStoreData.cityId ? parseInt(newStoreData.cityId) : null,
          creditLimit: parseFloat(newStoreData.creditLimit) || 0,
          preferredPaymentMethod: "Cash",
        };

        const storeResult = await storeService.createStore(storePayload);
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
                          {(selectedStore.barangayName ||
                            selectedStore.cityName) && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-300 mt-1">
                                <MapPin className="h-3 w-3" />
                                {selectedStore.barangayName && (
                                  <span>{selectedStore.barangayName}</span>
                                )}
                                {selectedStore.barangayName &&
                                  selectedStore.cityName && <span>, </span>}
                                {selectedStore.cityName && (
                                  <span>{selectedStore.cityName}</span>
                                )}
                              </div>
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

            {/* Product Selection */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Add Products
                  </h3>
                  <div className="flex items-center gap-2">
                    <select
                      value={activeCategory}
                      onChange={(e) => handleCategorySelect(e.target.value)}
                      className="text-sm p-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Items</option>
                      {categories.map((category, index) => (
                        <option key={`${category.id}-${index}`} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="flex gap-3 mb-6">
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

                {/* Category Tabs */}


                {/* Product Grid */}
                {loadingProducts && !searching ? (
                  <div className="py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading products...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[600px] overflow-y-auto p-1">
                    {(searchTerm ? searchResults : products).map((product, index) => (
                      <button
                        key={`${product.id}-${index}`}
                        onClick={() => addProductToOrder(product)}
                        className="flex flex-col text-left group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-all hover:border-blue-500 dark:hover:border-blue-500"
                      >
                        {/* Product Image */}
                        <div className="h-28 w-full bg-gray-100 dark:bg-gray-900 relative">
                          {product.imageUrl ? (
                            <img
                              src={getImageUrl(product.imageUrl)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                        </div>

                        {/* Product Details */}
                        <div className="p-3">
                          <p className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-sm mb-1 h-10">
                            {product.name}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                              {product.sku}
                            </span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              ₱{product.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                    {(searchTerm ? searchResults : products).length === 0 && (
                      <div className="col-span-full py-12 text-center text-gray-500">
                        <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No products found</p>
                      </div>
                    )}
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
