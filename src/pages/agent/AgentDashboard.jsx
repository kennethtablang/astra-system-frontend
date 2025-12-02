import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Store, Plus, CheckCircle, Clock } from "lucide-react";
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

      // Fetch my orders
      const { data: ordersData } = await api.get("/orders", {
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
          totalStores: 0, // Will be fetched from stores endpoint
        };
        setOrderStats(stats);
      }

      // Fetch stores count
      const { data: storesData } = await api.get("/stores/lookup");
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
            value={orderStats.totalOrders.toString()}
            icon={Package}
            color="blue"
          />
          <StatCard
            title="Delivered"
            value={orderStats.deliveredOrders.toString()}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Pending"
            value={orderStats.pendingOrders.toString()}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="My Stores"
            value={orderStats.totalStores.toString()}
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
                      className="cursor-pointer hover:bg-gray-50"
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">
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
                onClick={() => navigate("/agent/orders")}
              >
                <Package className="h-4 w-4 mr-2" />
                View All Orders
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">
                Order Summary
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Orders</span>
                  <span className="font-semibold text-gray-900">
                    {orderStats.totalOrders}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-semibold text-yellow-600">
                    {orderStats.pendingOrders}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Delivered</span>
                  <span className="font-semibold text-green-600">
                    {orderStats.deliveredOrders}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="font-semibold text-gray-900">
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
    </DashboardLayout>
  );
};

export default AgentDashboard;
