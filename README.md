# ITMS — Internal Ticket Management System

A standalone, self-hosted web application for managing internal IT support tickets.

**Stack:** Next.js 14 · TypeScript · Tailwind CSS · Prisma · NextAuth.js · TanStack Query

**Database Support:** SQL Server | PostgreSQL | MySQL (configurable)

---

## Features

- **Dashboard** — Real-time stats, 7-day trend chart, SLA breach tracking
- **Ticket Management** — Create, assign, update, filter, search
- **Comment System** — Public + internal notes with role-based visibility
- **Knowledge Base** — Searchable solution articles
- **SLA Tracking** — Auto-calculated due dates per priority
- **Audit Trail** — Every status/priority/assignee change logged
- **Role-based Access** — Admin, Agent, User roles
- **Smooth UI** — Framer Motion animations, responsive design

---

## Quick Start (5 minutes)

### Prerequisites

| Software | Version | Download |
|----------|---------|----------|
| Node.js | 20.x LTS | https://nodejs.org |
| Git | Any | https://git-scm.com |
| Database (pick one) | See below | See below |

### Step 1: Clone and Install

```bash
git clone <your-repo-url> itms
cd itms
npm install
```

### Step 2: Choose Your Database

```bash
npm run db:use -- postgresql    # OR mssql OR mysql
```

### Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` — set DATABASE_URL and NEXTAUTH_SECRET.

**PostgreSQL:**
```
DATABASE_URL="postgresql://itms_user:your_password@localhost:5432/itms?schema=public"
```

**SQL Server:**
```
DATABASE_URL="sqlserver://localhost:1433;database=ITMS;user=sa;password=YourPass123;encrypt=false;trustServerCertificate=true"
```

**MySQL:**
```
DATABASE_URL="mysql://itms_user:your_password@localhost:3306/itms"
```

### Step 4: Create Database

Create the database in your chosen server (itms for PG/MySQL, ITMS for MSSQL).

### Step 5: Migrate and Seed

```bash
npm run db:generate
npm run db:setup
```

### Step 6: Start

```bash
npm run dev
```

Open **http://localhost:3000** — login with **admin / Admin@123**

---

## Default Logins

| Username | Password | Role |
|----------|----------|------|
| admin | Admin@123 | Admin |
| rahul | Agent@123 | Agent |
| priya | Agent@123 | Agent |
| amit | User@123 | User |
| neha | User@123 | User |

---

## Switching Databases

```bash
npm run db:use -- mssql          # Switch to MSSQL
# Update DATABASE_URL in .env
npm run db:generate
npm run db:setup
```

---

## Production Deployment

### PM2 (Windows or Linux)

```bash
npm ci --production && npm run db:generate && npm run build
pm2 start npm --name "itms" -- start
pm2 save && pm2 startup
```

### Docker

```bash
npm run db:use -- postgresql
docker-compose --profile postgres up -d
docker-compose up -d app
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run db:use -- <db>` | Switch database provider |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:setup` | Migrate + seed |
| `npm run db:studio` | Prisma Studio GUI |

---

## License

Internal use only.
