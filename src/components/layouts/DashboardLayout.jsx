// src/components/layouts/DashboardLayout.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Package,
  Truck,
  Users,
  Store,
  DollarSign,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ShoppingCart,
  BarChart3,
  MapPin,
  Warehouse,
  Sun,
  Moon,
  ChevronDown,
  UserCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  const navigation = {
    Admin: [
      { name: "Dashboard", href: "/admin/dashboard", icon: Home },
      {
        name: "User Management",
        href: "/admin/users",
        icon: Users,
      },
      {
        name: "Order Management",
        href: "/admin/orders",
        icon: ShoppingCart,
      },
      {
        name: "Trip Management",
        href: "/admin/trips",
        icon: Truck,
      },
      {
        name: "Store Management",
        href: "/admin/stores",
        icon: Store,
      },
      {
        name: "Product Management",
        href: "/admin/products",
        icon: Package,
      },
      {
        name: "Distributor Management",
        href: "/admin/distributors",
        icon: Warehouse,
      },
      {
        name: "Route Management",
        href: "/admin/routes",
        icon: MapPin,
      },
      {
        name: "Financial Management",
        href: "/admin/finance",
        icon: DollarSign,
      },
      {
        name: "Reports & Analytics",
        href: "/admin/reports",
        icon: BarChart3,
      },
      {
        name: "System Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
    Agent: [
      { name: "Dashboard", href: "/agent/dashboard", icon: Home },
      { name: "Orders", href: "/agent/orders", icon: Package },
      { name: "Stores", href: "/agent/stores", icon: Store },
      { name: "Products", href: "/agent/products", icon: Package },
    ],
    Dispatcher: [
      { name: "Dashboard", href: "/dispatcher/dashboard", icon: Home },
      { name: "Trips", href: "/dispatcher/trips", icon: Truck },
      { name: "Orders", href: "/dispatcher/orders", icon: Package },
      { name: "Deliveries", href: "/dispatcher/deliveries", icon: Truck },
    ],
    Accountant: [
      { name: "Dashboard", href: "/accountant/dashboard", icon: Home },
      { name: "Payments", href: "/accountant/payments", icon: DollarSign },
      { name: "Invoices", href: "/accountant/invoices", icon: FileText },
      { name: "Reports", href: "/accountant/reports", icon: FileText },
    ],
  };

  const userNavigation = navigation[user?.role] || [];

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (href) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ASTRA
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {userNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white"
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 ${
                      active
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center w-full space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {user?.fullName?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.role}
                  </p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <UserCircle className="mr-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    Profile Settings
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate("/settings");
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <Settings className="mr-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    Account Settings
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30 transition-colors border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex-1 flex items-center justify-center lg:justify-start">
              <div className="w-full max-w-lg lg:max-w-xs">
                <label htmlFor="search" className="sr-only">
                  Search
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                    placeholder="Search..."
                    type="search"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle theme"
                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
