#!/bin/sh
set -e

echo "Waiting for PostgreSQL database to be ready..."
if [ "$USE_POSTGRES" = "True" ] || [ "$USE_POSTGRES" = "true" ]; then
    while ! nc -z $DB_HOST $DB_PORT; do
      sleep 1
    done
    echo "PostgreSQL is online and reachable!"
fi

echo "Applying Django migrations..."
python manage.py migrate --noinput

echo "Seeding initial Kit Culture inventory and superuser..."
python manage.py seed_jerseys
python manage.py shell -c "from django.contrib.auth.models import User; User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@kitculture.com', 'admin123')"

echo "Starting Gunicorn application server on 0.0.0.0:8000..."
exec gunicorn kitculture_backend.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120
