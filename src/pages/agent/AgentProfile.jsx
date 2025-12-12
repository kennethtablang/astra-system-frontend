// src/pages/agent/AgentProfile.jsx
import { useState, useEffect } from "react";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Shield,
    Key,
    Save,
    Camera,
} from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/Loading";
import { useAuth } from "../../contexts/AuthContext";
import userService from "../../services/userService";
import { toast } from "react-hot-toast";

const AgentProfile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        address: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const result = await userService.getCurrentUser();
            if (result.success && result.data) {
                setProfile({
                    fullName: result.data.fullName || "",
                    email: result.data.email || "",
                    phoneNumber: result.data.phoneNumber || "",
                    address: result.data.address || "",
                });
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            // Use context user data as fallback
            if (user) {
                setProfile({
                    fullName: user.fullName || "",
                    email: user.email || "",
                    phoneNumber: user.phoneNumber || "",
                    address: user.address || "",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setProfile((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            const result = await userService.updateProfile({
                fullName: profile.fullName,
                phoneNumber: profile.phoneNumber,
                address: profile.address,
            });
            if (result.success) {
                toast.success("Profile updated successfully");
            } else {
                toast.error(result.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-3xl">
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        My Profile
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        View and update your profile information
                    </p>
                </div>

                {/* Profile Card */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {profile.fullName?.charAt(0) || "A"}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {profile.fullName || "Agent"}
                                </h2>
                                <Badge variant="info" className="mt-1">
                                    Agent
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={profile.fullName}
                                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Email (Read-only) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={profile.email}
                                        readOnly
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Contact administrator to change email
                                </p>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={profile.phoneNumber}
                                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                                        placeholder="+63 9XX XXX XXXX"
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Address
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <textarea
                                        value={profile.address}
                                        onChange={(e) => handleInputChange("address", e.target.value)}
                                        rows={3}
                                        placeholder="Enter your address"
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                                    />
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="pt-4">
                                <Button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="flex items-center gap-2"
                                >
                                    {saving ? (
                                        <LoadingSpinner size="sm" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    {saving ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Key className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        Password
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Last changed: Unknown
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">
                                Change Password
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default AgentProfile;
