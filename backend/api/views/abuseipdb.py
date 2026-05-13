import requests
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

ABUSEIPDB_BASE = 'https://api.abuseipdb.com/api/v2'


def _api_key():
    return getattr(settings, 'ABUSEIPDB_API_KEY', '')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check(request):
    ip_address = request.query_params.get('ipAddress', '')
    max_age = request.query_params.get('maxAgeInDays', '90')

    if not ip_address:
        return Response({'error': 'ipAddress query parameter is required.'}, status=status.HTTP_400_BAD_REQUEST)

    key = _api_key()
    if not key:
        return Response({'error': 'ABUSEIPDB_API_KEY not configured on the server.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    try:
        resp = requests.get(
            f'{ABUSEIPDB_BASE}/check',
            params={'ipAddress': ip_address, 'maxAgeInDays': max_age},
            headers={'Key': key, 'Accept': 'application/json'},
            timeout=10,
        )
        resp.raise_for_status()
        return Response(resp.json())
    except requests.RequestException as e:
        return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def blacklist(request):
    confidence_minimum = request.query_params.get('confidenceMinimum', '90')
    limit = request.query_params.get('limit', '50')

    key = _api_key()
    if not key:
        return Response({'error': 'ABUSEIPDB_API_KEY not configured on the server.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    try:
        resp = requests.get(
            f'{ABUSEIPDB_BASE}/blacklist',
            params={'confidenceMinimum': confidence_minimum, 'limit': limit},
            headers={'Key': key, 'Accept': 'application/json'},
            timeout=15,
        )
        resp.raise_for_status()
        return Response(resp.json())
    except requests.RequestException as e:
        return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)
