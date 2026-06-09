import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// подставляем токен в каждый запрос
api.interceptors.request.use(config => {
  const token = localStorage.getItem('ww_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// обрабатываем 401 — сбрасываем авторизацию
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ww_token')
      // не редиректим, пусть компонент сам разберётся
    }
    return Promise.reject(error)
  }
)

export default api
