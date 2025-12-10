// src/components/modals/AdminStore/StoreEditModal.jsx
import { useState, useEffect, useMemo } from "react";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { Button } from "../../ui/Button";
import locationService from "../../../services/locationServices";

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
        barangayId: "",
        cityId: "",
        ownerName: "",
        phone: "",
        creditLimit: "0",
        preferredPaymentMethod: "Cash",
      };

    return {
      id: selectedStore.id,
      name: selectedStore.name || "",
      barangayId: selectedStore.barangayId?.toString() || "",
      cityId: selectedStore.cityId?.toString() || "",
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
      if (initialFormData.cityId) {
        fetchBarangays(initialFormData.cityId);
      }
    }
  }, [isOpen, initialFormData]);

  // Fetch barangays when city changes
  useEffect(() => {
    if (formData.cityId && formData.cityId !== initialFormData.cityId) {
      fetchBarangays(formData.cityId);
      // Reset barangay when city changes
      setFormData((prev) => ({ ...prev, barangayId: "" }));
    }
  }, [formData.cityId]);

  const fetchCities = async () => {
    try {
      setLoadingLocations(true);
      const response = await locationService.getCitiesForLookup();
      if (response.success) {
        setCities(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch cities:", error);
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchBarangays = async (cityId) => {
    try {
      setLoadingLocations(true);
      const response = await locationService.getBarangaysForLookup(
        parseInt(cityId)
      );
      if (response.success) {
        setBarangays(response.data || []);
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

    // Convert IDs to numbers and creditLimit to decimal
    const submitData = {
      id: parseInt(formData.id),
      name: formData.name,
      barangayId: formData.barangayId ? parseInt(formData.barangayId) : null,
      cityId: formData.cityId ? parseInt(formData.cityId) : null,
      ownerName: formData.ownerName || null,
      phone: formData.phone || null,
      creditLimit: parseFloat(formData.creditLimit) || 0,
      preferredPaymentMethod: formData.preferredPaymentMethod,
    };

    await onSubmit(submitData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      barangayId: "",
      cityId: "",
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
    ...cities.map((c) => ({ value: c.id.toString(), label: c.name })),
  ];

  const barangayOptions = [
    { value: "", label: "Select Barangay" },
    ...barangays.map((b) => ({ value: b.id.toString(), label: b.name })),
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
            name="cityId"
            value={formData.cityId}
            onChange={handleInputChange}
            options={cityOptions}
            disabled={loadingLocations}
          />
          <Select
            label="Barangay"
            name="barangayId"
            value={formData.barangayId}
            onChange={handleInputChange}
            options={barangayOptions}
            disabled={loadingLocations || !formData.cityId}
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
