/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  User,
  Truck,
  DollarSign,
  FileText,
  XCircle,
  AlertCircle,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardHeader, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/Loading";
import { Modal } from "../../components/ui/Modal";
import api from "../../api/axios";
import { toast } from "react-hot-toast";

const AgentOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/orders/${id}`);
      if (data.success) {
        setOrder(data.data);
      }
    } catch (error) {
      toast.error("Failed to load order details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    try {
      setCancelling(true);
      const { data } = await api.post(`/orders/${id}/cancel`, {
        reason: cancelReason,
      });

      if (data.success) {
        toast.success("Order cancelled successfully");
        setShowCancelModal(false);
        fetchOrderDetails();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
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

  if (!order) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Order not found</p>
          <Button className="mt-4" onClick={() => navigate("/agent/orders")}>
            Back to Orders
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const canCancelOrder = ["Pending", "Confirmed"].includes(order.status);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate("/agent/orders")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order.id}
              </h1>
              <p className="text-gray-600 mt-1">
                Created on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getOrderStatusBadge(order.status)}
            {canCancelOrder && (
              <Button variant="danger" onClick={() => setShowCancelModal(true)}>
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Order
              </Button>
            )}
          </div>
        </div>

        {/* Order Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Store Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  Store Details
                </h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Store Name</p>
                  <p className="font-medium text-gray-900">{order.storeName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-gray-900">
                    {order.storeBarangay}, {order.storeCity}
                  </p>
                </div>
                {order.warehouseName && (
                  <div>
                    <p className="text-sm text-gray-600">Assigned Warehouse</p>
                    <p className="text-gray-900">{order.warehouseName}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Package className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  Order Information
                </h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  {getOrderStatusBadge(order.status)}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Priority</p>
                  <Badge variant={order.priority ? "danger" : "default"}>
                    {order.priority ? "High Priority" : "Normal"}
                  </Badge>
                </div>
                {order.scheduledFor && (
                  <div>
                    <p className="text-sm text-gray-600">Scheduled For</p>
                    <p className="text-gray-900">
                      {new Date(order.scheduledFor).toLocaleString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Agent</p>
                  <p className="text-gray-900">{order.agentName || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-yellow-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  Financial Summary
                </h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    ₱{order.subTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tax</span>
                  <span className="font-medium">
                    ₱{order.tax.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
                  <span>Total</span>
                  <span>₱{order.total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {item.productName}
                    </p>
                    <p className="text-sm text-gray-600">
                      SKU: {item.productSku}
                    </p>
                  </div>
                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Unit Price</p>
                      <p className="font-medium">
                        ₱{item.unitPrice.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Quantity</p>
                      <p className="font-medium">{item.quantity}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Line Total</p>
                      <p className="font-medium">
                        ₱{item.lineTotal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Status Timeline */}
        {order.status !== "Pending" && order.status !== "Cancelled" && (
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Truck className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  Delivery Status
                </h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Timeline visualization would go here */}
                <p className="text-gray-600">Current Status: {order.status}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Order"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Are you sure you want to cancel this order?
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for cancellation *
            </label>
            <textarea
              rows={4}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Please provide a reason..."
            />
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowCancelModal(false)}
              disabled={cancelling}
            >
              Keep Order
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleCancelOrder}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default AgentOrderDetail;
