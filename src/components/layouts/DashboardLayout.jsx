import { useState, useEffect, useRef, useMemo } from "react";
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
  ShoppingBag,
  Sun,
  Moon,
  Camera,
  Navigation,
  ChevronDown,
  UserCircle,
  ChevronRight,
  AlertCircle,
  Shield,
  Tag,
  Clock,
  TrendingUp,
  CreditCard,
  Activity,
  FileSpreadsheet,
  Database,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import api from "../../api/axios";
import { getImageUrl } from "../../utils/imageUrl";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);
  const prevLocationRef = useRef(location.pathname);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get("/settings");
        if (response.data.success && response.data.data.CompanyLogo) {
          setLogoUrl(response.data.data.CompanyLogo);
        }
      } catch (error) {
        console.error("Failed to load settings", error);
      }
    };
    fetchSettings();
  }, []);

  const navigation = {
    Admin: [
      {
        name: "Dashboard",
        href: "/admin/dashboard",
        icon: Home,
        type: "single",
      },
      {
        name: "Users & Roles",
        icon: Users,
        type: "group",
        key: "users",
        items: [
          { name: "User Management", href: "/admin/users", icon: Users },
          { name: "Roles & Permissions", href: "/admin/roles", icon: Shield },
        ],
      },
      {
        name: "Orders",
        icon: ShoppingCart,
        type: "group",
        key: "orders",
        items: [
          {
            name: "Create Order",
            href: "/admin/orders/create",
            icon: ShoppingBag,
          },
          { name: "All Orders", href: "/admin/orders", icon: ShoppingCart },
          { name: "Pending", href: "/admin/orders/pending", icon: Clock },
          { name: "History", href: "/admin/orders/history", icon: FileText },
        ],
      },
      {
        name: "Trips (Distributor)",
        icon: Truck,
        type: "group",
        key: "trips",
        items: [
          { name: "All Trips", href: "/admin/trips", icon: Truck },
          {
            name: "Active Trips",
            href: "/admin/trips/active",
            icon: TrendingUp,
          },
          {
            name: "Trip History",
            href: "/admin/trips/history",
            icon: FileText,
          },
        ],
      },
      {
        name: "Deliveries (Dispatcher)",
        icon: Truck,
        type: "group",
        key: "deliveries",
        items: [
          { name: "All Deliveries", href: "/admin/deliveries", icon: Package },
          {
            name: "Delivery Live",
            href: "/admin/deliveries/live",
            icon: Navigation,
          },
          {
            name: "Delivery Photos",
            href: "/admin/deliveries/photos",
            icon: Camera,
          },
          {
            name: "Delivery Exceptions",
            href: "/admin/deliveries/exceptions",
            icon: AlertCircle,
          },
        ],
      },
      {
        name: "Stores",
        icon: Store,
        type: "group",
        key: "stores",
        items: [
          { name: "Store Management", href: "/admin/stores", icon: Store },
          { name: "Barangay", href: "/admin/stores/barangay", icon: Tag },
          { name: "City", href: "/admin/stores/city", icon: Tag },
        ],
      },
      {
        name: "Products",
        icon: Package,
        type: "group",
        key: "products",
        items: [
          {
            name: "Product Management",
            href: "/admin/products",
            icon: Package,
          },
          {
            name: "Inventory",
            href: "/admin/products/inventory",
            icon: Warehouse,
          },
        ],
      },
      {
        name: "Finance",
        icon: DollarSign,
        type: "group",
        key: "finance",
        items: [
          { name: "Overview", href: "/admin/finance", icon: DollarSign },
          {
            name: "Payments",
            href: "/admin/finance/payments",
            icon: CreditCard,
          },
          { name: "Invoices", href: "/admin/finance/invoices", icon: FileText },
          {
            name: "Remittance",
            href: "/admin/finance/remittance",
            icon: Users,
          },
          {
            name: "Transactions",
            href: "/admin/finance/transactions",
            icon: Activity,
          },
        ],
      },
      {
        name: "Reports",
        icon: BarChart3,
        type: "group",
        key: "reports",
        items: [
          { name: "Dashboard", href: "/admin/reports", icon: BarChart3 },
          {
            name: "Sales Reports",
            href: "/admin/reports/sales",
            icon: TrendingUp,
          },
          {
            name: "Performance",
            href: "/admin/reports/performance",
            icon: Activity,
          },
          {
            name: "Custom Reports",
            href: "/admin/reports/custom",
            icon: FileSpreadsheet,
          },
        ],
      },
      {
        name: "Master Data",
        icon: Database,
        type: "group",
        key: "master-data",
        items: [
          { name: "Locations", href: "/admin/master-data/locations", icon: MapPin },
          { name: "Categories", href: "/admin/master-data/categories", icon: Tag },
          { name: "Warehouses", href: "/admin/warehouses", icon: Warehouse },
        ]
      },
      {
        name: "Settings",
        icon: Settings,
        type: "group",
        key: "settings",
        items: [
          { name: "System Settings", href: "/admin/settings", icon: Settings },
          { name: "General", href: "/admin/settings/general", icon: Settings },
          {
            name: "Notifications",
            href: "/admin/settings/notifications",
            icon: Bell,
          },
          { name: "Security", href: "/admin/settings/security", icon: Shield },
        ],
      },
    ],
    DistributorAdmin: [
      {
        name: "Dashboard",
        href: "/distributor/dashboard",
        icon: Home,
        type: "single",
      },
      {
        name: "Warehouses",
        href: "/distributor/warehouses",
        icon: Warehouse,
        type: "single",
      },
      {
        name: "Stores",
        href: "/distributor/stores",
        icon: Store,
        type: "single",
      },
      {
        name: "Products",
        icon: Package,
        type: "group",
        key: "products",
        items: [
          {
            name: "Product Management",
            href: "/distributor/products",
            icon: Package,
          },
          { name: "Categories", href: "/distributor/products/categories", icon: Tag },
          {
            name: "Inventory",
            href: "/distributor/inventory",
            icon: Warehouse,
          },
        ],
      },
      {
        name: "Orders",
        icon: ShoppingCart,
        type: "group",
        key: "orders",
        items: [
          {
            name: "Create Order",
            href: "/distributor/orders/create",
            icon: ShoppingBag,
          },
          { name: "All Orders", href: "/distributor/orders", icon: ShoppingCart },
          { name: "Pending", href: "/distributor/orders/pending", icon: Clock },
          { name: "History", href: "/distributor/orders/history", icon: FileText },
        ],
      },
      {
        name: "Trips",
        icon: Truck,
        type: "group",
        key: "trips",
        items: [
          { name: "All Trips", href: "/distributor/trips", icon: Truck },
          {
            name: "Active Trips",
            href: "/distributor/trips/active",
            icon: TrendingUp,
          },
          {
            name: "Trip History",
            href: "/distributor/trips/history",
            icon: FileText,
          },
        ],
      },
      {
        name: "Finance",
        icon: DollarSign,
        type: "group",
        key: "finance",
        items: [
          { name: "Overview", href: "/distributor/finance", icon: DollarSign },
          {
            name: "Payments",
            href: "/distributor/finance/payments",
            icon: CreditCard,
          },
          { name: "Invoices", href: "/distributor/finance/invoices", icon: FileText },
          {
            name: "Remittance",
            href: "/distributor/finance/remittance",
            icon: Users,
          },
          {
            name: "Transactions",
            href: "/distributor/finance/transactions",
            icon: Activity,
          },
        ],
      },
      {
        name: "Reports",
        icon: BarChart3,
        type: "group",
        key: "reports",
        items: [
          { name: "Dashboard", href: "/distributor/reports", icon: BarChart3 },
          {
            name: "Sales Reports",
            href: "/distributor/reports/sales",
            icon: TrendingUp,
          },
          {
            name: "Performance",
            href: "/distributor/reports/performance",
            icon: Activity,
          },
          // {
          //   name: "Custom Reports",
          //   href: "/distributor/reports/custom",
          //   icon: FileSpreadsheet,
          // },
        ],
      },
    ],
    Agent: [
      {
        name: "Dashboard",
        href: "/agent/dashboard",
        icon: Home,
        type: "single",
      },
      { name: "Orders", href: "/agent/orders", icon: Package, type: "single" },
      { name: "Stores", href: "/agent/stores", icon: Store, type: "single" },
      {
        name: "Products",
        href: "/agent/products",
        icon: Package,
        type: "single",
      },
    ],
    Dispatcher: [
      {
        name: "Dashboard",
        href: "/dispatcher/dashboard",
        icon: Home,
        type: "single",
      },
      { name: "Trips", href: "/dispatcher/trips", icon: Truck, type: "single" },
      {
        name: "Orders",
        href: "/dispatcher/orders",
        icon: Package,
        type: "single",
      },
      {
        name: "Deliveries",
        href: "/dispatcher/deliveries",
        icon: Truck,
        type: "single",
      },
    ],

  };

  const userNavigation = navigation[user?.role] || [];

  // Calculate initial expanded groups based on active route
  const getInitialExpandedGroups = useMemo(() => {
    const initialGroups = {};
    userNavigation.forEach((item) => {
      if (item.type === "group" && item.items) {
        const hasActiveChild = item.items.some(
          (subItem) => location.pathname === subItem.href
        );
        if (hasActiveChild) {
          initialGroups[item.key] = true;
        }
      }
    });
    return initialGroups;
  }, [location.pathname, userNavigation]);

  const [expandedGroups, setExpandedGroups] = useState(
    getInitialExpandedGroups
  );

  // Update expanded groups when route changes - FIXED VERSION
  useEffect(() => {
    // Only run if location actually changed
    if (prevLocationRef.current === location.pathname) {
      return;
    }

    prevLocationRef.current = location.pathname;

    // Use setTimeout to defer the state update to the next render cycle
    const timeoutId = setTimeout(() => {
      setExpandedGroups((prev) => {
        const newGroups = { ...prev };
        let hasChanges = false;

        userNavigation.forEach((item) => {
          if (item.type === "group" && item.items) {
            const hasActiveChild = item.items.some(
              (subItem) => location.pathname === subItem.href
            );
            if (hasActiveChild && !newGroups[item.key]) {
              newGroups[item.key] = true;
              hasChanges = true;
            }
          }
        });

        return hasChanges ? newGroups : prev;
      });
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [location.pathname, userNavigation]);

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

  const isGroupActive = (items) => {
    return items?.some((item) => location.pathname === item.href);
  };

  const toggleGroup = (key) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

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
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {logoUrl ? (
                <img
                  src={getImageUrl(logoUrl)}
                  alt="Company Logo"
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="h-8 w-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg font-bold">A</span>
                </div>
              )}
              {!logoUrl && (
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  ASTRA
                </span>
              )}
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
              if (item.type === "single") {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${active
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white"
                      }`}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 ${active
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400 dark:text-gray-500"
                        }`}
                    />
                    {item.name}
                  </Link>
                );
              }

              if (item.type === "group") {
                const Icon = item.icon;
                const isExpanded = expandedGroups[item.key];
                const hasActiveChild = isGroupActive(item.items);

                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleGroup(item.key)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${hasActiveChild
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white"
                        }`}
                    >
                      <div className="flex items-center">
                        <Icon
                          className={`mr-3 h-5 w-5 ${hasActiveChild
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-400 dark:text-gray-500"
                            }`}
                        />
                        {item.name}
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""
                          }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="mt-1 ml-4 space-y-1">
                        {item.items.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const active = isActive(subItem.href);

                          return (
                            <Link
                              key={subItem.name}
                              to={subItem.href}
                              className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${active
                                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-white"
                                }`}
                            >
                              <SubIcon
                                className={`mr-3 h-4 w-4 ${active
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-gray-400 dark:text-gray-500"
                                  }`}
                              />
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return null;
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
                  className={`h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform ${userMenuOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      const profilePaths = {
                        Admin: "/admin/profile",
                        Agent: "/agent/profile",
                        Dispatcher: "/dispatcher/profile",
                        DistributorAdmin: "/distributor/profile",
                      };
                      const path = profilePaths[user?.role] || "/admin/profile"; 
                      navigate(path);
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <UserCircle className="mr-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    Profile Settings
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
