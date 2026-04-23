import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'

const CATEGORIES = ['Academic', 'Hostel', 'Transport', 'Other']

const CAT_META = {
  Academic:  { icon: '📚', cls: 'cat-academic'  },
  Hostel:    { icon: '🏠', cls: 'cat-hostel'    },
  Transport: { icon: '🚌', cls: 'cat-transport' },
  Other:     { icon: '📋', cls: 'cat-other'     },
}

const EMPTY_FORM = { title: '', description: '', category: '' }

export default function DashboardPage() {
  const navigate = useNavigate()

  const [student, setStudent]   = useState(null)
  const [grievances, setGrievances] = useState([])
  const [loading, setLoading]   = useState(true)

  // ── Submit form ──────────────────────────────────────────
  const [form, setForm]           = useState(EMPTY_FORM)
  const [submitMsg, setSubmitMsg] = useState({ text: '', type: '' })
  const [submitting, setSubmitting] = useState(false)

  // ── Search ───────────────────────────────────────────────
  const [searchQuery, setSearchQuery]     = useState('')
  const [searching, setSearching]         = useState(false)
  const [isSearchMode, setIsSearchMode]   = useState(false)

  // ── Edit modal ───────────────────────────────────────────
  const [editItem, setEditItem]   = useState(null)
  const [editForm, setEditForm]   = useState({})
  const [editMsg, setEditMsg]     = useState({ text: '', type: '' })
  const [editSaving, setEditSaving] = useState(false)

  // ── Delete confirm ───────────────────────────────────────
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // ── On mount: load student + grievances ─────────────────
  useEffect(() => {
    const stored = localStorage.getItem('student')
    if (stored) setStudent(JSON.parse(stored))
    fetchAll()
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setIsSearchMode(false)
    try {
      const { data } = await axios.get('/grievances')
      setGrievances(data.grievances)
    } catch {
      handleLogout()
    } finally {
      setLoading(false)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('student')
    navigate('/')
  }

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitMsg({ text: '', type: '' })
    if (!form.title.trim() || !form.description.trim() || !form.category) {
      setSubmitMsg({ text: 'All fields are required.', type: 'error' })
      return
    }
    setSubmitting(true)
    try {
      const { data } = await axios.post('/grievances', form)
      setSubmitMsg({ text: data.message, type: 'success' })
      setForm(EMPTY_FORM)
      setGrievances((prev) => [data.grievance, ...prev])
      setIsSearchMode(false)
      setSearchQuery('')
    } catch (err) {
      setSubmitMsg({ text: err.response?.data?.message || 'Failed to submit.', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  // ── Search ───────────────────────────────────────────────
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) { fetchAll(); return }
    setSearching(true)
    setIsSearchMode(true)
    try {
      const { data } = await axios.get(`/grievances/search?title=${encodeURIComponent(searchQuery)}`)
      setGrievances(data.grievances)
    } catch {
      setGrievances([])
    } finally {
      setSearching(false)
    }
  }

  const clearSearch = () => { setSearchQuery(''); fetchAll() }

  // ── Edit ─────────────────────────────────────────────────
  const openEdit = (g) => {
    setEditItem(g)
    setEditForm({ title: g.title, description: g.description, category: g.category, status: g.status })
    setEditMsg({ text: '', type: '' })
  }
  const closeEdit = () => { setEditItem(null); setEditMsg({ text: '', type: '' }) }

  const handleEditSave = async (e) => {
    e.preventDefault()
    setEditMsg({ text: '', type: '' })
    if (!editForm.title.trim() || !editForm.description.trim() || !editForm.category) {
      setEditMsg({ text: 'All fields are required.', type: 'error' })
      return
    }
    setEditSaving(true)
    try {
      const { data } = await axios.put(`/grievances/${editItem._id}`, editForm)
      setGrievances((prev) => prev.map((g) => (g._id === editItem._id ? data.grievance : g)))
      setEditMsg({ text: data.message, type: 'success' })
      setTimeout(closeEdit, 700)
    } catch (err) {
      setEditMsg({ text: err.response?.data?.message || 'Update failed.', type: 'error' })
    } finally {
      setEditSaving(false)
    }
  }

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true)
    try {
      await axios.delete(`/grievances/${deleteId}`)
      setGrievances((prev) => prev.filter((g) => g._id !== deleteId))
    } finally {
      setDeleteId(null)
      setDeleting(false)
    }
  }

  // ── Helpers ──────────────────────────────────────────────
  const initials = student?.name
    ? student.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  const pending  = grievances.filter((g) => g.status === 'Pending').length
  const resolved = grievances.filter((g) => g.status === 'Resolved').length

  // ────────────────────────────────────────────────────────
  return (
    <div className="dashboard-bg">

      {/* ── Navbar ──────────────────────────────────── */}
      <nav className="navbar" id="main-navbar">
        <div className="navbar-brand">
          <span className="nav-icon">🎓</span>
          <span>Student Grievance Portal</span>
        </div>
        <div className="navbar-user">
          <div className="user-chip">
            <div className="user-avatar">{initials}</div>
            <span>{student?.name?.split(' ')[0]}</span>
          </div>
          <button id="logout-btn" className="btn btn-danger btn-sm" onClick={handleLogout} style={{ width: 'auto' }}>
            🚪 Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-container">

        {/* ── Page Header ─────────────────────────────── */}
        <div className="dashboard-header">
          <h2>👋 Hello, {student?.name?.split(' ')[0]}!</h2>
          <p>Submit, track, and manage your grievances all in one place</p>
        </div>

        {/* ── Stats ───────────────────────────────────── */}
        <div className="stats-row">
          <div className="stat-card stat-total">
            <div className="stat-icon">📋</div>
            <div>
              <div className="stat-number" id="stat-total">{grievances.length}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>
          <div className="stat-card stat-pending">
            <div className="stat-icon">⏳</div>
            <div>
              <div className="stat-number" id="stat-pending">{pending}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          <div className="stat-card stat-resolved">
            <div className="stat-icon">✅</div>
            <div>
              <div className="stat-number" id="stat-resolved">{resolved}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>
        </div>

        {/* ── Main 2-col Grid ─────────────────────────── */}
        <div className="grievance-grid">

          {/* ── LEFT: Submit Form ─────────────────────── */}
          <div className="dash-card form-card" id="submit-grievance-card">
            <div className="dash-card-header">
              <div className="dash-card-icon icon-purple">📝</div>
              <div>
                <h3>Submit Grievance</h3>
                <p className="subtitle">Raise a new complaint</p>
              </div>
            </div>

            {submitMsg.text && (
              <div className={`alert alert-${submitMsg.type === 'success' ? 'success' : 'error'}`} id="submit-msg">
                {submitMsg.type === 'success' ? '✅' : '⚠️'} {submitMsg.text}
              </div>
            )}

            <form onSubmit={handleSubmit} id="submit-grievance-form" noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="grievance-title">Title</label>
                <input
                  id="grievance-title"
                  className="form-control"
                  type="text"
                  name="title"
                  placeholder="Brief summary of your complaint"
                  value={form.title}
                  onChange={(e) => { setForm({ ...form, title: e.target.value }); setSubmitMsg({ text: '', type: '' }) }}
                  maxLength={150}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="grievance-category">Category</label>
                <select
                  id="grievance-category"
                  className="form-control"
                  name="category"
                  value={form.category}
                  onChange={(e) => { setForm({ ...form, category: e.target.value }); setSubmitMsg({ text: '', type: '' }) }}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CAT_META[c].icon} {c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="grievance-description">Description</label>
                <textarea
                  id="grievance-description"
                  className="form-control textarea"
                  name="description"
                  placeholder="Describe your grievance in detail..."
                  value={form.description}
                  onChange={(e) => { setForm({ ...form, description: e.target.value }); setSubmitMsg({ text: '', type: '' }) }}
                  rows={5}
                  maxLength={2000}
                />
              </div>

              <button id="submit-grievance-btn" className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? '⏳ Submitting...' : '🚀 Submit Grievance'}
              </button>
            </form>
          </div>

          {/* ── RIGHT: Grievance List ──────────────────── */}
          <div className="dash-card list-card" id="grievances-list-card">
            <div className="dash-card-header">
              <div className="dash-card-icon icon-green">📂</div>
              <div>
                <h3>My Grievances</h3>
                <p className="subtitle">
                  {isSearchMode ? `Results for "${searchQuery}"` : 'All your submitted complaints'}
                </p>
              </div>
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="search-form" id="search-form">
              <div className="search-input-wrap">
                <span className="search-icon">🔍</span>
                <input
                  id="search-input"
                  className="form-control search-input"
                  type="text"
                  placeholder="Search grievances by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {isSearchMode && (
                  <button type="button" className="search-clear-btn" onClick={clearSearch} title="Clear">✕</button>
                )}
              </div>
              <button
                id="search-btn"
                className="btn btn-outline btn-sm"
                type="submit"
                disabled={searching}
                style={{ width: 'auto', marginTop: 0 }}
              >
                {searching ? '⏳' : 'Search'}
              </button>
            </form>

            {/* List */}
            <div className="grievance-list" id="grievance-list">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                  <div className="spinner" />
                  <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading…</p>
                </div>
              ) : grievances.length === 0 ? (
                <div className="empty-state" id="empty-state">
                  <div className="empty-icon">{isSearchMode ? '🔍' : '📭'}</div>
                  <p>{isSearchMode ? 'No results found.' : 'No grievances submitted yet.'}</p>
                  {isSearchMode && (
                    <button className="btn btn-outline btn-sm" onClick={clearSearch} style={{ width: 'auto', marginTop: '0.75rem' }}>
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                grievances.map((g) => (
                  <div key={g._id} className="grievance-item" id={`grievance-${g._id}`}>
                    <div className="grievance-item-top">
                      <div className="grievance-title-row">
                        <span className={`category-tag ${CAT_META[g.category]?.cls}`}>
                          {CAT_META[g.category]?.icon} {g.category}
                        </span>
                        <span className={`status-badge ${g.status === 'Pending' ? 'status-pending' : 'status-resolved'}`}>
                          {g.status === 'Pending' ? '⏳' : '✅'} {g.status}
                        </span>
                      </div>
                      <h4 className="grievance-title">{g.title}</h4>
                      <p className="grievance-desc">{g.description}</p>
                      <div className="grievance-date">🗓 {formatDate(g.date || g.createdAt)}</div>
                    </div>
                    <div className="grievance-actions">
                      <button
                        className="btn btn-outline btn-xs"
                        id={`edit-btn-${g._id}`}
                        onClick={() => openEdit(g)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-danger btn-xs"
                        id={`delete-btn-${g._id}`}
                        onClick={() => setDeleteId(g._id)}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Modal ──────────────────────────────────── */}
      {editItem && (
        <div className="modal-overlay" id="edit-modal" onClick={(e) => e.target === e.currentTarget && closeEdit()}>
          <div className="modal-card">
            <div className="modal-header">
              <h3>✏️ Edit Grievance</h3>
              <button className="modal-close-btn" onClick={closeEdit} id="close-edit-modal">✕</button>
            </div>

            {editMsg.text && (
              <div className={`alert alert-${editMsg.type === 'success' ? 'success' : 'error'}`} id="edit-msg">
                {editMsg.type === 'success' ? '✅' : '⚠️'} {editMsg.text}
              </div>
            )}

            <form onSubmit={handleEditSave} id="edit-grievance-form" noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-title">Title</label>
                <input id="edit-title" className="form-control" type="text" name="title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  maxLength={150}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-category">Category</label>
                <select id="edit-category" className="form-control" name="category"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_META[c].icon} {c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-status">Status</label>
                <select id="edit-status" className="form-control" name="status"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="Pending">⏳ Pending</option>
                  <option value="Resolved">✅ Resolved</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-description">Description</label>
                <textarea id="edit-description" className="form-control textarea" name="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={4} maxLength={2000}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeEdit}
                  style={{ width: 'auto' }} id="cancel-edit-btn">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={editSaving}
                  style={{ width: 'auto' }} id="save-edit-btn">
                  {editSaving ? '⏳ Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ─────────────────────────── */}
      {deleteId && (
        <div className="modal-overlay" id="delete-modal">
          <div className="modal-card modal-card-sm">
            <div className="modal-header">
              <h3>🗑 Confirm Delete</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Are you sure you want to delete this grievance? This action <strong>cannot</strong> be undone.
            </p>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}
                style={{ width: 'auto' }} id="cancel-delete-btn">Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}
                style={{ width: 'auto' }} id="confirm-delete-btn">
                {deleting ? '⏳ Deleting...' : '🗑 Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
