import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Store, Plus, CheckCircle, Clock, ShoppingCart } from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardHeader, CardContent } from "../../components/ui/Card";
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
import { LoadingSpinner } from "../../components/ui/Loading";
import api from "../../api/axios";
import { toast } from "react-hot-toast";

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalStores: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch my orders (using correct singular endpoint)
      const { data: ordersData } = await api.get("/order", {
        params: {
          pageSize: 10,
          pageNumber: 1,
          sortBy: "createdAt",
          sortDescending: true,
        },
      });

      if (ordersData.success) {
        const orders = ordersData.data.items || [];
        setMyOrders(orders);

        // Calculate stats from orders
        const stats = {
          totalOrders: ordersData.data.totalCount || 0,
          pendingOrders: orders.filter((o) => o.status === "Pending").length,
          deliveredOrders: orders.filter((o) => o.status === "Delivered")
            .length,
          totalStores: 0, // Will be fetched from store endpoint
        };
        setOrderStats(stats);
      }

      // Fetch stores count (using correct singular endpoint)
      const { data: storesData } = await api.get("/store/lookup");
      if (storesData.success) {
        setOrderStats((prev) => ({
          ...prev,
          totalStores: storesData.data.length || 0,
        }));
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusBadge = (status) => {
    const variants = {
      Pending: "warning",
      Confirmed: "info",
      Packed: "info",
      Dispatched: "purple",
      InTransit: "purple",
      Delivered: "success",
      Cancelled: "danger",
      Returned: "danger",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your orders and customer stores</p>
          </div>
          <Button onClick={() => navigate("/agent/orders/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{orderStats.totalOrders}</p>
                </div>
                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Delivered</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{orderStats.deliveredOrders}</p>
                </div>
                <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{orderStats.pendingOrders}</p>
                </div>
                <div className="h-10 w-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Stores</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{orderStats.totalStores}</p>
                </div>
                <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <Store className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Orders</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/agent/orders")}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Store</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                    </TableHeader>
                    <TableBody>
                      {myOrders.length > 0 ? (
                        myOrders.slice(0, 5).map((order) => (
                          <TableRow
                            key={order.id}
                            onClick={() => navigate(`/agent/orders/${order.id}`)}
                            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <TableCell className="font-medium">#{order.id}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{order.storeName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {order.storeBarangay}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                            <TableCell className="font-medium">₱{order.total.toLocaleString()}</TableCell>
                            <TableCell>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center text-gray-500 py-8"
                          >
                            <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                            <p className="font-medium">No orders yet</p>
                            <p className="text-sm mt-1">
                              Create your first order to get started
                            </p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Summary - Takes up 1 column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Quick Actions
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate("/agent/orders/create")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Order
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate("/agent/stores")}
                >
                  <Store className="h-4 w-4 mr-2" />
                  Manage Stores
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate("/agent/products")}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Product Catalog
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Performance
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Orders</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {orderStats.totalOrders}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                      {orderStats.pendingOrders}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Delivered</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {orderStats.deliveredOrders}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {orderStats.totalOrders > 0
                        ? (
                          (orderStats.deliveredOrders /
                            orderStats.totalOrders) *
                          100
                        ).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentDashboard;
