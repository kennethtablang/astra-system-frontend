import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Store,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
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

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch agent stats
      const { data: statsData } = await api.get("/agent/stats");
      setStats(statsData.data);

      // Fetch my orders
      const { data: ordersData } = await api.get("/orders/my-orders", {
        params: { pageSize: 10, pageNumber: 1 },
      });
      setMyOrders(ordersData.data.items || []);
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
            <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your orders and stores</p>
          </div>
          <Button onClick={() => navigate("/agent/orders/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders || "0"}
            icon={Package}
            color="blue"
          />
          <StatCard
            title="Delivered"
            value={stats?.deliveredOrders || "0"}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Pending"
            value={stats?.pendingOrders || "0"}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="My Stores"
            value={stats?.totalStores || "0"}
            icon={Store}
            color="purple"
          />
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/agent/orders")}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableHead>Order ID</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
              </TableHeader>
              <TableBody>
                {myOrders.length > 0 ? (
                  myOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      onClick={() => navigate(`/agent/orders/${order.id}`)}
                    >
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.storeName}</p>
                          <p className="text-xs text-gray-500">
                            {order.storeBarangay}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                      <TableCell>{order.itemCount} items</TableCell>
                      <TableCell>₱{order.total.toLocaleString()}</TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-gray-500 py-8"
                    >
                      <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="font-medium">No orders yet</p>
                      <p className="text-sm mt-1">
                        Create your first order to get started
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => navigate("/agent/orders/create")}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Order
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Order Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.ordersThisWeek || 0}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +{stats?.weekGrowth || 0}% from last week
                </p>
              </div>
              <Package className="h-12 w-12 text-blue-500" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.ordersThisMonth || 0}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +{stats?.monthGrowth || 0}% from last month
                </p>
              </div>
              <Package className="h-12 w-12 text-green-500" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.successRate || 0}%
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Delivery success rate
                </p>
              </div>
              <CheckCircle className="h-12 w-12 text-purple-500" />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentDashboard;
