<template>
  <div class="page-container">
    <div class="flex gap-8">
      <aside class="hidden lg:block w-56 shrink-0">
        <nav class="bg-surface-card rounded-xl border border-border p-4 sticky top-20 space-y-1">
          <router-link v-for="link in navLinks" :key="link.to" :to="link.to"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
            :class="$route.path === link.to ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-white hover:bg-surface-hover'">
            <span>{{ link.icon }}</span><span>{{ link.label }}</span>
          </router-link>
        </nav>
      </aside>
      <div class="flex-1 min-w-0">
        <h1 class="text-2xl font-bold mb-6">Заказы</h1>
        <div class="bg-surface-card rounded-xl border border-border overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-gray-400 border-b border-border">
                  <th class="px-4 py-3 font-medium">ID</th>
                  <th class="px-4 py-3 font-medium">Пользователь</th>
                  <th class="px-4 py-3 font-medium">Сумма</th>
                  <th class="px-4 py-3 font-medium">Статус</th>
                  <th class="px-4 py-3 font-medium">Способ оплаты</th>
                  <th class="px-4 py-3 font-medium">Дата</th>
                  <th class="px-4 py-3 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in orders" :key="order.id" class="border-b border-border/50 hover:bg-surface-hover/50">
                  <td class="px-4 py-3 text-white">#{{ order.id }}</td>
                  <td class="px-4 py-3 text-gray-300">{{ order.username }} <span class="text-gray-500 text-xs">({{ order.email }})</span></td>
                  <td class="px-4 py-3 text-primary font-medium">{{ formatPrice(order.total) }}</td>
                  <td class="px-4 py-3">
                    <select
                      :value="order.status"
                      @change="changeStatus(order.id, $event.target.value)"
                      class="bg-surface-elevated border border-border rounded px-2 py-1 text-xs text-white"
                    >
                      <option value="pending">Ожидает</option>
                      <option value="paid">Оплачен</option>
                      <option value="completed">Выполнен</option>
                      <option value="cancelled">Отменён</option>
                    </select>
                  </td>
                  <td class="px-4 py-3 text-gray-400">{{ order.payment_method || '—' }}</td>
                  <td class="px-4 py-3 text-gray-400">{{ formatDateTime(order.created_at) }}</td>
                  <td class="px-4 py-3 text-gray-400 text-xs">ID:{{ order.user_id }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAdminOrders, updateOrderStatus } from '@/api/admin'
import { formatPrice } from '@/utils/formatPrice'
import { formatDateTime } from '@/utils/formatDate'

const navLinks = [
  { to: '/admin', label: 'Дашборд', icon: '📊' },
  { to: '/admin/games', label: 'Товары', icon: '🎮' },
  { to: '/admin/orders', label: 'Заказы', icon: '📦' },
  { to: '/admin/users', label: 'Пользователи', icon: '👥' },
  { to: '/admin/promo', label: 'Промокоды', icon: '🏷️' }
]

const orders = ref([])

async function changeStatus(id, status) {
  await updateOrderStatus(id, status)
  const order = orders.value.find(o => o.id === id)
  if (order) order.status = status
}

onMounted(async () => {
  const { data } = await getAdminOrders()
  orders.value = data.orders
})
</script>
