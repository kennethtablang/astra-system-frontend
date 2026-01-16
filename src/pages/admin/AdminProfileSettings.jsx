// src/pages/admin/AdminProfileSettings.jsx
import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/Loading";
import { User, Phone, Mail, Shield, Save, MapPin, RefreshCw } from "lucide-react";
import userService from "../../services/userService";
import { toast } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for Leaflet default icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3603/3603850.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

export const AdminProfileSettings = () => {
  const { user: authUser, updateProfile: updateContextProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: "",
    twoFactorEnabled: false,
  });

  const toggleTwoFactor = async () => {
    try {
      setLoading(true);
      const newValue = !formData.twoFactorEnabled;
      const result = await userService.setTwoFactorStatus(newValue);

      if (result.success) {
        setFormData((prev) => ({ ...prev, twoFactorEnabled: newValue }));
        toast.success(
          `Two-factor authentication ${newValue ? "enabled" : "disabled"}`
        );
        // Update context if needed
        if (updateContextProfile) {
          updateContextProfile({
            ...authUser,
            twoFactorEnabled: newValue,
          });
        }
      } else {
        toast.error("Failed to update two-factor status");
      }
    } catch (error) {
      console.error("2FA toggle error:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setFetching(true);
      // Try to fetch latest from API, fallback to auth context
      try {
        const result = await userService.getCurrentUser();
        if (result.success && result.data) {
          setFormData({
            firstName: result.data.firstName || "",
            middleName: result.data.middleName || "",
            lastName: result.data.lastName || "",
            email: result.data.email || "",
            phoneNumber: result.data.phoneNumber || "",
            role: result.data.role || result.data.roles?.[0] || "",
            twoFactorEnabled: result.data.twoFactorEnabled || false,
          });
          return;
        }
      } catch (err) {
        console.warn("Failed to fetch profile from API, using context", err);
      }

      // Fallback
      if (authUser) {
        setFormData({
          firstName: authUser.firstName || "",
          middleName: authUser.middleName || "",
          lastName: authUser.lastName || "",
          email: authUser.email || "",
          phoneNumber: authUser.phoneNumber || "",
          role: authUser.role || "",
          twoFactorEnabled: authUser.twoFactorEnabled || false,
        });
      }
    } finally {
      setFetching(false);
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGettingLocation(false);
        toast.success("Location updated");
      },
      (error) => {
        console.error(error);
        toast.error("Unable to retrieve your location");
        setGettingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // Get location on mount
  useEffect(() => {
    getUserLocation();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data for update (exclude read-only fields like email/role if API restricts)
      const updateData = {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email, // Include email update
      };

      const result = await userService.updateProfile(updateData);

      if (result.success) {
        toast.success("Profile updated successfully");
        // Update context with new data
        if (updateContextProfile) {
          updateContextProfile({
            ...authUser,
            firstName: formData.firstName,
            middleName: formData.middleName,
            lastName: formData.lastName,
            email: formData.email,
            phoneNumber: formData.phoneNumber
          });
        }
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
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
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your personal information
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Avatar / Header Section */}
                <div className="flex items-center gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="h-24 w-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-3xl font-bold">
                    {formData.firstName?.[0]}{formData.lastName?.[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {formData.firstName} {formData.lastName}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 text-gray-500">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">{formData.role}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div className="space-y-2 text-left">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Middle Name */}
                  <div className="space-y-2 text-left">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Middle Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2 text-left">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2 text-left">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2 text-left">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Changing email may require re-login.</p>
                  </div>

                  {/* Role (Readonly) */}
                  <div className="space-y-2 text-left">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Account Role
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.role}
                        disabled
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>



                {/* Location Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Current Location
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getUserLocation}
                      disabled={gettingLocation}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${gettingLocation ? 'animate-spin' : ''}`} />
                      Update My Location
                    </Button>
                  </div>

                  <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 z-0 relative">
                    {currentLocation ? (
                      <MapContainer
                        center={[currentLocation.lat, currentLocation.lng]}
                        zoom={15}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker position={[currentLocation.lat, currentLocation.lng]} icon={userIcon}>
                          <Popup>You are here</Popup>
                        </Marker>
                      </MapContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                        <div className="text-center text-gray-500">
                          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Location not available</p>
                          <Button
                            type="button"
                            variant="link"
                            onClick={getUserLocation}
                            className="mt-2"
                          >
                            Try again
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {currentLocation
                      ? `Lat: ${currentLocation.lat.toFixed(6)}, Lng: ${currentLocation.lng.toFixed(6)}`
                      : "Click update to get your current coordinates"}
                  </p>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {loading ? "Updating..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout >
  );
};
