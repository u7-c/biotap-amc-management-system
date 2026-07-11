import { useState, useEffect } from 'react'
import api from '../api'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const currency = (value) => Number(value || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

const statusClass = (status) => {
  if (status === 'Converted' || status === 'Active') return 'badge-success'
  if (status === 'New' || status === 'Pending' || status === 'Contacted') return 'badge-warning'
  return 'badge-danger'
}

function Dashboard() {
  const [metrics, setMetrics] = useState(null)
  
  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(res => setMetrics(res.data))
      .catch(err => console.error(err))
  }, [])

  const summary = metrics?.summary
  const amcChart = metrics ? Object.entries(metrics.amc_status).map(([name, count]) => ({ name, count })) : []
  const leadChart = metrics ? Object.entries(metrics.lead_status).map(([name, count]) => ({ name, count })) : []
  const monthlyValue = metrics?.monthly_amc_value || []
  const topClients = metrics?.top_clients || []
  const topProducts = metrics?.top_products || []
  const upcomingRenewals = metrics?.upcoming_renewals || []
  const leadFollowups = metrics?.lead_followups || []
  const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#7c3aed', '#0891b2']

  if (!summary) return <p>Loading dashboard...</p>

  return (
    <>
      <div className="dashboard-title">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Renewals, revenue, client coverage, and lead movement from live database records.</p>
        </div>
        <div className="dashboard-date">Updated now</div>
      </div>

      <div className="kpi-grid">
        <div className="card kpi-card priority">
          <span>Renewals due in 30 days</span>
          <strong>{summary.expiring_30}</strong>
          <small>{currency(summary.expiring_60_value)} active value due in 60 days</small>
        </div>
        <div className="card kpi-card">
          <span>Active AMC value</span>
          <strong>{currency(summary.active_revenue)}</strong>
          <small>{summary.active_amcs} active contracts</small>
        </div>
        <div className="card kpi-card risk">
          <span>Expired AMC value</span>
          <strong>{currency(summary.expired_revenue)}</strong>
          <small>{summary.expired_amcs} contracts need recovery</small>
        </div>
        <div className="card kpi-card">
          <span>Lead conversion</span>
          <strong>{summary.conversion_rate}%</strong>
          <small>{summary.converted_leads} converted from {summary.total_leads} leads</small>
        </div>
      </div>

      <div className="metric-strip">
        <div><span>Clients</span><strong>{summary.total_clients}</strong></div>
        <div><span>Products</span><strong>{summary.total_products}</strong></div>
        <div><span>Linked products</span><strong>{summary.total_ownerships}</strong></div>
        <div><span>Pending AMCs</span><strong>{summary.pending_amcs}</strong></div>
        <div><span>Renewed AMCs</span><strong>{summary.renewed_amcs}</strong></div>
        <div><span>New leads in 30 days</span><strong>{summary.recent_leads}</strong></div>
      </div>

      <div className="dashboard-grid">
        <div className="card chart-card wide">
          <h3>AMC Value Trend</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyValue}>
              <defs>
                <linearGradient id="valueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="month" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
              <Tooltip formatter={(value) => currency(value)} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }} />
              <Area type="monotone" dataKey="value" stroke="#2563eb" fill="url(#valueFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card chart-card">
          <h3>AMC Health</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={amcChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {amcChart.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card chart-card">
          <h3>Lead Pipeline</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={leadChart} dataKey="count" nameKey="name" innerRadius={55} outerRadius={95}>
                {leadChart.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>Top Clients By AMC Value</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topClients} layout="vertical" margin={{ left: 28 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis type="number" stroke="var(--text-secondary)" tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
              <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" width={90} />
              <Tooltip formatter={(value) => currency(value)} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }} />
              <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card chart-card">
          <h3>Most Owned Products</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" stroke="var(--text-secondary)" interval={0} angle={-18} textAnchor="end" height={70} />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }} />
              <Bar dataKey="owners" fill="#0891b2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-grid lower">
        <div className="card">
          <div className="section-header compact">
            <h3>Upcoming Renewals</h3>
            <span className="badge badge-warning">Action Queue</span>
          </div>
          <div className="table-container">
            <table className="table compact-table">
              <thead><tr><th>Client</th><th>Product</th><th>Due</th><th>Value</th><th>Days</th></tr></thead>
              <tbody>
                {upcomingRenewals.map(item => (
                  <tr key={item.id}>
                    <td>{item.client}</td>
                    <td>{item.product}</td>
                    <td>{item.end_date}</td>
                    <td>{currency(item.amount)}</td>
                    <td><span className={`badge ${item.days_left <= 30 ? 'badge-danger' : 'badge-warning'}`}>{item.days_left}</span></td>
                  </tr>
                ))}
                {upcomingRenewals.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No active renewals due</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="section-header compact">
            <h3>Lead Follow-Ups</h3>
            <span className="badge badge-warning">Open Pipeline</span>
          </div>
          <div className="followup-list">
            {leadFollowups.map(lead => (
              <div className="followup-item" key={lead.id}>
                <div>
                  <strong>{lead.name}</strong>
                  <span>{lead.phone || 'No phone'} · {lead.notes || 'No notes'}</span>
                </div>
                <span className={`badge ${statusClass(lead.status)}`}>{lead.status}</span>
              </div>
            ))}
            {leadFollowups.length === 0 && <p>No open lead follow-ups.</p>}
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard
