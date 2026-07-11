import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Boxes, FileSpreadsheet, FileText, LayoutDashboard, Link2, Moon, Package, Sun, Target, UserCog, Users, LogOut } from 'lucide-react'
import api from './api'

// Pages
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Products from './pages/Products'
import AMCs from './pages/AMCs'
import Leads from './pages/Leads'
import Login from './pages/Login'
import Ownership from './pages/Ownership'
import Reports from './pages/Reports'
import UserManagement from './pages/UserManagement'

function Layout({ children, theme, toggleTheme, onLogout }) {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path ? 'var(--primary-color)' : 'var(--text-secondary)'
  const isBgActive = (path) => location.pathname === path ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
  
  return (
    <div className="app-container">
      <aside style={{ width: '250px', backgroundColor: 'var(--bg-card)', borderRight: '1px solid var(--border-color)', padding: '2rem 1rem', display: 'flex', flexDirection: 'column' }}>
        <h2 className="brand">
          <Boxes /> AMC System
        </h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <Link to="/" className="btn" style={{ justifyContent: 'flex-start', color: isActive('/'), backgroundColor: isBgActive('/') }}>
            <LayoutDashboard size={18} style={{ marginRight: '10px' }} /> Dashboard
          </Link>
          <Link to="/clients" className="btn" style={{ justifyContent: 'flex-start', color: isActive('/clients'), backgroundColor: isBgActive('/clients') }}>
            <Users size={18} style={{ marginRight: '10px' }} /> Clients
          </Link>
          <Link to="/products" className="btn" style={{ justifyContent: 'flex-start', color: isActive('/products'), backgroundColor: isBgActive('/products') }}>
            <Package size={18} style={{ marginRight: '10px' }} /> Products
          </Link>
          <Link to="/amcs" className="btn" style={{ justifyContent: 'flex-start', color: isActive('/amcs'), backgroundColor: isBgActive('/amcs') }}>
            <FileText size={18} style={{ marginRight: '10px' }} /> AMCs
          </Link>
          <Link to="/ownership" className="btn" style={{ justifyContent: 'flex-start', color: isActive('/ownership'), backgroundColor: isBgActive('/ownership') }}>
            <Link2 size={18} style={{ marginRight: '10px' }} /> Ownership
          </Link>
          <Link to="/leads" className="btn" style={{ justifyContent: 'flex-start', color: isActive('/leads'), backgroundColor: isBgActive('/leads') }}>
            <Target size={18} style={{ marginRight: '10px' }} /> Leads
          </Link>
          <Link to="/reports" className="btn" style={{ justifyContent: 'flex-start', color: isActive('/reports'), backgroundColor: isBgActive('/reports') }}>
            <FileSpreadsheet size={18} style={{ marginRight: '10px' }} /> Reports
          </Link>
          <Link to="/users" className="btn" style={{ justifyContent: 'flex-start', color: isActive('/users'), backgroundColor: isBgActive('/users') }}>
            <UserCog size={18} style={{ marginRight: '10px' }} /> Users
          </Link>
        </nav>
        <button onClick={onLogout} className="btn" style={{ justifyContent: 'flex-start', color: 'var(--danger)', marginTop: 'auto' }}>
          <LogOut size={18} style={{ marginRight: '10px' }} /> Logout
        </button>
      </aside>

      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '2rem' }}>
          <button className="btn" onClick={toggleTheme} style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </header>
        {children}
      </main>
    </div>
  )
}

function App() {
  const [theme, setTheme] = useState('light')
  const [token, setToken] = useState(localStorage.getItem('amc_token'))
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    if (token) {
      localStorage.setItem('amc_token', token)
      api.get('/auth/me').catch(() => setToken(null))
    } else {
      localStorage.removeItem('amc_token')
    }
  }, [token])

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')
  
  const handleLogin = (newToken) => {
    setToken(newToken)
  }

  const handleLogout = () => {
    setToken(null)
  }

  if (!token) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <BrowserRouter>
      <Layout theme={theme} toggleTheme={toggleTheme} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/products" element={<Products />} />
          <Route path="/amcs" element={<AMCs />} />
          <Route path="/ownership" element={<Ownership />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/users" element={<UserManagement />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
