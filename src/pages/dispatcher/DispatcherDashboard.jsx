import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
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

const DispatcherDashboard = () => {
  const navigate = useNavigate();
  const [activeTrips, setActiveTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeTrips: 0,
    pendingDeliveries: 0,
    completedToday: 0,
    readyOrders: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch active trips
      const { data: tripsData } = await api.get("/trips", {
        params: {
          status: "Started,InProgress",
          pageSize: 10,
          pageNumber: 1,
        },
      });

      if (tripsData.success) {
        const trips = tripsData.data.items || [];
        setActiveTrips(trips);

        setStats((prev) => ({
          ...prev,
          activeTrips: trips.length,
        }));
      }

      // Fetch order stats
      const { data: ordersData } = await api.get("/orders", {
        params: {
          status: "Packed",
          pageSize: 1,
          pageNumber: 1,
        },
      });

      if (ordersData.success) {
        setStats((prev) => ({
          ...prev,
          readyOrders: ordersData.data.totalCount || 0,
        }));
      }

      // Get delivered today count
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: deliveredData } = await api.get("/orders", {
        params: {
          status: "Delivered",
          createdFrom: today.toISOString(),
          pageSize: 1,
          pageNumber: 1,
        },
      });

      if (deliveredData.success) {
        setStats((prev) => ({
          ...prev,
          completedToday: deliveredData.data.totalCount || 0,
        }));
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTripStatusBadge = (status) => {
    const variants = {
      Created: "default",
      Assigned: "info",
      Started: "purple",
      InProgress: "purple",
      Completed: "success",
      Cancelled: "danger",
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
            <h1 className="text-2xl font-bold text-gray-900">
              Delivery Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Track and manage deliveries</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Trips"
            value={stats.activeTrips.toString()}
            icon={Truck}
            color="purple"
          />
          <StatCard
            title="Ready for Dispatch"
            value={stats.readyOrders.toString()}
            icon={Package}
            color="yellow"
          />
          <StatCard
            title="Completed Today"
            value={stats.completedToday.toString()}
            icon={CheckCircle}
            color="green"
          />
          <StatCard title="Issues" value="0" icon={AlertCircle} color="red" />
        </div>

        {/* Active Trips */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Active Trips</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dispatcher/trips")}
            >
              View All Trips
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableHead>Trip ID</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Departure</TableHead>
                <TableHead>Actions</TableHead>
              </TableHeader>
              <TableBody>
                {activeTrips.length > 0 ? (
                  activeTrips.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell className="font-medium">#{trip.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Truck className="h-4 w-4 mr-2 text-gray-400" />
                          {trip.vehicle || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>{getTripStatusBadge(trip.status)}</TableCell>
                      <TableCell>{trip.orderCount} orders</TableCell>
                      <TableCell>
                        {trip.departureAt
                          ? new Date(trip.departureAt).toLocaleString()
                          : "Not set"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(`/dispatcher/trips/${trip.id}`)
                          }
                        >
                          View
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
                      <Truck className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="font-medium">No active trips</p>
                      <p className="text-sm mt-1">
                        Trips will appear here once started
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">On-Time Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">95%</p>
                  <p className="text-xs text-green-600 mt-1">
                    +2% from last week
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Delivery Time</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">3.2h</p>
                  <p className="text-xs text-gray-600 mt-1">Per delivery</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">98%</p>
                  <p className="text-xs text-green-600 mt-1">
                    Delivery success
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Ready for Dispatch */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">
              Orders Ready for Dispatch
            </h3>
          </CardHeader>
          <CardContent>
            {stats.readyOrders > 0 ? (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {stats.readyOrders} orders packed and ready
                    </p>
                    <p className="text-sm text-gray-600">
                      Create a trip to start delivery
                    </p>
                  </div>
                </div>
                <Button onClick={() => navigate("/dispatcher/orders")}>
                  View Orders
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p>No orders ready for dispatch</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DispatcherDashboard;
