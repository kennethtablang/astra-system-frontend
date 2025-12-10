// src/pages/admin/AdminStores.jsx - FIXED VERSION
import { useState, useEffect } from "react";
import {
  Store,
  Search,
  Plus,
  Edit,
  Trash2,
  Phone,
  MapPin,
  User,
  DollarSign,
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
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { LoadingSpinner } from "../../components/ui/Loading";
import { StoreAddModal } from "../../components/modals/AdminStore/StoreAddModal";
import { StoreEditModal } from "../../components/modals/AdminStore/StoreEditModal";
import { StoreDeleteModal } from "../../components/modals/AdminStore/StoreDeleteModal";
import api from "../../api/axios";
import locationService from "../../services/locationServices";
import { toast } from "react-hot-toast";

const AdminStores = () => {
  // State Management
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCityId, setFilterCityId] = useState("All");
  const [filterBarangayId, setFilterBarangayId] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalStores, setTotalStores] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  // Fetch Stores
  useEffect(() => {
    fetchStores();
  }, [currentPage, pageSize, searchTerm, filterCityId, filterBarangayId]);

  // Fetch Cities and Barangays
  useEffect(() => {
    fetchCities();
  }, []);

  // Fetch barangays when city filter changes
  useEffect(() => {
    if (filterCityId !== "All") {
      fetchBarangays(parseInt(filterCityId));
    } else {
      setBarangays([]);
      setFilterBarangayId("All");
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
      if (filterCityId !== "All") params.cityId = parseInt(filterCityId);
      if (filterBarangayId !== "All")
        params.barangayId = parseInt(filterBarangayId);

      const { data } = await api.get("/store", { params });

      if (data.success) {
        setStores(data.data.items || []);
        setTotalStores(data.data.totalCount || 0);
      }
    } catch (error) {
      toast.error("Failed to fetch stores");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await locationService.getCitiesForLookup();
      if (response.success) {
        setCities(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch cities:", error);
      toast.error("Failed to fetch cities");
    }
  };

  const fetchBarangays = async (cityId) => {
    try {
      const response = await locationService.getBarangaysForLookup(cityId);
      if (response.success) {
        setBarangays(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch barangays:", error);
      toast.error("Failed to fetch barangays");
    }
  };

  // Handle Add Store
  const handleAddStore = async (formData) => {
    try {
      const { data } = await api.post("/store", formData);

      if (data.success) {
        toast.success("Store added successfully");
        setShowAddModal(false);
        fetchStores();
        fetchCities();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add store");
      console.error(error);
    }
  };

  // Handle Edit Store
  const handleEditStore = async (formData) => {
    try {
      const { data } = await api.put(`/store/${formData.id}`, formData);

      if (data.success) {
        toast.success("Store updated successfully");
        setShowEditModal(false);
        setSelectedStore(null);
        fetchStores();
        fetchCities();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update store");
      console.error(error);
    }
  };

  // Handle Delete Store
  const handleDeleteStore = async () => {
    try {
      const { data } = await api.delete(`/store/${selectedStore.id}`);
      if (data.success) {
        toast.success("Store deleted successfully");
        setShowDeleteModal(false);
        setSelectedStore(null);
        fetchStores();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete store");
      console.error(error);
    }
  };

  // Open Edit Modal
  const openEditModal = (store) => {
    setSelectedStore(store);
    setShowEditModal(true);
  };

  // Open Delete Modal
  const openDeleteModal = (store) => {
    setSelectedStore(store);
    setShowDeleteModal(true);
  };

  // Pagination Calculations
  const totalPages = Math.ceil(totalStores / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalStores);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  // Options
  const cityOptions = [
    { value: "All", label: "All Cities" },
    ...cities.map((c) => ({ value: c.id.toString(), label: c.name })),
  ];

  const barangayOptions = [
    { value: "All", label: "All Barangays" },
    ...barangays.map((b) => ({
      value: b.id.toString(),
      label: `${b.name}${b.storeCount ? ` (${b.storeCount})` : ""}`,
    })),
  ];

  const pageSizeOptions = [
    { value: "10", label: "10" },
    { value: "25", label: "25" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Store Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all customer stores
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
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
                    {filterCityId !== "All" ? barangays.length : "—"}
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
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
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
                <Select
                  value={filterCityId}
                  onChange={(e) => {
                    setFilterCityId(e.target.value);
                    setFilterBarangayId("All");
                    setCurrentPage(1);
                  }}
                  options={cityOptions}
                  className="w-40"
                />
                <Select
                  value={filterBarangayId}
                  onChange={(e) => {
                    setFilterBarangayId(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={barangayOptions}
                  className="w-48"
                  disabled={filterCityId === "All"}
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
                      <TableHead>Created</TableHead>
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
                                <div className="text-sm text-gray-500 dark:text-gray-500">
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
                            <div className="text-sm">
                              {new Date(
                                store.createdAt || Date.now()
                              ).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(store)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Edit store"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(store)}
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
                      <Select
                        value={pageSize.toString()}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        options={pageSizeOptions}
                        className="w-20"
                      />
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
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === pageNum
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
      </div>

      {/* Modals */}
      <StoreAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddStore}
      />

      <StoreEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStore(null);
        }}
        onSubmit={handleEditStore}
        selectedStore={selectedStore}
      />

      <StoreDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedStore(null);
        }}
        onConfirm={handleDeleteStore}
        selectedStore={selectedStore}
      />
    </DashboardLayout>
  );
};

export default AdminStores;
