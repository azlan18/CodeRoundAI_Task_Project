"use client"

import { useState, useEffect } from "react"
import {
  Zap,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Database,
  BarChart,
  Settings,
  ChevronRight,
  Sparkles,
  Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"

interface ScraperStatus {
  status: "idle" | "running" | "completed" | "failed"
  last_run?: string
  jobs_added?: number
  jobs_updated?: number
  errors?: string[]
}

interface ScraperResponse {
  success: boolean
  jobs_added: number
  jobs_updated: number
  errors?: string[]
}

const ScraperPage = () => {
  const [maxJobs, setMaxJobs] = useState<number>(5)
  const [status, setStatus] = useState<ScraperStatus>({ status: "idle" })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [response, setResponse] = useState<ScraperResponse | null>(null)

  // Fetch initial scraper status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/scrape/")
        if (!response.ok) {
          throw new Error("Failed to fetch scraper status")
        }
        const data = await response.json()
        setStatus(data)
      } catch (error) {
        console.error("Error fetching scraper status:", error)
      }
    }

    fetchStatus()
  }, [])

  const runScraper = async () => {
    setIsLoading(true)
    setProgress(0)
    setStatus({ status: "running" })
    setResponse(null)

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return 95
        }
        return prev + Math.random() * 10
      })
    }, 500)

    try {
      const response = await fetch("http://127.0.0.1:8000/api/scrape/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ max_jobs: maxJobs }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        throw new Error("Failed to run scraper")
      }

      const data: ScraperResponse = await response.json()
      setResponse(data)
      setStatus({
        status: data.success ? "completed" : "failed",
        last_run: new Date().toISOString(),
        jobs_added: data.jobs_added,
        jobs_updated: data.jobs_updated,
        errors: data.errors,
      })
    } catch (error) {
      clearInterval(progressInterval)
      setProgress(100)
      setStatus({
        status: "failed",
        errors: [error instanceof Error ? error.message : "An unknown error occurred"],
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (status.status) {
      case "idle":
        return <Clock className="h-6 w-6 text-gray-400" />
      case "running":
        return <RefreshCw className="h-6 w-6 text-indigo-400 animate-spin" />
      case "completed":
        return <CheckCircle className="h-6 w-6 text-green-400" />
      case "failed":
        return <XCircle className="h-6 w-6 text-red-400" />
      default:
        return <AlertCircle className="h-6 w-6 text-yellow-400" />
    }
  }

  const getStatusText = () => {
    switch (status.status) {
      case "idle":
        return "Ready to run"
      case "running":
        return "Scraper is running..."
      case "completed":
        return "Scraping completed successfully"
      case "failed":
        return "Scraping failed"
      default:
        return "Unknown status"
    }
  }

  const getStatusColor = () => {
    switch (status.status) {
      case "idle":
        return "text-gray-400"
      case "running":
        return "text-indigo-400"
      case "completed":
        return "text-green-400"
      case "failed":
        return "text-red-400"
      default:
        return "text-yellow-400"
    }
  }

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
                <a href="/" className="text-slate-300 hover:text-white transition-colors">
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
                <a href="/">
                  <Button variant="outline" className="border-indigo-500 text-indigo-400 hover:bg-indigo-500/10">
                    View Jobs
                    <ChevronRight className="ml-2 h-4 w-4" />
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
                Run the
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  Job Scraper
                </span>
                Find Your Next Opportunity
              </h1>

              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Our AI-powered scraper automatically finds the latest job opportunities from top companies, tailored to
                your preferences.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scraper Control Section */}
      <section className="py-12 px-4 md:px-8 lg:px-12">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            {/* Scraper Control Card */}
            <div className="relative group mb-12">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-30"></div>
              <div className="relative bg-gray-900/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Settings className="h-6 w-6 mr-3 text-indigo-400" />
                  Scraper Configuration
                </h2>

                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Maximum Jobs per Company ({maxJobs})
                  </label>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400">1</span>
                    <Slider
                      value={[maxJobs]}
                      min={1}
                      max={20}
                      step={1}
                      onValueChange={(value) => setMaxJobs(value[0])}
                      className="flex-grow"
                    />
                    <span className="text-gray-400">20</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Set how many jobs to scrape per company. Higher values will take longer to process.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={runScraper}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 flex-grow"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                        Running Scraper...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        Run Scraper
                      </>
                    )}
                  </Button>
                  <a href="/">
                    <Button
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800 py-6 flex-grow"
                    >
                      View All Jobs
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 shadow-xl mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Database className="h-6 w-6 mr-3 text-indigo-400" />
                Scraper Status
              </h2>

              <div className="flex items-center mb-6">
                {getStatusIcon()}
                <span className={`ml-2 font-medium ${getStatusColor()}`}>{getStatusText()}</span>
              </div>

              {status.status === "running" && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-gray-800" indicatorClassName="bg-indigo-500" />
                </div>
              )}

              {status.last_run && (
                <div className="text-sm text-gray-400 mb-4">
                  <span className="font-medium">Last Run:</span>{" "}
                  {new Date(status.last_run).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              )}

              {status.status === "completed" && response && (
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-indigo-400">{response.jobs_added}</div>
                      <div className="text-sm text-gray-400">Jobs Added</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-400">{response.jobs_updated}</div>
                      <div className="text-sm text-gray-400">Jobs Updated</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                      onClick={() => (window.location.href = "/")}
                    >
                      View Jobs
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {status.status === "failed" && status.errors && status.errors.length > 0 && (
                <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4">
                  <h3 className="text-red-400 font-medium mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Errors Occurred
                  </h3>
                  <ul className="text-sm text-red-300 list-disc pl-5 space-y-1">
                    {status.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Companies Card */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Building2 className="h-6 w-6 mr-3 text-indigo-400" />
                Companies We Scrape
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {["Swiggy", "Zepto", "Ola", "Smowcode"].map((company, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 flex items-center gap-3"
                  >
                    <div className="h-10 w-10 rounded-lg bg-indigo-900/30 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-indigo-400" />
                    </div>
                    <span className="font-medium text-gray-300">{company}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm mb-4">
                  We're constantly adding new companies to our scraping engine.
                </p>
                <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Request a Company
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 md:px-8 lg:px-12">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">
              Scraper <span className="text-indigo-400">Performance</span>
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 shadow-xl text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-900/30 mb-4">
                  <BarChart className="h-8 w-8 text-indigo-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">98%</div>
                <div className="text-gray-400">Accuracy Rate</div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 shadow-xl text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-purple-900/30 mb-4">
                  <Clock className="h-8 w-8 text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">5 min</div>
                <div className="text-gray-400">Average Run Time</div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 shadow-xl text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-900/30 mb-4">
                  <Database className="h-8 w-8 text-indigo-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">1000+</div>
                <div className="text-gray-400">Jobs Scraped Daily</div>
              </div>
            </div>
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
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Find Your Dream Job?</h2>
                <p className="text-xl text-slate-300">
                  Browse through our collection of freshly scraped job opportunities.
                </p>
              </div>
              <div>
                <a href="/">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg h-14 px-8"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Explore Jobs
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

export default ScraperPage
