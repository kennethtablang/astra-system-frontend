// src/components/modals/AgentStore/AgentStoreEditModal.jsx
import { useState, useEffect } from "react";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { Combobox } from "../../ui/Combobox";
import { Button } from "../../ui/Button";
import { Phone, User } from "lucide-react";
import api from "../../../api/axios";

export const AgentStoreEditModal = ({
    isOpen,
    onClose,
    onSubmit,
    selectedStore,
}) => {
    const [cities, setCities] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const [loadingLocations, setLoadingLocations] = useState(false);

    const [formData, setFormData] = useState({
        id: "",
        name: "",
        barangayId: "",
        cityId: "",
        ownerName: "",
        phone: "",
        creditLimit: "0",
        preferredPaymentMethod: "Cash",
    });

    // Fetch cities on mount
    useEffect(() => {
        if (isOpen) {
            fetchCities();
        }
    }, [isOpen]);

    // Pre-populate form when store is selected
    useEffect(() => {
        if (selectedStore && isOpen) {
            setFormData({
                id: selectedStore.id,
                name: selectedStore.name || "",
                barangayId: selectedStore.barangayId?.toString() || "",
                cityId: selectedStore.cityId?.toString() || "",
                ownerName: selectedStore.ownerName || "",
                phone: selectedStore.phone || "",
                creditLimit: selectedStore.creditLimit?.toString() || "0",
                preferredPaymentMethod: selectedStore.preferredPaymentMethod || "Cash",
            });

            // Fetch barangays if city exists
            if (selectedStore.cityId) {
                fetchBarangays(selectedStore.cityId);
            }
        }
    }, [selectedStore, isOpen]);

    const fetchCities = async () => {
        try {
            setLoadingLocations(true);
            const { data } = await api.get("/city/lookup");
            if (data.success) {
                setCities(data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch cities:", error);
        } finally {
            setLoadingLocations(false);
        }
    };

    const fetchBarangays = async (cityId) => {
        if (!cityId) {
            setBarangays([]);
            return;
        }

        try {
            setLoadingLocations(true);
            const { data } = await api.get("/barangay/lookup", {
                params: { cityId: parseInt(cityId) }
            });
            if (data.success) {
                setBarangays(data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch barangays:", error);
            setBarangays([]);
        } finally {
            setLoadingLocations(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate
        if (!formData.name) {
            alert("Please enter store name");
            return;
        }

        const submitData = {
            id: formData.id,
            name: formData.name,
            barangayId: formData.barangayId ? parseInt(formData.barangayId) : null,
            cityId: formData.cityId ? parseInt(formData.cityId) : null,
            ownerName: formData.ownerName || null,
            phone: formData.phone || null,
            creditLimit: parseFloat(formData.creditLimit) || 0,
            preferredPaymentMethod: formData.preferredPaymentMethod,
        };

        await onSubmit(submitData);
        onClose();
    };

    const paymentMethodOptions = [
        { value: "Cash", label: "Cash" },
        { value: "GCash", label: "GCash" },
        { value: "Maya", label: "Maya" },
        { value: "BankTransfer", label: "Bank Transfer" },
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Store"
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Info Banner */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Store ID:</strong> {selectedStore?.id}
                    </div>
                </div>

                <Input
                    label="Store Name *"
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Combobox
                        label="City *"
                        value={formData.cityId}
                        options={cities.map((c) => ({
                            value: c.id.toString(),
                            label: c.name,
                            key: c.id
                        }))}
                        onChange={(value) => {
                            handleChange("cityId", value);
                            handleChange("barangayId", "");
                            fetchBarangays(value);
                        }}
                        placeholder="Select City"
                        required
                    />

                    <Combobox
                        label="Barangay *"
                        value={formData.barangayId}
                        options={barangays.map((b) => ({
                            value: b.id.toString(),
                            label: b.name,
                            key: b.id
                        }))}
                        onChange={(value) => handleChange("barangayId", value)}
                        placeholder="Select Barangay"
                        disabled={!formData.cityId || loadingLocations}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Owner Name"
                        name="ownerName"
                        icon={User}
                        value={formData.ownerName}
                        onChange={(e) => handleChange("ownerName", e.target.value)}
                    />
                    <Input
                        label="Phone Number"
                        name="phone"
                        icon={Phone}
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Credit Limit"
                        name="creditLimit"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.creditLimit}
                        onChange={(e) => handleChange("creditLimit", e.target.value)}
                    />
                    <Select
                        label="Preferred Payment Method"
                        name="preferredPaymentMethod"
                        value={formData.preferredPaymentMethod}
                        onChange={(e) => handleChange("preferredPaymentMethod", e.target.value)}
                        options={paymentMethodOptions}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit">Update Store</Button>
                </div>
            </form>
        </Modal>
    );
};
