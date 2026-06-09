import api from './index'

export function getWishlist() {
  return api.get('/wishlist')
}

export function toggleWishlist(gameId) {
  return api.post('/wishlist', { gameId })
}

export function removeFromWishlist(gameId) {
  return api.delete(`/wishlist/${gameId}`)
}
