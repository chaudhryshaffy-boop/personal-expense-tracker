import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { authActions } from '../store/authSlice'
import { api } from '../services/api'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const resp = await api.post('/auth/login', { email, password })
      dispatch(authActions.setTokens({ accessToken: resp.data.access_token, refreshToken: resp.data.refresh_token }))
      const me = await api.get('/auth/me')
      dispatch(authActions.setUser(me.data))
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="bg-card rounded-lg shadow p-6 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Sign in</h1>
        {error && <div className="text-danger text-sm">{error}</div>}
        <input className="w-full border rounded px-3 py-2" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full bg-primary text-white rounded py-2">Login</button>
        <p className="text-sm">No account? <Link to="/register" className="text-primary">Register</Link></p>
      </form>
    </div>
  )
}

