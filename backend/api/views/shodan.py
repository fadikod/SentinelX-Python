import requests
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

SHODAN_BASE = 'https://api.shodan.io'


def _api_key():
    return getattr(settings, 'SHODAN_API_KEY', '')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def host(request, ip):
    key = _api_key()
    if not key:
        return Response({'error': 'SHODAN_API_KEY not configured on the server.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    try:
        resp = requests.get(
            f'{SHODAN_BASE}/shodan/host/{ip}',
            params={'key': key},
            timeout=15,
        )
        resp.raise_for_status()
        return Response(resp.json())
    except requests.RequestException as e:
        return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search(request):
    query = request.query_params.get('query', '')
    page = request.query_params.get('page', '1')

    if not query:
        return Response({'error': 'query parameter is required.'}, status=status.HTTP_400_BAD_REQUEST)

    key = _api_key()
    if not key:
        return Response({'error': 'SHODAN_API_KEY not configured on the server.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    try:
        resp = requests.get(
            f'{SHODAN_BASE}/shodan/host/search',
            params={'key': key, 'query': query, 'page': page},
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        return Response({
            'matches': data.get('matches', [])[:20],
            'total': data.get('total', 0),
        })
    except requests.RequestException as e:
        return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats(request):
    key = _api_key()
    if not key:
        return Response({'error': 'SHODAN_API_KEY not configured on the server.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    try:
        resp = requests.get(
            f'{SHODAN_BASE}/api-info',
            params={'key': key},
            timeout=10,
        )
        resp.raise_for_status()
        return Response(resp.json())
    except requests.RequestException as e:
        return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)
