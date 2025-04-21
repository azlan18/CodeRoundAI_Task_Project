import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import JobsPage from "./pages/JobsPage"
import ScraperPage from "./pages/ScraperPage"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<JobsPage />} />
        <Route path="/scraper" element={<ScraperPage />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  )
}
