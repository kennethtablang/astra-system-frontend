// src/components/modals/AdminStore/StoreEditModal.jsx
import { useState, useEffect, useMemo } from "react";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { Button } from "../../ui/Button";
import api from "../../../api/axios";

export const StoreEditModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedStore,
}) => {
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Derive form data from selectedStore
  const initialFormData = useMemo(() => {
    if (!selectedStore)
      return {
        id: "",
        name: "",
        barangay: "",
        city: "",
        ownerName: "",
        phone: "",
        creditLimit: "0",
        preferredPaymentMethod: "Cash",
      };

    return {
      id: selectedStore.id,
      name: selectedStore.name || "",
      barangay: selectedStore.barangay || "",
      city: selectedStore.city || "",
      ownerName: selectedStore.ownerName || "",
      phone: selectedStore.phone || "",
      creditLimit: selectedStore.creditLimit?.toString() || "0",
      preferredPaymentMethod: selectedStore.preferredPaymentMethod || "Cash",
    };
  }, [selectedStore]);

  const [formData, setFormData] = useState(initialFormData);

  // Update form data when initialFormData changes
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      fetchCities();
      if (initialFormData.city) {
        fetchBarangays(initialFormData.city);
      }
    }
  }, [isOpen, initialFormData]);

  // Fetch barangays when city changes
  useEffect(() => {
    if (formData.city && formData.city !== initialFormData.city) {
      fetchBarangays(formData.city);
    }
  }, [formData.city]);

  const fetchCities = async () => {
    try {
      setLoadingLocations(true);
      const { data } = await api.get("/store/locations/cities");
      if (data.success) {
        setCities(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch cities:", error);
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchBarangays = async (city) => {
    try {
      setLoadingLocations(true);
      const { data } = await api.get("/store/locations/barangays", {
        params: { city },
      });
      if (data.success) {
        setBarangays(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch barangays:", error);
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name) {
      alert("Please enter store name");
      return;
    }

    // Convert creditLimit to number
    const submitData = {
      ...formData,
      creditLimit: parseFloat(formData.creditLimit) || 0,
    };

    await onSubmit(submitData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      barangay: "",
      city: "",
      ownerName: "",
      phone: "",
      creditLimit: "0",
      preferredPaymentMethod: "Cash",
    });
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
    { value: "Check", label: "Check" },
    { value: "Credit", label: "Credit Terms" },
  ];

  const cityOptions = [
    { value: "", label: "Select City" },
    ...cities.map((c) => ({ value: c, label: c })),
  ];

  const barangayOptions = [
    { value: "", label: "Select Barangay" },
    ...barangays.map((b) => ({ value: b.barangay, label: b.barangay })),
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Store" size="lg">
      <div className="space-y-4">
        {/* Store Info Display */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Store ID:</strong> {selectedStore?.id}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            <strong>Created:</strong>{" "}
            {selectedStore?.createdAt &&
              new Date(selectedStore.createdAt).toLocaleDateString()}
          </div>
        </div>

        <Input
          label="Store Name *"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          placeholder="e.g., Sari-Sari Store ni Aling Maria"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="City"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            options={cityOptions}
            disabled={loadingLocations}
          />
          <Select
            label="Barangay"
            name="barangay"
            value={formData.barangay}
            onChange={handleInputChange}
            options={barangayOptions}
            disabled={loadingLocations || !formData.city}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Owner Name"
            name="ownerName"
            value={formData.ownerName}
            onChange={handleInputChange}
            placeholder="Juan Dela Cruz"
          />
          <Input
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
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
            onChange={handleInputChange}
            placeholder="0.00"
          />
          <Select
            label="Preferred Payment Method"
            name="preferredPaymentMethod"
            value={formData.preferredPaymentMethod}
            onChange={handleInputChange}
            options={paymentMethodOptions}
          />
        </div>

        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> Changes to credit limit should be done
            carefully. Consider the store's payment history before increasing
            credit limits.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Update Store</Button>
        </div>
      </div>
    </Modal>
  );
};
