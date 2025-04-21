# job_api/admin.py
from django.contrib import admin
from .models import Company, Job, JobSkill

class JobSkillInline(admin.TabularInline):
    model = JobSkill
    extra = 1

class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'location', 'posted_date', 'date_scraped')
    list_filter = ('company', 'location', 'date_scraped')
    search_fields = ('title', 'description', 'company__name', 'location')
    inlines = [JobSkillInline]

class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'rating', 'reviews')
    search_fields = ('name',)

admin.site.register(Company, CompanyAdmin)
admin.site.register(Job, JobAdmin)