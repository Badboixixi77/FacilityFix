# FacilityFix 🔧
> **"Track, assign, and resolve facility maintenance requests from one professional unified dashboard."**

FacilityFix is an enterprise-grade B2B full-stack Maintenance Request & Facility Management SaaS built for apartments, offices, hotels, hospitals, schools, and warehouse/factory properties. 

This production-quality MVP solves critical real-world challenges: preventing lost maintenance complaints, speeding up resolution times, monitoring SLA targets, routing work order assignments, tracking repair history, and generating real-time analytics.

---

## 🚀 Tech Stack

- **Frontend**: Next.js 14 App Router, React, TypeScript, Tailwind CSS
- **Backend**: Next.js Server Actions, REST-like API routes, Prisma ORM
- **Database**: SQLite (local development), PostgreSQL (production-ready)
- **Authentication**: Custom JWT Cookie-based stateless sessions, Bcryptjs password hashing, Role-Based Access Control (RBAC)
- **Other tools**: Zod (schema validation), Lucide React (visual symbols), date-fns

---

## 🛠️ Main Modules & Features

1. **Investor-Ready Landing Page**: Fully responsive layout detailing the problem, solution, pricing matrices, sector distribution, and direct quick-start calls-to-action.
2. **Role-Based Access Control**: Highly tailored dashboards for five distinct roles:
   - `SUPER_ADMIN`: Overall platform controller.
   - `ORG_ADMIN`: Organization owner. Can oversee staff, configurations, buildings, and reports.
   - `FACILITY_MANAGER`: General maintenance supervisor. Can assign technicians, adjust priority, and change state.
   - `TECHNICIAN`: Field technician. Can view assigned queue, comment, log notes, and upload visual completions.
   - `REQUESTER`: Tenants, residents, or staff. Can submit issues, track progress, comment, and confirm resolutions.
3. **Public Submission Portal**: Allows residents/employees to submit tickets without signing in or accessing the admin panel (via dynamic tenant slug: `/request/[organizationSlug]`).
4. **Interactive Request Workflows**: Real-time status states:
   `OPEN` ➜ `ASSIGNED` ➜ `IN_PROGRESS` ➜ `ON_HOLD` ➜ `RESOLVED` ➜ `CONFIRMED` / `CANCELLED`
5. **Automated SLA Targets**: Auto-calculates deadlines based on priority standards:
   - `LOW`: Due in 7 Days (e.g. general janitorial, minor drywalls)
   - `MEDIUM`: Due in 3 Days (e.g. faulty smart door lock, slower drain)
   - `HIGH`: Due in 24 Hours (e.g. elevator scraping, room AC outage)
   - `URGENT`: Due in 4 Hours (e.g. telecom router offline, main pipeline flooding)
6. **Detailed Audit Trails**: Keeps an immutable timeline log of every single change (technician routed, priority bumped, comment submitted, photo uploaded).
7. **Breathtaking Reports & Analytics**: Live dynamic query board summarizing category frequencies, active SLA breach countdowns, technician performance speeds, and problematic buildings.

---

## 🔑 Preconfigured Demo Accounts

For convenient evaluation, the local database has been seeded with a premium mock organization named **Metro Heights Facility** and four preconfigured user roles (password for all seeded accounts is **`admin123`** / **`manager123`** / **`tech123`** / **`tenant123`** respectively, or simply click any of the "Demo Accounts" quick-fill cards on the login page!):

| Role | Username / Name | Email | Password |
|---|---|---|---|
| **Org Admin** | Admin User | `admin@facilityfix.com` | `admin123` |
| **Facility Manager** | Manager User | `manager@facilityfix.com` | `manager123` |
| **Technician** | Tech User | `tech@facilityfix.com` | `tech123` |
| **Requester / Tenant** | Tenant User | `tenant@facilityfix.com` | `tenant123` |

---

## 💻 Local Setup & Quickstart

Follow these simple steps to run FacilityFix on your machine:

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
*(The local database URL is preconfigured to write a `dev.db` file in your root folder using SQLite).*

### 3. Sync Database & Generate Client
Generate your Prisma client types and synchronize the local SQLite schema:
```bash
npx prisma db push
```

### 4. Seed Seed Data
Populate the database with the preconfigured "Metro Heights Facility" workspace, including buildings, locations, technicians, and multiple sample tickets:
```bash
node prisma/seed.js
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the landing page. Click **"Explore Seeded Demo"** to log in instantly.

---

## 🏗️ Folder Structure

```text
/home/user/
├── prisma/
│   ├── schema.prisma   # DB entities
│   ├── seed.js         # Core database seeder
│   └── dev.db          # SQLite local data store
├── src/
│   ├── actions/        # Next.js Server Actions (Auth, CRUD, Workflows)
│   ├── app/            # App Router Pages & Forms
│   ├── components/     # Reusable Sidebar, Layouts, and UI modules
│   └── lib/            # Shared DB instance, JWT Auth session helpers
├── package.json
└── README.md
```

---

## ☁️ Production Deployment (PostgreSQL)

FacilityFix is fully production-ready and configured to use standard PostgreSQL in cloud environments (Neon, Supabase, Railway, Render).

### 1. Switch Prisma Provider
In `/prisma/schema.prisma`, adjust the `db` block to target PostgreSQL:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Environment Settings
In your deployment environment (e.g. Vercel, Railway), configure these variables:
- `DATABASE_URL`: Your production PostgreSQL connection string (with pooled connection if using serverless).
- `JWT_SECRET`: A secure randomly-generated string to encrypt cookies.
- `NODE_ENV`: Set to `"production"`.

### 3. Build & Run
Run the standard NextJS build command:
```bash
npm run build
```
Vercel will build the project dynamically and optimize all Server Actions automatically.
