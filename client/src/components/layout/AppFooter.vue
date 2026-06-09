<template>
  <footer class="bg-surface-card border-t border-border mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div class="flex items-center gap-2 mb-4">
            <span class="text-primary text-xl">⚡</span>
            <span class="text-white font-extrabold text-lg">WW MARKET</span>
          </div>
          <p class="text-sm text-gray-400">Экосистема для геймеров, созданная геймерами. Покупайте игры, пополняйте кошельки сервисов.</p>
        </div>
        <div>
          <h4 class="text-white font-semibold mb-4">Каталог</h4>
          <ul class="space-y-2 text-sm">
            <li><router-link to="/catalog/games" class="text-gray-400 hover:text-primary transition-colors">Игры</router-link></li>
            <li><router-link to="/catalog/gift-cards" class="text-gray-400 hover:text-primary transition-colors">Подарочные карты</router-link></li>
            <li><router-link to="/catalog/currency" class="text-gray-400 hover:text-primary transition-colors">Игровая валюта</router-link></li>
            <li><router-link to="/catalog/subscriptions" class="text-gray-400 hover:text-primary transition-colors">Подписки</router-link></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-semibold mb-4">Покупателям</h4>
          <ul class="space-y-2 text-sm">
            <li><router-link to="/wallet" class="text-gray-400 hover:text-primary transition-colors">Пополнение кошельков</router-link></li>
            <li><a href="#" class="text-gray-400 hover:text-primary transition-colors">Как купить</a></li>
            <li><a href="#" class="text-gray-400 hover:text-primary transition-colors">Гарантии</a></li>
            <li><a href="#" class="text-gray-400 hover:text-primary transition-colors">FAQ</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-semibold mb-4">Контакты</h4>
          <ul class="space-y-2 text-sm text-gray-400">
            <li>support@wwmarket.ru</li>
            <li>Telegram: @wwmarket</li>
            <li>Ежедневно, 10:00 — 22:00</li>
          </ul>
        </div>
      </div>
      <div class="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
        <p>WW Market гарантирует безопасность всех транзакций</p>
        <p class="mt-2 sm:mt-0">&copy; {{ new Date().getFullYear() }} WW Market. Все права защищены.</p>
      </div>
    </div>
  </footer>
</template>
