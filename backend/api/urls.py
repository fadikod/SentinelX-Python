from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from api.views import auth, nvd, abuseipdb, shodan, news, settings as settings_view

urlpatterns = [
    # Auth
    path('auth/register', auth.register, name='register'),
    path('auth/login', auth.login_view, name='login'),
    path('auth/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me', auth.me, name='me'),

    # NVD
    path('nvd/recent', nvd.recent, name='nvd_recent'),
    path('nvd/search', nvd.search, name='nvd_search'),

    # AbuseIPDB
    path('abuseipdb/check', abuseipdb.check, name='abuseipdb_check'),
    path('abuseipdb/blacklist', abuseipdb.blacklist, name='abuseipdb_blacklist'),

    # Shodan
    path('shodan/host/<str:ip>', shodan.host, name='shodan_host'),
    path('shodan/search', shodan.search, name='shodan_search'),
    path('shodan/stats', shodan.stats, name='shodan_stats'),

    # News
    path('news/cybersecurity', news.cybersecurity, name='news_cybersecurity'),

    # Settings
    path('settings/keys', settings_view.set_key, name='settings_keys'),

    # Health
    path('health', auth.health, name='health'),
]
