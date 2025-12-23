# Nexus IT Asset Manager

Nexus is a robust, full-stack IT Asset Management (ITAM) system designed to streamline the lifecycle of hardware and software assets. It provides real-time visibility into inventory, financial tracking, and automated subscription renewal alerts.

## 🚀 Key Features

### 📊 Intelligent Dashboard
- **Asset Distribution**: Visual breakdown of assets by status and type using interactive Recharts.
- **Financial Metrics**: Real-time calculation of total inventory value and recurring costs.
- **Recent Activity**: Quick view of latest asset assignments.

### 📦 Inventory Management
- **Lifecycle Tracking**: Monitor assets from purchase through retirement.
- **QR Code System**: Built-in QR code generator and scanner for mobile-friendly auditing.
- **Bulk Label Printing**: Specialized print preview and ordering system for thermal label printers.
- **Advanced Filtering**: Quickly locate assets by serial number, tag, type, or assignee.

### 💳 Enhanced Subscription Manager
- **Financial Forecasting**: Estimated monthly and annual spend tracking for SaaS and licenses.
- **Renewal Notifications**: Global alert system for items expiring within 30 days.
- **Visual Highlighting**: Amber-coded indicators for urgent renewals with precise "Days Remaining" counters.

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts.
- **Backend**: Node.js, Express.
- **Database**: MySQL 8.0.
- **DevOps**: Docker & Docker Compose.

## 🏁 Getting Started

### Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   cd server && npm install
   ```

2. **Environment Setup**:
   Create a `.env` file in the root with:
   ```env
   API_KEY=your_gemini_api_key_here
   ```

3. **Run Services**:
   - Start Backend: `cd server && npm start`
   - Start Frontend: `npm run dev`

### Docker Deployment (Recommended)

The easiest way to run Nexus in production is via Docker Compose:

```bash
# Clone the repository
git clone <repo-url>
cd nexus-asset-manager

# Start the stack (Port 80 by default)
API_KEY=your_key docker-compose up -d --build
```

## 📂 Project Structure

- `/src`: React frontend application.
- `/src/components`: UI modules (Inventory, Dashboard, Subscription Manager).
- `/src/services`: API client (`db.ts`) and local storage fallbacks.
- `/server`: Node.js Express API and MySQL schema.

## 🔔 Notification System

The system automatically scans active subscriptions upon login. Any subscription with a `renewalDate` within the next 30 days triggers:
1. A red badge on the global notification bell.
2. A detailed entry in the notification dropdown.
3. An amber-highlighted row in the Subscription Manager with a live countdown.

---
*Nexus Asset Manager - Streamlining IT Operations.*
