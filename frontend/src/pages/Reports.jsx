import { useEffect, useState } from 'react'
import api from '../api'

const reportOptions = [
  { value: 'amcs', label: 'AMC Reports' },
  { value: 'clients', label: 'Client Reports' },
  { value: 'products', label: 'Product Reports' },
]

function Reports() {
  const [reportType, setReportType] = useState('amcs')
  const [rows, setRows] = useState([])

  useEffect(() => {
    api.get(`/analytics/reports/${reportType}`).then(res => setRows(res.data))
  }, [reportType])

  const columns = rows[0] ? Object.keys(rows[0]) : []

  const exportCsv = () => {
    if (!rows.length) return
    const csv = [columns.join(','), ...rows.map(row => columns.map(column => `"${String(row[column] ?? '').replaceAll('"', '""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${reportType}-report.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="card">
      <div className="section-header">
        <h2>Reports</h2>
        <button className="btn btn-primary" onClick={exportCsv}>Export CSV</button>
      </div>
      <div className="filter-row">
        <select className="form-control" value={reportType} onChange={e => setReportType(e.target.value)}>
          {reportOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>
      <div className="table-container">
        <table className="table">
          <thead><tr>{columns.map(column => <th key={column}>{column.replaceAll('_', ' ')}</th>)}</tr></thead>
          <tbody>
            {rows.map(row => <tr key={row.id}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}
            {rows.length === 0 && <tr><td style={{ textAlign: 'center' }}>No report data found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Reports
