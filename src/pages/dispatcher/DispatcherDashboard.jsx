// src/pages/dispatcher/DispatcherDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  ArrowRight,
  TrendingUp,
  Briefcase
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
import tripService from "../../services/tripService";
import orderService from "../../services/orderService";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-hot-toast";

const DispatcherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTrips, setActiveTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeTrips: 0,
    readyOrders: 0,
    completedToday: 0,
    myAssignedTrips: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Active Trips (Trips that are currently InProgress or Started)
      // This helps the dispatcher know what is currently on the road
      const activeTripsResult = await tripService.getTrips({
        status: "Started,InProgress",
        pageSize: 5,
        pageNumber: 1
      });

      if (activeTripsResult.success) {
        setActiveTrips(activeTripsResult.data.items || []);
        setStats(prev => ({
          ...prev,
          activeTrips: activeTripsResult.data.totalCount || 0
        }));
      }

      // 2. Fetch Orders Ready for Dispatch (Confirmed or Packed)
      const readyOrdersResult = await orderService.getOrders({
        status: "Packed",
        pageSize: 1
      });

      if (readyOrdersResult.success) {
        setStats(prev => ({
          ...prev,
          readyOrders: readyOrdersResult.data.totalCount || 0
        }));
      }

      // 3. Fetch My Assigned Trips (if userId available)
      const userId = user?.userId || user?.UserId || user?.id;
      if (userId) {
        const myTripsResult = await tripService.getTrips({
          dispatcherId: userId,
          status: "Assigned,Started,InProgress",
          pageSize: 1
        });

        if (myTripsResult.success) {
          setStats(prev => ({
            ...prev,
            myAssignedTrips: myTripsResult.data.totalCount || 0
          }));
        }
      }

      // 4. Completed Today (Deliveries)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const completedResult = await orderService.getOrders({
        status: "Delivered",
        updatedFrom: today.toISOString(),
        pageSize: 1
      });

      if (completedResult.success) {
        setStats(prev => ({
          ...prev,
          completedToday: completedResult.data.totalCount || 0
        }));
      }

    } catch (error) {
      console.error("Dashboard data fetch error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getTripStatusBadge = (status) => {
    const variants = {
      Created: "default",
      Assigned: "info",
      Started: "info",
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dispatcher Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Overview of fleet operations and deliveries
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/dispatcher/trips")}>
              Manage Trips
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Trips"
            value={stats.activeTrips.toString()}
            icon={Truck}
            color="purple"
            trend={stats.activeTrips > 0 ? "Currently on road" : "No active trips"}
            trendDirection="neutral"
          />
          <StatCard
            title="Ready to Dispatch"
            value={stats.readyOrders.toString()}
            icon={Package}
            color="yellow"
            trend="Orders packed"
            trendDirection="neutral"
          />
          <StatCard
            title="Delivered Today"
            value={stats.completedToday.toString()}
            icon={CheckCircle}
            color="green"
            trend="Successful deliveries"
            trendDirection="up"
          />
          <StatCard
            title="My Assignments"
            value={stats.myAssignedTrips.toString()}
            icon={Briefcase}
            color="blue"
            trend="Trips assigned to me"
            trendDirection="neutral"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Fleet Activity */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Live Fleet Status</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dispatcher/trips")}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                View All <ArrowRight className="h-4 w-4 ml-1" />
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
                  <TableHead className="text-right">Action</TableHead>
                </TableHeader>
                <TableBody>
                  {activeTrips.length > 0 ? (
                    activeTrips.map((trip) => (
                      <TableRow key={trip.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <TableCell className="font-medium">#{trip.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">{trip.vehicle || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getTripStatusBadge(trip.status)}</TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {trip.orderCount} orders
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {trip.departureAt
                              ? new Date(trip.departureAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : "Not started"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/dispatcher/deliveries`)} // Assuming this goes to active tracking
                            className="h-8"
                          >
                            Track
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-gray-500 py-12"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <Truck className="h-10 w-10 text-gray-300 mb-2" />
                          <p className="font-medium">No active trips right now</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Quick Actions / Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  size="lg"
                  onClick={() => navigate("/dispatcher/trips")}
                >
                  <Truck className="h-5 w-5 mr-3" />
                  To My Trips
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="lg"
                  onClick={() => navigate("/dispatcher/orders")}
                >
                  <Package className="h-5 w-5 mr-3" />
                  Browse Orders
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="lg"
                  onClick={() => navigate("/dispatcher/deliveries")}
                >
                  <MapPin className="h-5 w-5 mr-3" />
                  Current Route Map
                </Button>
              </CardContent>
            </Card>

            {/* KPI Card */}
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-blue-100 font-medium">Weekly Delivery Rate</p>
                    <h3 className="text-3xl font-bold mt-1">98.5%</h3>
                  </div>
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="w-full bg-black/20 rounded-full h-1.5 mb-2">
                  <div className="bg-white h-1.5 rounded-full" style={{ width: '98.5%' }}></div>
                </div>
                <p className="text-sm text-blue-100">
                  +2.4% vs last week target
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DispatcherDashboard;
