/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, MapPin, Phone, User } from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardHeader, CardContent } from "../../components/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/Table";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Modal } from "../../components/ui/Modal";
import { LoadingSpinner } from "../../components/ui/Loading";
import { EmptyState } from "../../components/ui/EmptyState";
import api from "../../api/axios";
import { toast } from "react-hot-toast";

const AgentStoresList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: "",
    city: "",
    barangay: "",
  });
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    barangay: "",
    city: "",
    ownerName: "",
    phone: "",
    creditLimit: 0,
    preferredPaymentMethod: "Cash",
  });

  useEffect(() => {
    fetchStores();
    fetchCities();
  }, [filters]);

  useEffect(() => {
    if (filters.city) {
      fetchBarangays(filters.city);
    }
  }, [filters.city]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/stores", {
        params: { ...filters, pageSize: 100, pageNumber: 1 },
      });
      if (data.success) {
        setStores(data.data.items || []);
      }
    } catch (error) {
      toast.error("Failed to load stores");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const { data } = await api.get("/stores/cities");
      if (data.success) {
        setCities(data.data || []);
      }
    } catch (error) {
      console.error("Failed to load cities", error);
    }
  };

  const fetchBarangays = async (city) => {
    try {
      const { data } = await api.get("/stores/barangays", {
        params: { city },
      });
      if (data.success) {
        setBarangays(data.data || []);
      }
    } catch (error) {
      console.error("Failed to load barangays", error);
    }
  };

  const handleOpenModal = (store = null) => {
    if (store) {
      setEditingStore(store);
      setFormData({
        name: store.name,
        barangay: store.barangay,
        city: store.city,
        ownerName: store.ownerName || "",
        phone: store.phone || "",
        creditLimit: store.creditLimit,
        preferredPaymentMethod: store.preferredPaymentMethod || "Cash",
      });
    } else {
      setEditingStore(null);
      setFormData({
        name: "",
        barangay: "",
        city: "",
        ownerName: "",
        phone: "",
        creditLimit: 0,
        preferredPaymentMethod: "Cash",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStore(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingStore) {
        const { data } = await api.put(`/stores/${editingStore.id}`, formData);
        if (data.success) {
          toast.success("Store updated successfully");
          fetchStores();
          handleCloseModal();
        }
      } else {
        const { data } = await api.post("/stores", formData);
        if (data.success) {
          toast.success("Store created successfully");
          fetchStores();
          handleCloseModal();
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          `Failed to ${editingStore ? "update" : "create"} store`
      );
    }
  };

  const handleDelete = async (storeId) => {
    if (!window.confirm("Are you sure you want to delete this store?")) {
      return;
    }

    try {
      const { data } = await api.delete(`/stores/${storeId}`);
      if (data.success) {
        toast.success("Store deleted successfully");
        fetchStores();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete store");
    }
  };

  const paymentMethods = [
    { value: "Cash", label: "Cash" },
    { value: "GCash", label: "GCash" },
    { value: "Maya", label: "Maya" },
    { value: "BankTransfer", label: "Bank Transfer" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
            <p className="text-gray-600 mt-1">Manage your store accounts</p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Store
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search stores..."
                icon={Search}
                value={filters.searchTerm}
                onChange={(e) =>
                  setFilters({ ...filters, searchTerm: e.target.value })
                }
              />
              <Select
                options={[
                  { value: "", label: "All Cities" },
                  ...cities.map((city) => ({ value: city, label: city })),
                ]}
                value={filters.city}
                onChange={(e) =>
                  setFilters({ ...filters, city: e.target.value })
                }
              />
              <Select
                options={[
                  { value: "", label: "All Barangays" },
                  ...barangays.map((b) => ({
                    value: b.barangay,
                    label: b.barangay,
                  })),
                ]}
                value={filters.barangay}
                onChange={(e) =>
                  setFilters({ ...filters, barangay: e.target.value })
                }
                disabled={!filters.city}
              />
            </div>
          </CardContent>
        </Card>

        {/* Stores Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : stores.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableHead>Store Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Credit Limit</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Actions</TableHead>
                </TableHeader>
                <TableBody>
                  {stores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="font-medium">{store.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{store.barangay}</p>
                          <p className="text-xs text-gray-500">{store.city}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          {store.ownerName || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          {store.phone || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        ₱{store.creditLimit.toLocaleString()}
                      </TableCell>
                      <TableCell>{store.preferredPaymentMethod}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenModal(store)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(store.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                icon={MapPin}
                title="No stores yet"
                description="Add your first store to get started"
                action={
                  <Button onClick={() => handleOpenModal()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Store
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Store Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingStore ? "Edit Store" : "Add New Store"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Store Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City *"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              required
            />
            <Input
              label="Barangay *"
              value={formData.barangay}
              onChange={(e) =>
                setFormData({ ...formData, barangay: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Owner Name"
              icon={User}
              value={formData.ownerName}
              onChange={(e) =>
                setFormData({ ...formData, ownerName: e.target.value })
              }
            />
            <Input
              label="Phone Number"
              icon={Phone}
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Credit Limit"
              type="number"
              min="0"
              step="0.01"
              value={formData.creditLimit}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  creditLimit: parseFloat(e.target.value) || 0,
                })
              }
            />
            <Select
              label="Preferred Payment Method"
              options={paymentMethods}
              value={formData.preferredPaymentMethod}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  preferredPaymentMethod: e.target.value,
                })
              }
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editingStore ? "Update Store" : "Create Store"}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AgentStoresList;
