// src/pages/distributor/DistributorProducts.jsx
import { useState, useEffect } from "react";
import {
    Package,
    Plus,
    Edit,
    Trash2,
    Search,
    Tag,
    DollarSign,
    Box,
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
import { ProductAddModal } from "../../components/modals/AdminProduct/ProductAddModal";
import { ProductEditModal } from "../../components/modals/AdminProduct/ProductEditModal";
import { ProductDeleteModal } from "../../components/modals/AdminProduct/ProductDeleteModal";
import api from "../../api/axios";
import { toast } from "react-hot-toast";

import { getImageUrl } from "../../utils/imageUrl";

const DistributorProducts = () => {
    // State Management
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalProducts, setTotalProducts] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Fetch Products
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [currentPage, pageSize, searchTerm, filterCategory]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {
                pageNumber: currentPage,
                pageSize: pageSize,
            };

            if (searchTerm) params.searchTerm = searchTerm;
            if (filterCategory !== "All") params.category = filterCategory;

            const { data } = await api.get("/product", { params });

            if (data.success) {
                setProducts(data.data.items || []);
                setTotalProducts(data.data.totalCount || 0);
            }
        } catch (error) {
            toast.error("Failed to fetch products");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get("/product/categories");
            if (data.success) {
                setCategories(data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    // Handle Add Product
    const handleAddProduct = async (formData) => {
        try {
            // Use multipart/form-data for file upload support
            const config = {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            };

            const { data } = await api.post("/product", formData, config);

            if (!data.success) {
                toast.error(data.message || "Failed to add product");
                throw new Error(data.message || "Failed to add product");
            }

            toast.success("Product added successfully");
            setShowAddModal(false);
            fetchProducts();
        } catch (error) {
            console.error("Error adding product:", error);
            toast.error(error.response?.data?.message || "Failed to add product");
            throw error;
        }
    };

    // Handle Edit Product
    const handleEditProduct = async (formData) => {
        try {
            // Use multipart/form-data for file upload support
            const config = {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            };

            // Extract ID from FormData for the URL
            const id = formData.get("id");

            const { data } = await api.put(`/product/${id}`, formData, config);

            if (!data.success) {
                toast.error(data.message || "Failed to update product");
                throw new Error(data.message || "Failed to update product");
            }

            toast.success("Product updated successfully");
            setShowEditModal(false);
            setSelectedProduct(null);
            fetchProducts();
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error(error.response?.data?.message || "Failed to update product");
            throw error;
        }
    };

    // Handle Delete Product
    const handleDeleteProduct = async () => {
        try {
            const { data } = await api.delete(`/product/${selectedProduct.id}`);

            if (!data.success) {
                toast.error(data.message || "Failed to delete product");
                return;
            }

            toast.success("Product deleted successfully");
            setShowDeleteModal(false);
            setSelectedProduct(null);
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete product");
            console.error(error);
        }
    };

    // Open Edit Modal
    const openEditModal = (product) => {
        setSelectedProduct(product);
        setShowEditModal(true);
    };

    // Open Delete Modal
    const openDeleteModal = (product) => {
        setSelectedProduct(product);
        setShowDeleteModal(true);
    };

    // Pagination Calculations
    const totalPages = Math.ceil(totalProducts / pageSize);
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, totalProducts);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(amount);
    };

    // Options
    const categoryOptions = [
        { value: "All", label: "All Categories" },
        ...categories.map((c) => ({ value: c, label: c })),
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
                            Product Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage all products
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Product
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or SKU..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                            <Select
                                value={filterCategory}
                                onChange={(e) => {
                                    setFilterCategory(e.target.value);
                                    setCurrentPage(1);
                                }}
                                options={categoryOptions}
                                className="w-48"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Products Table */}
                <Card>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <LoadingSpinner size="lg" />
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    No products found
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">
                                    {searchTerm
                                        ? "Try adjusting your search"
                                        : "Get started by adding your first product"}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableHead>Image</TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead>Product Name</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Unit</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableHeader>
                                        <TableBody>
                                            {products.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell>
                                                        <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-600">
                                                            {product.imageUrl ? (
                                                                <img
                                                                    src={getImageUrl(product.imageUrl)}
                                                                    alt={product.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <Package className="h-6 w-6 text-gray-400" />
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                            {product.sku}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                                                                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-white">
                                                                    {product.name}
                                                                </p>
                                                                {product.isBarcoded && product.barcode && (
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {product.barcode}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {product.categoryName ? (
                                                            <Badge variant="info">{product.categoryName}</Badge>
                                                        ) : (
                                                            <span className="text-gray-400">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-semibold text-gray-900 dark:text-white">
                                                            {formatCurrency(product.price)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {product.unitOfMeasure || "—"}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {product.isPerishable ? (
                                                            <Badge variant="warning">Perishable</Badge>
                                                        ) : (
                                                            <Badge variant="success">Non-Perishable</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            {new Date(
                                                                product.createdAt || Date.now()
                                                            ).toLocaleDateString()}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => openEditModal(product)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                                title="Edit product"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => openDeleteModal(product)}
                                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                title="Delete product"
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
                                                {startIndex}-{endIndex} of {totalProducts}
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
            </div>

            {/* Modals */}
            <ProductAddModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleAddProduct}
            />

            <ProductEditModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedProduct(null);
                }}
                onSubmit={handleEditProduct}
                selectedProduct={selectedProduct}
            />

            <ProductDeleteModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedProduct(null);
                }}
                onConfirm={handleDeleteProduct}
                selectedProduct={selectedProduct}
            />
        </DashboardLayout>
    );
};

export default DistributorProducts;
