# Warehouse Stock Manager

A full-stack inventory management app built with Next.js (App Router), MongoDB, and TypeScript.

**Live:** https://warehouse-app-dusky.vercel.app  
**Repo:** https://github.com/Aryansinghal29/warehouse-stock-manager

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) — frontend + backend in one repo |
| Language | TypeScript throughout — strict mode, no unchecked `any` |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (bcrypt passwords, 7-day tokens, localStorage persistence) |
| Styling | Tailwind CSS |
| Deploy | Vercel (frontend + API routes) + MongoDB Atlas (M0 free) |

---

## Features

### Tier 1 — Foundation
- Signup / Signin with bcrypt-hashed passwords (never returned in API responses)
- JWT auth — 7-day expiry, persists on refresh via localStorage
- Protected routes — dashboard/products/orders redirect to `/signin` when logged out
- Full CRUD for products: SKU, name, quantity, category, low-stock threshold
- Client-side + server-side validation with clear error messages
- Dashboard with low-stock alerts (items at or below threshold), stat cards
- Loading states and error states throughout the UI

### Tier 2 — Order Fulfillment
- Place orders with multiple SKUs in one request
- **Atomic stock deduction** — uses MongoDB `$inc` with conditional update to prevent overselling under concurrent load
- **Partial fulfillment** — fulfills what's available, marks remainder as `backordered`
- Order history / audit log with per-item breakdown (requested / fulfilled / backordered)
- Edge cases handled: zero stock, invalid quantities, unknown SKUs

---

## Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas URI (or local MongoDB with replica set for transactions)

### Run locally

```bash
cd warehouse-app
npm install
```

Create `.env.local`:
```
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/warehouse
JWT_SECRET=your_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
npm run dev   # http://localhost:3000
```

---

## Project Structure

```
warehouse-app/
├── app/
│   ├── api/                    # Backend — Next.js Route Handlers
│   │   ├── auth/signup/        # POST — register user
│   │   ├── auth/signin/        # POST — login
│   │   ├── products/           # GET, POST — list & create
│   │   ├── products/[id]/      # PUT, DELETE — update & remove
│   │   └── orders/             # GET, POST — history & place order
│   ├── (auth)/                 # Public pages: /signup, /signin
│   └── (dashboard)/            # Protected pages: /dashboard, /products, /orders
├── lib/
│   ├── models/                 # Mongoose models: User, Product, Order
│   ├── db.ts                   # MongoDB connection (cached across hot reloads)
│   ├── auth.ts                 # JWT sign + verify helpers
│   └── apiClient.ts            # Fetch wrapper — attaches JWT, handles 401
├── context/AuthContext.tsx     # Global auth state (signup/signin/signout)
├── components/                 # Navbar, Badge
└── types/index.ts              # Shared TypeScript interfaces
```

---

## Key Design Decisions

**Concurrency safety without transactions:**  
MongoDB Atlas free tier (M0) is a single-node replica set that doesn't support multi-document transactions reliably. Instead, stock deduction uses `findOneAndUpdate` with `$inc` — a single atomic operation that prevents overselling without needing a session. Two concurrent requests for the same SKU will serialize at the document level.

**Auth persistence:**  
JWT stored in localStorage — simple, works across tabs, survives refresh. For higher security, httpOnly cookies would be preferable but require careful CORS/cookie config on Vercel.

**SKU uniqueness:**  
Scoped per user via a compound index `{ sku: 1, userId: 1 }` — two users can have the same SKU without conflict.

**Partial fulfillment:**  
Stock is deducted immediately for the fulfilled portion. Backordered items are tracked in the order document but not auto-fulfilled when stock is replenished (natural Tier 3 extension).

---

## What I'd Improve With More Time

- Refresh token rotation instead of long-lived JWTs
- Optimistic UI updates with rollback on error
- Pagination for products and orders
- Auto-fulfillment of backorders on restock
- Unit tests for order fulfillment logic (race condition scenarios with concurrent requests)
- Tier 3: zone-rate matrix + volumetric weight calculator + vehicle capacity splitting
