# ASTRA - Agent Supply and Transport Routing System

<div align="center">

**A comprehensive distribution and logistics management system**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 🌟 Overview

ASTRA (Agent Supply and Transport Routing System) is a full-featured distribution and logistics management platform designed to streamline operations for distributors, warehouses, agents, and delivery personnel. The system provides real-time tracking, inventory management, order processing, and route optimization capabilities.

### Key Capabilities

- **Order Management**: End-to-end order lifecycle from creation to delivery
- **Inventory Control**: Real-time inventory tracking across multiple warehouses
- **Route Optimization**: Smart trip planning and delivery route management
- **Live Tracking**: GPS-based real-time delivery tracking
- **Multi-Role Access**: Role-based access control for different user types
- **Analytics & Reporting**: Comprehensive dashboards and custom reports

---

## ✨ Features

### 🛒 Order Management
- Create orders for existing (Suki) and new (Walk-in) customers
- Barcode scanning for quick product lookup
- Order status workflow management (Pending → Confirmed → Packed → Dispatched → Delivered)
- Priority order handling
- Order history and analytics

### 📦 Inventory Management
- Multi-warehouse inventory tracking
- Real-time stock level monitoring
- Low stock alerts and reorder notifications
- Inventory adjustments and movements
- Product categorization and SKU management

### 🚚 Trip & Delivery Management
- Automated trip creation and assignment
- Route optimization for multiple stops
- Real-time GPS tracking
- Proof of delivery with photo capture
- Delivery exception reporting
- Trip manifest generation (PDF)

### 👥 Store Management
- Customer (store) database with location mapping
- City and barangay hierarchical location system
- Credit limit management
- Store performance analytics

### 📊 Analytics & Reporting
- Dashboard with key performance indicators
- Sales reports and trends
- Delivery performance metrics
- Custom report generation
- Export capabilities (CSV, PDF)

### 🔐 User Management
- Role-based access control (Admin, Agent, Dispatcher, etc.)
- User approval workflow
- Profile management
- Activity logging

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18.x
- **Build Tool**: Vite 5.x
- **Styling**: TailwindCSS 3.x
- **Routing**: React Router 6.x
- **State Management**: React Context API
- **HTTP Client**: Axios
- **UI Components**: Custom component library
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

### Key Libraries
- **Authentication**: JWT-based auth with refresh tokens
- **File Handling**: File upload and preview capabilities
- **Location Services**: Geolocation API integration
- **PDF Generation**: Client-side PDF generation for manifests
- **Form Handling**: Custom form components with validation

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/astra.git
   cd astra
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=https://your-api-url.com/api
   VITE_APP_NAME=ASTRA
   VITE_APP_VERSION=1.0.0
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Access the application**
   
   Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

---

## 📁 Project Structure

```
astra/
├── public/              # Static assets
├── src/
│   ├── api/            # API configuration and interceptors
│   │   └── axios.js    # Axios instance with auth interceptors
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable components
│   │   ├── forms/      # Form components
│   │   ├── layouts/    # Layout components
│   │   ├── lists/      # List components
│   │   ├── modals/     # Modal dialogs
│   │   ├── sidebars/   # Sidebar components
│   │   └── ui/         # Base UI components
│   ├── contexts/       # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── pages/          # Page components
│   │   ├── admin/      # Admin pages
│   │   ├── auth/       # Authentication pages
│   │   └── public/     # Public pages
│   ├── services/       # API service modules
│   │   ├── orderService.js
│   │   ├── tripService.js
│   │   ├── inventoryService.js
│   │   └── ...
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── .env                # Environment variables
├── index.html          # HTML template
├── package.json        # Dependencies
├── tailwind.config.js  # TailwindCSS configuration
└── vite.config.js      # Vite configuration
```

---

## ⚙️ Configuration

### API Configuration

The application uses Axios with interceptors for API communication. Configuration is in `src/api/axios.js`:

- **Base URL**: Set via `VITE_API_BASE_URL` environment variable
- **Authentication**: JWT tokens stored in localStorage
- **Token Refresh**: Automatic token refresh on 401 responses
- **Error Handling**: Global error handling with toast notifications

### Authentication Flow

1. User logs in with email/password
2. Server returns access token and refresh token
3. Access token used for all authenticated requests
4. On token expiry (401), refresh token is used to get new access token
5. On refresh failure, user is redirected to login

**Important**: The application uses localStorage for token storage. Do not use sessionStorage or other browser storage APIs in artifacts as they are not supported.

