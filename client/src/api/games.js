import api from './index'

export function getGames(params = {}) {
  return api.get('/games', { params })
}

export function getFeaturedGames() {
  return api.get('/games/featured')
}

export function getGame(slug) {
  return api.get(`/games/${slug}`)
}
