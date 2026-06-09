import api from './index'

export function login(email, password) {
  return api.post('/auth/login', { email, password })
}

export function register(email, username, password) {
  return api.post('/auth/register', { email, username, password })
}

export function getProfile() {
  return api.get('/auth/me')
}

export function updateProfile(data) {
  return api.put('/auth/me', data)
}

export function changePassword(currentPassword, newPassword) {
  return api.put('/auth/password', { currentPassword, newPassword })
}
