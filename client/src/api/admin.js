import api from './index'

export function getStats() {
  return api.get('/admin/stats')
}

export function getAdminGames() {
  return api.get('/admin/games')
}

export function createGame(data) {
  return api.post('/admin/games', data)
}

export function updateGame(id, data) {
  return api.put(`/admin/games/${id}`, data)
}

export function deleteGame(id) {
  return api.delete(`/admin/games/${id}`)
}

export function addGameKeys(id, keys) {
  return api.post(`/admin/games/${id}/keys`, { keys })
}

export function uploadImage(file) {
  const fd = new FormData()
  fd.append('image', file)
  return api.post('/admin/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function getAdminOrders() {
  return api.get('/admin/orders')
}

export function updateOrderStatus(id, status) {
  return api.put(`/admin/orders/${id}/status`, { status })
}

export function getAdminUsers() {
  return api.get('/admin/users')
}

export function updateUserRole(id, role) {
  return api.put(`/admin/users/${id}/role`, { role })
}

export function getAdminPromos() {
  return api.get('/admin/promo')
}

export function createPromo(data) {
  return api.post('/admin/promo', data)
}

export function deletePromo(id) {
  return api.delete(`/admin/promo/${id}`)
}
