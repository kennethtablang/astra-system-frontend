// src/components/ui/Card.jsx
export const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 transition-colors ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "" }) => {
  return (
    <div
      className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="text-gray-900 dark:text-gray-100">{children}</div>
    </div>
  );
};

export const CardContent = ({ children, className = "" }) => {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
};

export const CardFooter = ({ children, className = "" }) => {
  return (
    <div
      className={`px-6 py-4 bg-gray-50  dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-800 ${className}`}
    >
      {children}
    </div>
  );
};
