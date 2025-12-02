// src/components/ui/Table.jsx
export const Table = ({ children, className = "" }) => {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children }) => {
  return (
    <thead className="bg-gray-50">
      <tr>{children}</tr>
    </thead>
  );
};

export const TableBody = ({ children }) => {
  return (
    <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
  );
};

export const TableRow = ({ children, onClick, className = "" }) => {
  return (
    <tr
      onClick={onClick}
      className={`${
        onClick ? "cursor-pointer hover:bg-gray-50" : ""
      } ${className}`}
    >
      {children}
    </tr>
  );
};

export const TableHead = ({ children, className = "" }) => {
  return (
    <th
      scope="col"
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
};

export const TableCell = ({ children, className = "" }) => {
  return (
    <td
      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}
    >
      {children}
    </td>
  );
};
