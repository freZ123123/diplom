import api from './index'

export function createTopUp(data) {
  return api.post('/wallet/topup', data)
}

export function getTopUpHistory() {
  return api.get('/wallet/history')
}
