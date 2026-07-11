import { useEffect, useState } from 'react'
import api from '../api'
import Modal from '../components/Modal'

function UserManagement() {
  const [users, setUsers] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ email: '', password: '', is_active: true })

  const loadUsers = () => api.get('/users/').then(res => setUsers(res.data))
  useEffect(() => { loadUsers() }, [])

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({ email: '', password: '', is_active: true })
  }

  const submit = (event) => {
    event.preventDefault()
    const payload = editingId ? formData : { email: formData.email, password: formData.password }
    const request = editingId ? api.put(`/users/${editingId}`, payload) : api.post('/users/', payload)
    request.then(() => { loadUsers(); closeModal() }).catch(err => alert(err.response?.data?.detail || 'Error saving user'))
  }

  const edit = (user) => {
    setEditingId(user.id)
    setFormData({ email: user.email, password: '', is_active: user.is_active })
    setIsModalOpen(true)
  }

  const remove = (id) => {
    if (!confirm('Delete this user?')) return
    api.delete(`/users/${id}`).then(loadUsers).catch(err => alert(err.response?.data?.detail || 'Error deleting user'))
  }

  return (
    <>
      <div className="card">
        <div className="section-header">
          <h2>User Management</h2>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Add User</button>
        </div>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>ID</th><th>Username</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td><span className={`badge ${user.is_active ? 'badge-success' : 'badge-danger'}`}>{user.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td className="action-cell">
                    <button className="btn" onClick={() => edit(user)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => remove(user.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? 'Edit User' : 'Add User'}>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input required className="form-control" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input required={!editingId} type="password" className="form-control" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
          </div>
          {editingId && (
            <label className="checkbox-row">
              <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
              Active
            </label>
          )}
          <div className="modal-actions">
            <button type="button" className="btn" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save User</button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default UserManagement
