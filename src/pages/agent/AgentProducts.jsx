// src/pages/agent/AgentProducts.jsx
import { useState, useEffect } from "react";
import {
  Package,
  Search,
  Filter,
  Grid,
  List,
  Tag,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Select } from "../../components/ui/Select";
import { LoadingSpinner } from "../../components/ui/Loading";
import productService from "../../services/productService";
import { toast } from "react-hot-toast";

const AgentProducts = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const result = await productService.getProducts();
      if (result.success) {
        setProducts(result.data?.items || result.data || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

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

  const getStockBadge = (stock) => {
    if (stock === 0) {
      return { variant: "danger", text: "Out of Stock", icon: AlertCircle };
    }
    if (stock <= 10) {
      return { variant: "warning", text: "Low Stock", icon: AlertCircle };
    }
    return { variant: "success", text: "In Stock", icon: CheckCircle };
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      product.categoryId?.toString() === selectedCategory ||
      product.categoryName?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...categories.map((cat) => ({
      value: cat.id?.toString(),
      label: cat.name,
    })),
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Product Catalog
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Browse products for order creation
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                options={categoryOptions}
                className="w-48"
              />
              <div className="flex gap-1 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${
                    viewMode === "grid"
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${
                    viewMode === "list"
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Display */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No products found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Try adjusting your search or filter
                </p>
              </div>
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const stockInfo = getStockBadge(product.currentStock || 0);
              return (
                <Card
                  key={product.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-4">
                    {/* Product Image Placeholder */}
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Tag className="h-3 w-3" />
                        {product.categoryName || "Uncategorized"}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-green-600 dark:text-green-400">
                          ₱{product.price?.toLocaleString() || 0}
                        </span>
                        <Badge variant={stockInfo.variant} className="text-xs">
                          {stockInfo.text}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        SKU: {product.sku || "N/A"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.map((product) => {
                  const stockInfo = getStockBadge(product.currentStock || 0);
                  return (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {product.categoryName || "Uncategorized"}
                          </span>
                          <span>SKU: {product.sku || "N/A"}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 dark:text-green-400">
                          ₱{product.price?.toLocaleString() || 0}
                        </p>
                        <Badge variant={stockInfo.variant} className="mt-1">
                          {stockInfo.text}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AgentProducts;
