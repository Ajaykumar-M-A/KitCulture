========================================================================
KIT CULTURE - FULL-STACK ONLINE FOOTBALL JERSEY STORE
========================================================================
Theme: Clean White Background, Mobile-Responsive, Sports Typography
Stack: React 18 (Vite + Tailwind) + Python DRF + PostgreSQL (with SQLite fallback)
Image Upload: Drag & Drop File Upload + Dual Compression (HTML5 Canvas + Pillow WebP)
Auth: JSON Web Token (SimpleJWT) Role-Based Admin Authentication
Payments: Razorpay Demo Integration (Key: rzp_test_KitCultureDemoKey)
Admin: Dedicated Private Route for Admin CRUD Management (/admin, /admin-portal)
DevOps: Docker, Docker Compose, GitHub Actions CI/CD Pipeline

------------------------------------------------------------------------
IMAGE UPLOAD & COMPRESSION PIPELINE:
------------------------------------------------------------------------
When adding or editing jerseys in the Admin Modal:
1. Admins drag & drop or click to upload photo files directly from their device.
2. Client-Side Compression (HTML5 Canvas) instantly compresses large 5MB-10MB
   camera photos to responsive WebP before upload.
3. Server-Side Multipart Handler (POST /api/upload/) processes the file with Pillow,
   optimizes quality/dimensions, saves to /media/jerseys/, and returns the media URL.
4. The generated media URL is automatically saved into the Jersey record in the database!
5. Admins can also toggle to paste an external URL if preferred.

------------------------------------------------------------------------
RUNNING OPTIONS:
------------------------------------------------------------------------

### OPTION 1: DOCKER COMPOSE (FULL STACK + POSTGRESQL)
  docker compose up --build

-> Customer Storefront:  http://localhost/ (or http://localhost:5173/)
-> Private Admin Portal: http://localhost/admin (or http://localhost/admin-portal)
-> Backend API:          http://localhost:8000/api/

---

### OPTION 2: 1-CLICK BATCH SCRIPT (WINDOWS LOCAL DEV)
Double-click:
  start_dev.bat

---

### OPTION 3: MANUAL COMMANDS

=== TERMINAL 1 (BACKEND): ===
  cd backend
  python -m pip install -r requirements.txt
  python manage.py migrate
  python manage.py seed_jerseys
  python manage.py test store
  python manage.py runserver 8000

=== TERMINAL 2 (FRONTEND): ===
  cd frontend
  npm install
  npm run dev

------------------------------------------------------------------------
ADMIN ACCESS (SEPARATE ROUTE):
------------------------------------------------------------------------
Admin Setup URL: http://localhost:5173/admin or /admin-portal
Pre-seeded Credentials:
  * Username: admin
  * Password: admin123
========================================================================
