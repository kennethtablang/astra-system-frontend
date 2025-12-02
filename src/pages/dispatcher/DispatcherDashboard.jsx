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
  const [stats, setStats] = useState(null);
  const [activeTrips, setActiveTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dispatcher stats
      const { data: statsData } = await api.get("/dispatcher/stats");
      setStats(statsData.data);

      // Fetch active trips
      const { data: tripsData } = await api.get("/trips/active");
      setActiveTrips(tripsData.data || []);
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
          <Button onClick={() => navigate("/dispatcher/trips/create")}>
            <Truck className="h-4 w-4 mr-2" />
            Create Trip
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Trips"
            value={stats?.activeTrips || "0"}
            icon={Truck}
            color="purple"
          />
          <StatCard
            title="Pending Deliveries"
            value={stats?.pendingDeliveries || "0"}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="Completed Today"
            value={stats?.completedToday || "0"}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Issues"
            value={stats?.issues || "0"}
            icon={AlertCircle}
            color="red"
          />
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
                <TableHead>Progress</TableHead>
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
                          {trip.vehicle}
                        </div>
                      </TableCell>
                      <TableCell>{getTripStatusBadge(trip.status)}</TableCell>
                      <TableCell>{trip.orderCount} orders</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${
                                  (trip.completedStops / trip.totalStops) * 100
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {trip.completedStops}/{trip.totalStops}
                          </span>
                        </div>
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
                        Create a trip to get started
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => navigate("/dispatcher/trips/create")}
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        Create Trip
                      </Button>
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
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On-Time Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.onTimeRate || 0}%
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +2% from last week
                </p>
              </div>
              <Clock className="h-12 w-12 text-blue-500" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Delivery Time</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.avgDeliveryTime || "0"}h
                </p>
                <p className="text-xs text-gray-600 mt-1">Per delivery</p>
              </div>
              <MapPin className="h-12 w-12 text-green-500" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.successRate || 0}%
                </p>
                <p className="text-xs text-green-600 mt-1">Delivery success</p>
              </div>
              <CheckCircle className="h-12 w-12 text-purple-500" />
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
            {stats?.readyOrders > 0 ? (
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
                <Button onClick={() => navigate("/dispatcher/trips/create")}>
                  Create Trip
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
