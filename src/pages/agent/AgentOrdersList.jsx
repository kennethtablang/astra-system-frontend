/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Download } from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
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
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { LoadingSpinner } from "../../components/ui/Loading";
import { EmptyState } from "../../components/ui/EmptyState";
import api from "../../api/axios";
import { toast } from "react-hot-toast";

const AgentOrdersList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    searchTerm: "",
    status: "",
    sortBy: "createdAt",
    sortDescending: true,
  });

  useEffect(() => {
    fetchOrders();
  }, [pagination.pageNumber, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/orders/my-orders", {
        params: {
          pageNumber: pagination.pageNumber,
          pageSize: pagination.pageSize,
          ...filters,
        },
      });

      if (data.success) {
        setOrders(data.data.items || []);
        setPagination({
          ...pagination,
          totalCount: data.data.totalCount,
          totalPages: data.data.totalPages,
        });
      }
    } catch (error) {
      toast.error("Failed to load orders");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
    setPagination({ ...pagination, pageNumber: 1 });
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

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "Pending", label: "Pending" },
    { value: "Confirmed", label: "Confirmed" },
    { value: "Packed", label: "Packed" },
    { value: "Dispatched", label: "Dispatched" },
    { value: "InTransit", label: "In Transit" },
    { value: "Delivered", label: "Delivered" },
    { value: "Cancelled", label: "Cancelled" },
    { value: "Returned", label: "Returned" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-1">Manage and track your orders</p>
          </div>
          <Button onClick={() => navigate("/agent/orders/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search orders..."
                icon={Search}
                value={filters.searchTerm}
                onChange={(e) =>
                  handleFilterChange("searchTerm", e.target.value)
                }
              />
              <Select
                options={statusOptions}
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              />
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : orders.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          #{order.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.storeName}</p>
                            <p className="text-xs text-gray-500">
                              {order.storeOwnerName || "N/A"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{order.storeBarangay}</p>
                          <p className="text-xs text-gray-500">
                            {order.storeCity}
                          </p>
                        </TableCell>
                        <TableCell>
                          {getOrderStatusBadge(order.status)}
                        </TableCell>
                        <TableCell>{order.itemCount} items</TableCell>
                        <TableCell className="font-medium">
                          ₱{order.total.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate(`/agent/orders/${order.id}`)
                            }
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {(pagination.pageNumber - 1) * pagination.pageSize + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        pagination.pageNumber * pagination.pageSize,
                        pagination.totalCount
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">{pagination.totalCount}</span>{" "}
                    results
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pagination.pageNumber === 1}
                      onClick={() =>
                        setPagination({
                          ...pagination,
                          pageNumber: pagination.pageNumber - 1,
                        })
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pagination.pageNumber >= pagination.totalPages}
                      onClick={() =>
                        setPagination({
                          ...pagination,
                          pageNumber: pagination.pageNumber + 1,
                        })
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState
                icon={Plus}
                title="No orders yet"
                description="Create your first order to get started"
                action={
                  <Button onClick={() => navigate("/agent/orders/create")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Order
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AgentOrdersList;
