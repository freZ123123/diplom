<template>
  <div class="page-container">
    <div v-if="loading" class="space-y-6">
      <div class="skeleton h-8 w-64 rounded"></div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 skeleton aspect-video rounded-xl"></div>
        <div class="space-y-4">
          <div class="skeleton h-6 w-48 rounded"></div>
          <div class="skeleton h-10 w-32 rounded"></div>
          <div class="skeleton h-12 w-full rounded"></div>
        </div>
      </div>
    </div>

    <div v-else-if="!game" class="text-center py-16">
      <p class="text-gray-400 text-2xl mb-2">Игра не найдена</p>
      <router-link to="/catalog" class="text-primary hover:underline">Вернуться в каталог</router-link>
    </div>

    <template v-else>
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <router-link to="/" class="hover:text-white transition-colors">Главная</router-link>
        <span>/</span>
        <router-link to="/catalog" class="hover:text-white transition-colors">Каталог</router-link>
        <span>/</span>
        <span class="text-white">{{ game.title }}</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left: image and description -->
        <div class="lg:col-span-2 space-y-6">
          <div class="aspect-video bg-surface-card rounded-xl overflow-hidden border border-border">
            <img v-if="game.image_url" :src="game.image_url" :alt="game.title" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-600">
              <svg class="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div class="bg-surface-card rounded-xl border border-border p-6">
            <h2 class="text-lg font-semibold mb-3">Описание</h2>
            <p class="text-gray-300 leading-relaxed whitespace-pre-line">{{ game.description }}</p>
          </div>

          <!-- Reviews -->
          <div class="bg-surface-card rounded-xl border border-border p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold">Отзывы ({{ reviews.length }})</h2>
              <button v-if="auth.isLoggedIn && !hasUserReview" @click="showReviewForm = !showReviewForm" class="text-sm text-primary hover:underline">
                Оставить отзыв
              </button>
            </div>

            <div v-if="showReviewForm" class="mb-6 p-4 bg-surface-elevated rounded-lg border border-border">
              <div class="mb-3">
                <label class="block text-sm text-gray-300 mb-1">Оценка</label>
                <StarRating v-model="newReview.rating" />
              </div>
              <div class="mb-3">
                <textarea v-model="newReview.comment" rows="3" class="input-field text-sm" placeholder="Ваш отзыв..."></textarea>
              </div>
              <div class="flex gap-2">
                <button @click="submitReview" class="btn-primary text-sm py-2" :disabled="!newReview.rating">Отправить</button>
                <button @click="showReviewForm = false" class="btn-secondary text-sm py-2">Отмена</button>
              </div>
            </div>

            <div v-if="reviews.length === 0" class="text-gray-500 text-sm">Отзывов пока нет. Будьте первым!</div>
            <div v-else class="space-y-4">
              <div v-for="review in reviews" :key="review.id" class="flex gap-3 p-3 bg-surface-elevated rounded-lg">
                <div class="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold shrink-0">
                  {{ review.username.charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-sm font-medium">{{ review.username }}</span>
                    <StarRating :model-value="review.rating" readonly />
                    <span class="text-xs text-gray-500">{{ formatDate(review.created_at) }}</span>
                  </div>
                  <p class="text-sm text-gray-300">{{ review.comment }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: purchase card -->
        <div class="space-y-4">
          <div class="bg-surface-card rounded-xl border border-border p-6 sticky top-20">
            <h1 class="text-2xl font-bold mb-2">{{ game.title }}</h1>
            <p class="text-sm text-gray-400 mb-4">{{ game.short_desc }}</p>

            <div class="flex items-baseline gap-3 mb-4">
              <span class="text-3xl font-extrabold text-primary">{{ formatPrice(game.price) }}</span>
              <span v-if="game.old_price" class="text-lg text-gray-500 line-through">{{ formatPrice(game.old_price) }}</span>
              <span v-if="game.old_price" class="badge-green text-xs">-{{ Math.round((1 - game.price / game.old_price) * 100) }}%</span>
            </div>

            <div class="space-y-2 text-sm text-gray-400 mb-6">
              <div v-if="game.platform_name" class="flex justify-between">
                <span>Платформа</span>
                <span class="text-white">{{ game.platform_name }}</span>
              </div>
              <div v-if="game.genre" class="flex justify-between">
                <span>Жанр</span>
                <span class="text-white">{{ GENRES[game.genre] || game.genre }}</span>
              </div>
              <div v-if="game.developer" class="flex justify-between">
                <span>Разработчик</span>
                <span class="text-white">{{ game.developer }}</span>
              </div>
              <div v-if="game.release_date" class="flex justify-between">
                <span>Дата выхода</span>
                <span class="text-white">{{ formatDate(game.release_date) }}</span>
              </div>
              <div class="flex justify-between">
                <span>В наличии</span>
                <span :class="game.stock > 0 ? 'text-primary' : 'text-red-400'">
                  {{ game.stock > 0 ? `${game.stock} шт.` : 'Нет в наличии' }}
                </span>
              </div>
              <div v-if="game.rating > 0" class="flex justify-between items-center">
                <span>Рейтинг</span>
                <div class="flex items-center gap-1">
                  <StarRating :model-value="game.rating" readonly />
                  <span class="text-white ml-1">{{ game.rating }}</span>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <button
                @click="handleAddToCart"
                :disabled="game.stock < 1"
                class="w-full btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ game.stock > 0 ? 'В корзину' : 'Нет в наличии' }}
              </button>
              <button
                v-if="auth.isLoggedIn"
                @click="handleWishlist"
                class="w-full btn-secondary py-3 flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" :class="inWishlist ? 'text-red-400' : ''" :fill="inWishlist ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {{ inWishlist ? 'В избранном' : 'В избранное' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'
import { getGame } from '@/api/games'
import { getReviews, addReview } from '@/api/reviews'
import { toggleWishlist, getWishlist } from '@/api/wishlist'
import { formatPrice } from '@/utils/formatPrice'
import { formatDate } from '@/utils/formatDate'
import { GENRES } from '@/utils/constants'
import StarRating from '@/components/ui/StarRating.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()
const toast = useToast()

const game = ref(null)
const reviews = ref([])
const loading = ref(true)
const inWishlist = ref(false)
const showReviewForm = ref(false)
const newReview = ref({ rating: 0, comment: '' })

const hasUserReview = computed(() => {
  if (!auth.user) return false
  return reviews.value.some(r => r.user_id === auth.user.id)
})

async function loadGame() {
  loading.value = true
  try {
    const { data } = await getGame(route.params.slug)
    game.value = data.game

    const reviewsRes = await getReviews(data.game.id)
    reviews.value = reviewsRes.data.reviews

    if (auth.isLoggedIn) {
      try {
        const wl = await getWishlist()
        inWishlist.value = wl.data.items.some(i => i.game_id === data.game.id)
      } catch {}
    }
  } catch {
    game.value = null
  } finally {
    loading.value = false
  }
}

async function handleAddToCart() {
  if (!auth.isLoggedIn) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  try {
    await cart.addItem(game.value.id)
    toast.success('Добавлено в корзину')
  } catch (e) {
    toast.error(e.response?.data?.error || 'Ошибка')
  }
}

async function handleWishlist() {
  try {
    const { data } = await toggleWishlist(game.value.id)
    inWishlist.value = data.added
    toast.success(data.message)
  } catch (e) {
    toast.error('Не удалось обновить избранное')
  }
}

async function submitReview() {
  try {
    await addReview(game.value.id, newReview.value.rating, newReview.value.comment)
    toast.success('Отзыв добавлен')
    showReviewForm.value = false
    newReview.value = { rating: 0, comment: '' }
    const { data } = await getReviews(game.value.id)
    reviews.value = data.reviews
  } catch (e) {
    toast.error(e.response?.data?.error || 'Ошибка')
  }
}

onMounted(loadGame)
</script>
