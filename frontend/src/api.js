import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'),
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('amc_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
