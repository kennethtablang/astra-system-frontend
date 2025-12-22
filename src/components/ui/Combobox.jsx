import { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";

export const Combobox = ({
    label,
    value,
    onChange,
    options = [],
    placeholder = "Select option...",
    disabled = false,
    className = "",
    error,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);

    // Find selected option label
    const selectedOption = options.find((opt) => opt.value === value);

    // Filter options based on search
    const filteredOptions = options.filter((opt) =>
        opt.label && opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle selection
    const handleSelect = (option) => {
        onChange?.(option.value);
        setIsOpen(false);
        setSearchTerm("");
    };

    // Clear selection
    const handleClear = (e) => {
        e.stopPropagation();
        onChange?.("");
        setSearchTerm("");
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                </label>
            )}

            {/* Trigger Button */}
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`
          relative w-full cursor-default bg-white dark:bg-gray-700 border rounded-lg py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm
          ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
          ${disabled ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-75" : "cursor-pointer"}
        `}
            >
                <span className="block truncate text-gray-900 dark:text-gray-100">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDown
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                    />
                </span>
            </div>

            {/* Dropdown Panel */}
            {isOpen && !disabled && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {/* Search Input */}
                    <div className="sticky top-0 z-10 bg-white dark:bg-gray-700 p-2 border-b border-gray-200 dark:border-gray-600">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    {filteredOptions.length === 0 ? (
                        <div className="cursor-default select-none relative py-2 px-4 text-gray-700 dark:text-gray-400">
                            No results found.
                        </div>
                    ) : (
                        filteredOptions.map((option) => (
                            <div
                                key={option.value || "empty"}
                                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 dark:hover:bg-blue-900/20 ${option.value === value
                                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10"
                                    : "text-gray-900 dark:text-gray-100"
                                    }`}
                                onClick={() => handleSelect(option)}
                            >
                                <div className="flex items-center">
                                    <span className={`block truncate ${option.value === value ? "font-semibold" : "font-normal"}`}>
                                        {option.label}
                                    </span>
                                </div>

                                {option.value === value && (
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600 dark:text-blue-400">
                                        <Check className="h-4 w-4" aria-hidden="true" />
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};
