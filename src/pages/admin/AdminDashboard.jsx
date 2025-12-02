import { useState, useEffect } from "react";
import {
  Package,
  Truck,
  Users,
  DollarSign,
  TrendingUp,
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
import { LoadingSpinner } from "../../components/ui/Loading";
import api from "../../api/axios";
import { toast } from "react-hot-toast";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats using the correct endpoint
      const { data: statsData } = await api.get("/reports/dashboard-stats");
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Fetch recent orders
      const { data: ordersData } = await api.get("/orders", {
        params: {
          pageSize: 5,
          pageNumber: 1,
          sortBy: "createdAt",
          sortDescending: true,
        },
      });
      if (ordersData.success) {
        setRecentOrders(ordersData.data.items || []);
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of your system
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders?.toString() || "0"}
            icon={Package}
            color="blue"
          />
          <StatCard
            title="Active Trips"
            value={stats?.activeTrips?.toString() || "0"}
            icon={Truck}
            color="purple"
          />
          <StatCard
            title="Active Stores"
            value={stats?.activeStores?.toString() || "0"}
            icon={Users}
            color="green"
          />
          <StatCard
            title="Revenue"
            value={`₱${stats?.totalRevenue?.toLocaleString() || "0"}`}
            icon={DollarSign}
            color="yellow"
          />
        </div>

        {/* Charts and Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Recent Orders
              </h3>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                </TableHeader>
                <TableBody>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          #{order.id}
                        </TableCell>
                        <TableCell>{order.storeName}</TableCell>
                        <TableCell>
                          {getOrderStatusBadge(order.status)}
                        </TableCell>
                        <TableCell>₱{order.total.toLocaleString()}</TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-gray-500"
                      >
                        No orders found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Quick Stats
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Pending
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Orders
                    </p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats?.pendingOrders || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Truck className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Confirmed
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Orders
                    </p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats?.confirmedOrders || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Delivered
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Today
                    </p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats?.deliveredToday || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Package className="h-5 w-5 text-yellow-600" />
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
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-white">
                    On-Time Delivery
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats?.onTimeDeliveryRate?.toFixed(1) || 0}%
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-white">
                    Outstanding AR
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    ₱{stats?.outstandingAR?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-white">
                    Avg Order Value
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    ₱{stats?.averageOrderValue?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
