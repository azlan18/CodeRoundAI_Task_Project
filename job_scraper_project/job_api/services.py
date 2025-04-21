# job_api/services.py
import asyncio
import json
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options  # Add this import
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from groq import Groq
from django.conf import settings

from .models import Company, Job, JobSkill
from django.db import transaction
from asgiref.sync import sync_to_async

class JobScraperService:
    def __init__(self):
        chrome_options = Options()
        # chrome_options.add_argument('--headless')  # Comment this out to see the browser
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        
        self.driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=chrome_options
        )
        # Initialize Groq client with API key from environment variable
        self.groq_client = Groq(api_key=settings.GROQ_API_KEY)
        
        # Job sites to scrape
        self.job_sites = {
            "https://www.naukri.com/ola-jobs-careers-706807": ".srp-jobtuple-wrapper[data-job-id]",
            "https://www.naukri.com/swiggy-jobs?k=swiggy": ".srp-jobtuple-wrapper",
            "https://www.naukri.com/zepto-jobs?k=zepto&nignbevent_src=jobsearchDeskGNB": ".srp-jobtuple-wrapper"
        }
    
    async def fetch_html(self, url, selector, max_jobs=3):
        options = webdriver.ChromeOptions()
        options.add_argument("--disable-blink-features=AutomationControlled")
        # options.add_argument("--headless")  # Comment out headless to see the browser
        options.add_argument("--start-maximized")
        options.add_argument("--disable-notifications")
        options.add_argument("--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option("useAutomationExtension", False)
        
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        try:
            driver.get(url)
            # Increase wait time
            WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
            time.sleep(5)  # Increased wait time for dynamic content
            
            job_elements = driver.find_elements(By.CSS_SELECTOR, selector)[:max_jobs]
            html_content = "".join([elem.get_attribute("outerHTML") for elem in job_elements])
            
            return html_content
        except Exception as e:
            print(f"Error accessing {url}: {str(e)}")
            return ""
        finally:
            driver.quit()
    
    def parse_jobs_with_llm(self, html_content, site_name):
        prompt = f"""You are a highly capable AI model tasked with parsing HTML content and extracting structured data. Extract all available information from the following Naukri.com job listing HTML into a JSON object. Use the following structure for the output:

{{
  "jobs": [
    {{
      "job_id": "string",
      "title": "string",
      "company": "string",
      "company_rating": "string",
      "company_reviews": "string",
      "experience": "string",
      "salary": "string",
      "location": "string",
      "description": "string",
      "skills": ["string"],
      "posted": "string",
      "detail_url": "string",
      "logo_url": "string"
    }}
  ]
}}

Extraction guide for Naukri.com:
- For job_id: Extract from data-job-id attribute of div.srp-jobtuple-wrapper
- For title: Extract from a.title
- For company: Extract from a.comp-name
- For company_rating: Find span.main-2 inside the rating element
- For company_reviews: Extract from a.review
- For experience: Find span with title containing "Yrs"
- For salary: Find span with title containing "Lacs PA" or salary information
- For location: Find span.locWdth
- For description: Extract from span.job-desc
- For skills: Extract all li elements inside ul.tags-gt
- For posted: Extract from span.job-post-day
- For detail_url: Extract href from a.title
- For logo_url: Extract src from img.logoImage

Output ONLY the JSON object with no explanation or additional text.

The HTML content is provided below:
{html_content}
"""

        completion = self.groq_client.chat.completions.create(
            model="meta-llama/llama-4-maverick-17b-128e-instruct",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_completion_tokens=2048,
            top_p=1,
            stream=False,
            response_format={"type": "json_object"},
            stop=None,
        )
        return completion.choices[0].message.content
    
    @sync_to_async
    def save_job_data(self, job_data, results):
        try:
            with transaction.atomic():
                # Create or update company
                company, created = Company.objects.update_or_create(
                    name=job_data.get("company"),
                    defaults={
                        "rating": job_data.get("company_rating"),
                        "reviews": job_data.get("company_reviews"),
                        "logo_url": job_data.get("logo_url")
                    }
                )
                
                # Check if job already exists
                job, job_created = Job.objects.update_or_create(
                    job_id=job_data.get("job_id"),
                    defaults={
                        "title": job_data.get("title"),
                        "company": company,
                        "experience": job_data.get("experience"),
                        "salary": job_data.get("salary"),
                        "location": job_data.get("location"),
                        "description": job_data.get("description"),
                        "detail_url": job_data.get("detail_url"),
                        "posted_date": job_data.get("posted")
                    }
                )
                
                # Add skills
                if job_created:
                    results["jobs_added"] += 1
                else:
                    results["jobs_updated"] += 1
                    
                # Clear existing skills and add new ones
                JobSkill.objects.filter(job=job).delete()
                
                for skill in job_data.get("skills", []):
                    JobSkill.objects.create(job=job, skill=skill)
                
                return True
        except Exception as e:
            results["errors"].append(f"Error processing job {job_data.get('title')}: {str(e)}")
            return False

    async def scrape_and_save_jobs(self, max_jobs=3):
        results = {"success": True, "jobs_added": 0, "jobs_updated": 0, "errors": []}
        
        for url, selector in self.job_sites.items():
            site_name = url.split('/')[-1]
            
            try:
                html_content = await self.fetch_html(url, selector, max_jobs)
                json_response = self.parse_jobs_with_llm(html_content, site_name)
                
                # Parse the JSON response
                jobs_data = json.loads(json_response)
                
                # Process each job
                for job_data in jobs_data.get("jobs", []):
                    await self.save_job_data(job_data, results)
                    
            except Exception as e:
                results["errors"].append(f"Error scraping {site_name}: {str(e)}")
                
        if results["errors"]:
            results["success"] = False
            
        return results