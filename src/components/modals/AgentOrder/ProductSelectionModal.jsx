import { useState, useEffect } from "react";
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Search, Package, Barcode, Tag } from "lucide-react";
import api from "../../../api/axios";

export const ProductSelectionModal = ({
    isOpen,
    onClose,
    onSelectProduct,
    excludeProductIds = [],
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchProducts();
        }
    }, [isOpen, searchTerm]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/product/lookup", {
                params: { searchTerm },
            });
            if (data.success) {
                // Filter out already selected products
                const filteredProducts = (data.data || []).filter(
                    (product) => !excludeProductIds.includes(product.id)
                );
                setProducts(filteredProducts);
            }
        } catch (error) {
            console.error("Failed to load products:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectProduct = (product) => {
        onSelectProduct(product);
        setSearchTerm("");
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(amount);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Products"
            size="lg"
        >
            <div className="space-y-4">
                {/* Search Input */}
                <div className="space-y-2">
                    <Input
                        placeholder="Search products by name or SKU..."
                        icon={Search}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Barcode className="h-3 w-3" />
                        Tip: You can search by product name or SKU
                    </p>
                </div>

                {/* Product List */}
                <div className="max-h-96 overflow-y-auto space-y-2">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Loading products...
                            </p>
                        </div>
                    ) : products.length > 0 ? (
                        products.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => handleSelectProduct(product)}
                                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {product.name}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Barcode className="h-3 w-3" />
                                                SKU: {product.sku}
                                            </span>
                                            {product.category && (
                                                <span className="flex items-center gap-1">
                                                    <Tag className="h-3 w-3" />
                                                    {product.category}
                                                </span>
                                            )}
                                        </div>
                                        {product.unitOfMeasure && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Unit: {product.unitOfMeasure}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                            {formatCurrency(product.price)}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            per {product.unitOfMeasure || "unit"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 dark:text-gray-400 mb-1">
                                No products found
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                {searchTerm
                                    ? "Try a different search term"
                                    : "Start typing to search for products"}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="outline" onClick={onClose}>
                        Done
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
