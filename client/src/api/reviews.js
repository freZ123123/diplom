import api from './index'

export function getReviews(gameId) {
  return api.get(`/reviews/game/${gameId}`)
}

export function addReview(gameId, rating, comment) {
  return api.post('/reviews', { gameId, rating, comment })
}

export function deleteReview(id) {
  return api.delete(`/reviews/${id}`)
}
