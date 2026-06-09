import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCart, addToCart as apiAdd, removeFromCart as apiRemove, updateCartItem, clearCart as apiClear } from '@/api/cart'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const loading = ref(false)
  const total = ref(0)

  const itemCount = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))
  const isEmpty = computed(() => items.value.length === 0)

  async function fetchCart() {
    try {
      loading.value = true
      const { data } = await getCart()
      items.value = data.items
      total.value = data.total
    } catch {
      items.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  async function addItem(gameId) {
    await apiAdd(gameId)
    await fetchCart()
  }

  async function removeItem(id) {
    await apiRemove(id)
    await fetchCart()
  }

  async function updateQuantity(id, quantity) {
    await updateCartItem(id, quantity)
    await fetchCart()
  }

  async function clearAll() {
    await apiClear()
    items.value = []
    total.value = 0
  }

  return { items, loading, total, itemCount, isEmpty, fetchCart, addItem, removeItem, updateQuantity, clearAll }
})
