# 🏆 KIT CULTURE — Full-Stack Football Jersey Store

> *"Wear Your Passion. Live The Culture."*  
> *"Crafted for champions, worn by culture. More than fabric — it's football heritage."*

Kit Culture is an end-to-end, production-grade e-commerce platform for football shirts and retro grails. Built with **React 18**, **Python Django REST Framework (DRF)**, **PostgreSQL**, **JWT Authentication (SimpleJWT)**, **Docker & Docker Compose**, **GitHub Actions CI/CD**, a clean **standard white background aesthetic**, and a **Razorpay Payment Gateway Demo**.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, React Router v6, Canvas Confetti
- **Backend**: Python 3.11, Django 5 / 4.1.5, Django REST Framework, SimpleJWT, django-cors-headers, Gunicorn
- **Database**: PostgreSQL 16 (Configured with graceful local SQLite fallback)
- **Authentication**: JWT (JSON Web Tokens) with HS256 algorithm and token rotation
- **Payments**: Razorpay Demo Gateway (Key: `rzp_test_KitCultureDemoKey`, HMAC-SHA256 signature verification)
- **Containerization**: Docker multi-stage builds & Docker Compose orchestration
- **CI/CD**: GitHub Actions automated pipeline for testing, linting, Docker build verification, and deployment

---

## 🔐 Admin Authentication & CRUD Authorization

1. **JWT Endpoints**:
   - `POST /api/auth/token/`: Generates `access` and `refresh` tokens + user profile.
   - `POST /api/auth/token/refresh/`: Refreshes expired access tokens.
   - `GET /api/auth/me/`: Returns current user identity and staff admin status.
2. **Access Control**:
   - **Public (Read Only)**: Store visitors can browse catalog, view jersey details, and place checkout orders.
   - **Staff Admin Only (JWT Protected)**: Creating (`POST`), editing (`PUT/PATCH`), and deleting (`DELETE`) jerseys, managing categories, and viewing revenue KPIs requires an authenticated Admin JWT.
3. **Admin Portal UI (`/admin`)**:
   - High-contrast white theme login portal.
   - Quick **"Fill Default Demo Credentials"** (`admin` / `admin123`) button for instant testing.
   - Dynamic user badge (*"Admin (admin) - Superuser"*), Logout action, and complete CRUD modals with inline stock steppers.

---

## 🐳 Docker & Docker Compose Setup

Run the entire multi-service stack (**PostgreSQL**, **Django DRF**, **React Frontend with Nginx**) in one command:

```bash
docker compose up --build
```

- **Frontend (Nginx Reverse Proxy)**: `http://localhost/` or `http://localhost:5173/`
- **Backend API**: `http://localhost:8000/api/`
- **PostgreSQL Database**: Port `5432` with volume persistence `kitculture_postgres_data`
- **Admin Login**: `http://localhost/admin` (`admin` / `admin123`)

To stop all containers:
```bash
docker compose down
```

---

## 🚀 Local Development (Without Docker)

### Option A: 1-Click Launch (Windows)
Double-click `start_dev.bat` in the project root.

### Option B: Manual Command Line

**1. Start Backend:**
```powershell
cd backend
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py seed_jerseys
python manage.py test store
python manage.py runserver 8000
```
- API Base: `http://127.0.0.1:8000/api/`
- Admin Superuser: `admin` / `admin123`

**2. Start Frontend:**
```powershell
cd frontend
npm install
npm run dev
```
- Storefront: `http://localhost:5173/`
- Admin Dashboard: `http://localhost:5173/admin`

---

## 🔄 CI/CD Pipeline (GitHub Actions)

Located at [`.github/workflows/ci-cd.yml`](file:///.github/workflows/ci-cd.yml):

1. **`backend-ci`**: Sets up Python 3.11 + PostgreSQL service container, runs Django system checks, executes migrations, seeds data, and runs unit tests.
2. **`frontend-ci`**: Sets up Node 20, installs npm dependencies, and runs `npm run build` with Vite.
3. **`docker-ci`**: Validates `docker compose config` syntax and builds both Backend and Frontend container images.
4. **`cd-deploy`**: Automates zero-downtime deployment simulation on pushes to `main` or `master`.

---

## 📄 Documentation Files

- [`README.txt`](file:///README.txt) — Global overview, commands, and credentials.
- [`backend/README.txt`](file:///backend/README.txt) — DRF backend guide, JWT token endpoints, and PostgreSQL setup.
- [`frontend/README.txt`](file:///frontend/README.txt) — React Vite frontend commands, routes, and admin instructions.
