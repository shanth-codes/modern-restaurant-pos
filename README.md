# 🍽️ The Modern Restaurant — Full-Stack POS & Ordering System

[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20Vercel-success?style=for-the-badge&logo=vercel)](https://modern-restaurant-pos-chi.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-brightgreen?style=for-the-badge&logo=node.js)](https://nodejs.org/)

> A modern, high-performance Point of Sale (POS), Kitchen Display System (KDS), and online table ordering application tailored for counter operations and fine South Indian dining.

---

## 🌟 Live Demo

- **Customer Storefront & Ordering**: [https://modern-restaurant-pos-chi.vercel.app/](https://modern-restaurant-pos-chi.vercel.app/)
- **Staff Access Portal**: [https://modern-restaurant-pos-chi.vercel.app/login.html](https://modern-restaurant-pos-chi.vercel.app/login.html)
- **POS & Kitchen Display (KDS)**: [https://modern-restaurant-pos-chi.vercel.app/pos.html](https://modern-restaurant-pos-chi.vercel.app/pos.html)

---

## ✨ Key Features

### 🛍️ Customer Storefront (`index.html`)
- **Curated Menu**: Categorized dishes (Breakfast, Mains, Beverages) with real-time dish search.
- **Interactive Cart**: Slide-out cart drawer with instant quantity toggles, price computations, and CGST/SGST tax calculation.
- **Dining Modes**: Choose between **Takeaway** or **Dine-in** with live table selection.
- **Live Order Tracker**: Look up live cooking and preparation status using an order token number.

### 💼 POS Cashier Terminal (`pos.html`)
- **Fast Counter Billing**: Quick-add menu items with custom quantity selectors and order tickets.
- **Table Assignment**: Real-time table selection linking tickets to specific floor tables.
- **Payment Processing**: Multi-mode support (Cash, Card, UPI) with an automatic change-due calculator.
- **Token Management**: Auto-incrementing order tokens with live receipts.

### 🍳 Kitchen Display System (KDS)
- **Live Ticket Board**: Separate cards for orders in `pending`, `cooking`, and `ready` states.
- **Web Audio Chime**: Synthesized audio alert on new orders to notify kitchen staff immediately without external audio assets.
- **One-Click Progression**: Update status from cooking to ready to served with table status auto-release.

### 🪑 Floor Table Management
- **Visual Floor Layout**: Real-time statuses for 12 dine-in tables: `Available`, `Occupied`, `Billing`, and `Reserved`.
- **Automatic Status Sync**: Table status automatically updates to `Occupied` on order placement and resets to `Available` on order completion.

### 📊 Real-Time Analytics & Menu Manager
- **Business KPI Metrics**: Today's revenue, completed orders count, active kitchen tickets, and table occupancy rate.
- **Category Sales Breakdown**: Visual distribution of revenue across Breakfast, Mains, and Beverages.
- **Menu CRUD Operations**: Add new dishes, edit pricing, upload image paths, toggle availability, and set promotional badges.

---

## 🔐 Demo Credentials

Use these quick credentials on the [Staff Portal](https://modern-restaurant-pos-chi.vercel.app/login.html):

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Cashier** | `cashier@tmr.in` | `tmr123` | POS counter, billing, & live orders |
| **Kitchen Chef** | `kitchen@tmr.in` | `kitchen1` | Kitchen Display System (KDS) |
| **Admin Manager** | `admin@tmr.in` | `admin123` | Full dashboard, analytics, & menu manager |

*(Quick-fill buttons are also available directly on the login page for demo testing).*

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Vanilla JavaScript (ES6+), CSS3 (Custom Properties, Grid & Flexbox layouts, Glassmorphism UI), HTML5.
- **Backend API**: Node.js, Express.js, CORS.
- **Data Persistence**: JSON file store pre-seeded with sample data, with dual-layer client `localStorage` caching and serverless `/tmp` write compatibility.
- **Cloud Infrastructure**: Vercel Serverless Functions (`/api/*`) and Vercel Edge CDN for static asset distribution.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shanth-codes/modern-restaurant-pos.git
   cd modern-restaurant-pos
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local server:**
   ```bash
   npm start
   ```

4. **Open in your browser:**
   - Customer Portal: [http://localhost:3000](http://localhost:3000)
   - Staff Login: [http://localhost:3000/login.html](http://localhost:3000/login.html)
   - POS System: [http://localhost:3000/pos.html](http://localhost:3000/pos.html)

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate staff member |
| `GET` | `/api/menu` | Retrieve all menu items |
| `POST` | `/api/menu` | Add a new menu dish |
| `PUT` | `/api/menu/:id` | Update dish details or availability |
| `DELETE` | `/api/menu/:id` | Remove a menu dish |
| `GET` | `/api/tables` | Get all table states and active tokens |
| `PATCH` | `/api/tables/:id` | Update table status (`available`, `occupied`, etc.) |
| `GET` | `/api/orders` | Fetch live order list |
| `GET` | `/api/orders/:token` | Fetch order details by token |
| `POST` | `/api/orders` | Create and place a new order |
| `PATCH` | `/api/orders/:token/status` | Update order state (`cooking`, `ready`, `completed`) |
| `GET` | `/api/analytics` | Fetch revenue, top dishes, and category statistics |
| `GET` | `/api/health` | Health check endpoint |

---

## ☁️ Deployment on Vercel

This repository is pre-configured for zero-friction Vercel deployment:

1. Import this repository into [Vercel](https://vercel.com/new).
2. Framework Preset: **Other**.
3. Output Directory: **`public`** (or leave default).
4. Click **Deploy**.

Vercel will automatically build the Serverless Functions inside `/api` and serve all static assets via its Edge CDN.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
