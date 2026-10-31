========================================================================
KIT CULTURE - FRONTEND (REACT + VITE + TAILWIND CSS + JWT AUTH)
========================================================================

PREREQUISITES:
- Node.js (v18 or higher)
- npm (Node Package Manager)

------------------------------------------------------------------------
COMMANDS FOR RUNNING THE FRONTEND:
------------------------------------------------------------------------

1. Open your terminal / command prompt and navigate to the frontend directory:
   cd frontend

2. Install dependencies:
   npm install

3. START THE DEVELOPMENT SERVER:
   npm run dev

   Frontend will run at:
   http://localhost:5173/

4. Build for production:
   npm run build

------------------------------------------------------------------------
ADMIN DASHBOARD & JWT AUTHENTICATION:
------------------------------------------------------------------------
- Route: http://localhost:5173/admin
- If not signed in:
  * Secure Admin Login Portal is presented
  * Enter username: admin and password: admin123
  * Or click "Fill Default Demo Credentials" for 1-click autofill
  * Generates and stores JWT tokens in localStorage
- Once signed in:
  * Profile pill shows "Admin (admin)" with superuser badge
  * Full access to Jersey Inventory CRUD:
    - Add New Jersey (modal form)
    - Edit Jersey (prefilled modal)
    - Delete Jersey (confirmation dialog)
    - Quick Stock +/- buttons
  * Access to Recent Orders table and Razorpay gateway config
  * 1-Click Logout button clears JWT session securely
========================================================================
