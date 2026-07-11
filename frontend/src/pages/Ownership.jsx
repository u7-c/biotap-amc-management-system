import { useEffect, useState } from 'react'
import api from '../api'
import Modal from '../components/Modal'

function Ownership() {
  const [ownerships, setOwnerships] = useState([])
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ client_id: '', product_id: '', purchase_date: '' })

  const loadData = () => {
    Promise.all([api.get('/client-products/'), api.get('/clients/'), api.get('/products/')])
      .then(([ownershipRes, clientRes, productRes]) => {
        setOwnerships(ownershipRes.data)
        setClients(clientRes.data)
        setProducts(productRes.data)
      })
  }

  useEffect(() => { loadData() }, [])

  const clientMap = Object.fromEntries(clients.map(item => [item.id, item]))
  const productMap = Object.fromEntries(products.map(item => [item.id, item]))

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({ client_id: '', product_id: '', purchase_date: '' })
  }

  const submit = (event) => {
    event.preventDefault()
    const payload = {
      client_id: parseInt(formData.client_id),
      product_id: parseInt(formData.product_id),
      purchase_date: formData.purchase_date,
    }
    const request = editingId ? api.put(`/client-products/${editingId}`, payload) : api.post('/client-products/', payload)
    request.then(() => { loadData(); closeModal() }).catch(() => alert('Error saving ownership record'))
  }

  const edit = (record) => {
    setEditingId(record.id)
    setFormData(record)
    setIsModalOpen(true)
  }

  const remove = (id) => {
    if (!confirm('Delete this ownership record?')) return
    api.delete(`/client-products/${id}`).then(loadData).catch(() => alert('Error deleting ownership record'))
  }

  return (
    <>
      <div className="card">
        <div className="section-header">
          <h2>Client Products</h2>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Link Product</button>
        </div>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>ID</th><th>Client</th><th>Product</th><th>Purchase Date</th><th>Actions</th></tr></thead>
            <tbody>
              {ownerships.map(record => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{clientMap[record.client_id]?.name || record.client_id}</td>
                  <td>{productMap[record.product_id]?.name || record.product_id}</td>
                  <td>{record.purchase_date}</td>
                  <td className="action-cell">
                    <button className="btn" onClick={() => edit(record)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => remove(record.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {ownerships.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No ownership records found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? 'Edit Ownership' : 'Link Client To Product'}>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Client</label>
            <select required className="form-control" value={formData.client_id} onChange={e => setFormData({ ...formData, client_id: e.target.value })}>
              <option value="">Select Client</option>
              {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Product</label>
            <select required className="form-control" value={formData.product_id} onChange={e => setFormData({ ...formData, product_id: e.target.value })}>
              <option value="">Select Product</option>
              {products.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Purchase Date</label>
            <input required type="date" className="form-control" value={formData.purchase_date} onChange={e => setFormData({ ...formData, purchase_date: e.target.value })} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default Ownership
