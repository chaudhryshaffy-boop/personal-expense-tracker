import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await api.post('/auth/register', { email, password, full_name: fullName, currency: 'USD' })
      navigate('/login')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="bg-card rounded-lg shadow p-6 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Create account</h1>
        {error && <div className="text-danger text-sm">{error}</div>}
        <input className="w-full border rounded px-3 py-2" placeholder="Full name" value={fullName} onChange={e=>setFullName(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full bg-primary text-white rounded py-2">Register</button>
        <p className="text-sm">Have an account? <Link to="/login" className="text-primary">Sign in</Link></p>
      </form>
    </div>
  )
}

