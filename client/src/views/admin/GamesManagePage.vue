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
          <h1 class="text-2xl font-bold">Управление товарами</h1>
          <button @click="openForm()" class="btn-primary text-sm">+ Добавить</button>
        </div>

        <div class="bg-surface-card rounded-xl border border-border overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-gray-400 border-b border-border">
                  <th class="px-4 py-3 font-medium">ID</th>
                  <th class="px-4 py-3 font-medium">Название</th>
                  <th class="px-4 py-3 font-medium">Цена</th>
                  <th class="px-4 py-3 font-medium">Категория</th>
                  <th class="px-4 py-3 font-medium">Остаток</th>
                  <th class="px-4 py-3 font-medium">Статус</th>
                  <th class="px-4 py-3 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="game in games" :key="game.id" class="border-b border-border/50 hover:bg-surface-hover/50">
                  <td class="px-4 py-3 text-gray-400">{{ game.id }}</td>
                  <td class="px-4 py-3 text-white font-medium">{{ game.title }}</td>
                  <td class="px-4 py-3 text-primary">{{ formatPrice(game.price) }}</td>
                  <td class="px-4 py-3 text-gray-300">{{ game.category_name }}</td>
                  <td class="px-4 py-3" :class="game.stock > 10 ? 'text-green-400' : 'text-red-400'">{{ game.stock }}</td>
                  <td class="px-4 py-3">
                    <span :class="game.is_active ? 'badge-green' : 'badge-red'">{{ game.is_active ? 'Активен' : 'Скрыт' }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex gap-2">
                      <button @click="openForm(game)" class="text-gray-400 hover:text-primary text-xs">Ред.</button>
                      <button @click="handleDelete(game)" class="text-gray-400 hover:text-red-400 text-xs">Скрыть</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Edit modal -->
        <BaseModal v-model="showForm" :title="editingGame ? 'Редактировать товар' : 'Новый товар'" max-width="lg">
          <form @submit.prevent="saveGame" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-300 mb-1">Название</label>
                <input v-model="form.title" class="input-field text-sm" required />
              </div>
              <div>
                <label class="block text-sm text-gray-300 mb-1">Цена (₽)</label>
                <input v-model.number="form.price" type="number" class="input-field text-sm" required min="0" />
              </div>
              <div>
                <label class="block text-sm text-gray-300 mb-1">Старая цена</label>
                <input v-model.number="form.old_price" type="number" class="input-field text-sm" min="0" />
              </div>
              <div>
                <label class="block text-sm text-gray-300 mb-1">Категория</label>
                <select v-model.number="form.category_id" class="input-field text-sm" required>
                  <option :value="1">Игры</option>
                  <option :value="2">Подарочные карты</option>
                  <option :value="3">Игровая валюта</option>
                  <option :value="4">Подписки</option>
                </select>
              </div>
              <div>
                <label class="block text-sm text-gray-300 mb-1">Платформа</label>
                <select v-model.number="form.platform_id" class="input-field text-sm">
                  <option :value="null">—</option>
                  <option :value="1">Steam</option>
                  <option :value="2">PlayStation</option>
                  <option :value="3">Xbox</option>
                  <option :value="4">Nintendo</option>
                  <option :value="5">PC</option>
                </select>
              </div>
              <div>
                <label class="block text-sm text-gray-300 mb-1">Жанр</label>
                <input v-model="form.genre" class="input-field text-sm" placeholder="action, rpg, shooter..." />
              </div>
              <div>
                <label class="block text-sm text-gray-300 mb-1">Разработчик</label>
                <input v-model="form.developer" class="input-field text-sm" />
              </div>
              <div>
                <label class="block text-sm text-gray-300 mb-1">Издатель</label>
                <input v-model="form.publisher" class="input-field text-sm" />
              </div>
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-1">Краткое описание</label>
              <input v-model="form.short_desc" class="input-field text-sm" />
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-1">Полное описание</label>
              <textarea v-model="form.description" rows="4" class="input-field text-sm"></textarea>
            </div>
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" v-model="form.is_featured" class="rounded" />
                Показывать в рекомендуемых
              </label>
            </div>
            <div class="flex gap-2 pt-2">
              <button type="submit" class="btn-primary text-sm">{{ editingGame ? 'Сохранить' : 'Создать' }}</button>
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
import { getAdminGames, createGame, updateGame, deleteGame } from '@/api/admin'
import { formatPrice } from '@/utils/formatPrice'
import BaseModal from '@/components/ui/BaseModal.vue'

const navLinks = [
  { to: '/admin', label: 'Дашборд', icon: '📊' },
  { to: '/admin/games', label: 'Товары', icon: '🎮' },
  { to: '/admin/orders', label: 'Заказы', icon: '📦' },
  { to: '/admin/users', label: 'Пользователи', icon: '👥' },
  { to: '/admin/promo', label: 'Промокоды', icon: '🏷️' }
]

const games = ref([])
const showForm = ref(false)
const editingGame = ref(null)

const defaultForm = {
  title: '', price: 0, old_price: null, category_id: 1, platform_id: null,
  genre: '', developer: '', publisher: '', short_desc: '', description: '',
  is_featured: false, product_type: 'key'
}
const form = reactive({ ...defaultForm })

function openForm(game = null) {
  editingGame.value = game
  if (game) {
    Object.assign(form, {
      title: game.title, price: game.price, old_price: game.old_price,
      category_id: game.category_id, platform_id: game.platform_id,
      genre: game.genre || '', developer: game.developer || '',
      publisher: game.publisher || '', short_desc: game.short_desc || '',
      description: game.description || '', is_featured: !!game.is_featured,
      product_type: game.product_type
    })
  } else {
    Object.assign(form, defaultForm)
  }
  showForm.value = true
}

async function saveGame() {
  try {
    if (editingGame.value) {
      await updateGame(editingGame.value.id, { ...form })
    } else {
      await createGame({ ...form })
    }
    showForm.value = false
    await loadGames()
  } catch (e) {
    alert(e.response?.data?.error || 'Ошибка')
  }
}

async function handleDelete(game) {
  if (!confirm(`Скрыть "${game.title}"?`)) return
  await deleteGame(game.id)
  await loadGames()
}

async function loadGames() {
  const { data } = await getAdminGames()
  games.value = data.games
}

onMounted(loadGames)
</script>
