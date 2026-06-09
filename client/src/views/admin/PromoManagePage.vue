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
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold">Промокоды</h1>
          <button @click="showForm = true" class="btn-primary text-sm">+ Создать</button>
        </div>

        <div class="bg-surface-card rounded-xl border border-border overflow-hidden mb-6">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-gray-400 border-b border-border">
                  <th class="px-4 py-3 font-medium">Код</th>
                  <th class="px-4 py-3 font-medium">Скидка</th>
                  <th class="px-4 py-3 font-medium">Мин. заказ</th>
                  <th class="px-4 py-3 font-medium">Использований</th>
                  <th class="px-4 py-3 font-medium">Действует до</th>
                  <th class="px-4 py-3 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="promo in promos" :key="promo.id" class="border-b border-border/50 hover:bg-surface-hover/50">
                  <td class="px-4 py-3 text-primary font-mono font-bold">{{ promo.code }}</td>
                  <td class="px-4 py-3 text-white">
                    {{ promo.discount_type === 'percent' ? `${promo.discount_value}%` : formatPrice(promo.discount_value) }}
                  </td>
                  <td class="px-4 py-3 text-gray-300">{{ formatPrice(promo.min_order) }}</td>
                  <td class="px-4 py-3 text-gray-300">{{ promo.used_count }}/{{ promo.max_uses }}</td>
                  <td class="px-4 py-3 text-gray-400">{{ promo.expires_at || 'Бессрочно' }}</td>
                  <td class="px-4 py-3">
                    <button @click="handleDelete(promo)" class="text-red-400 hover:text-red-300 text-xs">Удалить</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Create form -->
        <BaseModal v-model="showForm" title="Новый промокод">
          <form @submit.prevent="savePromo" class="space-y-4">
            <div>
              <label class="block text-sm text-gray-300 mb-1">Код</label>
              <input v-model="form.code" class="input-field text-sm" required placeholder="SUMMER20" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-300 mb-1">Тип</label>
                <select v-model="form.discount_type" class="input-field text-sm">
                  <option value="percent">Процент</option>
                  <option value="fixed">Фиксированная</option>
                </select>
              </div>
              <div>
                <label class="block text-sm text-gray-300 mb-1">Размер скидки</label>
                <input v-model.number="form.discount_value" type="number" class="input-field text-sm" required min="0" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-300 mb-1">Мин. заказ (₽)</label>
                <input v-model.number="form.min_order" type="number" class="input-field text-sm" min="0" />
              </div>
              <div>
                <label class="block text-sm text-gray-300 mb-1">Макс. использований</label>
                <input v-model.number="form.max_uses" type="number" class="input-field text-sm" min="1" />
              </div>
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-1">Действует до</label>
              <input v-model="form.expires_at" type="date" class="input-field text-sm" />
            </div>
            <div class="flex gap-2">
              <button type="submit" class="btn-primary text-sm">Создать</button>
              <button type="button" @click="showForm = false" class="btn-secondary text-sm">Отмена</button>
            </div>
          </form>
        </BaseModal>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getAdminPromos, createPromo, deletePromo } from '@/api/admin'
import { formatPrice } from '@/utils/formatPrice'
import BaseModal from '@/components/ui/BaseModal.vue'

const navLinks = [
  { to: '/admin', label: 'Дашборд', icon: '📊' },
  { to: '/admin/games', label: 'Товары', icon: '🎮' },
  { to: '/admin/orders', label: 'Заказы', icon: '📦' },
  { to: '/admin/users', label: 'Пользователи', icon: '👥' },
  { to: '/admin/promo', label: 'Промокоды', icon: '🏷️' }
]

const promos = ref([])
const showForm = ref(false)
const form = reactive({
  code: '', discount_type: 'percent', discount_value: 10,
  min_order: 0, max_uses: 100, expires_at: ''
})

async function savePromo() {
  try {
    await createPromo({ ...form })
    showForm.value = false
    await loadPromos()
    Object.assign(form, { code: '', discount_type: 'percent', discount_value: 10, min_order: 0, max_uses: 100, expires_at: '' })
  } catch (e) {
    alert(e.response?.data?.error || 'Ошибка')
  }
}

async function handleDelete(promo) {
  if (!confirm(`Удалить промокод "${promo.code}"?`)) return
  await deletePromo(promo.id)
  await loadPromos()
}

async function loadPromos() {
  const { data } = await getAdminPromos()
  promos.value = data.codes
}

onMounted(loadPromos)
</script>
