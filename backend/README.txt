========================================================================
KIT CULTURE - BACKEND (PYTHON DRF + POSTGRESQL + JWT AUTH + IMAGE UPLOAD)
========================================================================

PREREQUISITES:
- Python 3.10+ (Python 3.11 recommended)
- PostgreSQL (Optional: SQLite auto-fallback enabled if Postgres is not running)

------------------------------------------------------------------------
IMAGE UPLOAD & COMPRESSION ENDPOINT:
------------------------------------------------------------------------
- Route: POST http://127.0.0.1:8000/api/upload/
- Content-Type: multipart/form-data
- Auth: Requires Bearer <admin_jwt>
- Form Field: "image" or "file" (Accepts PNG, JPG, JPEG, WEBP)
- Image Processing:
  * Automatically fixes camera EXIF orientation
  * Compresses and scales to optimal high-resolution dimensions (max 1600x2000)
  * Converts to ultra-efficient WebP format using Pillow
  * Saves to backend /media/jerseys/
  * Returns JSON payload:
    {
      "url": "/media/jerseys/jersey_4f2b918a2c10.webp",
      "absolute_url": "http://127.0.0.1:8000/media/jerseys/jersey_4f2b918a2c10.webp",
      "original_size_kb": 1850.4,
      "compressed_size_kb": 142.1,
      "savings": "92.3%"
    }
- The returned "url" is then saved directly into the Jersey model in the database!

------------------------------------------------------------------------
COMMANDS FOR RUNNING THE BACKEND LOCALLY:
------------------------------------------------------------------------
1. cd backend
2. python -m pip install -r requirements.txt
3. python manage.py migrate
4. python manage.py seed_jerseys
5. python manage.py test store
6. python manage.py runserver 8000

Superuser Credentials:
- Username: admin
- Password: admin123
========================================================================
