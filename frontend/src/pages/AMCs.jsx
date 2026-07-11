import { useState, useEffect } from 'react'
import api from '../api'
import Modal from '../components/Modal'

function AMCs() {
  const [amcs, setAmcs] = useState([])
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('All')
  
  const [formData, setFormData] = useState({ 
    client_id: '', 
    product_id: '', 
    start_date: '', 
    end_date: '', 
    amount: '', 
    status: 'Active' 
  })

  useEffect(() => {
    fetchAMCs()
    fetchClientsAndProducts()
  }, [])

  const fetchAMCs = () => {
    setLoading(true)
    api.get('/amcs/')
      .then(res => {
        setAmcs(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  const fetchClientsAndProducts = () => {
    api.get('/clients/').then(res => setClients(res.data))
    api.get('/products/').then(res => setProducts(res.data))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...formData,
      client_id: parseInt(formData.client_id),
      product_id: parseInt(formData.product_id),
      amount: parseFloat(formData.amount)
    }

    const request = editingId ? api.put(`/amcs/${editingId}`, payload) : api.post('/amcs/', payload)
    request
      .then(() => {
        fetchAMCs()
        closeModal()
      })
      .catch(() => {
        alert("Error creating AMC")
      })
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({ client_id: '', product_id: '', start_date: '', end_date: '', amount: '', status: 'Active' })
  }

  const getProductId = (amc) => {
    const ownership = amc.client_product_id && ownershipMap[amc.client_product_id]
    return ownership?.product_id || ''
  }

  const startEdit = (amc) => {
    setEditingId(amc.id)
    setFormData({
      client_id: amc.client_id,
      product_id: getProductId(amc),
      start_date: amc.start_date,
      end_date: amc.end_date,
      amount: amc.amount,
      status: amc.status,
    })
    setIsModalOpen(true)
  }

  const deleteAMC = (id) => {
    if (!confirm('Delete this AMC?')) return
    api.delete(`/amcs/${id}`).then(fetchAMCs).catch(() => alert('Error deleting AMC'))
  }

  const [ownerships, setOwnerships] = useState([])
  const ownershipMap = Object.fromEntries(ownerships.map(item => [item.id, item]))
  const clientMap = Object.fromEntries(clients.map(item => [item.id, item]))
  const productMap = Object.fromEntries(products.map(item => [item.id, item]))

  useEffect(() => {
    api.get('/client-products/').then(res => setOwnerships(res.data)).catch(() => {})
  }, [amcs.length])

  const filteredAMCs = amcs.filter(amc => statusFilter === 'All' || amc.status === statusFilter)

  return (
    <>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>AMCs</h2>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Create AMC</button>
        </div>
        <div className="filter-row">
          <select className="form-control" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option>All</option>
            <option>Active</option>
            <option>Expired</option>
            <option>Renewed</option>
            <option>Pending</option>
          </select>
        </div>
        
        {loading ? <p>Loading AMCs...</p> : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAMCs.map(amc => {
                  const productId = getProductId(amc)
                  return (
                  <tr key={amc.id}>
                    <td>{amc.id}</td>
                    <td>{clientMap[amc.client_id]?.name || amc.client_id}</td>
                    <td>{productMap[productId]?.name || productId || 'N/A'}</td>
                    <td>{Number(amc.amount || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                    <td>{amc.start_date}</td>
                    <td>{amc.end_date}</td>
                    <td>
                      <span className={`badge ${amc.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                        {amc.status}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button className="btn" onClick={() => startEdit(amc)}>Edit</button>
                      <button className="btn btn-danger" onClick={() => deleteAMC(amc.id)}>Delete</button>
                    </td>
                  </tr>
                )})}
                {filteredAMCs.length === 0 && (
                  <tr><td colSpan="8" style={{ textAlign: 'center' }}>No AMCs found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? 'Edit AMC' : 'Create AMC'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Client</label>
            <select required className="form-control" value={formData.client_id} onChange={e => setFormData({...formData, client_id: e.target.value})}>
              <option value="">Select Client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Product</label>
            <select required className="form-control" value={formData.product_id} onChange={e => setFormData({...formData, product_id: e.target.value})}>
              <option value="">Select Product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input required type="date" className="form-control" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input required type="date" className="form-control" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Amount</label>
            <input required type="number" step="0.01" className="form-control" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Expired">Expired</option>
              <option value="Renewed">Renewed</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
            <button type="button" className="btn" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save AMC</button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default AMCs
