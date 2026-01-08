import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/Loading";
import { Building, Save, Mail, Phone, MapPin, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../api/axios";
import { getImageUrl } from "../../utils/imageUrl";

export const AdminSettingsGeneral = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [formData, setFormData] = useState({
    companyName: "",
    supportEmail: "",
    contactNumber: "",
    address: "",
    CompanyLogo: ""
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setFetching(true);
      const response = await api.get("/settings");
      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          ...response.data.data,
          companyName: response.data.data.companyName || response.data.data.CompanyName || "",
          supportEmail: response.data.data.supportEmail || response.data.data.SupportEmail || "",
          contactNumber: response.data.data.contactNumber || response.data.data.ContactNumber || "",
          address: response.data.data.address || response.data.data.Address || "",
        }));
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload logo if changed
      if (logoFile) {
        const formData = new FormData();
        formData.append('file', logoFile);
        const uploadRes = await api.post('/settings/logo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (uploadRes.data.success) {
          // Update local state with new logo url
          formData.CompanyLogo = uploadRes.data.data.logoUrl;
        }
      }

      // Save other settings
      const settingsToSave = {
        companyName: formData.companyName,
        supportEmail: formData.supportEmail,
        contactNumber: formData.contactNumber,
        address: formData.address
      };

      const response = await api.put("/settings", settingsToSave);

      if (response.data.success) {
        toast.success("Settings saved successfully");
        setLogoFile(null); // Reset file input
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            General Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure company details and logo
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">

                {/* Logo Section */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                    {logoPreview || formData.CompanyLogo ? (
                      <img
                        src={logoPreview || getImageUrl(formData.CompanyLogo)}
                        alt="Company Logo"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-gray-300" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => document.getElementById('logo-upload').click()}>
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <input
                    type="file"
                    id="logo-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('logo-upload').click()}>
                    Change Logo
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2 text-left">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Company Name
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter company name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 text-left">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Support Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          name="supportEmail"
                          value={formData.supportEmail}
                          onChange={handleChange}
                          required
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter email"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 text-left">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Contact Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          name="contactNumber"
                          value={formData.contactNumber}
                          onChange={handleChange}
                          required
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        rows="3"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter address"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {loading ? "Saving..." : "Save Changes"}
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
