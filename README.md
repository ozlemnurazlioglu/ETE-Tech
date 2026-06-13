# ETE Technology - Full-Stack Management System Assignment

This project is a comprehensive, production-grade management panel built with **React**, **TypeScript**, **Ant Design (Antd v5)**, **Node.js (Express)**, and **Sequelize ORM** backed by a remote **PostgreSQL database (hosted on Supabase)**. The entire application is containerized using **Docker** for a single-command local setup.

---

## Key Achievements & Features Sourced

### Full-Suite Test Coverage - 23 Cases
While writing extensive tests wasn't strictly required, we implemented a full **unit and integration test suite** utilizing **Jest** and **Supertest**. Testing features mock database models to run isolated from Supabase in less than **4 seconds**!
We have covered 4 main modules with a total of **23 rigorous test cases**:
- **Auth (`auth.test.ts`):** Validates successful register/login, minimum character requirements, password hashing, and duplicate username protections. (6 tests)
- **Companies (`company.test.ts`):** Verifies unauthorized blockings, pagination lists, searching, individual company details, creating records, avoiding duplicate legal numbers, updating, and cascading deletes. (9 tests)
- **Products (`product.test.ts`):** Checks listing parameters, individual records, creating new products linked with a valid company, blocking invalid manufacturer entries, updating, and deleting records. (7 tests)
- **Dashboard (`dashboard.test.ts`):** Assures overall metrics format, latest records lists, and data charts structure consistency. (1 test)

### Auto-Seeder Database Script (`seed.ts`)
We created a custom seeding script that automatically populates the remote Supabase database with realistic mock data:
- **Default Admin Account:** 
  - **Username:** `admin`
  - **Password:** `admin123`
- **Companies:** 5 real-world inspired companies (TechNova, Global Logistics, Green Energy, etc.) with unique website domains and legal numbers.
- **Products:** 10 relational products spanning multiple categories (Hardware, Software, Energy, Logistics, etc.) with dynamic quantities and units linked automatically to the generated companies.

### Standard & Bonus Features Included
1. **JWT & Bcrypt Security:** All user passwords are safely hashed with `bcryptjs`. Endpoints (except login/register) are locked behind custom `authenticateToken` JWT middleware.
2. **Server-Side Operations (Scale Ready):** Sorting, searching, pagination, and dropdown filtering are executed **server-side (SQL database layer)** rather than client-side array slicing, making the application production-scale ready.
3. **Beautiful Recharts Analytics:** The dashboard displays real-time interactive **Bar Charts** (Product count by categories) and **Pie Charts** (Total amount split by categories) that update dynamically as companies/products are added or removed.
4. **Cascade Deletes:** Deleting a company automatically cascades on the database level, securely erasing all related products and preventing database clutter.

---

## 🛠️ Tech Stack

- **Frontend:** React (v18), TypeScript, Vite, Ant Design (Antd v5), Recharts, Axios, React Router (v6).
- **Backend:** Node.js, Express, TypeScript, Sequelize, pg (PostgreSQL), jsonwebtoken, bcryptjs, Jest, Supertest.
- **Database:** PostgreSQL (Hosted on Supabase).
- **Infrastructure:** Docker, Docker-Compose, Nginx.

---

## 📋 Prerequisites

Before running the application, make sure you have:
1. **Docker & Docker-Compose** installed on your machine.
2. (Optional for local manual run) **Node.js (v18+)** and **npm** installed.

---

## ⚙️ Configuration (.env Setup)

Create a `.env` file in the **root** folder (or rename `.env.example`).

```env
# Database Configuration (Supabase PostgreSQL Connection Details)
DB_HOST=aws-1-ap-south-1.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.ofbjpqxdgbrfkzbatmsq
DB_PASSWORD=FHg52QftW3NOjOZp

# JWT Authentication Configuration
JWT_SECRET=super_secret_jwt_key_ete_tech_123!
```

---

## 🐳 Running with Docker (Recommended)

To spin up both the Frontend (Port 3000) and Backend (Port 5000) with a single command:

```bash
# Start containers and compile images in background
docker-compose up -d --build
```

- **Frontend (UI):** [http://localhost:3000](http://localhost:3000)
- **Backend (API):** [http://localhost:5000](http://localhost:5000)

### 🌱 Populating Mock Data (Seeding)
To run our automated seeding script inside the backend container and add our standard companies/products and the admin user:
```bash
docker-compose exec backend sh -c "npx ts-node src/seed.ts"
```
*You can now log in with:*
- **Username:** `admin`
- **Password:** `admin123`

### 🧪 Executing Tests inside Docker
To run all 23 unit & integration test suites inside the secure container environment:
```bash
docker-compose exec backend npm test
```

To stop all containers:
```bash
docker-compose down
```

---

## 💻 Running Locally (Manual Mode)

If you prefer to run services manually on your host machine:

### 1. Backend API
```bash
cd backend
npm install
# Create a local '.env' inside 'backend/' folder based on '.env.example'
npm run dev
```
*Backend will run on [http://localhost:5000](http://localhost:5000)*.

To run tests locally:
```bash
npm test
```

### 2. Frontend UI
```bash
cd frontend
npm install
npm run dev
```
*Frontend UI will run on [http://localhost:3000](http://localhost:3000)*.

---

## 📐 Architectural Decisions & Code Quality

- **Layered Controller-Route Pattern:** The backend decouples router definitions from the actual controller business logic and sequelize schema structures, aligning with Clean Architecture.
- **TypeScript Throughout:** Absolute type safety from frontend requests to backend models.
- **Axios Interceptor Pattern:** A custom Axios instance (`frontend/src/api/api.ts`) automatically intercepts outgoing requests to inject the JWT Bearer Token, and handles expired tokens (401/403) by clearing localStorage and pushing to `/login`.
- **Database Schema Sync:** On API startup, Sequelize automatically synchronizes model schemas with Supabase utilizing `sequelize.sync()`.
- **Nginx Reverse Proxy in Docker:** In production mode, the React application is built into optimized static chunks and served via Nginx. Nginx is configured to handle frontend route refreshes gracefully and reverse proxy any `/api/*` requests directly to the Express server.
- **Relational Integrity:** Cascade deleting on company deletion ensures perfect data consistency without orphan products.
