import api from './index'

export function getCart() {
  return api.get('/cart')
}

export function addToCart(gameId, quantity = 1) {
  return api.post('/cart', { gameId, quantity })
}

export function updateCartItem(id, quantity) {
  return api.put(`/cart/${id}`, { quantity })
}

export function removeFromCart(id) {
  return api.delete(`/cart/${id}`)
}

export function clearCart() {
  return api.delete('/cart')
}
