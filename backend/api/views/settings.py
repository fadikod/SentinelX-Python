from django.conf import settings as django_settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

ALLOWED_KEYS = {'ABUSEIPDB_API_KEY', 'NEWS_API_KEY', 'SHODAN_API_KEY', 'NVD_API_KEY'}


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_key(request):
    key = request.data.get('key', '')
    value = request.data.get('value', '')

    if key not in ALLOWED_KEYS:
        return Response({'error': f'Unknown key: {key}'}, status=status.HTTP_400_BAD_REQUEST)

    setattr(django_settings, key, value)
    return Response({'ok': True})
