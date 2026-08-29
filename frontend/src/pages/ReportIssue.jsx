import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { submitReport } from '../services/api'
import mockFacilities from '../data/mockFacilities'

const PROBLEM_TYPES = [
  { value: 'missing_facility', label: '🏥 Missing Facility — This facility is not listed' },
  { value: 'incorrect_info', label: '✏️ Incorrect Information — Name, address, or hours are wrong' },
  { value: 'service_unavailable', label: '🚫 Service Unavailable — A listed service is not actually provided' },
  { value: 'medicine_unavailable', label: '💊 Medicine Unavailable — A listed medicine is out of stock' },
  { value: 'doctor_unavailable', label: '👨‍⚕️ Doctor Unavailable — Listed doctor is not currently available' },
  { value: 'other', label: '📝 Other Issue' },
]

export default function ReportIssue() {
  const [searchParams] = useSearchParams()
  const prefilledId = searchParams.get('facilityId') || ''

  const [formData, setFormData] = useState({
    facilityId: prefilledId,
    facilityName: '',
    problemType: '',
    description: '',
    reporterName: '',
    reporterPhone: '',
    location: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (prefilledId) {
      setFormData((prev) => ({ ...prev, facilityId: prefilledId }))
    }
  }, [prefilledId])
  const validate = () => {
    const errs = {}
    if (!formData.problemType) errs.problemType = 'Please select a problem type.'
    if (!formData.description.trim() || formData.description.trim().length < 15)
      errs.description = 'Please provide at least 15 characters of description.'
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      await submitReport(formData)
      setSubmitted(true)
    } catch {
      setErrors({ form: 'Submission failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="bg-success-50 border border-success-200 rounded-2xl p-10">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-success-700 mb-3">Report Submitted!</h2>
          <p className="text-slate-600 text-base leading-relaxed mb-6">
            Thank you. Your report has been submitted for verification. Authorised healthcare workers will review and update the information.
          </p>
          <p className="text-sm text-slate-500 mb-8">
            Your contribution helps keep RuralCare information accurate for your community.
          </p>
          <button
            onClick={() => { setSubmitted(false); setFormData({ facilityId: '', facilityName: '', problemType: '', description: '', reporterName: '', reporterPhone: '', location: '' }) }}
            className="bg-primary-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-primary-700 transition-colors text-sm"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Report Incorrect Information</h1>
        <p className="text-slate-500 text-sm mt-1">
          Help keep RuralCare accurate. Your report will be reviewed by authorised healthcare workers.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-blue-800">
          You don't need to create an account to submit a report. Reports are reviewed and used only to improve facility information.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-card p-6 space-y-5">

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Facility (optional)
          </label>
          <select
            name="facilityId"
            value={formData.facilityId}
            onChange={handleChange}
            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <option value="">Select a facility (or type below)</option>
            {mockFacilities.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
            <option value="not_listed">Facility not listed here</option>
          </select>

          {(formData.facilityId === 'not_listed' || formData.facilityId === '') && (
            <input
              type="text"
              name="facilityName"
              value={formData.facilityName}
              onChange={handleChange}
              placeholder="Enter facility name (if known)"
              className="w-full mt-2 text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-700"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Problem Type <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {PROBLEM_TYPES.map((p) => (
              <label key={p.value} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:border-primary-300 hover:bg-primary-50/50 transition-colors">
                <input
                  type="radio"
                  name="problemType"
                  value={p.value}
                  checked={formData.problemType === p.value}
                  onChange={handleChange}
                  className="accent-primary-600 mt-0.5 w-4 h-4 flex-shrink-0"
                />
                <span className="text-sm text-slate-700">{p.label}</span>
              </label>
            ))}
          </div>
          {errors.problemType && <p className="text-xs text-red-500 mt-1">{errors.problemType}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Please describe the issue clearly. For example: 'The phone number listed is incorrect — the correct number is 02143-XXXXXX'"
            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-700 resize-none"
          />
          <div className="flex justify-between mt-1">
            {errors.description
              ? <p className="text-xs text-red-500">{errors.description}</p>
              : <span />
            }
            <p className="text-xs text-slate-400">{formData.description.length} chars</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Your Location (optional)
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Village, town, or district — helps us verify the report"
            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-700"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Name (optional)</label>
            <input
              type="text"
              name="reporterName"
              value={formData.reporterName}
              onChange={handleChange}
              placeholder="Anonymous if left blank"
              className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone (optional)</label>
            <input
              type="tel"
              name="reporterPhone"
              value={formData.reporterPhone}
              onChange={handleChange}
              placeholder="For follow-up if needed"
              className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-700"
            />
          </div>
        </div>

        {errors.form && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{errors.form}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white font-semibold py-3.5 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60 text-sm"
        >
          {loading ? 'Submitting Report...' : 'Submit Report'}
        </button>

        <p className="text-xs text-slate-500 text-center">
          Your report will be reviewed by the RuralCare team and verified healthcare workers.
        </p>
      </form>
    </div>
  )
}
