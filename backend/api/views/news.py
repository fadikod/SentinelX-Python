import requests
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

NEWS_BASE = 'https://newsapi.org/v2'


def _api_key():
    return getattr(settings, 'NEWS_API_KEY', '')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cybersecurity(request):
    page_size = request.query_params.get('pageSize', '20')
    page = request.query_params.get('page', '1')

    key = _api_key()
    if not key:
        return Response({'error': 'NEWS_API_KEY not configured on the server.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    try:
        resp = requests.get(
            f'{NEWS_BASE}/everything',
            params={
                'q': 'cybersecurity OR "cyber attack" OR malware OR ransomware OR "data breach"',
                'language': 'en',
                'sortBy': 'publishedAt',
                'pageSize': page_size,
                'page': page,
                'apiKey': key,
            },
            timeout=10,
        )
        resp.raise_for_status()
        return Response(resp.json())
    except requests.RequestException as e:
        return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)
