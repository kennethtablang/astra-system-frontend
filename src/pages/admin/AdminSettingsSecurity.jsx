// src/pages/admin/AdminSettingsSecurity.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/Loading";
import { ArrowLeft, Shield, Lock, Save, Smartphone, CheckCircle } from "lucide-react";
import authService from "../../services/authService";
import { toast } from "react-hot-toast";

export const AdminSettingsSecurity = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // Password State
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    fetchSecurityStatus();
  }, []);

  const fetchSecurityStatus = async () => {
    try {
      setFetching(true);
      const result = await authService.getCurrentUser();
      if (result.success) {
        setTwoFactorEnabled(result.data.twoFactorEnabled);
        setUserEmail(result.data.email);
      }
    } catch (error) {
      console.error("Failed to fetch security status:", error);
      // toast.error("Failed to load security settings");
    } finally {
      setFetching(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const result = await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmPassword
      });

      if (result.success) {
        toast.success("Password updated successfully");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        toast.error(result.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Failed to update password:", error);
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    if (twoFactorEnabled) {
      // Disable 2FA
      if (!window.confirm("Are you sure you want to disable Two-Factor Authentication? Your account will be less secure.")) return;

      try {
        setLoading(true);
        await authService.setTwoFactorEnabled(false);
        setTwoFactorEnabled(false);
        toast.success("Two-Factor Authentication Disabled");
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Failed to disable 2FA");
      } finally {
        setLoading(false);
      }
    } else {
      // Enable 2FA - Step 1: Request Code
      if (!userEmail) {
        toast.error("Email address is required to enable 2FA. Please update your profile.");
        return;
      }

      try {
        setLoading(true);
        await authService.requestTwoFactorCode({ email: userEmail });
        setShow2FAModal(true);
        setVerificationCode("");
        toast.success("Verification code sent to " + userEmail);
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Failed to request verification code");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerifyAndEnable2FA = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Step 2: Verify Code
      await authService.verifyTwoFactor({ email: userEmail, code: verificationCode });

      // Step 3: Enable
      await authService.setTwoFactorEnabled(true);

      setTwoFactorEnabled(true);
      setShow2FAModal(false);
      toast.success("Two-Factor Authentication Enabled Successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/settings")}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Security Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your password and account security
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">

          {/* 2FA Card */}
          <Card className={twoFactorEnabled ? "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10" : ""}>
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${twoFactorEnabled ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                    <Smartphone className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      Two-Factor Authentication (2FA)
                      {twoFactorEnabled && <CheckCircle className="h-5 w-5 text-green-600" />}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 max-w-sm">
                      Add an extra layer of security to your account by requiring a verification code when logging in.
                    </p>
                    {twoFactorEnabled ? (
                      <p className="text-green-700 dark:text-green-400 text-sm font-medium mt-2">
                        Status: Enabled
                      </p>
                    ) : (
                      <p className="text-gray-500 text-sm mt-2">
                        Status: Disabled
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant={twoFactorEnabled ? "outline" : "primary"}
                  className={twoFactorEnabled ? "border-red-200 text-red-600 hover:bg-red-50" : ""}
                  onClick={handleToggle2FA}
                  disabled={loading}
                >
                  {loading ? <LoadingSpinner size="sm" /> : (twoFactorEnabled ? "Disable 2FA" : "Enable 2FA")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
                  <Shield className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Change Password
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Ensure your account is using a long, random password to stay secure.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-2 text-left">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter current password"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={6}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter new password"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={6}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Confirm new password"
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
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 2FA Verification Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Verify to Enable 2FA</h3>
                <p className="text-sm text-gray-500 mt-2">
                  A verification code has been sent to <strong>{userEmail}</strong>. Please enter it below.
                </p>
              </div>
              <form onSubmit={handleVerifyAndEnable2FA} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full text-center text-3xl tracking-widest py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShow2FAModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={loading || verificationCode.length !== 6}
                  >
                    {loading ? <LoadingSpinner size="sm" /> : "Verify & Enable"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};
