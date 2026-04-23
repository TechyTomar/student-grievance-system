import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../api/axios'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm]     = useState({ name: '', email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name || !form.email || !form.password) {
      setError('All fields are required.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const { data } = await axios.post('/register', form)
      localStorage.setItem('token',   data.token)
      localStorage.setItem('student', JSON.stringify(data.student))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg">
      <div className="card">
        <div className="brand">
          <div className="brand-icon">🎓</div>
          <h1>Create Account</h1>
          <p>Register to access the Grievance Portal</p>
        </div>

        {error && (
          <div className="alert alert-error" role="alert" id="register-error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate id="register-form">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              className="form-control"
              type="text"
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              className="form-control"
              type="email"
              name="email"
              placeholder="john@university.edu"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              className="form-control"
              type="password"
              name="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          <button id="register-btn" className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? '⏳ Registering...' : '🚀 Create Account'}
          </button>
        </form>

        <div className="auth-link">
          Already have an account?{' '}
          <Link to="/" id="go-login-link">Sign in here</Link>
        </div>
      </div>
    </div>
  )
}
