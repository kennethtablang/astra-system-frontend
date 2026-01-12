import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardHeader, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { toast } from "react-hot-toast";
import { Settings, Save, Upload, Trash } from "lucide-react";
import settingsService from "../../services/settingsService";
import { LoadingSpinner } from "../../components/ui/Loading";
import { getImageUrl } from "../../utils/imageUrl";

export const AdminSettings = () => {
  const [settings, setSettings] = useState({
    CompanyName: "",
    CompanyAddress: "",
    CompanyPhone: "",
    CompanyEmail: "",
    TaxRate: "0",
    Currency: "PHP",
  });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await settingsService.getSettings();
      if (data) {
        setSettings(data);
        if (data.CompanyLogo) {
          setLogoPreview(getImageUrl(data.CompanyLogo));
        }
      }
    } catch (error) {
      toast.error("Failed to load settings: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
      handleUploadLogo(file);
    }
  };

  const handleUploadLogo = async (file) => {
    try {
      const loadingToast = toast.loading("Uploading logo...");
      await settingsService.uploadLogo(file);
      toast.dismiss(loadingToast);
      toast.success("Logo uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload logo");
      console.error(error);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.updateSettings(settings); // Send as key-value pairs or object depending on backend
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            System Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage global system configuration and branding
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Company Branding */}
          <Card className="md:col-span-1">
            <CardHeader>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Company Branding
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                {logoPreview ? (
                  <div className="relative group">
                    <img
                      src={logoPreview}
                      alt="Company Logo"
                      className="h-32 w-32 object-contain mb-4"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                      <label htmlFor="logo-upload" className="cursor-pointer text-white">
                        <Upload className="h-6 w-6" />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="h-32 w-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                    <Settings className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="text-center">
                  <label htmlFor="logo-upload">
                    <Button variant="outline" size="sm" as="span">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                  </label>
                  <input
                    id="logo-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG up to 2MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* General Configuration */}
          <Card className="md:col-span-2">
            <CardHeader>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                General Configuration
              </h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Company Name
                    </label>
                    <Input
                      name="CompanyName"
                      value={settings.CompanyName || ""}
                      onChange={handleChange}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contact Email
                    </label>
                    <Input
                      name="CompanyEmail"
                      value={settings.CompanyEmail || ""}
                      onChange={handleChange}
                      placeholder="support@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number
                    </label>
                    <Input
                      name="CompanyPhone"
                      value={settings.CompanyPhone || ""}
                      onChange={handleChange}
                      placeholder="+63 900 000 0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Address
                    </label>
                    <Input
                      name="CompanyAddress"
                      value={settings.CompanyAddress || ""}
                      onChange={handleChange}
                      placeholder="Building, Street, City"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tax Rate (%)
                    </label>
                    <Input
                      type="number"
                      name="TaxRate"
                      value={settings.TaxRate || ""}
                      onChange={handleChange}
                      placeholder="12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Currency
                    </label>
                    <Input
                      name="Currency"
                      value={settings.Currency || "PHP"}
                      onChange={handleChange}
                      placeholder="PHP"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
