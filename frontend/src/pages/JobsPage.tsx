"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Briefcase,
  MapPin,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Code,
  Building2,
  Star,
  Clock,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"

// Types
interface Skill {
  skill: string
}

interface Company {
  id: number
  name: string
  rating: string
  reviews: string
  logo_url: string
}

interface Job {
  id: number
  job_id: string
  title: string
  company: Company
  experience: string
  salary: string
  location: string
  description: string
  detail_url: string
  posted_date: string
  date_scraped: string
  skills: Skill[]
}

const JobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [filters, setFilters] = useState({
    company: "",
    location: "",
    title: "",
    skill: "",
  })

  const [showFilters, setShowFilters] = useState(false)
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null)

  // Fetch jobs and companies
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [jobsResponse, companiesResponse] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/jobs/"),
          fetch("http://127.0.0.1:8000/api/companies/"),
        ])

        if (!jobsResponse.ok || !companiesResponse.ok) {
          throw new Error("Failed to fetch data")
        }

        const jobsData = await jobsResponse.json()
        const companiesData = await companiesResponse.json()

        setJobs(jobsData)
        setFilteredJobs(jobsData)
        setCompanies(companiesData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Apply filters
  useEffect(() => {
    const applyFilters = async () => {
      setLoading(true)

      try {
        // Build query string from filters
        const queryParams = new URLSearchParams()
        if (filters.company) queryParams.append("company", filters.company)
        if (filters.location) queryParams.append("location", filters.location)
        if (filters.title) queryParams.append("title", filters.title)
        if (filters.skill) queryParams.append("skill", filters.skill)

        const queryString = queryParams.toString()
        const url = `http://127.0.0.1:8000/api/jobs/${queryString ? `?${queryString}` : ""}`

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error("Failed to fetch filtered jobs")
        }

        const data = await response.json()
        setFilteredJobs(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        setFilteredJobs(jobs) // Fallback to all jobs
      } finally {
        setLoading(false)
      }
    }

    // Only fetch if any filter is applied
    if (Object.values(filters).some((value) => value !== "")) {
      applyFilters()
    } else {
      setFilteredJobs(jobs)
    }
  }, [filters, jobs])

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      company: "",
      location: "",
      title: "",
      skill: "",
    })
  }

  const toggleJobExpansion = (jobId: number) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId)
  }

  // Get unique locations for filter dropdown
  const uniqueLocations = Array.from(new Set(jobs.map((job) => job.location)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-950 text-gray-100">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden px-5 pt-6 pb-20 md:px-8 lg:px-12">
        {/* Animated background pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-full h-full bg-[radial-gradient(circle_500px_at_50%_200px,#4f46e5,transparent)]" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='none' stroke='%231e293b' strokeWidth='2' strokeDasharray='10 10'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Main content */}
        <div className="relative container mx-auto px-4">
          <header className="py-6">
            <nav className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Zap className="h-8 w-8 text-indigo-400" />
                <span className="text-2xl font-bold text-white">
                  Scrape<span className="text-indigo-400">4Me</span>
                </span>
              </div>
              <div className="hidden md:flex items-center gap-8">
                <a href="#jobs" className="text-slate-300 hover:text-white transition-colors">
                  Jobs
                </a>
                <a href="#companies" className="text-slate-300 hover:text-white transition-colors">
                  Companies
                </a>
                <a href="/scraper" className="text-slate-300 hover:text-white transition-colors">
                  Scraper
                </a>
              </div>
              <div>
                <a href="/scraper">
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    Run Scraper
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
            </nav>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="py-12 md:py-20"
          >
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 text-indigo-400 mb-6">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-sm font-medium">Automated Job Discovery</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Discover Your Next
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  Career Opportunity
                </span>
                With AI-Powered Job Scraping
              </h1>

              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Scrape4Me automatically finds the best job opportunities across multiple platforms, tailored to your
                skills and preferences.
              </p>

              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-20"></div>
                <div className="relative flex">
                  <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      placeholder="Search job titles, skills, or companies..."
                      className="pl-12 pr-4 py-6 bg-gray-900/80 border-gray-700 text-gray-100 placeholder:text-gray-400 w-full rounded-l-lg rounded-r-none h-14 text-lg"
                      value={filters.title}
                      onChange={(e) => handleFilterChange("title", e.target.value)}
                    />
                  </div>
                  <Button
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-l-none h-14 px-6"
                    onClick={() => document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Find Jobs
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
                <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
                  <div className="text-3xl font-bold text-white">{jobs.length}+</div>
                  <div className="text-indigo-400">Available Jobs</div>
                </div>
                <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
                  <div className="text-3xl font-bold text-white">{companies.length}</div>
                  <div className="text-indigo-400">Companies</div>
                </div>
                <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
                  <div className="text-3xl font-bold text-white">24/7</div>
                  <div className="text-indigo-400">Auto Scraping</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Jobs Section */}
      <section id="jobs" className="py-16 px-4 md:px-8 lg:px-12">
        <div className="container mx-auto">
          {/* Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-12 bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 shadow-xl"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search job titles..."
                  className="pl-10 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-400 w-full"
                  value={filters.title}
                  onChange={(e) => handleFilterChange("title", e.target.value)}
                />
              </div>

              <Button
                variant="outline"
                className="w-full md:w-auto border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} className="mr-2" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>

              {Object.values(filters).some((value) => value !== "") && (
                <Button
                  variant="ghost"
                  className="w-full md:w-auto text-red-400 hover:text-red-300 hover:bg-gray-800"
                  onClick={clearFilters}
                >
                  <X size={18} className="mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
                      <select
                        className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-gray-100"
                        value={filters.company}
                        onChange={(e) => handleFilterChange("company", e.target.value)}
                      >
                        <option value="">All Companies</option>
                        {companies.map((company) => (
                          <option key={company.id} value={company.name}>
                            {company.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                      <select
                        className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-gray-100"
                        value={filters.location}
                        onChange={(e) => handleFilterChange("location", e.target.value)}
                      >
                        <option value="">All Locations</option>
                        {uniqueLocations.map((location) => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Skill</label>
                      <Input
                        placeholder="e.g. React, Python, etc."
                        className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-400"
                        value={filters.skill}
                        onChange={(e) => handleFilterChange("skill", e.target.value)}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Section Title */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">
              Available <span className="text-indigo-400">Jobs</span>
            </h2>
            {!loading && !error && (
              <div className="text-gray-400">
                Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          {/* Job Listings */}
          <div className="space-y-8">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-800"
                >
                  <div className="flex items-center mb-6">
                    <Skeleton className="h-16 w-16 rounded-xl bg-gray-800" />
                    <div className="ml-4 space-y-2">
                      <Skeleton className="h-6 w-48 bg-gray-800" />
                      <Skeleton className="h-4 w-32 bg-gray-800" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-3/4 mb-4 bg-gray-800" />
                  <Skeleton className="h-4 w-1/2 mb-6 bg-gray-800" />
                  <div className="flex flex-wrap gap-2 mt-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-20 rounded-full bg-gray-800" />
                    ))}
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="bg-red-900/30 border border-red-700 text-red-200 p-6 rounded-2xl">
                <p className="font-medium">Error loading jobs</p>
                <p className="text-sm mt-1">{error}</p>
                <Button
                  variant="outline"
                  className="mt-3 border-red-700 text-red-200 hover:bg-red-800/50"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-12 text-center shadow-xl border border-gray-800">
                <div className="flex justify-center mb-6">
                  <Briefcase className="h-16 w-16 text-gray-600" />
                </div>
                <h3 className="text-2xl font-medium text-gray-300 mb-2">No jobs found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your filters to see more results</p>
                <Button
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <AnimatePresence>
                {filteredJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="relative group"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
                    <div className="relative bg-gray-900/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:translate-y-[-2px]">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                        <div className="flex items-center">
                          <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-800 flex items-center justify-center">
                            {job.company.logo_url ? (
                              <img
                                src={job.company.logo_url || "/placeholder.svg"}
                                alt={`${job.company.name} logo`}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  ;(e.target as HTMLImageElement).src =
                                    `/placeholder.svg?height=64&width=64&query=${job.company.name} logo`
                                }}
                              />
                            ) : (
                              <Building2 className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <div className="ml-4">
                            <h3 className="font-medium text-xl text-white">{job.company.name}</h3>
                            <div className="flex items-center text-sm text-gray-400">
                              <Star className="h-4 w-4 text-yellow-400 mr-1" />
                              <span>{job.company.rating}</span>
                              <span className="mx-1">•</span>
                              <span>{job.company.reviews}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 text-sm text-gray-400 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{job.posted_date}</span>
                        </div>
                      </div>

                      <h2 className="text-2xl font-bold text-white mb-3">{job.title}</h2>

                      <div className="flex flex-wrap gap-y-3 text-sm text-gray-300 mb-6">
                        <div className="flex items-center mr-6">
                          <MapPin size={16} className="mr-1 text-indigo-400" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center mr-6">
                          <Briefcase size={16} className="mr-1 text-indigo-400" />
                          <span>{job.experience}</span>
                        </div>
                        {job.salary !== "Not disclosed" && (
                          <div className="flex items-center">
                            <span className="text-green-400 font-medium">{job.salary}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {job.skills
                          .slice(0, expandedJobId === job.id ? job.skills.length : 5)
                          .map((skillObj, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-indigo-900/30 hover:bg-indigo-800/40 text-indigo-300 border-indigo-800/50 py-1.5 px-3 text-sm"
                            >
                              <Code className="h-3.5 w-3.5 mr-1.5" />
                              {skillObj.skill}
                            </Badge>
                          ))}
                        {job.skills.length > 5 && expandedJobId !== job.id && (
                          <Badge
                            variant="outline"
                            className="border-gray-700 text-gray-400 cursor-pointer hover:bg-gray-800 py-1.5 px-3 text-sm"
                            onClick={() => toggleJobExpansion(job.id)}
                          >
                            +{job.skills.length - 5} more
                          </Badge>
                        )}
                      </div>

                      <AnimatePresence>
                        {expandedJobId === job.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-gray-800 pt-6 mt-2">
                              <h4 className="font-medium text-gray-300 mb-3 flex items-center">
                                <Sparkles className="h-4 w-4 mr-2 text-indigo-400" />
                                Job Description
                              </h4>
                              <p className="text-gray-400">{job.description}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex justify-between items-center mt-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-gray-800"
                          onClick={() => toggleJobExpansion(job.id)}
                        >
                          {expandedJobId === job.id ? (
                            <>
                              <ChevronUp size={16} className="mr-1" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown size={16} className="mr-1" />
                              Show More
                            </>
                          )}
                        </Button>

                        <a href={job.detail_url} target="_blank" rel="noopener noreferrer">
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                          >
                            Apply Now
                            <ExternalLink size={14} className="ml-1" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 lg:px-12">
        <div className="container mx-auto">
          <div className="relative bg-gradient-to-br from-indigo-900/30 via-purple-900/30 to-gray-900/30 rounded-3xl border border-white/10 backdrop-blur-xl p-12">
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-indigo-500/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-purple-500/10 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Automate Your Job Search?</h2>
                <p className="text-xl text-slate-300">
                  Run our scraper to find the latest job opportunities tailored to your skills.
                </p>
              </div>
              <div>
                <a href="/scraper">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg h-14 px-8"
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Run Scraper
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center mb-8">
            <Zap className="h-8 w-8 text-indigo-400 mr-2" />
            <span className="text-2xl font-bold text-white">
              Scrape<span className="text-indigo-400">4Me</span>
            </span>
          </div>
          <p className="text-center text-gray-400">&copy; {new Date().getFullYear()} Scrape4Me. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default JobsPage
