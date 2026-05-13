import os
import sys

# Add backend to path so Django can find its modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sentinelx.settings')
os.environ.setdefault('DB_PATH', '/tmp/db.sqlite3')

import django
django.setup()

# Always run migrations on cold start — idempotent, ensures tables exist.
# SQLite lives in /tmp on Vercel (ephemeral per-instance).
from django.core.management import call_command
try:
    call_command('migrate', '--run-syncdb', verbosity=0)
except Exception as exc:
    import sys as _sys
    print(f'[sentinelx] migrate failed: {exc}', file=_sys.stderr)

from sentinelx.wsgi import application as app
