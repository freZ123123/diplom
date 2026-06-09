import api from './index'

export function applyPromo(code, total) {
  return api.post('/promo/apply', { code, total })
}
