// src/components/forms/AdminOrder/NewStoreForm.jsx
import { Card, CardContent } from "../../ui/Card";
import { Input } from "../../ui/Input";

export const NewStoreForm = ({ formData, onChange }) => {
  const handleChange = (field, value) => {
    onChange({
      ...formData,
      [field]: value,
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

          <Input
            label="City *"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            placeholder="e.g., Meycauayan"
            required
          />

          <Input
            label="Barangay"
            value={formData.barangay}
            onChange={(e) => handleChange("barangay", e.target.value)}
            placeholder="e.g., Malhacan"
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
