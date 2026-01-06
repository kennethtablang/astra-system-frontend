// src/components/modals/AdminStore/StoreAddModal.jsx
import { useState, useEffect } from "react";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { Button } from "../../ui/Button";
import locationService from "../../../services/locationServices";
import { LocationPickerModal } from "./LocationPickerModal";
import { MapPin } from "lucide-react";

export const StoreAddModal = ({ isOpen, onClose, onSubmit }) => {
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    addressLine1: "",
    addressLine2: "",
    barangayId: "",
    cityId: "",
    latitude: "",
    longitude: "",
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
    if (formData.cityId) {
      fetchBarangays(formData.cityId);
    } else {
      setBarangays([]);
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
      const response = await locationService.getBarangaysForLookup(cityId);
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
      name: formData.name,
      addressLine1: formData.addressLine1 || null,
      addressLine2: formData.addressLine2 || null,
      barangayId: formData.barangayId ? parseInt(formData.barangayId) : null,
      cityId: formData.cityId ? parseInt(formData.cityId) : null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
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
      name: "",
      addressLine1: "",
      addressLine2: "",
      barangayId: "",
      cityId: "",
      latitude: "",
      longitude: "",
      ownerName: "",
      phone: "",
      creditLimit: "0",
      preferredPaymentMethod: "Cash",
    });
  };

  const handleLocationSelect = (latlng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: latlng.lat,
      longitude: latlng.lng,
    }));
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

        <Input
          label="Address Line 1"
          name="addressLine1"
          value={formData.addressLine1}
          onChange={handleInputChange}
          placeholder="e.g., Block 1 Lot 2 Street Name"
        />

        <Input
          label="Address Line 2 (Optional)"
          name="addressLine2"
          value={formData.addressLine2}
          onChange={handleInputChange}
          placeholder="e.g., Subdivision / Landmark"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Latitude"
            name="latitude"
            value={formData.latitude}
            onChange={handleInputChange}
            placeholder="0.000000"
          />
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="Longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                placeholder="0.000000"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsLocationPickerOpen(true)}
              className="mb-[2px]"
              title="Pick Location on Map"
            >
              <MapPin className="h-5 w-5" />
            </Button>
          </div>
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

      <LocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        onSelect={handleLocationSelect}
        initialLocation={
          formData.latitude && formData.longitude
            ? { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) }
            : null
        }
      />
    </Modal >
  );
};
