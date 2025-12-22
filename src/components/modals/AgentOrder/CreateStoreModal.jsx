import { useState, useEffect } from "react";
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Combobox } from "../../ui/Combobox";
import { toast } from "react-hot-toast";
import { Store, MapPin, User, Phone, Mail } from "lucide-react";
import api from "../../../api/axios";

export const CreateStoreModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [cities, setCities] = useState([]);
    const [barangays, setBarangays] = useState([]);

    // Fetch cities on mount
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const { data } = await api.get("/city/lookup");
                if (data.success) {
                    setCities(data.data || []);
                }
            } catch (error) {
                console.error("Failed to load cities", error);
            }
        };
        fetchCities();
    }, []);

    const fetchBarangays = async (cityId) => {
        try {
            const { data } = await api.get("/barangay/lookup", {
                params: { cityId: parseInt(cityId) },
            });
            if (data.success) {
                setBarangays(data.data || []);
            }
        } catch (error) {
            console.error("Failed to load barangays", error);
        }
    };

    const [formData, setFormData] = useState({
        name: "",
        ownerName: "",
        contactNumber: "",
        email: "",
        barangayId: "",
        cityId: "",
        address: "",
        storeType: "Sari-Sari Store",
    });

    const storeTypes = [
        "Sari-Sari Store",
        "Mini Mart",
        "Grocery Store",
        "Supermarket",
        "Convenience Store",
        "Wholesale Store",
        "Other",
    ];

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name?.trim()) {
            toast.error("Store name is required");
            return;
        }
        if (!formData.barangay?.trim()) {
            toast.error("Barangay is required");
            return;
        }
        if (!formData.city?.trim()) {
            toast.error("City is required");
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post("/store", formData);

            if (data.success) {
                toast.success("Store created successfully!");
                onSuccess?.(data.data);
                onClose();
                // Reset form
                setFormData({
                    name: "",
                    ownerName: "",
                    contactNumber: "",
                    email: "",
                    barangayId: "",
                    cityId: "",
                    address: "",
                    storeType: "Sari-Sari Store",
                });
            } else {
                toast.error(data.message || "Failed to create store");
            }
        } catch (error) {
            console.error("Error creating store:", error);
            toast.error(
                error.response?.data?.message || "Failed to create store"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create New Store"
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Store Information */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                        <Store className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Quick Store Creation</strong>
                            <p className="mt-1">
                                Fill in the store details to add it to the system.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Store Name */}
                <Input
                    label="Store Name"
                    placeholder="Enter store name"
                    icon={Store}
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                />

                {/* Store Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Store Type
                    </label>
                    <select
                        value={formData.storeType}
                        onChange={(e) => handleChange("storeType", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                        {storeTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Owner Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Owner Name"
                        placeholder="Enter owner name"
                        icon={User}
                        value={formData.ownerName}
                        onChange={(e) => handleChange("ownerName", e.target.value)}
                    />
                    <Input
                        label="Contact Number"
                        placeholder="e.g., 09123456789"
                        icon={Phone}
                        value={formData.contactNumber}
                        onChange={(e) => handleChange("contactNumber", e.target.value)}
                    />
                </div>

                {/* Email */}
                <Input
                    label="Email (Optional)"
                    type="email"
                    placeholder="store@example.com"
                    icon={Mail}
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Combobox
                        label="City *"
                        placeholder="Select City"
                        value={formData.cityId}
                        options={cities.map((city) => ({
                            value: city.id.toString(),
                            label: city.name,
                            key: city.id
                        }))}
                        onChange={(value) => {
                            handleChange("cityId", value);
                            handleChange("barangayId", "");
                            fetchBarangays(value);
                        }}
                        className="w-full"
                    />
                    <Combobox
                        label="Barangay *"
                        placeholder="Select Barangay"
                        value={formData.barangayId}
                        options={barangays.map((b) => ({
                            value: b.id.toString(),
                            label: b.name,
                            key: b.id
                        }))}
                        onChange={(value) => handleChange("barangayId", value)}
                        disabled={!formData.cityId}
                        className="w-full"
                    />
                </div>

                {/* Full Address */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Address (Optional)
                    </label>
                    <textarea
                        value={formData.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                        placeholder="Enter complete address"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" className="flex-1" disabled={loading}>
                        {loading ? "Creating..." : "Create Store"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
