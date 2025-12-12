import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Calendar,
  Activity,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  ArrowRight,
  AlertTriangle,
  BarChart3,
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
import { toast } from "react-hot-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [activeTrips, setActiveTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(
    async (showRefreshToast = false) => {
      try {
        if (showRefreshToast) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        // Fetch stats using the correct endpoint
        const statsPromise = api.get("/reports/dashboard-stats", {
          params: { from: dateRange.from, to: dateRange.to },
        });

        // Fetch recent orders
        const ordersPromise = api.get("/order", {
          params: {
            pageSize: 5,
            pageNumber: 1,
            sortBy: "createdAt",
            sortDescending: true,
          },
        });

        // Fetch active trips
        const tripsPromise = api
          .get("/trip/active")
          .catch(() => ({ data: { data: [] } }));

        // Fetch low stock products
        const lowStockPromise = api
          .get("/inventory", {
            params: {
              pageSize: 5,
              lowStock: true,
            },
          })
          .catch(() => ({ data: { data: { items: [] } } }));

        // Fetch top products
        const topProductsPromise = api
          .get("/product", {
            params: {
              pageSize: 5,
              sortBy: "totalSold",
              sortDescending: true,
            },
          })
          .catch(() => ({ data: { data: { items: [] } } }));

        // Fetch recent activities/notifications
        const activitiesPromise = api
          .get("/notification/audit-logs", {
            params: { limit: 10 },
          })
          .catch(() => ({ data: { data: [] } }));

        // Wait for all promises
        const [
          statsRes,
          ordersRes,
          tripsRes,
          lowStockRes,
          topProductsRes,
          activitiesRes,
        ] = await Promise.all([
          statsPromise,
          ordersPromise,
          tripsPromise,
          lowStockPromise,
          topProductsPromise,
          activitiesPromise,
        ]);

        // Set stats
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }

        // Set orders
        if (ordersRes.data.success) {
          setRecentOrders(
            ordersRes.data.data.items || ordersRes.data.data || []
          );
        }

        // Set active trips
        if (tripsRes.data.success || tripsRes.data.data) {
          setActiveTrips(tripsRes.data.data || []);
        }

        // Set low stock products
        if (lowStockRes.data.success || lowStockRes.data.data) {
          setLowStockProducts(
            lowStockRes.data.data?.items || lowStockRes.data.data || []
          );
        }

        // Set top products
        if (topProductsRes.data.success || topProductsRes.data.data) {
          setTopProducts(
            topProductsRes.data.data?.items || topProductsRes.data.data || []
          );
        }

        // Set activities
        if (activitiesRes.data.success || activitiesRes.data.data) {
          setRecentActivities(activitiesRes.data.data || []);
        }

        if (showRefreshToast) {
          toast.success("Dashboard refreshed successfully");
        }
      } catch (error) {
        toast.error("Failed to load dashboard data");
        console.error(error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateRange]
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle date range change
  const handleDateChange = (field, value) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

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

  // Get trip status badge
  const getTripStatusBadge = (status) => {
    const variants = {
      Planned: "warning",
      InProgress: "info",
      Completed: "success",
      Cancelled: "danger",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  // Get activity icon
  const getActivityIcon = (actionType) => {
    const icons = {
      OrderCreated: <ShoppingCart className="h-4 w-4 text-blue-500" />,
      OrderConfirmed: <CheckCircle className="h-4 w-4 text-green-500" />,
      OrderCancelled: <XCircle className="h-4 w-4 text-red-500" />,
      TripStarted: <Truck className="h-4 w-4 text-purple-500" />,
      TripCompleted: <CheckCircle className="h-4 w-4 text-green-500" />,
      UserLogin: <Users className="h-4 w-4 text-gray-500" />,
      PaymentReceived: <DollarSign className="h-4 w-4 text-green-500" />,
    };
    return icons[actionType] || <Activity className="h-4 w-4 text-gray-500" />;
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Navigate to create order
  const handleCreateOrder = () => {
    navigate("/admin/orders/create");
  };

  // Navigate to view all orders
  const handleViewAllOrders = () => {
    navigate("/admin/orders");
  };

  // Navigate to view all trips
  const handleViewAllTrips = () => {
    navigate("/admin/trips");
  };

  // Navigate to view inventory
  const handleViewInventory = () => {
    navigate("/admin/inventory");
  };

  // Navigate to view products
  const handleViewProducts = () => {
    navigate("/admin/products");
  };

  // Navigate to order details
  const handleViewOrder = (orderId) => {
    navigate(`/admin/orders?id=${orderId}`);
  };

  // Navigate to trip details
  const handleViewTrip = (tripId) => {
    navigate(`/admin/trips/${tripId}`);
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
        {/* Page Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Overview of your system performance
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Filters */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => handleDateChange("from", e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => handleDateChange("to", e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "..." : ""}
            </Button>

            {/* Quick Create Order */}
            <Button size="sm" onClick={handleCreateOrder}>
              <Plus className="h-4 w-4 mr-1" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders?.toLocaleString() || "0"}
            icon={Package}
            color="blue"
            trend={
              stats?.orderGrowth > 0
                ? "up"
                : stats?.orderGrowth < 0
                ? "down"
                : null
            }
            trendValue={
              stats?.orderGrowth
                ? `${Math.abs(stats.orderGrowth).toFixed(1)}%`
                : null
            }
          />
          <StatCard
            title="Active Trips"
            value={stats?.activeTrips?.toString() || "0"}
            icon={Truck}
            color="purple"
          />
          <StatCard
            title="Active Stores"
            value={stats?.activeStores?.toLocaleString() || "0"}
            icon={Users}
            color="green"
          />
          <StatCard
            title="Total Revenue"
            value={`₱${stats?.totalRevenue?.toLocaleString() || "0"}`}
            icon={DollarSign}
            color="yellow"
            trend={
              stats?.revenueGrowth > 0
                ? "up"
                : stats?.revenueGrowth < 0
                ? "down"
                : null
            }
            trendValue={
              stats?.revenueGrowth
                ? `${Math.abs(stats.revenueGrowth).toFixed(1)}%`
                : null
            }
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
                        No recent orders found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Quick Stats & Activity Feed */}
          <div className="space-y-6">
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
                    {stats?.pendingOrders || 0}
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
                    {stats?.confirmedOrders || 0}
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
                    {stats?.packedOrders || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Delivered Today
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Completed
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats?.deliveredToday || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Recent Activity
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.slice(0, 5).map((activity, index) => (
                      <div
                        key={activity.id || index}
                        className="flex items-start gap-3"
                      >
                        <div className="mt-0.5">
                          {getActivityIcon(activity.actionType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white truncate">
                            {activity.description || activity.actionType}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {activity.userName || "System"} •{" "}
                            {formatTimeAgo(activity.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No recent activity
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Second Row - Active Trips and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Trips */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Active Trips
              </h3>
              <Button variant="ghost" size="sm" onClick={handleViewAllTrips}>
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {activeTrips.length > 0 ? (
                <div className="space-y-4">
                  {activeTrips.slice(0, 5).map((trip) => (
                    <div
                      key={trip.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => handleViewTrip(trip.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Truck className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Trip #{trip.id}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {trip.driverName ||
                              trip.driver?.name ||
                              "No driver"}{" "}
                            • {trip.ordersCount || trip.orders?.length || 0}{" "}
                            orders
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTripStatusBadge(trip.status)}
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Truck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No active trips at the moment
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Low Stock Alerts
                </h3>
                {lowStockProducts.length > 0 && (
                  <Badge variant="danger">{lowStockProducts.length}</Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleViewInventory}>
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length > 0 ? (
                <div className="space-y-3">
                  {lowStockProducts.slice(0, 5).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.productName ||
                              product.product?.name ||
                              "Unknown Product"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            SKU: {product.sku || product.product?.sku || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-red-600">
                          {product.quantity || product.currentStock || 0} left
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Min:{" "}
                          {product.reorderLevel || product.minimumStock || 10}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    All products are well stocked
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    On-Time Delivery
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats?.onTimeDeliveryRate?.toFixed(1) || 0}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Last 30 days
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
                    Outstanding AR
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    ₱{stats?.outstandingAR?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Total receivables
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Avg Order Value
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    ₱{stats?.averageOrderValue?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Per order average
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        {topProducts.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Top Selling Products
              </h3>
              <Button variant="ghost" size="sm" onClick={handleViewProducts}>
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Units Sold</TableHead>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>{product.sku || "N/A"}</TableCell>
                      <TableCell>
                        {product.categoryName ||
                          product.category?.name ||
                          "N/A"}
                      </TableCell>
                      <TableCell>
                        ₱{(product.price || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="success">
                          {(
                            product.totalSold ||
                            product.unitsSold ||
                            0
                          ).toLocaleString()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
