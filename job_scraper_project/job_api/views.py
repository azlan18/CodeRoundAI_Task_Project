# job_api/views.py
import asyncio
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.http import JsonResponse

from .models import Job, Company
from .serializers import JobSerializer, CompanySerializer
from .services import JobScraperService

class JobViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Job.objects.all().order_by('-date_scraped')
    serializer_class = JobSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by company
        company = self.request.query_params.get('company')
        if company:
            queryset = queryset.filter(company__name__icontains=company)
            
        # Filter by title
        title = self.request.query_params.get('title')
        if title:
            queryset = queryset.filter(title__icontains=title)
            
        # Filter by location
        location = self.request.query_params.get('location')
        if location:
            queryset = queryset.filter(location__icontains=location)
            
        # Filter by skill
        skill = self.request.query_params.get('skill')
        if skill:
            queryset = queryset.filter(skills__skill__icontains=skill)
            
        return queryset

class CompanyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

@api_view(['GET', 'POST'])
def trigger_scraper(request):
    """
    Endpoint to trigger the job scraper
    GET: Returns status
    POST: Runs the scraper
    """
    if request.method == 'GET':
        return Response({'status': 'ready', 'message': 'Use POST to start scraping'})
    
    if request.method == 'POST':
        try:
            max_jobs = int(request.data.get('max_jobs', 3))
            scraper = JobScraperService()
            # Use asyncio to run the async scraper
            results = asyncio.run(scraper.scrape_and_save_jobs(max_jobs))
            return Response(results)
        except Exception as e:
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )