// src/pages/admin/AdminStoreCity.jsx
import { useState, useEffect } from "react";
import {
  MapPin,
  Search,
  Plus,
  Edit,
  Trash2,
  Building2,
  Store,
  Map,
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

const AdminStoreCity = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProvince, setFilterProvince] = useState("All");
  const [filterRegion, setFilterRegion] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCities, setTotalCities] = useState(0);
  const [provinces, setProvinces] = useState([]);
  const [regions, setRegions] = useState([]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    province: "",
    region: "",
    isActive: true,
  });

  useEffect(() => {
    fetchCities();
    fetchProvinces();
    fetchRegions();
  }, [currentPage, pageSize, searchTerm, filterProvince, filterRegion]);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const params = {
        pageNumber: currentPage,
        pageSize: pageSize,
      };

      if (searchTerm) params.searchTerm = searchTerm;
      if (filterProvince !== "All") params.province = filterProvince;
      if (filterRegion !== "All") params.region = filterRegion;

      const response = await locationService.getCities(params);

      if (response.success) {
        setCities(response.data.items || []);
        setTotalCities(response.data.totalCount || 0);
      }
    } catch (error) {
      toast.error("Failed to fetch cities");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      const response = await locationService.getProvinces();
      if (response.success) {
        setProvinces(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch provinces:", error);
    }
  };

  const fetchRegions = async () => {
    try {
      const response = await locationService.getRegions();
      if (response.success) {
        setRegions(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch regions:", error);
    }
  };

  const handleAddCity = async () => {
    try {
      const response = await locationService.createCity(formData);
      if (response.success) {
        toast.success("City added successfully");
        setShowAddModal(false);
        resetForm();
        fetchCities();
        fetchProvinces();
        fetchRegions();
      }
    } catch (error) {
      toast.error(error.message || "Failed to add city");
    }
  };

  const handleEditCity = async () => {
    try {
      const response = await locationService.updateCity(
        selectedCity.id,
        formData
      );
      if (response.success) {
        toast.success("City updated successfully");
        setShowEditModal(false);
        setSelectedCity(null);
        resetForm();
        fetchCities();
        fetchProvinces();
        fetchRegions();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update city");
    }
  };

  const handleDeleteCity = async () => {
    try {
      const response = await locationService.deleteCity(selectedCity.id);
      if (response.success) {
        toast.success("City deleted successfully");
        setShowDeleteModal(false);
        setSelectedCity(null);
        fetchCities();
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete city");
    }
  };

  const openEditModal = (city) => {
    setSelectedCity(city);
    setFormData({
      name: city.name,
      province: city.province || "",
      region: city.region || "",
      isActive: city.isActive,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (city) => {
    setSelectedCity(city);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      province: "",
      region: "",
      isActive: true,
    });
  };

  const totalPages = Math.ceil(totalCities / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCities);

  const provinceOptions = [
    { value: "All", label: "All Provinces" },
    ...provinces.map((p) => ({ value: p, label: p })),
  ];

  const regionOptions = [
    { value: "All", label: "All Regions" },
    ...regions.map((r) => ({ value: r, label: r })),
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
              City Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage cities and municipalities
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add City
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Cities
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalCities}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Provinces
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {provinces.length}
                  </p>
                </div>
                <Map className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Regions
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {regions.length}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Barangays
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {cities.reduce((sum, c) => sum + (c.barangayCount || 0), 0)}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-yellow-600" />
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
                  placeholder="Search cities..."
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
                  value={filterProvince}
                  onChange={(e) => {
                    setFilterProvince(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={provinceOptions}
                  className="w-40"
                />
                <Select
                  value={filterRegion}
                  onChange={(e) => {
                    setFilterRegion(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={regionOptions}
                  className="w-40"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cities Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : cities.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No cities found
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
                      <TableHead>City/Municipality</TableHead>
                      <TableHead>Province</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Barangays</TableHead>
                      <TableHead>Stores</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableHeader>
                    <TableBody>
                      {cities.map((city) => (
                        <TableRow key={city.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {city.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  ID: {city.id}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {city.province || (
                              <span className="text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {city.region || (
                              <span className="text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="info">
                              {city.barangayCount || 0}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Store className="h-4 w-4 text-gray-400" />
                              <span>{city.storeCount || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={city.isActive ? "success" : "default"}
                            >
                              {city.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(city)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Edit city"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(city)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete city"
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
                        {startIndex}-{endIndex} of {totalCities}
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

      {/* Add City Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New City"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="City/Municipality Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Manila, Quezon City"
            required
          />

          <Input
            label="Province"
            value={formData.province}
            onChange={(e) =>
              setFormData({ ...formData, province: e.target.value })
            }
            placeholder="e.g., Metro Manila, Bulacan"
          />

          <Input
            label="Region"
            value={formData.region}
            onChange={(e) =>
              setFormData({ ...formData, region: e.target.value })
            }
            placeholder="e.g., NCR, Region III"
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
            <Button onClick={handleAddCity}>Add City</Button>
          </div>
        </div>
      </Modal>

      {/* Edit City Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCity(null);
          resetForm();
        }}
        title="Edit City"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="City/Municipality Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Province"
            value={formData.province}
            onChange={(e) =>
              setFormData({ ...formData, province: e.target.value })
            }
          />

          <Input
            label="Region"
            value={formData.region}
            onChange={(e) =>
              setFormData({ ...formData, region: e.target.value })
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
                setSelectedCity(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditCity}>Update City</Button>
          </div>
        </div>
      </Modal>

      {/* Delete City Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCity(null);
        }}
        title="Delete City"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete{" "}
            <strong className="text-gray-900 dark:text-white">
              {selectedCity?.name}
            </strong>
            ?
          </p>
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Warning:</strong> This will also delete all barangays
              associated with this city. This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedCity(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteCity}>
              Delete City
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminStoreCity;
