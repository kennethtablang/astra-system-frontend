// src/pages/admin/AdminInventory.jsx
import { useState, useEffect } from "react";
import {
  Warehouse,
  Package,
  AlertTriangle,
  TrendingDown,
  Search,
  Filter,
  Download,
  Upload,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { LoadingSpinner } from "../../components/ui/Loading";
import api from "../../api/axios";
import { toast } from "react-hot-toast";

const AdminInventory = () => {
  // State Management
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterWarehouse, setFilterWarehouse] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Fetch Inventory
  useEffect(() => {
    fetchInventory();
    fetchWarehouses();
  }, [filterWarehouse, filterStatus]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      // Mock data - Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockInventory = [
        {
          id: 1,
          productId: 1,
          productName: "Coca Cola 1L",
          sku: "BEV-001",
          warehouseId: 1,
          warehouseName: "Main Warehouse",
          stockLevel: 150,
          reorderLevel: 50,
          maxStock: 500,
          category: "Beverages",
          lastRestocked: new Date(Date.now() - 86400000 * 5),
          status: "In Stock",
        },
        {
          id: 2,
          productId: 2,
          productName: "Chippy",
          sku: "SNK-001",
          warehouseId: 1,
          warehouseName: "Main Warehouse",
          stockLevel: 30,
          reorderLevel: 50,
          maxStock: 300,
          category: "Snacks",
          lastRestocked: new Date(Date.now() - 86400000 * 2),
          status: "Low Stock",
        },
        {
          id: 3,
          productId: 3,
          productName: "Surf Powder 250g",
          sku: "HH-001",
          warehouseId: 2,
          warehouseName: "Branch Warehouse",
          stockLevel: 0,
          reorderLevel: 30,
          maxStock: 200,
          category: "Household",
          lastRestocked: new Date(Date.now() - 86400000 * 10),
          status: "Out of Stock",
        },
        {
          id: 4,
          productId: 4,
          productName: "Royal 1.5L",
          sku: "BEV-002",
          warehouseId: 1,
          warehouseName: "Main Warehouse",
          stockLevel: 200,
          reorderLevel: 40,
          maxStock: 400,
          category: "Beverages",
          lastRestocked: new Date(Date.now() - 86400000 * 3),
          status: "In Stock",
        },
        {
          id: 5,
          productId: 5,
          productName: "Safeguard Soap",
          sku: "PC-001",
          warehouseId: 2,
          warehouseName: "Branch Warehouse",
          stockLevel: 45,
          reorderLevel: 50,
          maxStock: 250,
          category: "Personal Care",
          lastRestocked: new Date(Date.now() - 86400000 * 7),
          status: "Low Stock",
        },
      ];

      setInventory(mockInventory);
    } catch (error) {
      toast.error("Failed to fetch inventory");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const { data } = await api.get("/warehouse");
      if (data.success) {
        setWarehouses(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch warehouses:", error);
    }
  };

  // Get stock status
  const getStockStatus = (item) => {
    if (item.stockLevel === 0) return "Out of Stock";
    if (item.stockLevel <= item.reorderLevel) return "Low Stock";
    if (item.stockLevel >= item.maxStock * 0.9) return "Overstocked";
    return "In Stock";
  };

  // Get stock badge
  const getStockBadge = (status) => {
    const badges = {
      "In Stock": <Badge variant="success">In Stock</Badge>,
      "Low Stock": <Badge variant="warning">Low Stock</Badge>,
      "Out of Stock": <Badge variant="danger">Out of Stock</Badge>,
      Overstocked: <Badge variant="info">Overstocked</Badge>,
    };
    return badges[status] || <Badge variant="default">{status}</Badge>;
  };

  // Get stock level bar
  const getStockLevelBar = (current, max) => {
    const percentage = (current / max) * 100;
    let colorClass = "bg-green-500";

    if (percentage === 0) colorClass = "bg-red-500";
    else if (percentage <= 30) colorClass = "bg-yellow-500";
    else if (percentage >= 90) colorClass = "bg-blue-500";

    return (
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClass}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    );
  };

  // Filter inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWarehouse =
      filterWarehouse === "All" ||
      item.warehouseId.toString() === filterWarehouse;
    const matchesStatus =
      filterStatus === "All" || getStockStatus(item) === filterStatus;
    return matchesSearch && matchesWarehouse && matchesStatus;
  });

  // Calculate stats
  const stats = {
    totalProducts: inventory.length,
    inStock: inventory.filter((i) => getStockStatus(i) === "In Stock").length,
    lowStock: inventory.filter((i) => getStockStatus(i) === "Low Stock").length,
    outOfStock: inventory.filter((i) => getStockStatus(i) === "Out of Stock")
      .length,
  };

  // Options
  const warehouseOptions = [
    { value: "All", label: "All Warehouses" },
    ...warehouses.map((w) => ({ value: w.id.toString(), label: w.name })),
  ];

  const statusOptions = [
    { value: "All", label: "All Status" },
    { value: "In Stock", label: "In Stock" },
    { value: "Low Stock", label: "Low Stock" },
    { value: "Out of Stock", label: "Out of Stock" },
    { value: "Overstocked", label: "Overstocked" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Inventory Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track product inventory across warehouses
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import Stock
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Products
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalProducts}
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    In Stock
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.inStock}
                  </p>
                </div>
                <Warehouse className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Low Stock
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.lowStock}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Out of Stock
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.outOfStock}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by product name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={filterWarehouse}
                  onChange={(e) => setFilterWarehouse(e.target.value)}
                  options={warehouseOptions}
                  className="w-48"
                />
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  options={statusOptions}
                  className="w-40"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="text-center py-12">
                <Warehouse className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No inventory found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableHead>Product</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reorder Level</TableHead>
                    <TableHead>Last Restocked</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {item.productName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.sku}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Warehouse className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {item.warehouseName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {item.stockLevel} / {item.maxStock}
                              </span>
                            </div>
                            {getStockLevelBar(item.stockLevel, item.maxStock)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStockBadge(getStockStatus(item))}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {item.reorderLevel}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(item.lastRestocked).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm">
                              Adjust Stock
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminInventory;
