# Business Requirements Document (BRD)
## AMAC Green Platform

---

| Document Control | |
|---|---|
| **Document Title** | Business Requirements Document — AMAC Green Platform |
| **Version** | 1.0 |
| **Status** | Final Draft |
| **Prepared By** | AMAC Green Programme Team |
| **Date** | April 2026 |
| **Classification** | Confidential — Internal & Development Use |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Objectives](#2-business-objectives)
3. [Scope](#3-scope)
4. [Stakeholders](#4-stakeholders)
5. [Current State Analysis (As-Is)](#5-current-state-analysis-as-is)
6. [Proposed System Overview (To-Be)](#6-proposed-system-overview-to-be)
7. [Functional Requirements](#7-functional-requirements)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [User Roles & Permissions](#9-user-roles--permissions)
10. [Process Flows / User Journeys](#10-process-flows--user-journeys)
11. [Data Requirements](#11-data-requirements)
12. [Integration Requirements](#12-integration-requirements)
13. [Constraints](#13-constraints)
14. [Risks & Mitigation](#14-risks--mitigation)
15. [Success Metrics (KPIs)](#15-success-metrics-kpis)
16. [Acceptance Criteria](#16-acceptance-criteria)

---

## 1. Executive Summary

### 1.1 Overview

AMAC Green is an integrated clean energy marketplace platform purpose-built for the Kenyan market. It enables clients — institutions, SMEs, and households — to discover, finance, and deploy complete modern energy solutions through a single coordinated digital system. Rather than requiring clients to separately identify suppliers, negotiate pricing, arrange financing, and manage installation, AMAC Green integrates all of these into one end-to-end workflow.

The platform is built on Next.js 16 / React 19 with Supabase as the backend, and is live at production grade. It connects four primary parties:

- **Clients** — institutions (schools, hospitals, TVETs), SMEs, households, and individuals
- **Vendors** — approved suppliers who provide and install clean energy systems
- **KCB Bank** — the embedded financing provider (via KCB Buni and KCB Financing APIs)
- **AMAC** — the platform operator, programme coordinator, and oversight authority

The platform currently supports six user portals: Customer, Vendor, Professional (installation expert), Delivery Partner, Admin, and Super-Admin.

### 1.2 Business Objectives

- Solve the core market failure of fragmented access to clean energy technology, financing, and delivery
- Aggregate structured energy demand across Kenya's institutions and businesses
- Create a standardised, comparable marketplace for clean energy system packages
- Embed KCB financing directly into the procurement process
- Track every deployment from system selection through installation and commissioning
- Provide AMAC with real-time programme-level visibility

### 1.3 Expected Outcomes and Value

- Accelerated deployment of Solar PV, LPG, Electric Cooking, and Biomass systems across Kenya
- Reduced barriers to clean energy access through integrated, accessible financing
- Improved coordination between suppliers, financiers, and end users
- Standardised, auditable procurement and installation workflows
- A scalable platform that can grow from institutional pilots to mass-market household adoption

---

## 2. Business Objectives

| # | Objective | Alignment |
|---|---|---|
| BO-01 | Enable clients to procure complete, ready-to-deploy clean energy systems through a single platform | Market access / sustainability |
| BO-02 | Aggregate structured demand profiles from institutions, SMEs, and households | Data intelligence |
| BO-03 | Provide vendors with a standardised, governed channel to offer and fulfil system packages | Supply quality |
| BO-04 | Integrate KCB Bank financing seamlessly into the checkout workflow | Financial inclusion |
| BO-05 | Track end-to-end order fulfilment, delivery, and installation in real time | Operational efficiency |
| BO-06 | Give AMAC central oversight and analytics across all platform activity | Programme governance |
| BO-07 | Support multiple clean energy technology categories (Solar PV, LPG, Electric Cooking, Biomass, Hybrid) | Technology breadth |
| BO-08 | Scale from institutional deployments to mass-market household adoption | Long-term growth |
| BO-09 | Enable professional installation services via a competitive bidding marketplace | Service quality |
| BO-10 | Generate programme-level impact data (energy generated, fuel displaced, systems deployed) | Reporting & compliance |

---

## 3. Scope

### 3.1 In-Scope

**Platform Portals**
- Public-facing marketplace (product/package browsing, company information, contact)
- Customer portal (registration, demand profiling, solution selection, checkout, order tracking, installation job management)
- Vendor portal (product/package management, order fulfilment, delivery coordination, analytics)
- Professional portal (job marketplace, competitive bidding, project management)
- Delivery partner portal (assignment acceptance, live GPS tracking, status updates)
- Admin portal (vendor/professional/delivery partner application review and approval)
- Super-Admin portal (platform-wide analytics, vendor performance, category insights)

**Core Functional Domains**
- User registration and authentication (all roles)
- Demand profiling wizard (client energy need capture)
- Product and system package catalogue
- Shopping cart and checkout (multi-payment)
- KCB financing integration (embedded at checkout)
- M-Pesa (Daraja), KCB Buni, and Paystack payment processing
- Order lifecycle management (creation → fulfilment → delivery → completion)
- Installation job creation and competitive bidding
- Real-time delivery tracking (GPS)
- Email notification system (approval, rejection, order updates)
- Admin review and approval workflows
- Platform analytics and reporting

**Technology Categories Supported**
- Solar PV systems (with/without battery storage)
- LPG cooking systems
- Electric cooking solutions
- Biomass briquettes supply systems
- Hybrid configurations (e.g., solar + electric cooking, solar + LPG)

### 3.2 Out-of-Scope (Current Version)

- Direct KCB Bank API credit scoring or loan origination (handled by KCB's own systems; platform only initiates and tracks)
- IoT / smart meter integration for real-time energy generation monitoring (planned future phase)
- Mobile native app (iOS/Android) — web-responsive only
- Government compliance portal integrations (e.g., EPRA, KRA e-invoicing)
- Multi-currency or multi-country support beyond Kenya
- Third-party logistics carrier integrations (DHL, Sendy, etc.)
- Automated vendor payout / disbursement flows

### 3.3 Assumptions

- All vendors have valid business registration and where applicable, EPRA certification
- KCB Bank financing decisions are returned via API; AMAC does not perform credit assessments
- The platform operates under Kenyan law, using KES as the sole currency
- Clients have access to a smartphone or web browser and a mobile money account (M-Pesa)
- GPS coordinates are captured from device location services during client onboarding
- Email delivery is handled via Resend (admin notifications)
- Supabase (PostgreSQL) is the authoritative data store for all platform entities
- Simulation/test modes are available for M-Pesa, KCB Financing, and order creation during development

---

## 4. Stakeholders

### 4.1 Internal Stakeholders

| Stakeholder | Role | Responsibilities |
|---|---|---|
| AMAC Programme Team | Platform Operator | Define programme rules, manage admin accounts, monitor deployments, report to donors |
| AMAC Super-Admin | Platform Super-Administrator | Access cross-platform analytics, vendor performance, category KPIs |
| AMAC Admin | Application Reviewer | Approve/reject vendor, professional, and delivery partner applications |
| AMAC Development Team | Technical Owner | Build, deploy, and maintain the platform |
| AMAC Business Analysts | Requirements & QA | Define requirements, validate functional completeness, sign off UAT |

### 4.2 External Stakeholders

| Stakeholder | Role | Responsibilities |
|---|---|---|
| Clients (Institutions) | End User — Buyer | Register, define energy needs, select and procure clean energy systems |
| Clients (SMEs) | End User — Buyer | As above, with commercial energy profiling |
| Clients (Households / Individuals) | End User — Buyer (future expansion) | Residential clean energy procurement |
| Vendors | Supplier & Installer | List system packages, fulfil orders, manage delivery, commission installations |
| Professional Installers | Service Provider | Bid on and execute installation jobs, update project progress |
| Delivery Partners | Logistics Provider | Accept delivery assignments, track and complete last-mile deliveries |
| KCB Bank | Financing Partner | Process financing applications, return credit decisions, disburse loans |
| Safaricom (M-Pesa) | Payment Provider | Process STK Push payments via Daraja API |
| KCB Buni | Payment Provider | Alternative STK Push payment channel |
| Paystack | Payment Provider | International / card payment processing |
| Donors / Funders | Programme Oversight | Monitor platform KPIs, impact metrics, deployment progress |

---

## 5. Current State Analysis (As-Is)

### 5.1 Current Process

Before AMAC Green, clean energy procurement in Kenya was highly fragmented:

1. **Supply identification** — Clients sourced vendors independently, relying on word of mouth or informal directories with no quality assurance
2. **Pricing** — Non-standardised; each vendor quoted individually, making comparison difficult
3. **Financing** — Clients had to approach KCB or other financiers separately, providing their own documentation and vendor quotes, with no digital workflow
4. **Installation** — Managed informally between client and vendor, with no structured commissioning or tracking
5. **Oversight** — AMAC had no centralised view of deployments; data was gathered manually via field reports

### 5.2 Pain Points & Inefficiencies

| Pain Point | Impact |
|---|---|
| No single directory of vetted, EPRA-licensed vendors | High client risk; variable installation quality |
| No standardised system packages | Clients unable to compare offerings or assess value |
| Financing is a separate, paper-based process | Significantly lengthens procurement cycle (weeks → months) |
| No digital installation tracking | AMAC cannot monitor programme progress in real time |
| Manual demand data collection | Slow, incomplete, non-comparable demand profiles |
| No professional installer marketplace | Best installers are inaccessible to most clients |
| Last-mile delivery untracked | Equipment loss and delays are undetected |
| No platform-level analytics | Donors and AMAC lack reliable impact data |

---

## 6. Proposed System Overview (To-Be)

### 6.1 System Flow

```
Client → Platform → Vendor/Professional → KCB → Vendor → AMAC Dashboard
```

1. Client registers and completes structured energy demand profile
2. Platform presents matched vendor system packages
3. Client selects a complete solution
4. Checkout: direct payment (M-Pesa / KCB Buni / Paystack) or KCB financing
5. Order assigned to vendor; professional installer engaged via bidding
6. Delivery partner tracks last-mile logistics via GPS
7. Vendor commissions installation; status updated on platform
8. AMAC monitors full lifecycle via Super-Admin dashboard

### 6.2 Key Modules

| Module | Description |
|---|---|
| **User Management** | Registration, authentication, role-based access, approval workflows |
| **Demand Profiling** | Structured energy need capture (location, consumption, willingness to finance) |
| **Product & Package Catalogue** | Standardised system packages from approved vendors |
| **Cart & Checkout** | Multi-payment checkout with embedded KCB financing |
| **Order Management** | Full order lifecycle: creation, fulfilment, delivery, completion |
| **Installation Marketplace** | Job creation, competitive bidding, project tracking |
| **Delivery & Logistics** | GPS-tracked last-mile delivery management |
| **Admin & Approval Workflows** | Vendor, professional, and delivery partner vetting |
| **Analytics & Reporting** | Super-admin KPIs, vendor performance, category insights |
| **Notifications** | Email alerts for approvals, rejections, and order events |

---

## 7. Functional Requirements

### 7.1 User Authentication & Registration

| ID | Requirement |
|---|---|
| FR-AUTH-01 | The system shall support email/password-based registration and login via Supabase Auth |
| FR-AUTH-02 | The system shall send an email verification link upon registration before granting access |
| FR-AUTH-03 | The system shall support four registration pathways: Customer, Vendor, Professional Installer, Delivery Partner |
| FR-AUTH-04 | The system shall assign a role (`customer`, `vendor`, `professional`, `delivery`) to each user at registration, stored in user metadata |
| FR-AUTH-05 | The system shall redirect users to their role-specific dashboard upon successful login |
| FR-AUTH-06 | The system shall auto-approve Customer accounts upon email verification |
| FR-AUTH-07 | The system shall require admin approval for Vendor, Professional, and Delivery Partner accounts before granting portal access |
| FR-AUTH-08 | The system shall support persistent sessions with automatic token refresh |
| FR-AUTH-09 | The system shall provide a logout function that clears the session |
| FR-AUTH-10 | Admin access shall be restricted to a configured whitelist of email addresses |

### 7.2 Client Demand Profiling

| ID | Requirement |
|---|---|
| FR-PROF-01 | The system shall capture a structured demand profile for each client, including: basic identification, location, client classification, energy use profile, and financial indicators |
| FR-PROF-02 | The system shall capture GPS coordinates (latitude/longitude) from the client's device or manual map entry |
| FR-PROF-03 | The system shall record grid access status: on-grid, off-grid, or unreliable grid |
| FR-PROF-04 | The system shall record user type (Institution, SME, Household, Individual) and facility/business type |
| FR-PROF-05 | The system shall capture monthly electricity consumption (kWh or bill estimate) for solar system sizing |
| FR-PROF-06 | The system shall capture cooking fuel type, consumption, and transition preferences |
| FR-PROF-07 | The system shall record willingness to finance (Yes/No), which triggers the KCB financing workflow at checkout |
| FR-PROF-08 | The system shall allow clients to update their demand profile at any time |
| FR-PROF-09 | The system shall store the demand profile as a structured JSON object in the `customer_program_profiles` table |
| FR-PROF-10 | The system shall use the demand profile to influence product/package recommendations presented to the client |

### 7.3 Product & Package Catalogue

| ID | Requirement |
|---|---|
| FR-CAT-01 | The system shall support product categories including: Solar PV, LPG Cooking, Electric Cooking, Biomass, and Hybrid systems |
| FR-CAT-02 | The system shall allow vendors to create individual products with SKU, pricing, inventory, specifications, warranty, and images |
| FR-CAT-03 | The system shall allow vendors to create system packages (bundles) comprising multiple products with a single package price |
| FR-CAT-04 | Each system package shall include: system configuration, components, installation scope, total cost, service terms, and geographic coverage |
| FR-CAT-05 | The system shall display only active products and packages to clients; draft/inactive listings shall be hidden |
| FR-CAT-06 | The system shall support product filtering by: technology category, price range, vendor, and availability |
| FR-CAT-07 | The system shall support product search by name, description, and tags |
| FR-CAT-08 | The system shall display primary and secondary product images in a gallery |
| FR-CAT-09 | The system shall show stock availability and low-stock indicators to clients |
| FR-CAT-10 | The system shall support product variants (e.g., different capacities of the same solar panel) |

### 7.4 Shopping Cart & Checkout

| ID | Requirement |
|---|---|
| FR-CART-01 | The system shall maintain a persistent shopping cart for authenticated users, synced between browser local storage and the database |
| FR-CART-02 | The system shall allow unauthenticated users to add items to a local cart, which merges with their database cart upon login |
| FR-CART-03 | The system shall validate stock levels before allowing checkout |
| FR-CART-04 | The checkout flow shall collect: full name, phone number, email, and shipping address (address line 1/2, city, county, country) |
| FR-CART-05 | The system shall collect GPS-enhanced Kenya location fields (county, sub-county, physical address) for applicable product categories |
| FR-CART-06 | The system shall calculate subtotal, 16% VAT, shipping estimate, and order total at checkout |
| FR-CART-07 | The system shall support four payment methods: M-Pesa (Daraja STK Push), KCB Buni (STK Push), Paystack, and Bank Transfer |
| FR-CART-08 | The system shall present a KCB Financing option at checkout for clients who indicated willingness to finance in their demand profile |
| FR-CART-09 | Upon successful payment or financing approval, the system shall create an order record and redirect the client to an order confirmation page |
| FR-CART-10 | The system shall send an order confirmation notification to the client |

### 7.5 Order Management

| ID | Requirement |
|---|---|
| FR-ORD-01 | The system shall assign a unique order number to every order (format: ORD-{timestamp}-{random}) |
| FR-ORD-02 | The system shall track order status through defined stages: `pending` → `confirmed` → `processing` → `shipped` → `delivered` → `completed` or `cancelled`/`refunded` |
| FR-ORD-03 | The system shall track payment status independently: `pending` → `paid` → `failed` → `refunded` |
| FR-ORD-04 | The system shall track financing status independently: `none` → `pending` → `approved` / `declined` |
| FR-ORD-05 | The system shall record a status history log (timestamp, status, notes, actor) for every order state change |
| FR-ORD-06 | The system shall allow customers to view their full order history and individual order details |
| FR-ORD-07 | The system shall allow vendors to view and update the status of orders containing their products |
| FR-ORD-08 | The system shall automatically attempt to assign an available delivery partner to an order upon confirmation |
| FR-ORD-09 | The system shall allow admins to manually assign a delivery partner to an order if automatic assignment fails |
| FR-ORD-10 | The system shall display order tracking number and URL when the order is shipped |

### 7.6 KCB Financing

| ID | Requirement |
|---|---|
| FR-FIN-01 | The system shall present a financing option at checkout when the client's demand profile indicates willingness to finance |
| FR-FIN-02 | The system shall submit the client's profile and selected system details to KCB's financing API |
| FR-FIN-03 | The system shall receive and store KCB's financing decision (approved / declined) on the order record |
| FR-FIN-04 | The system shall automatically advance approved financing orders to fulfilment without requiring additional client action |
| FR-FIN-05 | The system shall notify the client of their financing decision by email and on-screen |
| FR-FIN-06 | The system shall support a simulation mode for KCB Financing during development and UAT (configurable via environment flag) |
| FR-FIN-07 | The system shall allow a declined financing application to be retried with an alternative payment method |

### 7.7 Installation Job Marketplace

| ID | Requirement |
|---|---|
| FR-INST-01 | The system shall allow customers to create an installation job, specifying: title, description, site address, GPS coordinates, urgency level, and required products |
| FR-INST-02 | The system shall track installation job status: `open` → `bidding` → `assigned` → `in_progress` → `completed` / `cancelled` |
| FR-INST-03 | The system shall present open and bidding-stage jobs to approved professional installers |
| FR-INST-04 | The system shall allow professionals to submit a bid specifying: labour cost, materials cost, additional costs, total amount, estimated duration (hours), and proposal notes |
| FR-INST-05 | The system shall allow customers to review all bids received on their job and compare costs and proposals |
| FR-INST-06 | The system shall allow customers to select a winning bid, which assigns the professional and updates job status to `assigned` |
| FR-INST-07 | The system shall allow the assigned professional to update job progress status |
| FR-INST-08 | The system shall notify the winning professional when their bid is accepted |

### 7.8 Delivery & Logistics

| ID | Requirement |
|---|---|
| FR-DEL-01 | The system shall assign deliveries to approved delivery partners |
| FR-DEL-02 | The system shall allow delivery partners to accept or reject assigned deliveries |
| FR-DEL-03 | The system shall track delivery status: `pending` → `in_progress` → `completed` |
| FR-DEL-04 | The system shall capture the delivery partner's GPS location (latitude, longitude, accuracy, heading, speed, battery level) at regular intervals |
| FR-DEL-05 | The system shall display a live map of active delivery partner locations to vendors and admins |
| FR-DEL-06 | The system shall display delivery performance statistics to each delivery partner (total deliveries, today's deliveries, earnings, ratings) |
| FR-DEL-07 | The system shall provide customer contact details to the delivery partner for each active delivery |

### 7.9 Vendor Management

| ID | Requirement |
|---|---|
| FR-VEN-01 | The system shall allow vendors to create, edit, and deactivate product listings and system packages |
| FR-VEN-02 | The system shall allow vendors to manage inventory quantities and set low-stock thresholds |
| FR-VEN-03 | The system shall allow vendors to upload multiple images per product |
| FR-VEN-04 | The system shall provide vendors with a dashboard showing: total revenue, order count, active products, and pending orders |
| FR-VEN-05 | The system shall allow vendors to view and update the fulfilment status of their orders |
| FR-VEN-06 | The system shall allow vendors to coordinate deliveries and view live delivery locations |
| FR-VEN-07 | The system shall provide vendors with sales analytics: revenue by category, order volume over time, top products |

### 7.10 Admin & Approval Workflows

| ID | Requirement |
|---|---|
| FR-ADM-01 | The system shall present admin users with a list of pending applications for: vendors, professional installers, and delivery partners |
| FR-ADM-02 | The system shall display full application details including submitted documents |
| FR-ADM-03 | The system shall allow admins to approve or reject each application with a single action |
| FR-ADM-04 | The system shall automatically send an approval or rejection email to the applicant upon status change |
| FR-ADM-05 | The system shall restrict admin portal access to a configured email whitelist |
| FR-ADM-06 | The system shall display a summary dashboard: total users by role, pending approvals, approved/rejected counts |

### 7.11 Super-Admin Analytics

| ID | Requirement |
|---|---|
| FR-SA-01 | The system shall provide a super-admin dashboard with platform-wide KPIs: total orders, total revenue, active vendors, active professionals, delivery completion rate, average order value |
| FR-SA-02 | The system shall display vendor performance metrics: revenue per vendor, order count, customer satisfaction |
| FR-SA-03 | The system shall display category-level performance: revenue by product category, popular products |
| FR-SA-04 | The system shall display user segmentation data: client type breakdown, geographic distribution, payment method preferences |
| FR-SA-05 | The system shall display financing metrics: applications submitted, approved, declined, total financed value |
| FR-SA-06 | The system shall display installation metrics: jobs created, bids submitted, jobs completed, completion rate by professional |

### 7.12 Notifications

| ID | Requirement |
|---|---|
| FR-NOT-01 | The system shall send email notifications for: account approval, account rejection, order confirmation, order status changes, bid acceptance |
| FR-NOT-02 | The system shall display in-app toast notifications for: successful actions, errors, and system status updates |
| FR-NOT-03 | Notification emails shall be personalised with the recipient's name and relevant order/application details |

### 7.13 Product Reviews

| ID | Requirement |
|---|---|
| FR-REV-01 | The system shall allow customers to submit a star rating and written review for a purchased product |
| FR-REV-02 | The system shall display reviews on the product listing page with aggregated average rating |
| FR-REV-03 | The system shall restrict review submission to customers who have purchased the product |

---

## 8. Non-Functional Requirements

### 8.1 Performance

| ID | Requirement |
|---|---|
| NFR-PERF-01 | Page load time for public catalogue and product pages shall be under 3 seconds on a 4G mobile connection |
| NFR-PERF-02 | Checkout and payment initiation (STK Push) shall complete within 5 seconds |
| NFR-PERF-03 | Admin and super-admin dashboard data shall load within 5 seconds |
| NFR-PERF-04 | GPS location updates shall be transmitted to the platform within 10 seconds of capture |
| NFR-PERF-05 | The platform shall support a minimum of 500 concurrent users without degradation |

### 8.2 Security

| ID | Requirement |
|---|---|
| NFR-SEC-01 | All data in transit shall be encrypted via HTTPS/TLS 1.2+ |
| NFR-SEC-02 | All authentication tokens shall be short-lived JWTs managed by Supabase Auth with automatic refresh |
| NFR-SEC-03 | Role-based access control (RBAC) shall be enforced server-side for all protected routes and server actions |
| NFR-SEC-04 | The system shall prevent access to vendor/professional/delivery portals until admin approval is granted |
| NFR-SEC-05 | Payment credentials (M-Pesa keys, KCB secrets, Paystack keys) shall be stored as server-side environment variables and never exposed to the client |
| NFR-SEC-06 | All user inputs shall be validated and sanitised server-side to prevent SQL injection and XSS attacks |
| NFR-SEC-07 | Document uploads shall be validated for file type and size; stored securely in Supabase Storage |
| NFR-SEC-08 | Admin access shall require email whitelisting in addition to authentication |

### 8.3 Scalability

| ID | Requirement |
|---|---|
| NFR-SCALE-01 | The platform architecture shall support horizontal scaling via Vercel serverless deployment |
| NFR-SCALE-02 | Supabase PostgreSQL shall be the primary data store, capable of scaling to millions of records without schema changes |
| NFR-SCALE-03 | Feature flags shall control the rollout of demand profiling, enhanced location fields, and financing UI to manage load during expansion |
| NFR-SCALE-04 | The system shall be designed to support future addition of household/individual client segments without architectural changes |

### 8.4 Availability

| ID | Requirement |
|---|---|
| NFR-AVAIL-01 | The platform shall target 99.5% uptime, excluding scheduled maintenance windows |
| NFR-AVAIL-02 | The M-Pesa callback URL endpoint shall be publicly accessible via HTTPS at all times to receive payment webhooks |
| NFR-AVAIL-03 | Planned maintenance shall be communicated to users at least 24 hours in advance |

### 8.5 Usability

| ID | Requirement |
|---|---|
| NFR-USE-01 | The platform shall be fully responsive and usable on mobile devices (minimum 375px viewport) |
| NFR-USE-02 | The user interface shall follow a consistent design system (shadcn/ui + Tailwind CSS) across all portals |
| NFR-USE-03 | All critical user journeys (registration → demand profile → product selection → checkout) shall be completable in under 10 minutes |
| NFR-USE-04 | Form validation errors shall be displayed inline and in plain language |
| NFR-USE-05 | The platform shall support English as the primary language |

---

## 9. User Roles & Permissions

### 9.1 Role Overview

| Role | Portal | Approval Required | Created By |
|---|---|---|---|
| Customer | `/dashboard`, `/customer` | No (email verification only) | Self-registration |
| Vendor | `/vendor` | Yes (Admin) | Self-registration |
| Professional Installer | `/professional` | Yes (Admin) | Self-registration |
| Delivery Partner | `/delivery` | Yes (Admin) | Self-registration |
| Admin | `/admin` | No (email whitelist) | Platform operator |
| Super-Admin | `/super-admin` | No (email whitelist) | Platform operator |

### 9.2 Detailed Permissions

#### Customer
- Register and manage account profile
- Complete energy demand profile
- Browse product catalogue and system packages
- Add items to cart and proceed to checkout
- Pay via M-Pesa, KCB Buni, Paystack, or KCB Financing
- View order history and track delivery status
- Create installation jobs and review/select professional bids
- Submit product reviews

#### Vendor
- (Requires admin approval)
- Manage product listings and system packages (create, edit, deactivate)
- Manage inventory levels
- View and update order fulfilment status
- Coordinate and monitor deliveries (live map)
- Access sales analytics and performance metrics

#### Professional Installer
- (Requires admin approval)
- Browse available installation jobs
- Submit bids with costing breakdown and proposal
- View bid outcomes and manage assigned projects
- Update project progress/status
- Manage professional profile and pricing templates

#### Delivery Partner
- (Requires admin approval)
- View assigned deliveries
- Accept or reject delivery assignments
- Update delivery status (in progress / completed)
- Transmit live GPS location
- View performance dashboard (deliveries, earnings, ratings)

#### Admin
- Review vendor, professional, and delivery partner applications
- Approve or reject applications (triggers automated emails)
- View application documents
- View admin summary dashboard

#### Super-Admin
- View platform-wide analytics and KPIs
- View vendor performance rankings
- View category and technology-level performance
- View user segmentation analysis
- View financing metrics and deployment progress

---

## 10. Process Flows / User Journeys

### 10.1 Client Onboarding & Procurement

```
Step 1 — Registration
  Client visits /register → selects client type → completes form
  → email verification sent → account activated

Step 2 — Demand Profiling
  Client completes energy demand profile:
  basic ID → location (GPS) → classification → energy use → financial indicators
  → profile saved → guides solution recommendations

Step 3 — Solution Browsing
  Client browses /products → filters by technology / budget / location
  → views complete system packages → selects preferred solution → adds to cart

Step 4 — Checkout
  Client reviews cart → enters shipping address (Kenya location fields)
  → selects payment method:
    (a) M-Pesa → STK Push → client approves on phone → callback received → order created
    (b) KCB Buni → STK Push → same flow
    (c) Paystack → redirect/inline payment → webhook → order created
    (d) KCB Financing → profile + system details sent to KCB → decision returned
        → Approved: order created automatically
        → Declined: client redirected to alternative payment

Step 5 — Order Confirmation
  Order created → confirmation page shown → confirmation email sent
  → delivery partner auto-assigned (or manually by admin)
```

### 10.2 Vendor Fulfilment & Installation

```
Step 1 — Order Received
  Vendor receives order notification → views order in /vendor/orders

Step 2 — Installation Job (if applicable)
  Customer creates installation job at /dashboard/installations/new
  → Professionals browse at /professional/jobs → submit bids
  → Customer reviews bids at /dashboard/installations → selects winning bid
  → Professional notified → job status: assigned

Step 3 — Delivery
  Delivery partner accepts assignment at /delivery
  → Updates status: in_progress
  → GPS tracked live → vendor monitors at /vendor/deliveries
  → Delivery completed → status: delivered

Step 4 — Installation & Commissioning
  Professional executes installation → updates job status: in_progress
  → Commissioning completed → status: completed
  → Order status updated to: completed

Step 5 — Review
  Customer submits product review → visible on product listing
```

### 10.3 Vendor / Professional / Delivery Partner Onboarding

```
Step 1 — Registration
  Applicant visits /register/{vendor|professional|delivery}
  → completes detailed application form
  → uploads supporting documents (optional)
  → email verification → account status: pending

Step 2 — Admin Review
  Admin receives application at /admin
  → reviews profile, credentials, documents
  → Approves: status updated → approval email sent → portal access granted
  → Rejects: status updated → rejection email sent

Step 3 — Portal Access
  Approved user logs in → redirected to role-specific portal
  → full portal features unlocked
```

### 10.4 Admin Oversight (AMAC)

```
Super-Admin monitors at /super-admin:
  → Platform KPIs (orders, revenue, users, financing)
  → Vendor performance rankings
  → Category-level deployment data
  → User segment breakdown
  → Geographic distribution of deployments
```

---

## 11. Data Requirements

### 11.1 Key Data Entities

| Entity | Key Fields | Storage |
|---|---|---|
| **Users** | id, email, role, created_at | Supabase Auth |
| **Customer Profile** | user_id, first_name, last_name, phone, customer_type, address, city, country | `customer_profiles` |
| **Demand Profile** | user_id, county, sub_county, gps_coordinates, grid_access, user_type, facility_type, monthly_kwh, cooking_fuel, monthly_spend, willingness_to_finance | `customer_program_profiles` (JSON) |
| **Vendor Application** | user_id, company_name, contact_person, email, phone, business_type, tax_id, bank_details, status, documents | `vendor_applications` |
| **Professional Application** | user_id, company_name, professional_type, license_number, epra_license, status, documents | `professional_applications` |
| **Delivery Application** | user_id, first_name, last_name, national_id, driver_license, vehicle_type, vehicle_registration, bank_details, status | `delivery_applications` |
| **Product** | id, vendor_id, category_id, name, sku, price, inventory_quantity, status, specifications, warranty_info | `products` |
| **Product Category** | id, name, slug, parent_id, is_active | `product_categories` |
| **Product Image** | id, product_id, image_url, is_primary, sort_order | `product_images` |
| **Product Package** | id, vendor_id, name, description, price, status | `product_packages` |
| **Cart Item** | product_id, name, price, quantity, stock | Client-side + `cart_items` |
| **Order** | id, customer_id, order_number, status, payment_status, payment_method, financing_status, subtotal, tax, shipping, total, shipping_address | `orders` |
| **Order Item** | id, order_id, product_id, vendor_id, quantity, unit_price, total_price | `order_items` |
| **Order Status History** | id, order_id, status, notes, created_by, created_at | `order_status_history` |
| **Installation Job** | id, customer_id, title, location, gps_coordinates, urgency, status, selected_bid_id | `installation_jobs` |
| **Installation Bid** | id, job_id, professional_id, labour_cost, materials_cost, total_bid_amount, duration_hours, status | `installation_bids` |
| **Delivery** | id, order_id, delivery_partner_id, status, gps_coordinates, battery_level, heading | `deliveries` |
| **Product Review** | id, product_id, customer_id, rating, body, created_at | `product_reviews` |

### 11.2 Data Sources

| Source | Type | Usage |
|---|---|---|
| Client registration forms | User input | Identity, contact, classification |
| GPS device API | Device sensor | Location coordinates for demand profiling and delivery tracking |
| Supabase Auth | System | User identity and session management |
| Supabase Storage | File store | Document uploads (vendor credentials, professional licenses) |
| KCB Financing API | External API | Financing decisions |
| M-Pesa Daraja API | External API | Payment status callbacks |
| KCB Buni API | External API | Payment status callbacks |
| Paystack API | External API | Payment status callbacks |

### 11.3 Data Storage Considerations

- All production data stored in Supabase (PostgreSQL, hosted on supabase.io)
- Row-level security (RLS) policies enforce data isolation between users
- Demand profiles stored as flexible JSON to allow future field additions without schema migration
- Payment credentials stored exclusively as server-side environment variables
- Documents stored in Supabase Storage with access-controlled bucket policies
- GPS coordinates stored with full decimal precision (latitude/longitude)

---

## 12. Integration Requirements

### 12.1 Payment Integrations

| System | Integration Type | Purpose | Key Endpoints |
|---|---|---|---|
| **M-Pesa Daraja (Safaricom)** | REST API (OAuth + STK Push) | Primary mobile money payment | `/api/mpesa/checkout`, `/api/mpesa/callback` |
| **KCB Buni** | REST API (OAuth + STK Push) | Secondary mobile money payment | `/api/kcb-buni/checkout`, `/api/kcb-buni/callback` |
| **Paystack** | REST API | Card / international payments | `/api/paystack/initialize`, `/api/paystack/verify`, `/api/paystack/callback` |
| **KCB Financing** | REST API | Embedded BNPL financing | `/api/kcb-financing/apply`, `/api/kcb-financing/callback` |

**Phone number normalisation** is applied uniformly across M-Pesa and KCB Buni integrations, supporting formats: `07XXXXXXXX`, `+254XXXXXXXXX`, `254XXXXXXXXX` → normalised to `254XXXXXXXXX`.

### 12.2 Infrastructure Integrations

| System | Purpose |
|---|---|
| **Supabase** | PostgreSQL database, Supabase Auth (JWT), File Storage |
| **Resend** | Transactional email delivery (approvals, rejections, order events) |
| **Leaflet.js** | Client-side GPS mapping for delivery tracking and location capture |

### 12.3 Future Integrations (Planned)

| System | Purpose |
|---|---|
| IoT / Smart Meter API | Real-time energy generation and consumption monitoring per deployed system |
| EPRA API | Automated verification of vendor and professional licences |
| KRA e-Invoice | Statutory tax invoice generation |
| Third-party logistics | Courier integrations for formal last-mile delivery |

---

## 13. Constraints

### 13.1 Technical Constraints

- The platform is a web application only; no native mobile app is included in this version
- The M-Pesa callback URL must be a publicly accessible HTTPS endpoint; local development requires a tunnel (e.g., ngrok)
- The KCB Buni and KCB Financing APIs require active credentials provisioned by KCB; simulation modes are available for development
- Supabase free tier has connection and storage limits; production deployment requires a paid Supabase plan
- The platform is built on Next.js App Router (v16); any server-side changes must be compatible with this architecture

### 13.2 Regulatory Constraints

- All payment processing must comply with CBK (Central Bank of Kenya) regulations
- Vendor and professional onboarding must verify EPRA licensing where applicable
- KCB financing workflows must comply with CMA and CBK lending regulations
- Data privacy must comply with Kenya's Data Protection Act (2019)
- VAT at 16% must be applied to all taxable transactions

### 13.3 Business Constraints

- Only AMAC-approved vendors may list products on the platform
- All system packages must meet AMAC's minimum quality and compliance standards before activation
- KCB is the sole financing partner in the current programme phase
- The platform operates in KES only; multi-currency support is out of scope
- Admin access is limited to AMAC staff via email whitelist

---

## 14. Risks & Mitigation

| # | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| R-01 | M-Pesa callback URL inaccessible due to hosting misconfiguration | Medium | High | Use a dedicated, stable public HTTPS endpoint; implement callback retry logic; test thoroughly in staging |
| R-02 | KCB Financing API unavailability delays order processing | Medium | High | Simulation mode provides fallback for demo/UAT; orders can be processed via direct payment as alternative |
| R-03 | Vendor uploads non-compliant or fraudulent product listings | Medium | High | Admin approval gate before vendor activation; ongoing listing review |
| R-04 | GPS location services unavailable on client devices | High | Medium | Allow manual address entry and map-based coordinate selection as fallback |
| R-05 | Low professional installer coverage in target geographies | Medium | High | Allow customers to proceed with vendor-supplied installation (vendors are also installers per spec); expand professional onboarding |
| R-06 | Data breach exposing client personal/financial data | Low | Critical | Supabase RLS, server-side credential storage, HTTPS enforcement, regular security audits |
| R-07 | Poor mobile performance on low-end devices | High | High | Responsive design, image optimisation, code splitting, Lighthouse performance audits |
| R-08 | Admin email whitelist creates single point of failure | Low | High | Document admin credentials; provide a process for adding emergency admin access |
| R-09 | Supabase service outage | Low | Critical | Monitor Supabase status; implement graceful error handling; maintain export/backup schedule |
| R-10 | KCB Buni token expiry causing payment failures | Medium | High | Token caching with 90% expiry threshold and automatic refresh already implemented |
| R-11 | Vendor non-compliance with installation standards | Medium | High | AMAC monitoring via order stages; client review system; professional installer separation of duties |
| R-12 | Scope creep in demand profile or analytics features | High | Medium | Strict change control; feature flags for gradual rollout |

---

## 15. Success Metrics (KPIs)

### 15.1 Platform Adoption

| KPI | Definition | Target (12 months) |
|---|---|---|
| Registered Clients | Total verified client accounts | 500+ |
| Completed Demand Profiles | Clients with full energy demand profiles | 70% of registered clients |
| Approved Vendors | Vendors with active listings | 20+ |
| Approved Professional Installers | Active professional accounts | 30+ |
| Approved Delivery Partners | Active delivery accounts | 15+ |

### 15.2 Commercial Performance

| KPI | Definition | Target |
|---|---|---|
| Orders Placed | Total orders created | 300+ (year 1) |
| Order Completion Rate | Orders delivered/completed ÷ orders placed | ≥ 85% |
| Gross Merchandise Value (GMV) | Total value of completed orders | KES 50M+ (year 1) |
| Average Order Value | GMV ÷ completed orders | KES 150,000+ |
| Repeat Purchase Rate | Clients with 2+ orders | ≥ 20% |

### 15.3 Financing

| KPI | Definition | Target |
|---|---|---|
| Financing Applications | Total KCB financing requests | 100+ (year 1) |
| Financing Approval Rate | Approved ÷ submitted | ≥ 60% |
| Financed GMV | Total value of KCB-financed orders | KES 20M+ (year 1) |

### 15.4 Impact

| KPI | Definition | Target |
|---|---|---|
| Systems Deployed | Completed installations by technology type | 200+ (year 1) |
| Geographic Coverage | Counties with at least 1 completed installation | 15+ counties |
| Institutions Served | Institutional clients with completed orders | 50+ |
| SMEs Served | SME clients with completed orders | 100+ |

### 15.5 Operational

| KPI | Definition | Target |
|---|---|---|
| Application Review Time | Time from submission to admin decision | ≤ 48 hours |
| Checkout Completion Rate | Checkouts completed ÷ initiated | ≥ 70% |
| Delivery Completion Rate | Deliveries completed ÷ assigned | ≥ 90% |
| Installation Bid Acceptance Rate | Jobs with accepted bids ÷ jobs created | ≥ 75% |
| Platform Uptime | % availability in a calendar month | ≥ 99.5% |

---

## 16. Acceptance Criteria

### 16.1 Functional Acceptance

The system shall be accepted when all of the following conditions are met:

| # | Acceptance Criterion |
|---|---|
| AC-01 | A new client can register, verify their email, complete a demand profile, browse products, add to cart, and complete an order via M-Pesa STK Push without error |
| AC-02 | A new client can complete an order using KCB Financing, receive an approval decision, and have the order automatically advanced to fulfilment |
| AC-03 | A vendor can register, receive admin approval, log in, create a product listing with images and inventory, and have it appear in the public catalogue |
| AC-04 | A professional installer can register, receive admin approval, browse open jobs, submit a bid, and be notified when selected |
| AC-05 | A delivery partner can register, receive admin approval, accept a delivery, transmit live GPS location, and mark the delivery as completed |
| AC-06 | An admin can log in, review a pending vendor application with documents, approve it, and the vendor receives an automated email with portal access |
| AC-07 | The super-admin dashboard displays accurate platform-wide metrics for orders, revenue, vendors, and users |
| AC-08 | The demand profile wizard captures all required fields (basic ID, GPS location, energy use, willingness to finance) and saves them to the database |
| AC-09 | All four payment methods (M-Pesa, KCB Buni, Paystack, Bank Transfer) are selectable at checkout and process without system errors |
| AC-10 | Order status history correctly logs every state change with timestamp and actor |

### 16.2 Non-Functional Acceptance

| # | Acceptance Criterion |
|---|---|
| AC-11 | Public product catalogue page loads in under 3 seconds on a 4G connection (measured via Lighthouse) |
| AC-12 | The platform is fully usable on a 375px viewport mobile browser (iOS Safari and Android Chrome) |
| AC-13 | All protected routes (vendor, professional, delivery, admin portals) return 401/redirect for unauthenticated or unauthorised users |
| AC-14 | Payment credentials are not exposed in browser network requests or client-side JavaScript |
| AC-15 | UAT is completed by AMAC's business team across all user journeys with zero critical defects open at sign-off |

### 16.3 Sign-Off Conditions

The platform shall be considered accepted and ready for production launch when:

1. All AC-01 through AC-15 criteria are verified and signed off by the AMAC Business Analyst and Programme Lead
2. A full UAT cycle has been completed with representative users from each role (client, vendor, professional, delivery, admin)
3. Load testing confirms the platform supports 500 concurrent users without degradation
4. A security review confirms no OWASP Top 10 vulnerabilities are present
5. All critical and high-severity defects identified during UAT are resolved and re-tested
6. The production environment (Supabase, hosting, payment credentials, SMTP) is fully configured and verified

---

*Document prepared for internal use by the AMAC Green programme team. For questions or change requests, contact the AMAC Green Development Team.*

*Version 1.0 — April 2026*
