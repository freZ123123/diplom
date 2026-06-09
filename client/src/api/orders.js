import api from './index'

export function createOrder(paymentMethod, promoCode) {
  return api.post('/orders', { paymentMethod, promoCode })
}

export function getOrders() {
  return api.get('/orders')
}

export function getOrder(id) {
  return api.get(`/orders/${id}`)
}
