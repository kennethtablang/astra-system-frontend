// src/pages/admin/AdminInventory.jsx
import { useState, useEffect } from "react";
import {
  Warehouse,
  Package,
  AlertTriangle,
  TrendingDown,
  Search,
  Download,
  Upload,
  History,
  Settings,
  Plus,
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
import { InventoryCreateModal } from "../../components/modals/AdminInventory/InventoryCreateModal";
import { InventoryAdjustModal } from "../../components/modals/AdminInventory/InventoryAdjustModal";
import { InventoryMovementModal } from "../../components/modals/AdminInventory/InventoryMovementModal";
import { InventoryLevelsModal } from "../../components/modals/AdminInventory/InventoryLevelsModal";
import inventoryService from "../../services/inventoryService";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalInventory, setTotalInventory] = useState(0);
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showLevelsModal, setShowLevelsModal] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);

  // Fetch Inventory
  useEffect(() => {
    fetchInventory();
    fetchWarehouses();
    fetchSummary();
  }, [currentPage, pageSize, searchTerm, filterWarehouse, filterStatus]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = {
        pageNumber: currentPage,
        pageSize: pageSize,
      };

      if (searchTerm) params.searchTerm = searchTerm;
      if (filterWarehouse !== "All") params.warehouseId = filterWarehouse;
      if (filterStatus !== "All") params.status = filterStatus;

      const result = await inventoryService.getInventories(params);

      if (result.success) {
        setInventory(result.data.items || []);
        setTotalInventory(result.data.totalCount || 0);
      }
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

  const fetchSummary = async () => {
    try {
      const warehouseId = filterWarehouse !== "All" ? filterWarehouse : null;
      const result = await inventoryService.getInventorySummary(warehouseId);

      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch summary:", error);
    }
  };

  // Handle Create Inventory
  const handleCreateInventory = async (formData) => {
    try {
      const result = await inventoryService.createInventory(formData);

      if (!result.success) {
        toast.error(result.message || "Failed to create inventory");
        throw new Error(result.message || "Failed to create inventory");
      }

      toast.success("Inventory created successfully");
      setShowCreateModal(false);
      fetchInventory();
      fetchSummary();
    } catch (error) {
      toast.error(error.message || "Failed to create inventory");
      console.error(error);
      throw error;
    }
  };

  // Handle Adjust Inventory
  const handleAdjustInventory = async (formData) => {
    try {
      const result = await inventoryService.adjustInventory(formData);

      if (!result.success) {
        toast.error(result.message || "Failed to adjust inventory");
        return;
      }

      toast.success("Inventory adjusted successfully");
      setShowAdjustModal(false);
      setSelectedInventory(null);
      fetchInventory();
      fetchSummary();
    } catch (error) {
      toast.error(error.message || "Failed to adjust inventory");
      console.error(error);
    }
  };

  // Handle Update Levels
  const handleUpdateLevels = async (formData) => {
    try {
      const result = await inventoryService.updateInventoryLevels(formData);

      if (!result.success) {
        toast.error(result.message || "Failed to update levels");
        return;
      }

      toast.success("Inventory levels updated successfully");
      setShowLevelsModal(false);
      setSelectedInventory(null);
      fetchInventory();
    } catch (error) {
      toast.error(error.message || "Failed to update levels");
      console.error(error);
    }
  };

  // Open Modals
  const openAdjustModal = (item) => {
    setSelectedInventory(item);
    setShowAdjustModal(true);
  };

  const openMovementModal = (item) => {
    setSelectedInventory(item);
    setShowMovementModal(true);
  };

  const openLevelsModal = (item) => {
    setSelectedInventory(item);
    setShowLevelsModal(true);
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
  const getStockLevelBar = (current, max, reorderLevel) => {
    const percentage = (current / max) * 100;
    let colorClass = "bg-green-500";

    if (percentage === 0) colorClass = "bg-red-500";
    else if (current <= reorderLevel) colorClass = "bg-yellow-500";
    else if (percentage >= 90) colorClass = "bg-blue-500";

    return (
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClass} transition-all`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    );
  };

  // Pagination
  const totalPages = Math.ceil(totalInventory / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalInventory);

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

  const pageSizeOptions = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
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
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Inventory
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
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
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={filterWarehouse}
                  onChange={(e) => {
                    setFilterWarehouse(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={warehouseOptions}
                  className="w-48"
                />
                <Select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
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
            ) : inventory.length === 0 ? (
              <div className="text-center py-12">
                <Warehouse className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No inventory found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {searchTerm || filterStatus !== "All"
                    ? "Try adjusting your search or filters"
                    : "Get started by adding inventory records"}
                </p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Inventory
                </Button>
              </div>
            ) : (
              <>
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
                      {inventory.map((item) => (
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
                                  {item.productSku}
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
                            <div className="space-y-1 min-w-[120px]">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {item.stockLevel}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">
                                  / {item.maxStock}
                                </span>
                              </div>
                              {getStockLevelBar(
                                item.stockLevel,
                                item.maxStock,
                                item.reorderLevel
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStockBadge(item.status)}</TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {item.reorderLevel}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {item.lastRestocked
                                ? new Date(
                                    item.lastRestocked
                                  ).toLocaleDateString()
                                : "Never"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openAdjustModal(item)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Adjust stock"
                              >
                                <Package className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openMovementModal(item)}
                                className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                title="View history"
                              >
                                <History className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openLevelsModal(item)}
                                className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title="Update levels"
                              >
                                <Settings className="h-4 w-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Select
                        value={pageSize.toString()}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        options={pageSizeOptions}
                        className="w-20"
                      />
                      <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {startIndex}-{endIndex} of {totalInventory}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = idx + 1;
                          } else if (currentPage <= 3) {
                            pageNum = idx + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + idx;
                          } else {
                            pageNum = currentPage - 2 + idx;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === pageNum
                                  ? "bg-blue-600 text-white"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <InventoryCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateInventory}
      />

      <InventoryAdjustModal
        isOpen={showAdjustModal}
        onClose={() => {
          setShowAdjustModal(false);
          setSelectedInventory(null);
        }}
        onSubmit={handleAdjustInventory}
        selectedInventory={selectedInventory}
      />

      <InventoryMovementModal
        isOpen={showMovementModal}
        onClose={() => {
          setShowMovementModal(false);
          setSelectedInventory(null);
        }}
        selectedInventory={selectedInventory}
      />

      <InventoryLevelsModal
        isOpen={showLevelsModal}
        onClose={() => {
          setShowLevelsModal(false);
          setSelectedInventory(null);
        }}
        onSubmit={handleUpdateLevels}
        selectedInventory={selectedInventory}
      />
    </DashboardLayout>
  );
};

export default AdminInventory;
