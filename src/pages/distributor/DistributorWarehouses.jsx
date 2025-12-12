// src/pages/distributor/DistributorWarehouses.jsx
import { useState, useEffect } from "react";
import {
    Warehouse,
    Plus,
    Edit,
    MapPin,
    Package,
    Users,
    Search,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/Loading";
import { warehouseService } from "../../services/warehouseService";
import { toast } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";

const DistributorWarehouses = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [warehouses, setWarehouses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        try {
            setLoading(true);
            const result = await warehouseService.getWarehouses(user?.distributorId);
            if (result.success) {
                setWarehouses(result.data || []);
            }
        } catch (error) {
            console.error("Error fetching warehouses:", error);
            toast.error("Failed to load warehouses");
        } finally {
            setLoading(false);
        }
    };

    const filteredWarehouses = warehouses.filter((warehouse) =>
        warehouse.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warehouse.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                            Warehouses
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage your distributor warehouses
                        </p>
                    </div>
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Warehouse
                    </Button>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="p-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search warehouses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Warehouses Grid */}
                {filteredWarehouses.length === 0 ? (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <Warehouse className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    No warehouses found
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">
                                    {searchTerm ? "Try adjusting your search" : "Add your first warehouse to get started"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredWarehouses.map((warehouse) => (
                            <Card key={warehouse.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                <Warehouse className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {warehouse.name}
                                                </h3>
                                                <Badge variant="info" className="mt-1">
                                                    ID: {warehouse.id}
                                                </Badge>
                                            </div>
                                        </div>
                                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="mt-4 space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <MapPin className="h-4 w-4" />
                                            <span>{warehouse.address || "No address"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Package className="h-4 w-4" />
                                            <span>{warehouse.productCount || 0} products</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Status</span>
                                            <Badge variant={warehouse.isActive ? "success" : "warning"}>
                                                {warehouse.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DistributorWarehouses;
