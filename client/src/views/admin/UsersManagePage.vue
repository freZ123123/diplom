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
        <h1 class="text-2xl font-bold mb-6">Пользователи</h1>
        <div class="bg-surface-card rounded-xl border border-border overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-gray-400 border-b border-border">
                  <th class="px-4 py-3 font-medium">ID</th>
                  <th class="px-4 py-3 font-medium">Имя</th>
                  <th class="px-4 py-3 font-medium">Email</th>
                  <th class="px-4 py-3 font-medium">Баланс</th>
                  <th class="px-4 py-3 font-medium">Роль</th>
                  <th class="px-4 py-3 font-medium">Дата регистрации</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id" class="border-b border-border/50 hover:bg-surface-hover/50">
                  <td class="px-4 py-3 text-gray-400">{{ user.id }}</td>
                  <td class="px-4 py-3 text-white font-medium">{{ user.username }}</td>
                  <td class="px-4 py-3 text-gray-300">{{ user.email }}</td>
                  <td class="px-4 py-3 text-primary">{{ formatPrice(user.balance) }}</td>
                  <td class="px-4 py-3">
                    <select
                      :value="user.role"
                      @change="changeRole(user.id, $event.target.value)"
                      class="bg-surface-elevated border border-border rounded px-2 py-1 text-xs text-white"
                    >
                      <option value="user">Пользователь</option>
                      <option value="admin">Администратор</option>
                    </select>
                  </td>
                  <td class="px-4 py-3 text-gray-400">{{ formatDate(user.created_at) }}</td>
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
import { getAdminUsers, updateUserRole } from '@/api/admin'
import { formatPrice } from '@/utils/formatPrice'
import { formatDate } from '@/utils/formatDate'

const navLinks = [
  { to: '/admin', label: 'Дашборд', icon: '📊' },
  { to: '/admin/games', label: 'Товары', icon: '🎮' },
  { to: '/admin/orders', label: 'Заказы', icon: '📦' },
  { to: '/admin/users', label: 'Пользователи', icon: '👥' },
  { to: '/admin/promo', label: 'Промокоды', icon: '🏷️' }
]

const users = ref([])

async function changeRole(id, role) {
  await updateUserRole(id, role)
}

onMounted(async () => {
  const { data } = await getAdminUsers()
  users.value = data.users
})
</script>
