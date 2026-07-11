import { useState, useEffect } from 'react'
import api from '../api'
import Modal from '../components/Modal'

function Leads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', status: 'New', notes: '' })

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = () => {
    setLoading(true)
    api.get('/leads/')
      .then(res => {
        setLeads(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const request = editingId ? api.put(`/leads/${editingId}`, formData) : api.post('/leads/', formData)
    request
      .then(() => {
        fetchLeads()
        closeModal()
      })
      .catch(() => {
        alert("Error creating lead")
      })
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({ name: '', email: '', phone: '', status: 'New', notes: '' })
  }

  const startEdit = (lead) => {
    setEditingId(lead.id)
    setFormData({ name: lead.name, email: lead.email || '', phone: lead.phone || '', status: lead.status, notes: lead.notes || '' })
    setIsModalOpen(true)
  }

  const deleteLead = (id) => {
    if (!confirm('Delete this lead?')) return
    api.delete(`/leads/${id}`).then(fetchLeads).catch(() => alert('Error deleting lead'))
  }

  const filteredLeads = leads.filter(lead => {
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter
    const matchesQuery = [lead.name, lead.email, lead.phone, lead.notes].some(value =>
      String(value || '').toLowerCase().includes(query.toLowerCase())
    )
    return matchesStatus && matchesQuery
  })

  return (
    <>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Leads</h2>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Add Lead</button>
        </div>
        <div className="filter-row">
          <input className="form-control" placeholder="Search leads" value={query} onChange={e => setQuery(e.target.value)} />
          <select className="form-control" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option>All</option>
            <option>New</option>
            <option>Contacted</option>
            <option>Converted</option>
            <option>Lost</option>
          </select>
        </div>
        
        {loading ? <p>Loading leads...</p> : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map(lead => (
                  <tr key={lead.id}>
                    <td>{lead.id}</td>
                    <td>{lead.name}</td>
                    <td>{lead.email}</td>
                    <td>{lead.phone || 'N/A'}</td>
                    <td>
                      <span className={`badge ${lead.status === 'New' ? 'badge-warning' : (lead.status === 'Converted' ? 'badge-success' : 'badge-danger')}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td>{lead.notes || 'N/A'}</td>
                    <td className="action-cell">
                      <button className="btn" onClick={() => startEdit(lead)}>Edit</button>
                      <button className="btn btn-danger" onClick={() => deleteLead(lead.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && (
                  <tr><td colSpan="7" style={{ textAlign: 'center' }}>No leads found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? 'Edit Lead' : 'Add New Lead'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input required type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input required type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input type="text" className="form-control" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-control" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
            <button type="button" className="btn" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Lead</button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default Leads
