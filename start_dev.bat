@echo off
echo ========================================================
echo        KIT CULTURE - AUTHENTIC FOOTBALL STORE
echo ========================================================
echo.
echo Starting Django REST Framework Backend on http://127.0.0.1:8000 ...
start "Kit Culture DRF Backend" cmd /k "cd backend && python manage.py runserver 8000"

echo Starting Vite React Frontend on http://localhost:5173 ...
start "Kit Culture React Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are launching!
echo Frontend: http://localhost:5173
echo Backend API: http://127.0.0.1:8000/api/
echo Admin Dashboard: http://localhost:5173/admin
echo Django Admin: http://127.0.0.1:8000/admin (User: admin / Pass: admin123)
echo.
pause
