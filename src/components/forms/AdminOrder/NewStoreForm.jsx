import { useState, useEffect } from "react";
import { Card, CardContent } from "../../ui/Card";
import { Input } from "../../ui/Input";
import locationService from "../../../services/locationService";

export const NewStoreForm = ({ formData, onChange }) => {
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);

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
      const result = await locationService.getCitiesForLookup();
      if (result.success) {
        setCities(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const fetchBarangays = async (cityId) => {
    try {
      const result = await locationService.getBarangaysForLookup(cityId);
      if (result.success) {
        setBarangays(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching barangays:", error);
    }
  };

  const handleChange = (field, value) => {
    onChange({
      ...formData,
      [field]: value,
    });
  };

  const handleCityChange = (e) => {
    const cityId = e.target.value;
    onChange({
      ...formData,
      cityId: cityId,
      barangayId: "", // Reset barangay when city changes
    });
  };

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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              City *
            </label>
            <select
              value={formData.cityId}
              onChange={handleCityChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              required
            >
              <option value="">Select City</option>
              {cities.map((city, index) => (
                <option key={`${city.id}-${index}`} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Barangay
            </label>
            <select
              value={formData.barangayId}
              onChange={(e) => handleChange("barangayId", e.target.value)}
              disabled={!formData.cityId}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm disabled:opacity-50"
            >
              <option value="">Select Barangay</option>
              {barangays.map((bg, index) => (
                <option key={`${bg.id}-${index}`} value={bg.id}>
                  {bg.name}
                </option>
              ))}
            </select>
          </div>

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
