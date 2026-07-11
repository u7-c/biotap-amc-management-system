import { useState } from 'react'
import api from '../api'

function Login({ onLogin }) {
  const [email, setEmail] = useState('admin')
  const [password, setPassword] = useState('1234')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)

    try {
      const res = await api.post('/auth/login', formData)
      const token = res.data.access_token
      onLogin(token)
    } catch {
      setError('Invalid username or password')
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>AMC System Login</h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input required type="text" className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input required type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Login</button>
        </form>
      </div>
    </div>
  )
}

export default Login
