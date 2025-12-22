// src/components/modals/AgentProduct/AgentProductEditModal.jsx
import { useState, useEffect } from "react";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { Button } from "../../ui/Button";
import api from "../../../api/axios";

export const AgentProductEditModal = ({
    isOpen,
    onClose,
    onSubmit,
    selectedProduct,
}) => {
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [formData, setFormData] = useState({
        id: "",
        sku: "",
        name: "",
        categoryId: null,
        price: "0",
        unitOfMeasure: "",
        isPerishable: false,
        isBarcoded: false,
        barcode: "",
    });

    // Update form when selectedProduct changes
    useEffect(() => {
        if (isOpen && selectedProduct) {
            setFormData({
                id: selectedProduct.id,
                sku: selectedProduct.sku || "",
                name: selectedProduct.name || "",
                categoryId: selectedProduct.categoryId || null,
                price: selectedProduct.price?.toString() || "0",
                unitOfMeasure: selectedProduct.unitOfMeasure || "",
                isPerishable: selectedProduct.isPerishable || false,
                isBarcoded: selectedProduct.isBarcoded || false,
                barcode: selectedProduct.barcode || "",
            });
            fetchCategories();
        }
    }, [isOpen, selectedProduct]);

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const { data } = await api.get("/category");
            if (data.success) {
                setCategories(data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async () => {
        if (!formData.sku || !formData.name || !formData.price) {
            alert("Please fill in all required fields");
            return;
        }

        if (formData.isBarcoded && !formData.barcode) {
            alert("Please enter a barcode for barcoded products");
            return;
        }

        const submitData = {
            id: formData.id,
            sku: formData.sku,
            name: formData.name,
            categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
            price: parseFloat(formData.price) || 0,
            unitOfMeasure: formData.unitOfMeasure || null,
            isPerishable: formData.isPerishable,
            isBarcoded: formData.isBarcoded,
            barcode: formData.barcode || null,
        };

        await onSubmit(submitData);
        onClose();
    };

    const handleClose = () => {
        onClose();
    };

    const categoryOptions = [
        { value: "", label: "Select Category" },
        ...categories.map((c) => ({ value: c.id.toString(), label: c.name })),
    ];

    const unitOptions = [
        { value: "", label: "Select Unit" },
        { value: "pcs", label: "Pieces" },
        { value: "box", label: "Box" },
        { value: "pack", label: "Pack" },
        { value: "bottle", label: "Bottle" },
        { value: "can", label: "Can" },
        { value: "kg", label: "Kilogram" },
        { value: "g", label: "Gram" },
        { value: "L", label: "Milliliter" }, // Fixed label from previous file if it was wrong, assuming L is Liter not Milliliter but let's copy previous logic or fix common sense. Admin had L as Liter.
        { value: "mL", label: "Milliliter" },
    ];

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Edit Product" size="lg">
            <div className="space-y-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Product ID:</strong> {selectedProduct?.id}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <strong>Created:</strong>{" "}
                        {selectedProduct?.createdAt &&
                            new Date(selectedProduct.createdAt).toLocaleDateString()}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="SKU *"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., BEV-001"
                    />
                    <Input
                        label="Product Name *"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Coca Cola 1L"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label="Category"
                        name="categoryId"
                        value={formData.categoryId?.toString() || ""}
                        onChange={handleInputChange}
                        options={categoryOptions}
                        disabled={loadingCategories}
                    />
                    <Select
                        label="Unit of Measure"
                        name="unitOfMeasure"
                        value={formData.unitOfMeasure}
                        onChange={handleInputChange}
                        options={unitOptions}
                    />
                </div>

                <Input
                    label="Price *"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    placeholder="0.00"
                />

                <div className="space-y-3">
                    <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <input
                            type="checkbox"
                            id="isPerishable"
                            name="isPerishable"
                            checked={formData.isPerishable}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                        />
                        <label
                            htmlFor="isPerishable"
                            className="ml-2 text-sm text-gray-700 dark:text-gray-200"
                        >
                            Perishable Product
                        </label>
                    </div>

                    <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <input
                            type="checkbox"
                            id="isBarcoded"
                            name="isBarcoded"
                            checked={formData.isBarcoded}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                        />
                        <label
                            htmlFor="isBarcoded"
                            className="ml-2 text-sm text-gray-700 dark:text-gray-200"
                        >
                            Has Barcode
                        </label>
                    </div>

                    {formData.isBarcoded && (
                        <Input
                            label="Barcode *"
                            name="barcode"
                            value={formData.barcode}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter barcode"
                        />
                    )}
                </div>

                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Note:</strong> Changing the SKU may affect existing orders
                        and inventory records. Proceed with caution.
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>Update Product</Button>
                </div>
            </div>
        </Modal>
    );
};
