import { useState, useEffect } from 'react'
import api from '../api'
import Modal from '../components/Modal'

function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [query, setQuery] = useState('')
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = () => {
    setLoading(true)
    api.get('/clients/')
      .then(res => {
        setClients(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    api.post('/upload/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    .then(res => {
      alert(res.data.message)
      fetchClients()
    })
    .catch(() => alert("Error uploading file"))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const request = editingId ? api.put(`/clients/${editingId}`, formData) : api.post('/clients/', formData)
    request
      .then(() => {
        fetchClients()
        closeModal()
      })
      .catch(err => {
        alert(err.response?.data?.detail || "Error creating client")
      })
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({ name: '', email: '', phone: '', address: '' })
  }

  const startEdit = (client) => {
    setEditingId(client.id)
    setFormData({ name: client.name, email: client.email, phone: client.phone || '', address: client.address || '' })
    setIsModalOpen(true)
  }

  const deleteClient = (id) => {
    if (!confirm('Delete this client?')) return
    api.delete(`/clients/${id}`).then(fetchClients).catch(() => alert('Error deleting client'))
  }

  const filteredClients = clients.filter(client =>
    [client.name, client.email, client.phone, client.address].some(value =>
      String(value || '').toLowerCase().includes(query.toLowerCase())
    )
  )

  return (
    <>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Clients</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <label className="btn btn-primary" style={{ cursor: 'pointer', backgroundColor: 'var(--success)' }}>
              Import CSV
              <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Add Client</button>
          </div>
        </div>
        <input className="form-control" placeholder="Search clients by name, email, phone, or address" value={query} onChange={e => setQuery(e.target.value)} style={{ marginBottom: '1rem' }} />
        
        {loading ? <p>Loading clients...</p> : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map(client => (
                  <tr key={client.id}>
                    <td>{client.id}</td>
                    <td>{client.name}</td>
                    <td>{client.email}</td>
                    <td>{client.phone || 'N/A'}</td>
                    <td>{client.address || 'N/A'}</td>
                    <td className="action-cell">
                      <button className="btn" onClick={() => startEdit(client)}>Edit</button>
                      <button className="btn btn-danger" onClick={() => deleteClient(client.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {filteredClients.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center' }}>No clients found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? 'Edit Client' : 'Add New Client'}>
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
            <label className="form-label">Address</label>
            <input type="text" className="form-control" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
            <button type="button" className="btn" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Client</button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default Clients
