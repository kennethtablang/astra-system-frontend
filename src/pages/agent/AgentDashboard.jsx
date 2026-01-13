// src/pages/agent/AgentDashboard.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Store,
  Users,
  ShoppingCart,
  Clock,
  CheckCircle,
  Plus,
  Eye,
  ArrowRight,
  TrendingUp,
  Calendar,
  AlertCircle,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { StatCard } from "../../components/ui/StatCard";
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
import orderService from "../../services/orderService";
import { toast } from "react-hot-toast";

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
    totalStores: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [myStores, setMyStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch agent's order statistics
      const statsPromise = orderService.getOrderSummary();

      // Fetch recent orders (agent's orders only)
      const ordersPromise = api.get("/order", {
        params: {
          pageSize: 5,
          pageNumber: 1,
          sortBy: "createdAt",
          sortDescending: true,
        },
      });

      // Fetch agent's stores
      const storesPromise = api.get("/store", {
        params: {
          pageSize: 5,
          pageNumber: 1,
        },
      });

      const [statsRes, ordersRes, storesRes] = await Promise.all([
        statsPromise,
        ordersPromise,
        storesPromise,
      ]);

      // Set stats
      if (statsRes.success) {
        setStats(statsRes.data);
      }

      // Set orders
      if (ordersRes.data.success) {
        setRecentOrders(
          ordersRes.data.data.items || ordersRes.data.data || []
        );
      }

      // Set stores
      if (storesRes.data.success) {
        setMyStores(storesRes.data.data.items || storesRes.data.data || []);
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Get order status badge
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

  // Navigate to create order
  const handleCreateOrder = () => {
    navigate("/agent/orders/create");
  };

  // Navigate to view all orders
  const handleViewAllOrders = () => {
    navigate("/agent/orders");
  };

  // Navigate to view all stores
  const handleViewAllStores = () => {
    navigate("/agent/stores");
  };

  // Navigate to products
  const handleViewProducts = () => {
    navigate("/agent/products");
  };

  // Navigate to order details
  const handleViewOrder = (orderId) => {
    navigate(`/agent/orders?id=${orderId}`);
  };

  // Navigate to store details
  const handleViewStore = (storeId) => {
    navigate(`/agent/stores?id=${storeId}`);
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
        {/* Page Header with Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome Back, Agent!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Here's your overview for today
            </p>
          </div>

          {/* Quick Create Order Button */}
          <Button onClick={handleCreateOrder} className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Order
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Orders"
            value={stats.totalOrders?.toLocaleString() || "0"}
            icon={ShoppingCart}
            color="blue"
          />
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders?.toString() || "0"}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="Confirmed Orders"
            value={stats.confirmedOrders?.toString() || "0"}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="My Stores"
            value={myStores.length.toString() || "0"}
            icon={Store}
            color="purple"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders - Takes 2 columns */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Recent Orders
              </h3>
              <Button variant="ghost" size="sm" onClick={handleViewAllOrders}>
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableHeader>
                <TableBody>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          #{order.id}
                        </TableCell>
                        <TableCell>
                          {order.storeName || order.store?.name || "N/A"}
                        </TableCell>
                        <TableCell>
                          {getOrderStatusBadge(order.status)}
                        </TableCell>
                        <TableCell>
                          ₱
                          {(
                            order.total ||
                            order.totalAmount ||
                            0
                          ).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewOrder(order.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-gray-500 py-8"
                      >
                        <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm">No recent orders</p>
                        <Button
                          size="sm"
                          onClick={handleCreateOrder}
                          className="mt-3"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Order
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Quick Actions & Order Status */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Quick Actions
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleCreateOrder}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Order
                </Button>
                <Button
                  onClick={handleViewAllStores}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Store className="h-4 w-4 mr-2" />
                  Manage Stores
                </Button>
                <Button
                  onClick={handleViewProducts}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Package className="h-4 w-4 mr-2" />
                  View Products
                </Button>
                <Button
                  onClick={handleViewAllOrders}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  View All Orders
                </Button>
              </CardContent>
            </Card>

            {/* Order Status Summary */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Order Status
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Pending
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Awaiting confirmation
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.pendingOrders || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Confirmed
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Ready to pack
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.confirmedOrders || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Package className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Packed
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Ready for dispatch
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.packedOrders || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Delivered
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Completed orders
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.deliveredOrders || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* My Stores Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              My Stores
            </h3>
            <Button variant="ghost" size="sm" onClick={handleViewAllStores}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {myStores.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myStores.map((store) => (
                  <div
                    key={store.id}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleViewStore(store.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Store className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {store.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {store.ownerName || "No owner"}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                    {store.cityName && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        📍 {store.cityName}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Store className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No stores assigned yet
                </p>
                <Button
                  size="sm"
                  onClick={handleViewAllStores}
                  className="mt-3"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Store
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Orders This Week
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.totalOrders || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Keep up the good work!
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Active Stores
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {myStores.length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Manage your stores
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <Store className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pending Actions
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.pendingOrders || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Orders need attention
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentDashboard;
