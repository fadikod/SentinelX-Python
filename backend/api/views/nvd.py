from datetime import datetime, timedelta, timezone
import requests
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

NVD_BASE = 'https://services.nvd.nist.gov/rest/json/cves/2.0'


def _nvd_headers():
    key = getattr(settings, 'NVD_API_KEY', '')
    if key:
        return {'apiKey': key}
    return {}


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent(request):
    results_per_page = request.query_params.get('resultsPerPage', '20')
    pub_start = request.query_params.get('pubStartDate')
    pub_end = request.query_params.get('pubEndDate')

    if not pub_start:
        end = datetime.now(timezone.utc)
        start = end - timedelta(days=30)
        pub_start = start.strftime('%Y-%m-%dT%H:%M:%S.000')
        pub_end = end.strftime('%Y-%m-%dT%H:%M:%S.000')

    params = {
        'pubStartDate': pub_start,
        'pubEndDate': pub_end,
        'resultsPerPage': results_per_page,
    }

    try:
        resp = requests.get(NVD_BASE, params=params, headers=_nvd_headers(), timeout=15)
        resp.raise_for_status()
        return Response(resp.json())
    except requests.RequestException as e:
        return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search(request):
    keyword = request.query_params.get('keyword', '')
    severity = request.query_params.get('severity', '')
    results_per_page = request.query_params.get('resultsPerPage', '20')

    params = {'resultsPerPage': results_per_page}
    if keyword:
        params['keywordSearch'] = keyword
    if severity:
        params['cvssV3Severity'] = severity

    try:
        resp = requests.get(NVD_BASE, params=params, headers=_nvd_headers(), timeout=15)
        resp.raise_for_status()
        return Response(resp.json())
    except requests.RequestException as e:
        return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)
