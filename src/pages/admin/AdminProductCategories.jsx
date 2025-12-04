// src/pages/admin/AdminProductCategories.jsx
import { useState, useEffect } from "react";
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Search,
  Package,
  TrendingUp,
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
import { LoadingSpinner } from "../../components/ui/Loading";
import { CategoryAddModal } from "../../components/modals/AdminProductCategory/CategoryAddModal";
import { CategoryEditModal } from "../../components/modals/AdminProductCategory/CategoryEditModal";
import { CategoryDeleteModal } from "../../components/modals/AdminProductCategory/CategoryDeleteModal";
import api from "../../api/axios";
import { toast } from "react-hot-toast";

const AdminProductCategories = () => {
  // State Management
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch Categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/category");

      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch categories");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Add Category
  const handleAddCategory = async (formData) => {
    try {
      const { data } = await api.post("/category", formData);

      if (!data.success) {
        toast.error(data.message || "Failed to add category");
        throw new Error(data.message || "Failed to add category");
      }

      toast.success("Category added successfully");
      setShowAddModal(false);
      fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error(error.response?.data?.message || "Failed to add category");
      throw error;
    }
  };

  // Handle Edit Category
  const handleEditCategory = async (formData) => {
    try {
      const { data } = await api.put(`/category/${formData.id}`, formData);

      if (!data.success) {
        toast.error(data.message || "Failed to update category");
        throw new Error(data.message || "Failed to update category");
      }

      toast.success("Category updated successfully");
      setShowEditModal(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(error.response?.data?.message || "Failed to update category");
      throw error;
    }
  };

  // Handle Delete Category
  const handleDeleteCategory = async () => {
    try {
      const { data } = await api.delete(`/category/${selectedCategory.id}`);

      if (!data.success) {
        toast.error(data.message || "Failed to delete category");
        return;
      }

      toast.success("Category deleted successfully");
      setShowDeleteModal(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete category");
      console.error(error);
    }
  };

  // Open Edit Modal
  const openEditModal = (category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  // Open Delete Modal
  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const getColorBadge = (color) => {
    const variants = {
      blue: "info",
      green: "success",
      purple: "purple",
      yellow: "warning",
      red: "danger",
      indigo: "info",
      pink: "danger",
    };
    return variants[color] || "default";
  };

  // Calculate stats
  const stats = {
    totalCategories: categories.length,
    activeCategories: categories.filter((c) => c.isActive).length,
    totalProducts: categories.reduce((sum, cat) => sum + cat.productCount, 0),
    mostPopular:
      categories.length > 0
        ? [...categories].sort((a, b) => b.productCount - a.productCount)[0]
            ?.name
        : "N/A",
    avgProductsPerCategory:
      categories.length > 0
        ? Math.round(
            categories.reduce((sum, cat) => sum + cat.productCount, 0) /
              categories.length
          )
        : 0,
  };

  // Filter categories
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Product Categories
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage product categories
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No categories found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {searchTerm
                    ? "Try adjusting your search"
                    : "Get started by adding your first category"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => {
                      const percentage =
                        stats.totalProducts > 0
                          ? (category.productCount / stats.totalProducts) * 100
                          : 0;

                      return (
                        <TableRow key={category.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-10 w-10 rounded-full bg-${category.color}-100 dark:bg-${category.color}-900 flex items-center justify-center flex-shrink-0`}
                              >
                                <Tag
                                  className={`h-5 w-5 text-${category.color}-600 dark:text-${category.color}-400`}
                                />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {category.name}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                              {category.description || "—"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {category.productCount}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getColorBadge(category.color)}>
                              {category.color}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {category.isActive ? (
                              <Badge variant="success">Active</Badge>
                            ) : (
                              <Badge variant="default">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(
                                category.createdAt
                              ).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(category)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Edit category"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(category)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete category"
                                disabled={category.productCount > 0}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CategoryAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddCategory}
      />

      <CategoryEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCategory(null);
        }}
        onSubmit={handleEditCategory}
        selectedCategory={selectedCategory}
      />

      <CategoryDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCategory(null);
        }}
        onConfirm={handleDeleteCategory}
        selectedCategory={selectedCategory}
      />
    </DashboardLayout>
  );
};

export default AdminProductCategories;
