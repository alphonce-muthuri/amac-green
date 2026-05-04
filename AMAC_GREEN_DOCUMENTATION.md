# AMAC Green — Platform Documentation

**Version:** 1.0  
**Date:** April 2026  
**Prepared by:** AMAC Green Engineering Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Platform Overview](#2-platform-overview)
3. [Technology Stack](#3-technology-stack)
4. [User Roles & Portals](#4-user-roles--portals)
5. [Key Features](#5-key-features)
6. [Platform Architecture](#6-platform-architecture)
7. [Payment Integrations](#7-payment-integrations)
8. [Data & Security](#8-data--security)
9. [Environment Configuration](#9-environment-configuration)
10. [Developer Setup Guide](#10-developer-setup-guide)
11. [Database Schema Reference](#11-database-schema-reference)
12. [API & Server Actions Reference](#12-api--server-actions-reference)
13. [Order Lifecycle](#13-order-lifecycle)
14. [Deployment](#14-deployment)

---

## 1. Executive Summary

**AMAC Green** is a full-stack digital marketplace platform purpose-built for the Kenyan clean energy sector. It enables end-to-end procurement, financing, installation, and delivery of clean energy products — connecting customers (households, SMEs, and institutions) with vetted vendors, certified professional installers, and last-mile delivery partners through a single, coordinated digital platform.

**Supported Energy Solutions:**
- Solar PV systems (with and without battery storage)
- LPG cooking systems
- Electric cooking solutions
- Biomass briquette supply
- Hybrid energy configurations

**Value Proposition:**  
AMAC Green eliminates the fragmentation in Kenya's clean energy supply chain. Historically, customers had to separately source vendors, negotiate pricing, arrange financing, and manage installation. AMAC Green integrates all of this into one coordinated digital system — reducing friction, increasing transparency, and enabling access to clean energy at scale.

---

## 2. Platform Overview

### What the Platform Does

| Function | Description |
|---|---|
| **Marketplace** | Customers browse and purchase clean energy products and bundles from approved vendors |
| **Financing** | Embedded KCB loan origination at checkout, enabling affordable energy access |
| **Installation** | Professional installers bid competitively on installation jobs posted by customers/vendors |
| **Delivery** | Last-mile delivery partners with live GPS tracking fulfil product orders |
| **Administration** | Admins review and approve vendor, installer, and delivery partner applications |
| **Analytics** | Super-admins access platform-wide revenue, order, and performance analytics |

### Target Markets

| Segment | Description |
|---|---|
| Households | Residential customers purchasing solar, LPG, or electric cooking solutions |
| SMEs | Small businesses seeking reliable, affordable energy systems |
| Institutions | Schools, health facilities, and other institutional energy buyers |

---

## 3. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | Next.js 16.2.1 (App Router) + React 19 | Full-stack web application |
| **Language** | TypeScript 5 | Type-safe development |
| **Styling** | Tailwind CSS + shadcn/ui | Responsive, accessible UI components |
| **Database** | Supabase (PostgreSQL) | Primary data store with Row Level Security |
| **Authentication** | Supabase Auth (JWT) | Secure user identity and session management |
| **File Storage** | Supabase Storage | Document and image uploads |
| **Payments** | M-Pesa (Daraja), KCB Buni, Paystack, KCB Financing | Multi-channel payment and financing |
| **Forms** | React Hook Form + Zod | Client and server-side form validation |
| **Data Visualization** | Recharts | Analytics dashboards and charts |
| **Maps** | Leaflet | Live delivery GPS tracking maps |
| **Email** | Resend | Transactional email notifications |
| **Analytics** | PostHog | Product analytics and user behaviour tracking |
| **Package Manager** | Bun 1.3.5 | Fast JavaScript runtime and package manager |

---

## 4. User Roles & Portals

### Customer Portal (`/customer`, `/dashboard`)
Customers can browse products, build a cart, go through a multi-step checkout, select a payment method, and track their orders and installations.

**Key Capabilities:**
- Energy demand profiling wizard (optional, feature-flagged)
- Product catalog browsing with category and price filters
- Multi-item shopping cart (persisted to local storage)
- Multi-step checkout: shipping → billing → delivery → payment → review
- Payment via M-Pesa, KCB Buni, Paystack, or KCB Financing (embedded loan)
- Order history and real-time status tracking
- Installation job monitoring

---

### Vendor Portal (`/vendor`)
Approved vendors manage their product and package listings, view and fulfil customer orders, coordinate deliveries, and track analytics.

**Key Capabilities:**
- Product and bundle (package) management with images, SKU, and inventory
- Order fulfilment and shipment management
- Delivery partner coordination
- Real-time inventory tracking with low-stock alerts
- Revenue trends and KPI analytics dashboard

---

### Professional Installer Portal (`/professional`)
Certified professional installers can browse installation job postings, submit competitive bids, and manage active installation projects.

**Key Capabilities:**
- Job marketplace: browse open installation jobs
- Competitive bidding: submit labour + material cost proposals
- Project management: track assigned jobs, update progress, mark completion
- Standard service rate management
- Bulk material order creation

---

### Delivery Partner Portal (`/delivery`)
Delivery partners accept delivery assignments and track them to completion with live GPS integration.

**Key Capabilities:**
- Live GPS-enabled delivery tracking map (Leaflet)
- Delivery assignment acceptance and status updates
- In-transit, delivered, and issue status reporting
- Delivery instructions and address management

---

### Admin Portal (`/admin`)
Admins review and approve or reject applications from vendors, professional installers, and delivery partners.

**Key Capabilities:**
- Application review queue for vendors, professionals, and delivery partners
- Approve or reject applications with reasons
- Platform KPI dashboard and recent activity overview
- Customer profile and order history visibility

---

### Super-Admin Portal (`/super-admin`)
Super-admins have access to platform-wide analytics and reporting with custom filtering.

**Key Capabilities:**
- Payment method distribution analytics
- Order and revenue trends (daily, weekly, monthly)
- Fulfillment stage tracking
- Vendor and category performance breakdowns
- Custom date range and status filtering
- Email-based super-admin access verification

---

## 5. Key Features

### Multi-Channel Payments
The platform supports four payment methods:

| Method | Type | Provider |
|---|---|---|
| M-Pesa STK Push | Mobile money | Safaricom Daraja API |
| KCB Buni | Mobile money | KCB Bank |
| Paystack | Card / international | Paystack |
| KCB Financing | Embedded loan | KCB Bank loan origination |

### Embedded Financing (KCB)
Customers can apply for KCB financing directly at checkout, enabling affordable access to higher-value energy systems. The financing status (`pending`, `approved`, `rejected`) is tracked against each order in real time.

### Live GPS Delivery Tracking
Delivery partners broadcast their GPS location during active deliveries. Customers and admins can view live tracking via an integrated Leaflet map.

### Competitive Installation Bidding
Vendors and customers post installation jobs. Certified professional installers submit itemised bids (labour cost + material cost). The job poster reviews bids and selects a winner, who is then assigned the project.

### Product Packages / Bundles
Vendors can group multiple products into named system packages (e.g., "5kW Solar Home System") with coverage notes. Customers can purchase complete packages in a single transaction.

### Demand Profiling
An optional energy demand wizard captures customer segment, county, and energy requirements. This data is stored in a JSONB `customer_program_profiles` table and can be used for targeted product recommendations and reporting.

---

## 6. Platform Architecture

### Application Structure

```
amac-green/
├── app/                    # Next.js App Router pages and API routes
│   ├── actions/            # Server Actions (database mutations)
│   ├── api/                # HTTP API routes (payment callbacks, uploads)
│   ├── admin/              # Admin portal pages
│   ├── super-admin/        # Super-admin analytics pages
│   ├── vendor/             # Vendor portal pages
│   ├── professional/       # Professional installer pages
│   ├── delivery/           # Delivery partner pages
│   ├── customer/           # Customer portal pages
│   ├── dashboard/          # Unified dashboard entry
│   ├── checkout/           # Cart and multi-step checkout
│   └── products/           # Public product catalog
├── components/             # Reusable UI components (shadcn + custom)
├── lib/                    # Utilities, contexts, integrations
│   ├── auth-context.tsx    # User session and role detection
│   ├── cart-context.tsx    # Shopping cart state (localStorage)
│   ├── supabase/           # Supabase client and server helpers
│   ├── daraja.ts           # M-Pesa Daraja integration
│   └── email-service.ts    # Resend email integration
├── scripts/                # SQL migration files for Supabase
└── public/                 # Static assets
```

### Authentication Flow

```
User registers
  → Email verification
  → Account created in Supabase Auth with role metadata
  → Vendor/Professional/Delivery: submits application form
  → Admin reviews and approves/rejects
  → Upon approval: full portal access granted
```

### Key Architectural Patterns

- **Server Actions** — All data mutations use Next.js `"use server"` actions. Every action calls `supabase.auth.getUser()` to verify identity server-side before executing.
- **Row Level Security (RLS)** — All Supabase database tables enforce RLS policies. Users can only access data they are authorised to access at the database level, regardless of application logic.
- **React Contexts** — `AuthContext` and `CartContext` manage client-side session and cart state respectively.
- **Path Revalidation** — After every mutation, `revalidatePath()` is called to keep the UI consistent with the database state.

---

## 7. Payment Integrations

### M-Pesa (Safaricom Daraja)

| Step | Description |
|---|---|
| **Initiate** | `POST /api/daraja/initialize` triggers an STK Push to the customer's phone |
| **Confirm** | Safaricom sends a callback to `POST /api/daraja/callback` |
| **Verify** | Server verifies the payment reference and updates the order status |

> **Note:** M-Pesa STK Push requires a publicly accessible HTTPS callback URL. Use ngrok or a deployed environment for local testing.

---

### KCB Buni

| Step | Description |
|---|---|
| **Initiate** | `POST /api/kcb-buni/initialize` triggers an STK Push via KCB Buni API |
| **Confirm** | KCB Buni sends a callback to `POST /api/kcb-buni/callback` |
| **Verify** | Server verifies and updates order payment status |

---

### Paystack

| Step | Description |
|---|---|
| **Initiate** | `POST /api/paystack/initialize` creates a Paystack payment session |
| **Redirect** | Customer completes card payment on Paystack-hosted page |
| **Verify** | `POST /api/paystack/verify` confirms the transaction |
| **Webhook** | `POST /api/paystack/webhook` handles asynchronous Paystack events |

---

### KCB Financing

| Step | Description |
|---|---|
| **Apply** | Customer selects "KCB Financing" at checkout; loan application initiated |
| **Decision** | KCB API returns `approved`, `pending`, or `rejected` |
| **Tracking** | `financing_status`, `financing_reference`, and `financing_payload` stored on the order |

---

## 8. Data & Security

### Row Level Security (RLS)

All database tables enforce Supabase RLS policies:

| Role | Data Access |
|---|---|
| Customer | Own orders, profiles, and applications only |
| Vendor | Own products, packages, and orders only |
| Professional | Eligible job listings and own bids only |
| Delivery Partner | Assigned deliveries only |
| Admin | All applications for review |
| Super-Admin | Platform-wide read access |

### Authentication Security
- JWT tokens are cryptographically verified on every server action — no client-side trust.
- Passwords are managed entirely by Supabase Auth (bcrypt hashing).
- Email verification is required before account activation.

### Document Uploads
- Vendor and professional application documents are uploaded to Supabase Storage via `POST /api/upload/documents`.
- Files are stored with access policies restricting visibility to the owner and admins.

---

## 9. Environment Configuration

Create a `.env.local` file in the project root with the following variables:

```env
# ── Application ──────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# ── Supabase ─────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ── M-Pesa (Daraja) ──────────────────────────────────────────
MPESA_BASE_URL=https://sandbox.safaricom.co.ke
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_CALLBACK_URL=https://your-domain.com/api/daraja/callback

# ── KCB Buni ─────────────────────────────────────────────────
KCB_BUNI_BASE_URL=
KCB_BUNI_TOKEN_URL=
KCB_BUNI_CLIENT_ID=
KCB_BUNI_CLIENT_SECRET=
KCB_BUNI_ROUTE_CODE=

# ── KCB Financing ────────────────────────────────────────────
NEXT_PUBLIC_ENABLE_FINANCING_CHECKOUT=false
KCB_FINANCING_SIMULATION=false

# ── Paystack ─────────────────────────────────────────────────
PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...

# ── PostHog Analytics ────────────────────────────────────────
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# ── Feature Flags ────────────────────────────────────────────
NEXT_PUBLIC_ENABLE_DEMAND_PROFILE=false
NEXT_PUBLIC_ENHANCED_LOCATION_CATEGORY_SLUG=gas-yetu

# ── Development / Simulation ─────────────────────────────────
ORDER_SIMULATION=false
KCB_FINANCING_AUTO_APPROVE_MS=0
NEXT_PUBLIC_SHOW_FINANCING_SIMULATION_UI=false
```

---

## 10. Developer Setup Guide

### Prerequisites

- Node.js 18+ or **Bun 1.3.5** (recommended)
- A [Supabase](https://supabase.com) project (free tier available)
- Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/amac-green.git
cd amac-green

# 2. Install dependencies
bun install

# 3. Copy environment template and fill in credentials
cp .env.example .env.local
```

### Database Setup

Run the following SQL migration files in order via the **Supabase SQL Editor**:

1. `scripts/create-tables.sql`
2. `scripts/create-orders-tables.sql`
3. `scripts/create-product-tables.sql`
4. `scripts/create-installation-jobs-tables.sql`
5. `scripts/create-professional-tables.sql`
6. `scripts/create-delivery-applications-table-v2.sql`
7. `scripts/create-deliveries-table.sql`
8. `scripts/create-reviews-table.sql`
9. `scripts/amac-spec-migration.sql` ← **Main migration** (financing, packages, profiles)
10. Any remaining `scripts/add-*.sql` patch files

> If you encounter schema cache issues after migrations, go to **Supabase → Project Settings → API → Reload schema**.

### Running the Development Server

```bash
bun dev
# Server starts at http://localhost:3000
```

### Build & Production

```bash
bun run build    # Compile the application
bun run start    # Run the compiled production server
bun run lint     # Run ESLint checks
```

### M-Pesa Local Testing

M-Pesa requires a publicly accessible HTTPS URL for payment callbacks. Use [ngrok](https://ngrok.com) during local development:

```bash
ngrok http 3000
# Set in .env.local:
# MPESA_CALLBACK_URL=https://<your-id>.ngrok-free.app/api/daraja/callback
```

### Simulation / Test Mode

For development without live payment credentials:

```env
ORDER_SIMULATION=true                         # Mock orders — no database writes
KCB_FINANCING_SIMULATION=true                # Simulate KCB financing decisions
KCB_FINANCING_AUTO_APPROVE_MS=3000           # Auto-approve loan after 3 seconds
NEXT_PUBLIC_SHOW_FINANCING_SIMULATION_UI=true
```

**Test API Endpoints:**
- `POST /api/daraja/simulate-callback` — Manually trigger M-Pesa payment confirmation
- `POST /api/kcb-buni/simulate-payment` — Simulate KCB Buni payment
- `POST /api/email/test` — Send a test email

---

## 11. Database Schema Reference

### Authentication & Identity

| Table | Description |
|---|---|
| `auth.users` | Supabase managed auth users |
| `customer_profiles` | Customer personal information |
| `vendor_profiles` | Approved vendor details |
| `customer_program_profiles` | Energy demand profiles (JSONB: county, user_segment) |

### Applications

| Table | Description |
|---|---|
| `vendor_applications` | Vendor signup applications (`pending` / `approved` / `rejected`) |
| `professional_applications` | Professional installer applications |
| `delivery_applications` | Delivery partner applications |

### Products & Packages

| Table | Description |
|---|---|
| `products` | Product catalog (vendor_id, name, price, SKU, inventory, status) |
| `product_images` | Product images with `is_primary` flag |
| `product_categories` | Category taxonomy |
| `product_packages` | Vendor-defined bundles (name, status, coverage_notes) |
| `product_package_items` | Items within a package (product_id, quantity, sort_order) |

### Orders & Payments

| Table | Description |
|---|---|
| `orders` | Order master record |
| `order_items` | Order line items (product_id, quantity, unit_price, total_price) |
| `order_status_history` | Full order lifecycle audit trail |
| `payment_transactions` | Payment event log (method, status, amount, reference) |

**Key Order Fields:**

| Field | Values |
|---|---|
| `payment_method` | `mpesa`, `kcb_buni`, `paystack`, `kcb_financing` |
| `payment_status` | `pending`, `paid`, `failed` |
| `fulfillment_stage` | `order_received` → `installation_in_progress` → `commissioned` → `completed` |
| `financing_status` | `pending`, `approved`, `rejected` |

### Installation

| Table | Description |
|---|---|
| `installation_jobs` | Job postings (customer_id, title, location, urgency, status) |
| `installation_job_items` | Products to be installed per job |
| `installation_bids` | Professional bids (labor_cost, material_cost, total_bid_amount, status) |

### Delivery & Logistics

| Table | Description |
|---|---|
| `deliveries` | Delivery assignments (order_id, delivery_partner_id, status) |
| `delivery_locations` | Live GPS tracking snapshots (latitude, longitude, timestamp) |

### Other

| Table | Description |
|---|---|
| `reviews` | Product reviews (product_id, user_id, rating, comment) |
| `inventory_adjustments` | Stock movement audit trail |

---

## 12. API & Server Actions Reference

### Server Actions (`app/actions/`)

| File | Key Functions |
|---|---|
| `auth.ts` | `registerCustomer`, `registerVendor`, `registerProfessional`, `registerDelivery` |
| `orders.ts` | `createOrder`, `getVendorOrders`, `updateOrderStatus`, `checkDeliveryAssignment`, `manuallyAssignDelivery` |
| `products.ts` | `createProduct`, `updateProduct`, `getProducts`, `getProductDetails`, `deleteProduct` |
| `delivery.ts` | `getDeliveryApplications`, `approveDeliveryApplication`, `rejectDeliveryApplication`, `updateDeliveryStatus`, `getActiveDeliveries` |
| `admin.ts` | `getDashboardStats`, `getVendorApplications`, `approveVendorApplication`, `rejectVendorApplication`, `checkAdminAccess` |
| `super-admin-analytics.ts` | `getPlatformAnalytics`, `getVendorPerformance`, `getCategoryPerformance` |
| `category-performance.ts` | Category-level sales analytics |
| `vendor-performance.ts` | Vendor-level KPI calculations |

### HTTP API Routes (`app/api/`)

| Route | Method | Description |
|---|---|---|
| `/api/daraja/initialize` | POST | Initiate M-Pesa STK Push |
| `/api/daraja/callback` | POST | Receive M-Pesa payment confirmation |
| `/api/daraja/verify` | POST | Verify M-Pesa payment status |
| `/api/kcb-buni/initialize` | POST | Initiate KCB Buni STK Push |
| `/api/kcb-buni/callback` | POST | Receive KCB Buni confirmation |
| `/api/paystack/initialize` | POST | Initialize Paystack card payment |
| `/api/paystack/verify` | POST | Verify Paystack transaction |
| `/api/paystack/webhook` | POST | Receive Paystack async events |
| `/api/reviews` | GET / POST | List or create product reviews |
| `/api/reviews/user` | GET | Fetch current user's reviews |
| `/api/reviews/[id]` | GET / PATCH / DELETE | Single review operations |
| `/api/vendor-stats` | GET | Vendor analytics data |
| `/api/upload/documents` | POST | Application document upload |
| `/api/email/test` | POST | Test email delivery (dev only) |

---

## 13. Order Lifecycle

```
[Customer]
  1. Adds products to cart
  2. Proceeds to multi-step checkout
     └── Shipping address → Billing address → Delivery instructions → Payment selection → Review
  3. Submits order → createOrder() server action saves to database

[Payment]
  4. Customer completes payment (M-Pesa / KCB Buni / Paystack / KCB Financing)
  5. Payment provider sends callback to platform
  6. Platform verifies payment → Order marked as "paid"

[Financing (if selected)]
  7. KCB financing API initiated
  8. Financing decision received and stored on order

[Fulfilment]
  9.  Vendor receives and processes order
  10. Delivery partner assigned → Order enters "in transit"
  11. Delivery partner marks order as delivered

[Installation (if applicable)]
  12. Installation job created → Professional installers bid
  13. Winning bid accepted → Installer assigned
  14. Installer updates progress → Marks job complete

[Completion]
  15. Order fulfillment_stage updated to "completed"
  16. Customer can leave a product review
```

---

## 14. Deployment

### Recommended: Vercel

Vercel provides seamless deployment for Next.js applications.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set all environment variables from Section 9 in the Vercel project dashboard under **Settings → Environment Variables**.

### Self-Hosted

```bash
bun run build
bun run start
```

Run behind a reverse proxy (e.g., Nginx) with HTTPS for M-Pesa callback compatibility.

### Production Checklist

- [ ] All environment variables set (Supabase, payment providers, PostHog)
- [ ] M-Pesa callback URL points to production HTTPS domain
- [ ] KCB Buni callback URL points to production HTTPS domain
- [ ] `ORDER_SIMULATION=false` and all simulation flags disabled
- [ ] `NEXT_PUBLIC_ENABLE_FINANCING_CHECKOUT` set appropriately
- [ ] All SQL migration files applied to production Supabase project
- [ ] Supabase RLS policies verified
- [ ] Admin and super-admin accounts created in Supabase
- [ ] Resend credentials configured for `lib/email-service.ts`

---

*AMAC Green Platform — Confidential. For internal and shareholder use only.*
