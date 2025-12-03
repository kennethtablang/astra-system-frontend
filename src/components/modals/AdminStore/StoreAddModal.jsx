// src/components/modals/AdminStore/StoreAddModal.jsx
import { useState, useEffect } from "react";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { Button } from "../../ui/Button";
import api from "../../../api/axios";

export const StoreAddModal = ({ isOpen, onClose, onSubmit }) => {
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    barangay: "",
    city: "",
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

  // Fetch barangays when city changes
  useEffect(() => {
    if (formData.city) {
      fetchBarangays(formData.city);
    } else {
      setBarangays([]);
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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Store"
      size="lg"
    >
      <div className="space-y-4">
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

        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Tip:</strong> You can leave city and barangay empty if not
            applicable. Credit limit determines how much credit the store can
            have before payment is required.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Store</Button>
        </div>
      </div>
    </Modal>
  );
};
