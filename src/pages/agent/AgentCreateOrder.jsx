/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Search, Loader2, Calendar } from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardHeader, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Modal } from "../../components/ui/Modal";
import api from "../../api/axios";
import { toast } from "react-hot-toast";

const AgentCreateOrder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  const [formData, setFormData] = useState({
    storeId: "",
    distributorId: "",
    warehouseId: "",
    priority: false,
    scheduledFor: "",
    items: [],
  });

  const [searchStore, setSearchStore] = useState("");
  const [searchProduct, setSearchProduct] = useState("");
  const [selectedStore, setSelectedStore] = useState(null);

  useEffect(() => {
    fetchStores();
    fetchProducts();
  }, []);

  const fetchStores = async () => {
    try {
      const { data } = await api.get("/stores/lookup", {
        params: { searchTerm: searchStore },
      });
      if (data.success) {
        setStores(data.data || []);
      }
    } catch (error) {
      console.error("Failed to load stores", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products/lookup", {
        params: { searchTerm: searchProduct },
      });
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error("Failed to load products", error);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchStores();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchStore]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchProduct]);

  const handleSelectStore = (store) => {
    setSelectedStore(store);
    setFormData({ ...formData, storeId: store.id });
    setShowStoreModal(false);
  };

  const handleAddProduct = (product) => {
    const existingItem = formData.items.find(
      (item) => item.productId === product.id
    );

    if (existingItem) {
      toast.error("Product already added");
      return;
    }

    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          unitPrice: product.price,
          quantity: 1,
        },
      ],
    });
    setShowProductModal(false);
  };

  const handleUpdateQuantity = (index, quantity) => {
    const newItems = [...formData.items];
    newItems[index].quantity = Math.max(1, parseInt(quantity) || 1);
    setFormData({ ...formData, items: newItems });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = subtotal * 0; // No tax for now
    return subtotal + tax;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.storeId) {
      toast.error("Please select a store");
      return;
    }

    if (formData.items.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        storeId: formData.storeId,
        distributorId: formData.distributorId || null,
        warehouseId: formData.warehouseId || null,
        priority: formData.priority,
        scheduledFor: formData.scheduledFor || new Date().toISOString(),
        items: formData.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const { data } = await api.post("/orders", orderData);

      if (data.success) {
        toast.success("Order created successfully!");
        navigate(`/agent/orders/${data.data.id}`);
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create order";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Order</h1>
            <p className="text-gray-600 mt-1">Add a new order for a store</p>
          </div>
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/agent/orders")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Creating...
                </>
              ) : (
                "Create Order"
              )}
            </Button>
          </div>
        </div>

        {/* Store Selection */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Store Details</h3>
          </CardHeader>
          <CardContent>
            {selectedStore ? (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedStore.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedStore.barangay}, {selectedStore.city}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Owner: {selectedStore.ownerName || "N/A"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStoreModal(true)}
                >
                  Change Store
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowStoreModal(true)}
              >
                <Search className="h-4 w-4 mr-2" />
                Select Store
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
            <Button
              type="button"
              size="sm"
              onClick={() => setShowProductModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </CardHeader>
          <CardContent>
            {formData.items.length > 0 ? (
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.productName}
                      </p>
                      <p className="text-sm text-gray-500">
                        SKU: {item.productSku}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        ₱{item.unitPrice.toLocaleString()} per unit
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(index, e.target.value)
                          }
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600 mb-1">Subtotal</p>
                        <p className="font-medium text-gray-900">
                          ₱{(item.quantity * item.unitPrice).toLocaleString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Order Summary */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      ₱{calculateSubtotal().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">₱0.00</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                    <span>Total</span>
                    <span>₱{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-4">No products added yet</p>
                <Button type="button" onClick={() => setShowProductModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Options */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">
              Additional Options
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="priority"
                  checked={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="priority"
                  className="ml-2 text-sm text-gray-700"
                >
                  Mark as priority order
                </label>
              </div>

              <Input
                label="Scheduled Delivery Date (Optional)"
                type="datetime-local"
                icon={Calendar}
                value={formData.scheduledFor}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledFor: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Store Selection Modal */}
      <Modal
        isOpen={showStoreModal}
        onClose={() => setShowStoreModal(false)}
        title="Select Store"
        size="md"
      >
        <div className="space-y-4">
          <Input
            placeholder="Search stores..."
            icon={Search}
            value={searchStore}
            onChange={(e) => setSearchStore(e.target.value)}
          />
          <div className="max-h-96 overflow-y-auto space-y-2">
            {stores.map((store) => (
              <div
                key={store.id}
                onClick={() => handleSelectStore(store)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <p className="font-medium text-gray-900">{store.name}</p>
                <p className="text-sm text-gray-600">
                  {store.barangay}, {store.city}
                </p>
                {store.ownerName && (
                  <p className="text-xs text-gray-500 mt-1">
                    Owner: {store.ownerName}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Product Selection Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        title="Add Product"
        size="md"
      >
        <div className="space-y-4">
          <Input
            placeholder="Search products..."
            icon={Search}
            value={searchProduct}
            onChange={(e) => setSearchProduct(e.target.value)}
          />
          <div className="max-h-96 overflow-y-auto space-y-2">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => handleAddProduct(product)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Category: {product.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ₱{product.price.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      per {product.unitOfMeasure}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default AgentCreateOrder;
