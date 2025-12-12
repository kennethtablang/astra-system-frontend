// src/pages/distributor/DistributorInventory.jsx
import { useState, useEffect } from "react";
import {
    Package,
    Search,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Filter,
    RefreshCw,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
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
import inventoryService from "../../services/inventoryService";
import { warehouseService } from "../../services/warehouseService";
import { toast } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";

const DistributorInventory = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [inventory, setInventory] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedWarehouse, setSelectedWarehouse] = useState("all");
    const [stockFilter, setStockFilter] = useState("all");
    const [summary, setSummary] = useState({
        totalProducts: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        totalValue: 0,
    });

    useEffect(() => {
        fetchData();
    }, [selectedWarehouse]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch warehouses
            const warehouseResult = await warehouseService.getWarehouses(user?.distributorId);
            if (warehouseResult.success) {
                setWarehouses(warehouseResult.data || []);
            }

            // Fetch inventory
            const params = {};
            if (selectedWarehouse !== "all") {
                params.warehouseId = selectedWarehouse;
            }

            const inventoryResult = await inventoryService.getInventories(params);
            if (inventoryResult.success) {
                setInventory(inventoryResult.data?.items || inventoryResult.data || []);
            }

            // Fetch summary
            const summaryResult = await inventoryService.getInventorySummary(
                selectedWarehouse !== "all" ? selectedWarehouse : null
            );
            if (summaryResult.success && summaryResult.data) {
                setSummary(summaryResult.data);
            }
        } catch (error) {
            console.error("Error fetching inventory:", error);
            toast.error("Failed to load inventory");
        } finally {
            setLoading(false);
        }
    };

    const getStockStatus = (item) => {
        if (item.currentStock === 0) return { status: "Out of Stock", variant: "danger" };
        if (item.currentStock <= item.reorderPoint) return { status: "Low Stock", variant: "warning" };
        return { status: "In Stock", variant: "success" };
    };

    const filteredInventory = inventory.filter((item) => {
        const matchesSearch =
            item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku?.toLowerCase().includes(searchTerm.toLowerCase());

        if (stockFilter === "low") {
            return matchesSearch && item.currentStock <= item.reorderPoint && item.currentStock > 0;
        }
        if (stockFilter === "out") {
            return matchesSearch && item.currentStock === 0;
        }
        return matchesSearch;
    });

    const warehouseOptions = [
        { value: "all", label: "All Warehouses" },
        ...warehouses.map((w) => ({ value: w.id.toString(), label: w.name })),
    ];

    const stockOptions = [
        { value: "all", label: "All Stock Levels" },
        { value: "low", label: "Low Stock" },
        { value: "out", label: "Out of Stock" },
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
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Inventory Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Monitor and manage stock levels across warehouses
                        </p>
                    </div>
                    <Button onClick={fetchData} variant="outline" className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Products</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {summary.totalProducts}
                                    </p>
                                </div>
                                <Package className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Low Stock</p>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {summary.lowStockCount}
                                    </p>
                                </div>
                                <TrendingDown className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Out of Stock</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {summary.outOfStockCount}
                                    </p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Value</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        ₱{summary.totalValue?.toLocaleString() || 0}
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-3">
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
                            <Select
                                value={selectedWarehouse}
                                onChange={(e) => setSelectedWarehouse(e.target.value)}
                                options={warehouseOptions}
                                className="w-40"
                            />
                            <Select
                                value={stockFilter}
                                onChange={(e) => setStockFilter(e.target.value)}
                                options={stockOptions}
                                className="w-40"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Inventory Table */}
                <Card>
                    <CardContent className="p-0">
                        {filteredInventory.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    No inventory found
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">
                                    Try adjusting your filters
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableHead>Product</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Warehouse</TableHead>
                                        <TableHead className="text-right">Current Stock</TableHead>
                                        <TableHead className="text-right">Reorder Point</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredInventory.map((item) => {
                                            const stockStatus = getStockStatus(item);
                                            return (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {item.productName}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-gray-600 dark:text-gray-400">
                                                        {item.sku || "-"}
                                                    </TableCell>
                                                    <TableCell className="text-gray-600 dark:text-gray-400">
                                                        {item.warehouseName}
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold">
                                                        {item.currentStock}
                                                    </TableCell>
                                                    <TableCell className="text-right text-gray-600 dark:text-gray-400">
                                                        {item.reorderPoint}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={stockStatus.variant}>
                                                            {stockStatus.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
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

export default DistributorInventory;
