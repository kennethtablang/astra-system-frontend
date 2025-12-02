// src/components/ui/Loading.jsx
import { Loader2 } from "lucide-react";

export const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <Loader2
      className={`animate-spin text-blue-600 ${sizes[size]} ${className}`}
    />
  );
};

export const LoadingOverlay = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
};
