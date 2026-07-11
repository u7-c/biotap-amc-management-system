import { useState, useEffect } from 'react'
import api from '../api'
import Modal from '../components/Modal'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [query, setQuery] = useState('')
  const [formData, setFormData] = useState({ name: '', category: '', price: '', description: '' })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = () => {
    setLoading(true)
    api.get('/products/')
      .then(res => {
        setProducts(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const payload = {
      ...formData,
      price: formData.price === '' ? null : parseFloat(formData.price)
    }
    
    const request = editingId ? api.put(`/products/${editingId}`, payload) : api.post('/products/', payload)
    request
      .then(() => {
        fetchProducts()
        closeModal()
      })
      .catch(() => {
        alert("Error creating product")
      })
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({ name: '', category: '', price: '', description: '' })
  }

  const startEdit = (product) => {
    setEditingId(product.id)
    setFormData({ name: product.name, category: product.category || '', price: product.price || '', description: product.description || '' })
    setIsModalOpen(true)
  }

  const deleteProduct = (id) => {
    if (!confirm('Delete this product?')) return
    api.delete(`/products/${id}`).then(fetchProducts).catch(() => alert('Error deleting product'))
  }

  const filteredProducts = products.filter(product =>
    [product.name, product.category, product.description].some(value =>
      String(value || '').toLowerCase().includes(query.toLowerCase())
    )
  )

  return (
    <>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Products</h2>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Add Product</button>
        </div>
        <input className="form-control" placeholder="Search products by name, category, or description" value={query} onChange={e => setQuery(e.target.value)} style={{ marginBottom: '1rem' }} />
        
        {loading ? <p>Loading products...</p> : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{Number(product.price || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                    <td>{product.description}</td>
                    <td className="action-cell">
                      <button className="btn" onClick={() => startEdit(product)}>Edit</button>
                      <button className="btn btn-danger" onClick={() => deleteProduct(product.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center' }}>No products found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? 'Edit Product' : 'Add New Product'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input required type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <input type="text" className="form-control" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Price</label>
            <input required type="number" step="0.01" className="form-control" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
            <button type="button" className="btn" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Product</button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default Products
