// src/components/modals/AgentStore/AgentStoreAddModal.jsx
import { useState, useEffect } from "react";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { Combobox } from "../../ui/Combobox";
import { Button } from "../../ui/Button";
import { Phone, User } from "lucide-react";
import api from "../../../api/axios";

export const AgentStoreAddModal = ({ isOpen, onClose, onSubmit }) => {
    const [cities, setCities] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const [loadingLocations, setLoadingLocations] = useState(false);

    const [formData, setFormData] = useState({
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

    // Reset form when closed
    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

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
            // Backend expects integer ID for lookup
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

        // Validate required fields
        if (!formData.name) {
            alert("Please enter store name");
            return;
        }
        if (!formData.cityId || !formData.barangayId) {
            alert("Please select city and barangay");
            return;
        }

        // Convert IDs to numbers and creditLimit to decimal
        const submitData = {
            name: formData.name,
            barangayId: parseInt(formData.barangayId),
            cityId: parseInt(formData.cityId),
            ownerName: formData.ownerName || null,
            phone: formData.phone || null,
            creditLimit: parseFloat(formData.creditLimit) || 0,
            preferredPaymentMethod: formData.preferredPaymentMethod,
        };

        await onSubmit(submitData);
        handleClose();
    };

    const resetForm = () => {
        setFormData({
            name: "",
            barangayId: "",
            cityId: "",
            ownerName: "",
            phone: "",
            creditLimit: "0",
            preferredPaymentMethod: "Cash",
        });
        setBarangays([]);
        setCities([]);
    };

    const handleClose = () => {
        resetForm();
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
            onClose={handleClose}
            title="Add New Store"
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Store Name *"
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                    placeholder="e.g., Sari-Sari Store ni Aling Maria"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Combobox
                        label="City *"
                        value={formData.cityId}
                        options={cities.map((c) => ({
                            value: c.id.toString(), // Use ID as value
                            label: c.name,
                            key: c.id
                        }))}
                        onChange={(value) => {
                            handleChange("cityId", value);
                            handleChange("barangayId", ""); // Reset barangay
                            fetchBarangays(value); // Fetch barcodes using ID
                        }}
                        placeholder="Select City"
                        required
                    />

                    <Combobox
                        label="Barangay *"
                        value={formData.barangayId}
                        options={barangays.map((b) => ({
                            value: b.id.toString(), // Use ID as value
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
                        placeholder="Juan Dela Cruz"
                    />
                    <Input
                        label="Phone Number"
                        name="phone"
                        icon={Phone}
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="09123456789"
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
                        placeholder="0.00"
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
                    <Button type="button" variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="submit">Add Store</Button>
                </div>
            </form>
        </Modal>
    );
};
