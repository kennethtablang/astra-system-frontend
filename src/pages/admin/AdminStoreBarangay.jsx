// src/pages/admin/AdminStoreBarangay.jsx
import { useState, useEffect } from "react";
import {
  MapPin,
  Search,
  Plus,
  Edit,
  Trash2,
  Store,
  Building2,
  List,
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
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import locationService from "../../services/locationServices";
import { toast } from "react-hot-toast";

const AdminStoreBarangay = () => {
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalBarangays, setTotalBarangays] = useState(0);
  const [cities, setCities] = useState([]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedBarangay, setSelectedBarangay] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    cityId: "",
    zipCode: "",
    isActive: true,
  });

  // Bulk add
  const [bulkData, setBulkData] = useState({
    cityId: "",
    barangayNames: "",
  });

  useEffect(() => {
    fetchBarangays();
    fetchCities();
  }, [currentPage, pageSize, searchTerm, filterCity, filterStatus]);

  const fetchBarangays = async () => {
    try {
      setLoading(true);
      const params = {
        pageNumber: currentPage,
        pageSize: pageSize,
      };

      if (searchTerm) params.searchTerm = searchTerm;
      if (filterCity !== "All") params.cityId = filterCity;
      if (filterStatus !== "All") params.isActive = filterStatus === "Active";

      const response = await locationService.getBarangays(params);

      if (response.success) {
        setBarangays(response.data.items || []);
        setTotalBarangays(response.data.totalCount || 0);
      }
    } catch (error) {
      toast.error("Failed to fetch barangays");
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
    }
  };

  const handleAddBarangay = async () => {
    try {
      if (!formData.name || !formData.cityId) {
        toast.error("Please fill in all required fields");
        return;
      }

      const response = await locationService.createBarangay({
        name: formData.name,
        cityId: parseInt(formData.cityId),
        zipCode: formData.zipCode || null,
        isActive: formData.isActive,
      });

      if (response.success) {
        toast.success("Barangay added successfully");
        setShowAddModal(false);
        resetForm();
        fetchBarangays();
      }
    } catch (error) {
      toast.error(error.message || "Failed to add barangay");
    }
  };

  const handleBulkAdd = async () => {
    try {
      if (!bulkData.cityId || !bulkData.barangayNames) {
        toast.error("Please select a city and enter barangay names");
        return;
      }

      const names = bulkData.barangayNames
        .split("\n")
        .map((name) => name.trim())
        .filter((name) => name.length > 0);

      if (names.length === 0) {
        toast.error("Please enter at least one barangay name");
        return;
      }

      const response = await locationService.bulkCreateBarangays({
        cityId: parseInt(bulkData.cityId),
        barangayNames: names,
      });

      if (response.success) {
        toast.success(`Successfully added ${response.data.length} barangay(s)`);
        setShowBulkModal(false);
        setBulkData({ cityId: "", barangayNames: "" });
        fetchBarangays();
      }
    } catch (error) {
      toast.error(error.message || "Failed to add barangays");
    }
  };

  const handleEditBarangay = async () => {
    try {
      if (!formData.name || !formData.cityId) {
        toast.error("Please fill in all required fields");
        return;
      }

      const response = await locationService.updateBarangay(
        selectedBarangay.id,
        {
          id: selectedBarangay.id,
          name: formData.name,
          cityId: parseInt(formData.cityId),
          zipCode: formData.zipCode || null,
          isActive: formData.isActive,
        }
      );

      if (response.success) {
        toast.success("Barangay updated successfully");
        setShowEditModal(false);
        setSelectedBarangay(null);
        resetForm();
        fetchBarangays();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update barangay");
    }
  };

  const handleDeleteBarangay = async () => {
    try {
      const response = await locationService.deleteBarangay(
        selectedBarangay.id
      );
      if (response.success) {
        toast.success("Barangay deleted successfully");
        setShowDeleteModal(false);
        setSelectedBarangay(null);
        fetchBarangays();
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete barangay");
    }
  };

  const openEditModal = (barangay) => {
    setSelectedBarangay(barangay);
    setFormData({
      name: barangay.name,
      cityId: barangay.cityId.toString(),
      zipCode: barangay.zipCode || "",
      isActive: barangay.isActive,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (barangay) => {
    setSelectedBarangay(barangay);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      cityId: "",
      zipCode: "",
      isActive: true,
    });
  };

  const totalPages = Math.ceil(totalBarangays / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalBarangays);

  const cityOptions = [
    { value: "All", label: "All Cities" },
    ...cities.map((c) => ({ value: c.id.toString(), label: c.name })),
  ];

  const citySelectOptions = [
    { value: "", label: "Select City" },
    ...cities.map((c) => ({ value: c.id.toString(), label: c.name })),
  ];

  const statusOptions = [
    { value: "All", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
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
              Barangay Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage barangays and their locations
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowBulkModal(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              Bulk Add
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Barangay
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Barangays
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalBarangays}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Active
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {barangays.filter((b) => b.isActive).length}
                  </p>
                </div>
                <Badge variant="success" className="text-lg px-3 py-1">
                  ✓
                </Badge>
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
                <Building2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Stores
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {barangays.reduce((sum, b) => sum + (b.storeCount || 0), 0)}
                  </p>
                </div>
                <Store className="h-8 w-8 text-purple-600" />
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
                  placeholder="Search barangays..."
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
                  value={filterCity}
                  onChange={(e) => {
                    setFilterCity(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={cityOptions}
                  className="w-48"
                />
                <Select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={statusOptions}
                  className="w-32"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Barangays Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : barangays.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No barangays found
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
                      <TableHead>Barangay</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Province</TableHead>
                      <TableHead>Zip Code</TableHead>
                      <TableHead>Stores</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableHeader>
                    <TableBody>
                      {barangays.map((barangay) => (
                        <TableRow key={barangay.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                                <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {barangay.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  ID: {barangay.id}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              {barangay.cityName}
                            </div>
                          </TableCell>
                          <TableCell>
                            {barangay.province || (
                              <span className="text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {barangay.zipCode || (
                              <span className="text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="info">
                              {barangay.storeCount || 0}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                barangay.isActive ? "success" : "default"
                              }
                            >
                              {barangay.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(barangay)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Edit barangay"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(barangay)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete barangay"
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
                        {startIndex}-{endIndex} of {totalBarangays}
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

      {/* Add Barangay Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Barangay"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="City *"
            value={formData.cityId}
            onChange={(e) =>
              setFormData({ ...formData, cityId: e.target.value })
            }
            options={citySelectOptions}
            required
          />

          <Input
            label="Barangay Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Bagong Bayan"
            required
          />

          <Input
            label="Zip Code"
            value={formData.zipCode}
            onChange={(e) =>
              setFormData({ ...formData, zipCode: e.target.value })
            }
            placeholder="e.g., 3000"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="isActive"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Active
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddBarangay}>Add Barangay</Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Add Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => {
          setShowBulkModal(false);
          setBulkData({ cityId: "", barangayNames: "" });
        }}
        title="Bulk Add Barangays"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="City *"
            value={bulkData.cityId}
            onChange={(e) =>
              setBulkData({ ...bulkData, cityId: e.target.value })
            }
            options={citySelectOptions}
            required
          />

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-2">
              Barangay Names (one per line) *
            </label>
            <textarea
              value={bulkData.barangayNames}
              onChange={(e) =>
                setBulkData({ ...bulkData, barangayNames: e.target.value })
              }
              placeholder="Bagong Bayan&#10;San Isidro&#10;Santa Cruz&#10;..."
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter each barangay name on a new line
            </p>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Tip:</strong> You can paste a list of barangay names from
              a spreadsheet or text file. Duplicate names will be automatically
              skipped.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => {
                setShowBulkModal(false);
                setBulkData({ cityId: "", barangayNames: "" });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleBulkAdd}>Add Barangays</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Barangay Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedBarangay(null);
          resetForm();
        }}
        title="Edit Barangay"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="City *"
            value={formData.cityId}
            onChange={(e) =>
              setFormData({ ...formData, cityId: e.target.value })
            }
            options={citySelectOptions}
            required
          />

          <Input
            label="Barangay Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Zip Code"
            value={formData.zipCode}
            onChange={(e) =>
              setFormData({ ...formData, zipCode: e.target.value })
            }
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="editIsActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="editIsActive"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Active
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setSelectedBarangay(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditBarangay}>Update Barangay</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Barangay Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedBarangay(null);
        }}
        title="Delete Barangay"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete{" "}
            <strong className="text-gray-900 dark:text-white">
              {selectedBarangay?.name}
            </strong>
            ?
          </p>
          {selectedBarangay?.storeCount > 0 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Warning:</strong> This barangay has{" "}
                {selectedBarangay.storeCount} store(s). Deleting it may affect
                store records.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedBarangay(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteBarangay}>
              Delete Barangay
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminStoreBarangay;
