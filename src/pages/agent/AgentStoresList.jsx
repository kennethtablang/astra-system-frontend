/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Phone,
  User,
  Store,
  DollarSign
} from "lucide-react";
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
import { Button } from "../../components/ui/Button";
import { Combobox } from "../../components/ui/Combobox";
import { LoadingSpinner } from "../../components/ui/Loading";
import { Badge } from "../../components/ui/Badge";
import { AgentStoreAddModal } from "../../components/modals/AgentStore/AgentStoreAddModal";
import { AgentStoreEditModal } from "../../components/modals/AgentStore/AgentStoreEditModal";
import api from "../../api/axios";
import { toast } from "react-hot-toast";

const AgentStoresList = () => {
  // State Management
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCityId, setFilterCityId] = useState("");
  const [filterBarangayId, setFilterBarangayId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalStores, setTotalStores] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  // Fetch Stores
  useEffect(() => {
    fetchStores();
  }, [currentPage, pageSize, searchTerm, filterCityId, filterBarangayId]);

  // Fetch Cities on Mount
  useEffect(() => {
    fetchCities();
  }, []);

  // Fetch barangays when city filter changes
  useEffect(() => {
    if (filterCityId) {
      fetchBarangays(parseInt(filterCityId));
    } else {
      setBarangays([]);
      setFilterBarangayId("");
    }
  }, [filterCityId]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = {
        pageNumber: currentPage,
        pageSize: pageSize,
      };

      if (searchTerm) params.searchTerm = searchTerm;
      if (filterCityId) params.cityId = parseInt(filterCityId);
      if (filterBarangayId) params.barangayId = parseInt(filterBarangayId);

      const { data } = await api.get("/store", { params });

      if (data.success) {
        setStores(data.data.items || []);
        // API might return totalCount, if not we fall back to length of items (which might be paged)
        setTotalStores(data.data.totalCount || data.data.items?.length || 0);
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
      const { data } = await api.get("/city/lookup");
      if (data.success) {
        setCities(data.data || []);
      }
    } catch (error) {
      console.error("Failed to load cities", error);
    }
  };

  const fetchBarangays = async (cityId) => {
    try {
      const { data } = await api.get("/barangay/lookup", {
        params: { cityId: parseInt(cityId) },
      });
      if (data.success) {
        setBarangays(data.data || []);
      }
    } catch (error) {
      console.error("Failed to load barangays", error);
    }
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
  };

  const handleOpenEditModal = (store) => {
    setEditingStore(store);
    setShowEditModal(true);
  };

  // Create Store
  const handleCreateStore = async (storeData) => {
    try {
      const { data } = await api.post("/store", storeData);
      if (data.success) {
        toast.success("Store created successfully");
        setShowAddModal(false);
        fetchStores();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create store");
    }
  };

  // Update Store
  const handleUpdateStore = async (storeData) => {
    try {
      const { data } = await api.put(`/store/${storeData.id}`, storeData);
      if (data.success) {
        toast.success("Store updated successfully");
        setShowEditModal(false);
        setEditingStore(null);
        fetchStores();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update store");
    }
  };

  // Delete Store
  const handleDelete = async (storeId) => {
    if (!window.confirm("Are you sure you want to delete this store?")) {
      return;
    }

    try {
      const { data } = await api.delete(`/store/${storeId}`);
      if (data.success) {
        toast.success("Store deleted successfully");
        fetchStores();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete store");
    }
  };

  // Formatting + Helpers
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const pageSizeOptions = [
    { value: "10", label: "10" },
    { value: "25", label: "25" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
  ];

  // Pagination Logic
  const totalPages = Math.ceil(totalStores / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalStores);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Agent Stores
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your customer stores
            </p>
          </div>
          <Button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Store
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Stores
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalStores}
                  </p>
                </div>
                <Store className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Cities Covered
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {cities.length}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Barangays
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filterCityId ? barangays.length : (cities.length > 0 ? "—" : 0)}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Avg Credit Limit
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                    {formatCurrency(
                      stores.length > 0
                        ? stores.reduce(
                          (sum, s) => sum + (s.creditLimit || 0),
                          0
                        ) / stores.length
                        : 0
                    )}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by store name, owner, or phone..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2">
                <Combobox
                  placeholder="All Cities"
                  options={[
                    { value: "", label: "All Cities" },
                    ...cities.map((city) => ({
                      value: city?.id?.toString() || "",
                      label: city?.name || "Unknown",
                      key: city?.id || Math.random()
                    })),
                  ]}
                  value={filterCityId}
                  onChange={(value) => {
                    setFilterCityId(value);
                    setCurrentPage(1);
                  }}
                  className="w-40"
                />
                <Combobox
                  placeholder="All Barangays"
                  options={[
                    { value: "", label: "All Barangays" },
                    ...barangays.map((b) => ({
                      value: b?.id?.toString() || "",
                      label: b?.name || "Unknown",
                      key: b?.id || Math.random()
                    })),
                  ]}
                  value={filterBarangayId}
                  onChange={(value) => {
                    setFilterBarangayId(value);
                    setCurrentPage(1);
                  }}
                  disabled={!filterCityId}
                  className="w-48"
                />
              </div>
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
            ) : stores.length === 0 ? (
              <div className="text-center py-12">
                <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No stores found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Try adjusting your search or filters
                </p>
                <div className="mt-4">
                  <Button onClick={handleOpenAddModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Store
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableHead>Store</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Credit Limit</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableHeader>
                    <TableBody>
                      {stores.map((store) => (
                        <TableRow key={store.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                                <Store className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {store.name}
                                </p>
                                {store.ownerName && (
                                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <User className="h-3 w-3 mr-1" />
                                    {store.ownerName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {store.barangayName && (
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {store.barangayName}
                                </div>
                              )}
                              {store.cityName && (
                                <div className="text-sm text-gray-500 dark:text-gray-500 pl-4">
                                  {store.cityName}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {store.phone && (
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <Phone className="h-3 w-3 mr-1" />
                                {store.phone}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(store.creditLimit)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {store.preferredPaymentMethod ? (
                              <Badge variant="info">
                                {store.preferredPaymentMethod}
                              </Badge>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditModal(store)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Edit store"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(store.id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete store"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="border border-gray-300 dark:border-gray-600 rounded-md p-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {pageSizeOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {startIndex}-{endIndex} of {totalStores}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = idx + 1;
                          } else if (currentPage <= 3) {
                            pageNum = idx + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + idx;
                          } else {
                            pageNum = currentPage - 2 + idx;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                  ? "bg-blue-600 text-white"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        <AgentStoreAddModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateStore}
        />

        <AgentStoreEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingStore(null);
          }}
          onSubmit={handleUpdateStore}
          selectedStore={editingStore}
        />
      </div>
    </DashboardLayout>
  );
};

export default AgentStoresList;