---

## 👤 User Roles

### 1. **Admin**
- Full system access
- User management and approval
- System configuration
- All reporting capabilities

### 2. **Distributor Admin**
- Manage warehouse operations
- Inventory management
- Order processing
- Trip management for assigned warehouses

### 3. **Agent**
- Create and manage orders
- Customer management
- View inventory
- Basic reporting

### 4. **Dispatcher**
- View assigned trips
- Update delivery status
- Upload proof of delivery
- Report delivery exceptions
- Location sharing

### 5. **Accountant**
- Financial reports
- Payment tracking
- Accounts receivable management

---

## 🔑 Key Modules

### 1. Order Management (`/admin/orders`)

**Features**:
- Create orders with barcode scanning
- Order status workflow management
- Bulk order operations
- Order history and search

**Key Components**:
- `AdminOrderCreate.jsx` - Order creation interface
- `AdminOrders.jsx` - Order list and management
- `AdminOrdersPending.jsx` - Pending orders queue

### 2. Inventory Management (`/admin/inventory`)

**Features**:
- Multi-warehouse inventory tracking
- Stock adjustments
- Inventory movements
- Low stock alerts

**Key Components**:
- `AdminInventory.jsx` - Main inventory interface
- `InventoryAdjustModal` - Stock adjustment dialog
- `InventoryMovementModal` - Movement history

### 3. Trip Management (`/admin/trips`)

**Features**:
- Automated trip creation from packed orders
- Route optimization
- Real-time tracking
- Trip manifest generation

**Key Components**:
- `AdminTrips.jsx` - Trip list and management
- `AdminTripDetails.jsx` - Detailed trip view
- `AdminTripTracking.jsx` - Live tracking interface
- `CreateTripModal` - Trip creation dialog

### 4. Delivery Management (`/admin/deliveries`)

**Features**:
- Real-time delivery tracking
- Proof of delivery capture
- Exception reporting
- Delivery history

**Key Components**:
- `AdminDeliveries.jsx` - Delivery list
- `AdminDeliveriesLive.jsx` - Live tracking
- `AdminDeliveriesExceptions.jsx` - Exception management
- `AdminDeliveriesPhotos.jsx` - Delivery photo gallery

### 5. Store Management (`/admin/stores`)

**Features**:
- Customer database
- Location management (City/Barangay)
- Credit limit tracking
- Store analytics

**Key Components**:
- `AdminStores.jsx` - Store list and management
- `AdminStoreCity.jsx` - City management
- `AdminStoreBarangay.jsx` - Barangay management

---

## 🔌 API Integration

### Service Architecture

Each module has a dedicated service file in `src/services/`:

```javascript
// Example: orderService.js
const orderService = {
  getOrders: async (params) => {
    const { data } = await api.get('/orders', { params });
    return data;
  },
  
  createOrder: async (orderData) => {
    const { data } = await api.post('/orders', orderData);
    return data;
  },
  
  // ... more methods
};

export default orderService;
```

### API Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "items": [...],
    "totalCount": 100,
    "pageNumber": 1,
    "pageSize": 20
  }
}
```

### Error Handling

Errors are handled globally by Axios interceptors and displayed via toast notifications:

```javascript
// Automatic error handling
api.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.message || 'An error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);
```

---

## 💻 Development

### Code Style

- Use functional components with hooks
- Follow component naming conventions (PascalCase)
- Use ES6+ features
- Implement proper error handling
- Add loading states for async operations

### Component Structure

```jsx
// Example component structure
const MyComponent = () => {
  // State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Effects
  useEffect(() => {
    fetchData();
  }, []);
  
  // Handlers
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await myService.getData();
      setData(result.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };
  
  // Render
  return (
    <div>
      {loading ? <LoadingSpinner /> : <DataDisplay data={data} />}
    </div>
  );
};
```

### Adding New Pages

1. Create page component in `src/pages/[module]/`
2. Add route in `App.jsx`
3. Create corresponding service methods
4. Add navigation link in sidebar
5. Implement role-based access control

### Testing Locally

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Write clear commit messages
- Add comments for complex logic
- Update documentation as needed
- Test thoroughly before submitting

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- React team for the amazing framework
- TailwindCSS for the utility-first CSS framework
- Lucide for the beautiful icon set
- All contributors who have helped shape ASTRA

---

<div align="center">

**Built with ❤️ for efficient distribution management**

[⬆ Back to Top](#astra---agent-supply-and-transport-routing-system)

</div>
