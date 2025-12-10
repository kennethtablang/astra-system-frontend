// src/components/forms/AdminOrder/NewStoreForm.jsx
import { useState, useEffect } from "react";
import { Card, CardContent } from "../../ui/Card";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import locationService from "../../../services/locationServices";

export const NewStoreForm = ({ formData, onChange }) => {
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    if (formData.cityId) {
      fetchBarangays(formData.cityId);
    } else {
      setBarangays([]);
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

  const handleChange = (field, value) => {
    onChange({
      ...formData,
      [field]: value,
    });
  };

  const cityOptions = [
    { value: "", label: "Select City" },
    ...cities.map((c) => ({ value: c.id.toString(), label: c.name })),
  ];

  const barangayOptions = [
    { value: "", label: "Select Barangay" },
    ...barangays.map((b) => ({ value: b.id.toString(), label: b.name })),
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Customer Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Store Name *"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g., Sari-Sari Store"
            required
          />

          <Input
            label="Owner Name *"
            value={formData.ownerName}
            onChange={(e) => handleChange("ownerName", e.target.value)}
            placeholder="e.g., Juan Dela Cruz"
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="e.g., 09123456789"
          />

          <Select
            label="City *"
            value={formData.cityId || ""}
            onChange={(e) => {
              handleChange("cityId", e.target.value);
              handleChange("barangayId", ""); // Reset barangay when city changes
            }}
            options={cityOptions}
            disabled={loadingLocations}
            required
          />

          <Select
            label="Barangay"
            value={formData.barangayId || ""}
            onChange={(e) => handleChange("barangayId", e.target.value)}
            options={barangayOptions}
            disabled={loadingLocations || !formData.cityId}
          />

          <Input
            label="Credit Limit"
            type="number"
            value={formData.creditLimit}
            onChange={(e) =>
              handleChange("creditLimit", parseFloat(e.target.value) || 0)
            }
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>

        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> For new customers, orders will default to
            cash-on-delivery. Credit limit can be adjusted later in Store
            Management.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
