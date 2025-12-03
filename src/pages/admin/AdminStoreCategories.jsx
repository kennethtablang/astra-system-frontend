// src/pages/admin/AdminStoreCategories.jsx
import { useState, useEffect } from "react";
import { Tag, Plus, Edit, Trash2, Search, Store } from "lucide-react";
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
import { StoreCategoryAddModal } from "../../components/modals/AdminStoreCategory/StoreCategoryAddModal";
import { StoreCategoryEditModal } from "../../components/modals/AdminStoreCategory/StoreCategoryEditModal";
import { StoreCategoryDeleteModal } from "../../components/modals/AdminStoreCategory/StoreCategoryDeleteModal";
import { toast } from "react-hot-toast";

const AdminStoreCategories = () => {
  // State Management
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Mock data - Replace with actual API calls
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock data
      const mockCategories = [
        {
          id: 1,
          name: "Sari-Sari Store",
          description: "General merchandise stores",
          storeCount: 145,
          color: "blue",
          createdAt: new Date("2024-01-15"),
        },
        {
          id: 2,
          name: "Mini Mart",
          description: "Small supermarket-style stores",
          storeCount: 67,
          color: "green",
          createdAt: new Date("2024-01-20"),
        },
        {
          id: 3,
          name: "Convenience Store",
          description: "24/7 convenience stores",
          storeCount: 32,
          color: "purple",
          createdAt: new Date("2024-02-01"),
        },
        {
          id: 4,
          name: "Grocery Store",
          description: "Full-service grocery stores",
          storeCount: 28,
          color: "yellow",
          createdAt: new Date("2024-02-10"),
        },
        {
          id: 5,
          name: "Wholesale",
          description: "Wholesale and bulk purchase stores",
          storeCount: 15,
          color: "red",
          createdAt: new Date("2024-02-15"),
        },
      ];

      setCategories(mockCategories);
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newCategory = {
        id: categories.length + 1,
        ...formData,
        storeCount: 0,
        createdAt: new Date(),
      };

      setCategories([...categories, newCategory]);
      toast.success("Category added successfully");
      setShowAddModal(false);
    } catch (error) {
      toast.error("Failed to add category");
      console.error(error);
    }
  };

  // Handle Edit Category
  const handleEditCategory = async (formData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setCategories(
        categories.map((cat) => (cat.id === formData.id ? formData : cat))
      );
      toast.success("Category updated successfully");
      setShowEditModal(false);
      setSelectedCategory(null);
    } catch (error) {
      toast.error("Failed to update category");
      console.error(error);
    }
  };

  // Handle Delete Category
  const handleDeleteCategory = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setCategories(categories.filter((cat) => cat.id !== selectedCategory.id));
      toast.success("Category deleted successfully");
      setShowDeleteModal(false);
      setSelectedCategory(null);
    } catch (error) {
      toast.error("Failed to delete category");
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

  // Filter categories
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get color badge variant
  const getColorBadge = (color) => {
    const variants = {
      blue: "info",
      green: "success",
      purple: "purple",
      yellow: "warning",
      red: "danger",
    };
    return variants[color] || "default";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Store Categories
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage store types and classifications
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Categories
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {categories.length}
                  </p>
                </div>
                <Tag className="h-8 w-8 text-blue-600" />
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
                    {categories.reduce((sum, cat) => sum + cat.storeCount, 0)}
                  </p>
                </div>
                <Store className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Most Popular
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {categories.length > 0
                      ? [...categories].sort(
                          (a, b) => b.storeCount - a.storeCount
                        )[0]?.name
                      : "N/A"}
                  </p>
                </div>
                <Tag className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Avg Stores/Category
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {categories.length > 0
                      ? Math.round(
                          categories.reduce(
                            (sum, cat) => sum + cat.storeCount,
                            0
                          ) / categories.length
                        )
                      : 0}
                  </p>
                </div>
                <Store className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
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
                    <TableHead>Stores</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => (
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
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {category.description || "—"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Store className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {category.storeCount}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getColorBadge(category.color)}>
                            {category.color}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(category.createdAt).toLocaleDateString()}
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
                              disabled={category.storeCount > 0}
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <StoreCategoryAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddCategory}
      />

      <StoreCategoryEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCategory(null);
        }}
        onSubmit={handleEditCategory}
        selectedCategory={selectedCategory}
      />

      <StoreCategoryDeleteModal
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

export default AdminStoreCategories;
