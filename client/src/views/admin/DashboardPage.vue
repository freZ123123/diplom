<template>
  <div class="page-container">
    <div class="flex gap-8">
      <!-- Sidebar -->
      <aside class="hidden lg:block w-56 shrink-0">
        <nav class="bg-surface-card rounded-xl border border-border p-4 sticky top-20 space-y-1">
          <router-link v-for="link in navLinks" :key="link.to" :to="link.to"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
            :class="$route.path === link.to ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-white hover:bg-surface-hover'">
            <span>{{ link.icon }}</span>
            <span>{{ link.label }}</span>
          </router-link>
        </nav>
      </aside>

      <div class="flex-1 min-w-0">
        <h1 class="text-2xl font-bold mb-6">Панель управления</h1>

        <!-- Stats cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="bg-surface-card rounded-xl border border-border p-5">
            <p class="text-sm text-gray-400 mb-1">Выручка</p>
            <p class="text-2xl font-bold text-primary">{{ formatPrice(stats.totalRevenue) }}</p>
          </div>
          <div class="bg-surface-card rounded-xl border border-border p-5">
            <p class="text-sm text-gray-400 mb-1">Заказов</p>
            <p class="text-2xl font-bold">{{ stats.totalOrders }}</p>
          </div>
          <div class="bg-surface-card rounded-xl border border-border p-5">
            <p class="text-sm text-gray-400 mb-1">Пользователей</p>
            <p class="text-2xl font-bold">{{ stats.totalUsers }}</p>
          </div>
          <div class="bg-surface-card rounded-xl border border-border p-5">
            <p class="text-sm text-gray-400 mb-1">Товаров</p>
            <p class="text-2xl font-bold">{{ stats.totalGames }}</p>
          </div>
        </div>

        <!-- Recent orders -->
        <div class="bg-surface-card rounded-xl border border-border">
          <div class="p-5 border-b border-border">
            <h2 class="text-lg font-semibold">Последние заказы</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-gray-400 border-b border-border">
                  <th class="px-5 py-3 font-medium">ID</th>
                  <th class="px-5 py-3 font-medium">Пользователь</th>
                  <th class="px-5 py-3 font-medium">Сумма</th>
                  <th class="px-5 py-3 font-medium">Статус</th>
                  <th class="px-5 py-3 font-medium">Дата</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in stats.recentOrders" :key="order.id" class="border-b border-border/50 hover:bg-surface-hover/50">
                  <td class="px-5 py-3 text-white">#{{ order.id }}</td>
                  <td class="px-5 py-3 text-gray-300">{{ order.username }}</td>
                  <td class="px-5 py-3 text-primary font-medium">{{ formatPrice(order.total) }}</td>
                  <td class="px-5 py-3">
                    <span class="badge-green" v-if="order.status === 'completed'">Выполнен</span>
                    <span class="badge-yellow" v-else-if="order.status === 'pending'">Ожидает</span>
                    <span class="badge-red" v-else>{{ order.status }}</span>
                  </td>
                  <td class="px-5 py-3 text-gray-400">{{ formatDateTime(order.created_at) }}</td>
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
import { getStats } from '@/api/admin'
import { formatPrice } from '@/utils/formatPrice'
import { formatDateTime } from '@/utils/formatDate'

const navLinks = [
  { to: '/admin', label: 'Дашборд', icon: '📊' },
  { to: '/admin/games', label: 'Товары', icon: '🎮' },
  { to: '/admin/orders', label: 'Заказы', icon: '📦' },
  { to: '/admin/users', label: 'Пользователи', icon: '👥' },
  { to: '/admin/promo', label: 'Промокоды', icon: '🏷️' }
]

const stats = ref({ totalRevenue: 0, totalOrders: 0, totalUsers: 0, totalGames: 0, recentOrders: [] })

onMounted(async () => {
  try {
    const { data } = await getStats()
    stats.value = data
  } catch (e) {
    console.error('Не удалось загрузить статистику', e)
  }
})
</script>
