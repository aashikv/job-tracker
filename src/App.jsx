import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'

const statuses = [
  'Applied',
  'Assessment',
  'Interview',
  'Rejected',
  'Offer',
]

const emptyForm = {
  company: '',
  role: '',
  applied_date: new Date().toISOString().split('T')[0],
  status: 'Applied',
}

function App() {
const [applications, setApplications] = useState([])
const [loading, setLoading] = useState(true)

const [search, setSearch] = useState('')
const [statusFilter, setStatusFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    fetchApplications()
  }, [])

  async function fetchApplications() {
    setLoading(true)

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setApplications(data)
    setLoading(false)
  }

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function openAddForm() {
    setEditingId(null)

    setFormData({
      ...emptyForm,
      applied_date: new Date().toISOString().split('T')[0],
    })

    setShowForm(true)
  }

  function openEditForm(application) {
    setEditingId(application.id)

    setFormData({
      company: application.company,
      role: application.role,
      applied_date: application.applied_date,
      status: application.status,
    })

    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setFormData(emptyForm)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!formData.company.trim() || !formData.role.trim()) {
      return
    }

    setSaving(true)

    if (editingId) {
      const { data, error } = await supabase
        .from('applications')
        .update(formData)
        .eq('id', editingId)
        .select()
        .single()

      if (error) {
        console.error(error)
        setSaving(false)
        return
      }

      setApplications((previous) =>
        previous.map((application) =>
          application.id === editingId
            ? data
            : application
        )
      )
    } else {
      const { data, error } = await supabase
        .from('applications')
        .insert([formData])
        .select()
        .single()

      if (error) {
        console.error(error)
        setSaving(false)
        return
      }

      setApplications((previous) => [data, ...previous])
    }

    setSaving(false)
    closeForm()
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this application?'
    )

    if (!confirmed) {
      return
    }

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(error)
      return
    }

    setApplications((previous) =>
      previous.filter((application) => application.id !== id)
    )
  }
const filteredApplications = applications.filter((application) => {
  const matchesSearch =
    application.company
      .toLowerCase()
      .includes(search.toLowerCase()) ||
    application.role
      .toLowerCase()
      .includes(search.toLowerCase())

  const matchesStatus =
    statusFilter === 'All' ||
    application.status === statusFilter

  return matchesSearch && matchesStatus
})
  const total = applications.length

  const interviews = applications.filter(
    (app) => app.status === 'Interview'
  ).length

  const rejected = applications.filter(
    (app) => app.status === 'Rejected'
  ).length

  const offers = applications.filter(
    (app) => app.status === 'Offer'
  ).length

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold">
              Job Tracker
            </h1>

            <p className="text-sm text-slate-400 mt-1">
              Track your job applications in one place
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-lg font-medium transition"
          >
            + Add Application
          </button>

        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Dashboard cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-sm text-slate-400">
              Total Applications
            </p>

            <p className="text-3xl font-bold mt-2">
              {total}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-sm text-slate-400">
              Interviews
            </p>

            <p className="text-3xl font-bold mt-2">
              {interviews}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-sm text-slate-400">
              Rejections
            </p>

            <p className="text-3xl font-bold mt-2">
              {rejected}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-sm text-slate-400">
              Offers
            </p>

            <p className="text-3xl font-bold mt-2">
              {offers}
            </p>
          </div>

        </div>

        {/* Applications */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
<div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row gap-3">

  <input
    type="text"
    placeholder="Search company or role..."
    value={search}
    onChange={(event) => setSearch(event.target.value)}
    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500"
  />

  <select
    value={statusFilter}
    onChange={(event) => setStatusFilter(event.target.value)}
    className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500"
  >
    <option value="All">All Statuses</option>

    {statuses.map((status) => (
      <option key={status} value={status}>
        {status}
      </option>
    ))}
  </select>

</div>
          <div className="px-6 py-5 border-b border-slate-800">
            <h2 className="text-lg font-semibold">
              Applications
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400">
              Loading applications...
            </div>
) : filteredApplications.length === 0 ? (            <div className="p-12 text-center">

<div>
  <p className="text-lg font-medium text-slate-300">
    No applications yet
  </p>

  <p className="text-sm text-slate-500 mt-1 mb-5">
    Start tracking your job search by adding your first application.
  </p>
</div>
              <button
                onClick={openAddForm}
                className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-lg font-medium transition"
              >
                Add your first application
              </button>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>
                  <tr className="border-b border-slate-800 text-left">

                    <th className="px-6 py-4 text-sm text-slate-400">
                      Company
                    </th>

                    <th className="px-6 py-4 text-sm text-slate-400">
                      Role
                    </th>

                    <th className="px-6 py-4 text-sm text-slate-400">
                      Applied
                    </th>

                    <th className="px-6 py-4 text-sm text-slate-400">
                      Status
                    </th>

                    <th className="px-6 py-4 text-sm text-slate-400 text-right">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody>

{filteredApplications.map((application) => (                    <tr
                      key={application.id}
                      className="border-b border-slate-800 last:border-0"
                    >

                      <td className="px-6 py-4 font-medium">
                        {application.company}
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {application.role}
                      </td>

                      <td className="px-6 py-4 text-slate-400">
{new Date(application.applied_date).toLocaleDateString(
  'en-IN',
  {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }
)}                      </td>

                      <td className="px-6 py-4">

                        <span
  className={`px-3 py-1 rounded-full text-xs font-medium ${
    application.status === 'Applied'
      ? 'bg-blue-500/10 text-blue-400'
      : application.status === 'Assessment'
        ? 'bg-purple-500/10 text-purple-400'
        : application.status === 'Interview'
          ? 'bg-amber-500/10 text-amber-400'
          : application.status === 'Rejected'
            ? 'bg-red-500/10 text-red-400'
            : 'bg-emerald-500/10 text-emerald-400'
  }`}
>
  {application.status}
</span>

                      </td>

                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              openEditForm(application)
                            }
                            className="px-3 py-1.5 text-sm rounded-lg border border-slate-700 hover:bg-slate-800 transition"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(application.id)
                            }
                            className="px-3 py-1.5 text-sm rounded-lg border border-red-900 text-red-400 hover:bg-red-950 transition"
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </main>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">

              <h2 className="text-xl font-semibold">
                {editingId
                  ? 'Edit Application'
                  : 'Add Application'}
              </h2>

              <button
                onClick={closeForm}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>

            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >

              {/* Company */}
              <div>

                <label className="block text-sm text-slate-300 mb-2">
                  Company
                </label>

                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g. Microsoft"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              {/* Role */}
              <div>

                <label className="block text-sm text-slate-300 mb-2">
                  Role
                </label>

                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="e.g. Data Analyst"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              {/* Applied date */}
              <div>

                <label className="block text-sm text-slate-300 mb-2">
                  Applied Date
                </label>

                <input
                  type="date"
                  name="applied_date"
                  value={formData.applied_date}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              {/* Status */}
              <div>

                <label className="block text-sm text-slate-300 mb-2">
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                >

                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}

                </select>

              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-2.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition font-medium"
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Save Changes'
                      : 'Save Application'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  )
}

export default App