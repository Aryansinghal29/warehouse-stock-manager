# Warehouse Stock Manager

A full-stack inventory management app built with Next.js, MongoDB, and Tailwind CSS.

**Live Demo:** `<your-vercel-url>`  
**Repo:** `<your-github-url>`

---

## Stack

- **Framework:** Next.js 16 (App Router, API Routes) + TypeScript
- **Database:** MongoDB Atlas (Mongoose)
- **Auth:** NextAuth.js (credentials + Google OAuth) with bcrypt-hashed passwords
- **Styling:** Tailwind CSS v4

---

## Features

### Tier 1 — Foundation
- Sign up / Sign in with bcrypt-hashed passwords
- JWT-based auth via NextAuth; session persisted across tabs
- Protected routes — all product/order pages require auth
- Full CRUD for products: SKU, name, quantity, category, low-stock threshold
- Dashboard with low-stock alerts (items at or below threshold)
- Client + server-side validation with clear error messages

### Tier 2 — Order Fulfillment
- Place orders with multiple SKUs
- Atomic stock deduction via MongoDB transactions (no overselling under concurrent load)
- Partial fulfillment: fulfills what's available, marks remainder as backordered
- Order history / audit log with per-item breakdown

### Tier 3 — Rate Engine
- Zone-rate matrix across 4 regions (North / South / East / West) mapped by pincode prefix
- Volumetric weight calculator: `chargeable = max(actualKg, L×W×H / 5000)`
- Auto vehicle selection (Bike → Mini Van → Truck → Heavy Truck) — smallest vehicle that fits the load
- Multi-vehicle splitting when total weight exceeds a single vehicle's capacity
- Full cost justification returned with every quote

---

## Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas URI (or local replica set for transactions)

### Run locally

```bash
cd warehouse-app
npm install
```

Create `.env.local`:

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/warehouse
JWT_SECRET=<random-secret>
NEXTAUTH_SECRET=<random-secret>
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional — Google OAuth
GOOGLE_CLIENT_ID=<client-id>
GOOGLE_CLIENT_SECRET=<client-secret>
```

```bash
npm run dev   # http://localhost:3000
```

---

## Deployment

| Service | Config |
|---------|--------|
| Vercel | Deploy `warehouse-app/`; add all env vars in project settings |
| MongoDB Atlas | Free M0 cluster; paste URI into `MONGO_URI` |

---

## Assumptions & Trade-offs

- **Single Next.js app** — API routes replace a separate Express backend; simpler deployment, same logic.
- **Auth:** NextAuth with credentials + Google OAuth. Sessions use JWTs. For higher security, httpOnly cookies are preferable but require same-domain config.
- **Concurrency:** MongoDB multi-document transactions require a replica set. Atlas works out of the box; locally use `mongod --replSet rs0`.
- **SKU uniqueness:** Scoped per user — two users can share the same SKU without conflict.
- **Partial fulfillment:** Stock is deducted immediately for the fulfilled portion; backordered items are tracked but not auto-fulfilled on restock (natural Tier 3+ extension).
- **Rate engine:** Pincode zones are mapped by 3-digit prefix. Only 10 major city prefixes are seeded — unknown pincodes return an error.

## What I'd Improve With More Time

- Refresh token rotation instead of long-lived sessions
- Pagination for products and orders
- Auto-fulfillment of backorders when stock is replenished
- Unit tests for order fulfillment (race condition scenarios) and the rate engine
- Broader pincode coverage in the zone matrix
