import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import HomePage from '@/views/HomePage.vue'

const CatalogPage = () => import('@/views/CatalogPage.vue')
const GamePage = () => import('@/views/GamePage.vue')
const CartPage = () => import('@/views/CartPage.vue')
const CheckoutPage = () => import('@/views/CheckoutPage.vue')
const ProfilePage = () => import('@/views/ProfilePage.vue')
const WalletTopUpPage = () => import('@/views/WalletTopUpPage.vue')
const LoginPage = () => import('@/views/LoginPage.vue')
const RegisterPage = () => import('@/views/RegisterPage.vue')
const OrderSuccessPage = () => import('@/views/OrderSuccessPage.vue')
const NotFoundPage = () => import('@/views/NotFoundPage.vue')

// admin
const AdminDashboard = () => import('@/views/admin/DashboardPage.vue')
const AdminGames = () => import('@/views/admin/GamesManagePage.vue')
const AdminOrders = () => import('@/views/admin/OrdersManagePage.vue')
const AdminUsers = () => import('@/views/admin/UsersManagePage.vue')
const AdminPromo = () => import('@/views/admin/PromoManagePage.vue')

const routes = [
  { path: '/', name: 'home', component: HomePage, meta: { title: 'Главная' } },
  { path: '/catalog', name: 'catalog', component: CatalogPage, meta: { title: 'Каталог' } },
  { path: '/catalog/:category', name: 'catalog-category', component: CatalogPage, meta: { title: 'Каталог' } },
  { path: '/game/:slug', name: 'game', component: GamePage, meta: { title: 'Игра' } },
  { path: '/cart', name: 'cart', component: CartPage, meta: { title: 'Корзина', auth: true } },
  { path: '/checkout', name: 'checkout', component: CheckoutPage, meta: { title: 'Оформление заказа', auth: true } },
  { path: '/wallet', name: 'wallet', component: WalletTopUpPage, meta: { title: 'Пополнение кошельков' } },
  { path: '/login', name: 'login', component: LoginPage, meta: { title: 'Вход', guest: true } },
  { path: '/register', name: 'register', component: RegisterPage, meta: { title: 'Регистрация', guest: true } },
  { path: '/profile', name: 'profile', component: ProfilePage, meta: { title: 'Профиль', auth: true } },
  { path: '/order/success/:id', name: 'order-success', component: OrderSuccessPage, meta: { title: 'Заказ оформлен', auth: true } },

  // админка
  {
    path: '/admin',
    meta: { admin: true },
    children: [
      { path: '', name: 'admin-dashboard', component: AdminDashboard, meta: { title: 'Панель управления', admin: true } },
      { path: 'games', name: 'admin-games', component: AdminGames, meta: { title: 'Управление играми', admin: true } },
      { path: 'orders', name: 'admin-orders', component: AdminOrders, meta: { title: 'Заказы', admin: true } },
      { path: 'users', name: 'admin-users', component: AdminUsers, meta: { title: 'Пользователи', admin: true } },
      { path: 'promo', name: 'admin-promo', component: AdminPromo, meta: { title: 'Промокоды', admin: true } }
    ]
  },

  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundPage, meta: { title: '404' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  document.title = to.meta.title ? `${to.meta.title} — WW Market` : 'WW Market'

  if (to.meta.auth && !auth.isLoggedIn) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if (to.meta.admin && !auth.isAdmin) {
    return next({ name: 'home' })
  }

  if (to.meta.guest && auth.isLoggedIn) {
    return next({ name: 'home' })
  }

  next()
})

export default router
