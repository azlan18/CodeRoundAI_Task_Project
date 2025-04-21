# job_api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'jobs', views.JobViewSet)
router.register(r'companies', views.CompanyViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('scrape/', views.trigger_scraper, name='trigger-scraper'),
]