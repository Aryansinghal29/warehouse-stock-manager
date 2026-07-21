# Warehouse Stock Manager

A full-stack inventory management app with authentication, product CRUD, and concurrency-safe order fulfillment.

**Stack:** React + TypeScript (Vite) · Node.js + Express + TypeScript · MongoDB (Mongoose)

---

## Features

### Tier 1 — Foundation
- Sign up / Sign in with bcrypt-hashed passwords
- JWT auth with 7-day expiry; token persisted in localStorage
- Protected routes — all product/order pages require auth
- Full CRUD for products: SKU, name, quantity, category, low-stock threshold
- Dashboard with low-stock alerts (items at or below threshold)
- Client + server-side validation with clear error messages

### Tier 2 — Order Fulfillment
- Place orders with multiple SKUs
- Atomic stock deduction via MongoDB transactions (no overselling under concurrent load)
- Partial fulfillment: fulfills what's available, marks remainder as backordered
- Order history / audit log with per-item breakdown

---

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`) **or** a MongoDB Atlas URI

### Backend

```bash
cd backend
npm install
# Edit .env — set MONGO_URI and JWT_SECRET
npm run dev        # starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
# Edit .env — set VITE_API_URL if backend is not on localhost:5000
npm run dev        # starts on http://localhost:5173
```

---

## Environment Variables

**backend/.env**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/warehouse
JWT_SECRET=change_this_in_production
CLIENT_URL=http://localhost:5173
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
```

---

## Deployment

| Service | What to deploy |
|---------|---------------|
| Vercel / Netlify | `frontend/` — set `VITE_API_URL` to your backend URL |
| Render / Railway | `backend/` — set all env vars in the dashboard |
| MongoDB Atlas | Free M0 cluster; paste connection string into `MONGO_URI` |

> For production, set `CLIENT_URL` on the backend to your frontend domain so CORS works correctly.

---

## Assumptions & Trade-offs

- **Auth persistence:** JWT stored in localStorage (simple, works across tabs). For higher security, httpOnly cookies would be preferable but require same-domain or careful CORS/cookie config.
- **Concurrency:** MongoDB multi-document transactions require a replica set. On Atlas this works out of the box; locally you need a replica set or use a single-node replica set (`mongod --replSet rs0`).
- **SKU uniqueness:** Scoped per user — two users can have the same SKU without conflict.
- **Partial fulfillment:** Stock is deducted immediately for the fulfilled portion; backordered items are tracked but not auto-fulfilled when stock is replenished (would be a natural Tier 3 extension).

## What I'd Improve With More Time

- Refresh token rotation instead of long-lived JWTs
- Optimistic UI updates with rollback on error
- Pagination for products/orders
- Auto-fulfillment of backorders when stock is restocked
- Unit tests for the order fulfillment logic (race condition scenarios)
- Tier 3: zone-rate matrix + volumetric weight calculator
