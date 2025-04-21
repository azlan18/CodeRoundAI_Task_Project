# job_api/models.py
from django.db import models

class Company(models.Model):
    name = models.CharField(max_length=255)
    rating = models.CharField(max_length=10, blank=True, null=True)
    reviews = models.CharField(max_length=255, blank=True, null=True)
    logo_url = models.URLField(blank=True, null=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Companies"

class Job(models.Model):
    job_id = models.CharField(max_length=255, unique=True)
    title = models.CharField(max_length=255)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='jobs')
    experience = models.CharField(max_length=100, blank=True, null=True)
    salary = models.CharField(max_length=100, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    detail_url = models.URLField()
    posted_date = models.CharField(max_length=100, blank=True, null=True)
    date_scraped = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} at {self.company.name}"

class JobSkill(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='skills')
    skill = models.CharField(max_length=255)
    
    def __str__(self):
        return self.skill
    
    class Meta:
        unique_together = ('job', 'skill')