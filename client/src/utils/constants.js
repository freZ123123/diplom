export const GENRES = {
  action: 'Экшен',
  rpg: 'RPG',
  strategy: 'Стратегия',
  racing: 'Гонки',
  shooter: 'Шутер',
  adventure: 'Приключение',
  simulation: 'Симулятор',
  sport: 'Спорт',
  horror: 'Хоррор',
  puzzle: 'Головоломка'
}

export const PRODUCT_TYPES = {
  key: 'Ключ',
  gift: 'Гифт',
  gift_card: 'Подарочная карта',
  currency: 'Игровая валюта',
  subscription: 'Подписка'
}

export const ORDER_STATUSES = {
  pending: { label: 'Ожидает', color: 'yellow' },
  paid: { label: 'Оплачен', color: 'blue' },
  completed: { label: 'Выполнен', color: 'green' },
  cancelled: { label: 'Отменён', color: 'red' }
}

export const SORT_OPTIONS = [
  { value: 'popular', label: 'По популярности' },
  { value: 'rating', label: 'По рейтингу' },
  { value: 'price_asc', label: 'Сначала дешёвые' },
  { value: 'price_desc', label: 'Сначала дорогие' },
  { value: 'newest', label: 'Новинки' }
]

export const WALLET_SERVICES = [
  { id: 'steam', name: 'Steam', desc: 'Моментально и безопасно', color: 'from-blue-600 to-blue-800' },
  { id: 'playstation', name: 'PlayStation', desc: 'Комиссия 0%', color: 'from-blue-500 to-indigo-700' },
  { id: 'xbox', name: 'Xbox', desc: 'Комиссия 0%', color: 'from-green-600 to-green-800' },
  { id: 'roblox', name: 'Roblox Superpass', desc: 'Гейпасс в 100+ игр Roblox', color: 'from-orange-500 to-red-600' },
  { id: 'nintendo', name: 'Nintendo eShop', desc: 'Пополнение кошелька', color: 'from-red-500 to-red-700' }
]
