import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { authService } from "../../services";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const confirmEmail = async () => {
      const token = searchParams.get("token");
      const userId = searchParams.get("userId");

      if (!token || !userId) {
        setStatus("error");
        setMessage("Invalid verification link.");
        return;
      }

      try {
        const response = await authService.confirmEmail({
          userId,
          token,
        });

        if (response.success) {
          setStatus("success");
          setMessage("Email confirmed successfully! You can now log in.");
        } else {
          setStatus("error");
          setMessage(response.message || "Failed to confirm email.");
        }
      } catch (error) {
        console.error("Email confirmation failed:", error);
        setStatus("error");
        setMessage(
          error.message ||
            "An error occurred while verifying your email."
        );
      }
    };

    confirmEmail();
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
        {status === "verifying" && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Verifying Email
            </h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Success!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              to="/login"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <XCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              to="/login"
              className="text-blue-600 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmail;
