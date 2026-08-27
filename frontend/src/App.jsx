import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Facilities from './pages/Facilities'
import FacilityDetails from './pages/FacilityDetails'
import HealthcareMap from './pages/HealthcareMap'
import AIAssistant from './pages/AIAssistant'
import ReportIssue from './pages/ReportIssue'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import ScrollToTop from './components/ScrollToTop'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/facilities" element={<Facilities />} />
            <Route path="/facilities/:id" element={<FacilityDetails />} />
            <Route path="/map" element={<HealthcareMap />} />
            <Route path="/assistant" element={<AIAssistant />} />
            <Route path="/report" element={<ReportIssue />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
