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

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, **Supabase Client**.
- **Backend**: **Supabase (PostgreSQL, Auth, Realtime)**.
- **Database**: **Supabase PostgreSQL**.

## 🏁 Getting Started

### 1. Supabase Project Setup (Manual - One Time)

1.  **Create a Project**: Sign up at [Supabase](https://supabase.com/) and create a new project.
2.  **Get Credentials**: Find your `Project URL` and `Anon Key` in `Project Settings` > `API`.
3.  **Create `assets` Table**: In the Supabase SQL Editor or Table Editor, create a table named `assets` with the following columns (matching `Asset` type in `src/types.ts`):
    *   `id` (TEXT, Primary Key)
    *   `name` (TEXT)
    *   `model` (TEXT)
    *   `serialNumber` (TEXT)
    *   `type` (TEXT)
    *   `status` (TEXT)
    *   `purchaseDate` (DATE or TEXT)
    *   `price` (NUMERIC)
    *   `assignedTo` (TEXT, nullable)
    *   `notes` (TEXT, nullable)
    *   `renewalDate` (DATE or TEXT, nullable)
    *   `billingCycle` (TEXT, nullable)
    *   `created_at` (TIMESTAMP WITH TIME ZONE, default `now()`) - *Recommended for ordering*
4.  **Enable RLS & Policies**: Go to `Authentication` > `Policies` for the `assets` table.
    *   Enable Row Level Security.
    *   Create policies to allow authenticated users to perform `SELECT`, `INSERT`, `UPDATE`, and `DELETE` on the `assets` table.
        *   **SELECT**: `FOR SELECT USING (true)`
        *   **INSERT**: `FOR INSERT WITH CHECK (auth.role() = 'authenticated')`
        *   **UPDATE**: `FOR UPDATE USING (auth.role() = 'authenticated')` (or `auth.uid() = user_id` if you add a `user_id` column to `assets` table)
        *   **DELETE**: `FOR DELETE USING (auth.role() = 'authenticated')`
5.  **Enable Email Auth**: In `Authentication` > `Settings`, ensure `Email` provider is enabled.

### 2. Local Development

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Environment Setup**:
    Create a `.env` file in the project root with your Supabase credentials and (optionally) your Gemini API key:
    ```env
    VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    API_KEY=your_gemini_api_key_here # For future AI features
    ```
3.  **Run Frontend**:
    ```bash
    npm run dev
    ```
    Your app will be available at `http://localhost:5173`.

## 📂 Project Structure

- `/src`: React frontend application.
- `/src/components`: UI modules (Inventory, Dashboard, Subscription Manager, **Auth**).
- `/src/services`: **Supabase client (`supabaseService.ts`)**, API client (`db.ts`) for Supabase interactions.

## 🔔 Notification System

The system automatically scans active subscriptions upon login. Any subscription with a `renewalDate` within the next 30 days triggers:
1. A red badge on the global notification bell.
2. A detailed entry in the notification dropdown.
3. An amber-highlighted row in the Subscription Manager with a live countdown.

---
*Nexus Asset Manager - Streamlining IT Operations.*