# job_api/serializers.py
from rest_framework import serializers
from .models import Company, Job, JobSkill

class JobSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobSkill
        fields = ['skill']

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name', 'rating', 'reviews', 'logo_url']

class JobSerializer(serializers.ModelSerializer):
    company = CompanySerializer()
    skills = JobSkillSerializer(many=True, read_only=True)
    
    class Meta:
        model = Job
        fields = ['id', 'job_id', 'title', 'company', 'experience', 'salary', 
                  'location', 'description', 'detail_url', 'posted_date', 
                  'date_scraped', 'skills']