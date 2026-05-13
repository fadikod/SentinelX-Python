import os
import sys

# Add backend to path so Django can find its modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sentinelx.settings')

import django
django.setup()

# Run migrations on cold start (SQLite lives in /tmp on Vercel)
db_path = os.environ.get('DB_PATH', '/tmp/db.sqlite3')
if not os.path.exists(db_path):
    from django.core.management import call_command
    try:
        call_command('migrate', '--run-syncdb', verbosity=0)
    except Exception:
        pass

from sentinelx.wsgi import application as app
