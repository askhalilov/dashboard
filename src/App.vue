<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import {
  Bell, Search, Plus, Heart, X, BookOpen, Home, HandHeart, BriefcaseBusiness,
  CalendarDays, MapPin, Sparkles, Flame, Lightbulb, Menu, UserRound, Send,
  Megaphone, Users, Bookmark, Trash2, Eye, MessageCircle, Grid2X2, Newspaper,
  GraduationCap, Coffee, ShieldCheck, PenLine, Star, Filter, Clock3, Building2,
  Laptop, WalletCards, PartyPopper, UserPlus, BookMarked, HelpCircle, Settings,
  Image as ImageIcon, CheckCircle2, LoaderCircle, ChevronRight, ClipboardList,
  Mail, Phone, Tag, Compass, Pencil, Upload, HousePlus
} from 'lucide-vue-next'

import heroCollage from './assets/board/06_student_collage_banner.png'
import spiral from './assets/board/28_notebook_spiral_left.png'

const pages = [
  { id: 'board', title: 'Объявления', icon: Megaphone },
  { id: 'study', title: 'Учёба', icon: BookOpen },
  { id: 'housing', title: 'Жильё', icon: Home },
  { id: 'volunteer', title: 'Волонтёрство', iconKey: 'volunteer' },
  { id: 'community', title: 'Сообщество', icon: Users },
]

const categories = [
  { id: 'study', title: 'Продажа учебников', short: 'Учёба', hint: 'Учебники, пособия, методички и конспекты', icon: BookOpen, color: 'blue', bg: '#c8f3ff' },
  { id: 'housing', title: 'Поиск соседей', short: 'Жильё', hint: 'Комнаты, общежития и соседи', icon: Home, color: 'yellow', bg: '#fff1a7' },
  { id: 'volunteer', title: 'Волонтёрство', short: 'Волонтёрство', hint: 'Проекты, фестивали и добрые дела', iconKey: 'volunteer', color: 'green', bg: '#dff8b8' },
  { id: 'job', title: 'Подработка', short: 'Подработка', hint: 'Временная работа и помощь на событиях', iconKey: 'job', color: 'orange', bg: '#ffd7a8' },
  { id: 'events', title: 'Мероприятия', short: 'Мероприятия', hint: 'Встречи, мастер-классы и хакатоны', icon: CalendarDays, color: 'pink', bg: '#ffd4e2' },
  { id: 'lost', title: 'Потеряно и найдено', short: 'Потеряно', hint: 'Документы, ключи, вещи и находки', icon: Compass, color: 'purple', bg: '#eadbff' },
]

const initialAds = [
  { id: 1, category: 'study', title: 'Продам учебник по математическому анализу', price: '500 ₽', time: 'Сегодня, 11:25', responses: 12, views: 86, place: 'Корпус А', iconKey: 'book', description: 'Учебник в хорошем состоянии, без порванных страниц. Подойдёт для 1–2 курса, есть аккуратные пометки карандашом и закладки по важным темам.', contacts: '@math_notes' },
  { id: 2, category: 'housing', title: 'Ищу соседку в комнату, общежитие рядом с кампусом', price: 'Бесплатно', time: 'Сегодня, 10:40', responses: 8, views: 64, place: 'Общежитие №2', iconKey: 'housing', description: 'Ищу спокойную соседку. Комната рядом с кампусом, до корпуса 10 минут пешком. В комнате чисто, есть рабочее место и общий шкаф.', contacts: '@campus_room' },
  { id: 3, category: 'volunteer', title: 'Нужны волонтёры на студенческий фестиваль', price: 'Набор открыт', time: 'Сегодня, 09:15', responses: 15, views: 102, place: 'Актовый зал', iconKey: 'volunteer', description: 'Помощь с регистрацией гостей, навигацией и активностями. Выдаём бейдж, питание и сертификат участия для портфолио.', contacts: 'volunteer@college.ru' },
  { id: 4, category: 'job', title: 'Подработка: помощник на мероприятии', price: 'от 800 ₽/день', time: 'Вчера, 18:30', responses: 6, views: 49, place: 'Главный корпус', iconKey: 'job', description: 'Нужна помощь на городском мероприятии: встреча гостей, выдача материалов, навигация. Оплата в день мероприятия.', contacts: '+7 900 000-00-00' },
  { id: 5, category: 'study', title: 'Отдам конспекты по программированию', price: 'Бесплатно', time: 'Вчера, 17:05', responses: 9, views: 77, place: 'Библиотека', iconKey: 'code', description: 'Конспекты по основам программирования, алгоритмам и базам данных. Можно забрать в колледже или получить в электронном виде.', contacts: '@code_notes' },
  { id: 6, category: 'events', title: 'Ищу команду для хакатона', price: 'Ищу команду', time: 'Вчера, 15:22', responses: 11, views: 93, place: 'Коворкинг', iconKey: 'events', description: 'Ищу frontend/backend разработчиков и дизайнера. Тема проекта — сервис для студентов. Опыт не обязателен, главное желание.', contacts: '@hack_team' },
]


const API_BASE = import.meta.env.VITE_API_URL || '/api'

const iconMap = {
  book: BookMarked,
  study: BookMarked,
  housing: HousePlus,
  volunteer: HandHeart,
  job: BriefcaseBusiness,
  code: Laptop,
  events: PartyPopper,
  lost: Compass,
}

function iconForAd(ad) {
  return iconMap[ad?.iconKey] || iconMap[ad?.category] || Star
}

function normalizeAd(ad) {
  const { icon, ...rest } = ad || {}
  return { ...rest, iconKey: rest.iconKey || rest.category || 'study' }
}

function serializeAds(value) {
  return value.map((ad) => {
    const { icon, ...rest } = ad
    return rest
  })
}

const events = [
  { day: '24', month: 'МАЯ', title: 'Ярмарка вакансий', place: '10:00 • Главный корпус', color: 'blue' },
  { day: '28', month: 'МАЯ', title: 'День открытых дверей', place: '12:00 • Ауд. 101', color: 'green' },
  { day: '02', month: 'ИЮН', title: 'Студенческий пикник', place: '15:00 • Парк «Дружбы»', color: 'pink' },
]

const tips = [
  'Планируй дела заранее и оставляй время на отдых — баланс спасает от выгорания!',
  'Проверяй контакты автора объявления и договаривайся о встрече в безопасном месте.',
  'Указывай категорию и понятное описание — так объявление быстрее найдут.',
]

const articles = [
  {
    id: 1,
    title: 'Как быстро продать учебники после сессии',
    subtitle: 'Короткая инструкция для студентов, которые хотят освободить полку и вернуть часть денег.',
    category: 'Учёба',
    color: 'blue',
    iconKey: 'book',
    time: '4 мин чтения',
    body: [
      'После сессии учебники часто остаются лежать без дела, хотя для младших курсов они могут быть очень полезны. Самое важное — сделать объявление понятным и честным.',
      'Сначала сфотографируйте обложку и несколько страниц. Покажите состояние учебника: есть ли пометки, закладки, повреждения или выделения. Это снижает количество лишних вопросов.',
      'В названии укажите предмет, автора и курс, для которого подходит пособие. В описании добавьте, можно ли встретиться в корпусе, общежитии или передать книгу через знакомых.',
      'Цена должна быть реалистичной. Если книга новая, можно поставить 60–70% от исходной цены. Если есть пометки, лучше немного снизить стоимость и написать об этом сразу.'
    ]
  },
  {
    id: 2,
    title: 'Чек-лист для поиска соседа по комнате',
    subtitle: 'Что обсудить до заселения, чтобы не спорить из-за быта через неделю.',
    category: 'Жильё',
    color: 'yellow',
    icon: UserPlus,
    time: '5 мин чтения',
    body: [
      'Поиск соседа — это не только вопрос цены. Важно заранее понять, совпадает ли ваш режим и бытовые привычки.',
      'Обсудите график сна, отношение к гостям, уборку, хранение продуктов, оплату интернета и коммунальных расходов. Лучше проговорить это до заселения, чем решать конфликт позже.',
      'В объявлении полезно указать район, расстояние до кампуса, стоимость, наличие рабочего места и требования к соседу. Чем точнее объявление, тем выше шанс найти подходящего человека.',
      'Для первой встречи выбирайте общественное место или территорию кампуса. Не отправляйте личные документы незнакомым людям до личного общения.'
    ]
  },
  {
    id: 3,
    title: 'Почему волонтёрство помогает в учёбе и карьере',
    subtitle: 'Волонтёрские проекты дают не только сертификаты, но и реальные навыки коммуникации.',
    category: 'Волонтёрство',
    color: 'green',
    iconKey: 'volunteer',
    time: '3 мин чтения',
    body: [
      'Волонтёрство часто воспринимают как дополнительную нагрузку, но оно может быть полезным опытом для портфолио и будущей работы.',
      'На мероприятиях студенты учатся общаться с людьми, распределять задачи, работать в команде и быстро реагировать на изменения. Эти навыки ценятся не меньше технических знаний.',
      'Также волонтёрство помогает познакомиться со студентами из других групп и направлений. Иногда именно такие знакомства приводят к новым проектам, хакатонам или стажировкам.',
      'Начинать лучше с небольших мероприятий на 2–3 часа, чтобы понять формат и не перегрузить расписание.'
    ]
  },
  {
    id: 4,
    title: 'Как не потеряться в потоке объявлений',
    subtitle: 'Фильтры, избранное и поиск помогают находить нужное быстрее.',
    category: 'Сообщество',
    color: 'pink',
    icon: Filter,
    time: '2 мин чтения',
    body: [
      'Когда объявлений становится много, важно пользоваться фильтрами и поиском. Это экономит время и помогает не пропустить важное.',
      'Добавляйте понравившиеся объявления в избранное, особенно если ещё не готовы откликнуться. Так можно вернуться к ним вечером или после пары.',
      'Если вы размещаете объявление сами, выбирайте правильную категорию и добавляйте ключевые слова: предмет, корпус, район, стоимость или дату события.',
      'Чем понятнее структура объявления, тем быстрее на него откликнутся.'
    ]
  },
]

const ideas = ref([
  'Добавить авторизацию студентов через почту колледжа.',
  'Сделать внутренний чат между автором объявления и студентом.',
  'Добавить рейтинг надёжности автора и жалобы на объявления.',
  'Подключить push-уведомления о новых ответах.',
  'Сделать карту кампуса с корпусами, общежитиями и пунктами встречи.',
])

const safeParse = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
}

const ads = ref(safeParse('student-board-ads-v3', initialAds).map(normalizeAd))
const favorites = ref(safeParse('student-board-favorites-v3', []))
const query = ref('')
const activeCategory = ref('all')
const currentPage = ref('board')
const showCreateModal = ref(false)
const selectedAd = ref(null)
const selectedArticle = ref(null)
const mobileMenu = ref(false)
const sortMode = ref('new')
const currentTip = ref(0)
const loading = ref(true)
const routeLoading = ref(false)
const showWelcome = ref(!localStorage.getItem('student-board-welcome-v1'))
const showNotifications = ref(false)
const showAllPopular = ref(false)
const showEventsModal = ref(false)
const showTopicModal = ref(false)
const toast = ref('')
const backendOnline = ref(false)
const backendMessage = ref('Локальный режим')
const topicText = ref('')
const newAd = ref({ title: '', category: 'study', description: '', price: '', contacts: '', place: '' })

const notifications = [
  { id: 1, title: 'Новый отклик', text: 'На объявление про учебник откликнулись 2 студента.', target: 1 },
  { id: 2, title: 'Событие рядом', text: 'Ярмарка вакансий начинается 24 мая в главном корпусе.', event: 'Ярмарка вакансий' },
  { id: 3, title: 'Совет дня', text: 'Добавьте место встречи — так объявление выглядит надёжнее.', tip: true },
]

watch(ads, (value) => localStorage.setItem('student-board-ads-v3', JSON.stringify(serializeAds(value))), { deep: true })
watch(favorites, (value) => localStorage.setItem('student-board-favorites-v3', JSON.stringify(value)), { deep: true })


async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  if (!response.ok) {
    const message = await response.text().catch(() => 'Ошибка API')
    throw new Error(message || 'Ошибка API')
  }
  return response.status === 204 ? null : response.json()
}

async function loadBackendData() {
  try {
    const [adsData, ideasData] = await Promise.all([
      apiRequest('/ads'),
      apiRequest('/ideas').catch(() => null),
    ])
    ads.value = (adsData.ads || adsData || []).map(normalizeAd)
    if (ideasData?.ideas?.length) ideas.value = ideasData.ideas
    backendOnline.value = true
    backendMessage.value = 'Backend подключён'
  } catch (error) {
    backendOnline.value = false
    backendMessage.value = 'Локальный режим без backend'
  }
}

onMounted(() => {
  window.setTimeout(() => { loading.value = false }, 1700)
  loadBackendData()
})

const categoryMap = computed(() => Object.fromEntries(categories.map((cat) => [cat.id, cat])))
const normalizedQuery = computed(() => query.value.trim().toLowerCase())
const activeTitle = computed(() => currentPage.value === 'profile' ? 'Профиль' : pages.find((page) => page.id === currentPage.value)?.title || 'Объявления')
const pageCategory = computed(() => ['study', 'housing', 'volunteer'].includes(currentPage.value) ? currentPage.value : null)

const filteredAds = computed(() => {
  let result = ads.value.filter((ad) => {
    const categoryFilter = pageCategory.value || activeCategory.value
    const matchesCategory = categoryFilter === null || categoryFilter === 'all' || ad.category === categoryFilter
    const matchesQuery = !normalizedQuery.value || [ad.title, ad.price, ad.description, ad.place, ad.contacts, categoryMap.value[ad.category]?.short]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery.value)
    return matchesCategory && matchesQuery
  })
  if (sortMode.value === 'popular') result = [...result].sort((a, b) => b.responses - a.responses)
  if (sortMode.value === 'cheap') result = [...result].sort((a, b) => extractPrice(a.price) - extractPrice(b.price))
  return result
})

const popular = computed(() => [...ads.value].sort((a, b) => b.responses - a.responses).slice(0, 3))
const favoriteAds = computed(() => ads.value.filter((ad) => favorites.value.includes(ad.id)))
const stats = computed(() => [
  { label: 'объявлений', value: ads.value.length, icon: ClipboardList },
  { label: 'новых сегодня', value: ads.value.filter((ad) => ad.time.includes('Сегодня') || ad.time.includes('Только')).length, icon: Sparkles },
  { label: 'откликов', value: ads.value.reduce((sum, ad) => sum + ad.responses, 0), icon: MessageCircle },
])

function extractPrice(price) {
  const match = String(price).match(/\d+/)
  return match ? Number(match[0]) : 0
}

function navigate(page) {
  if (currentPage.value === page) return
  routeLoading.value = true
  window.setTimeout(() => {
    currentPage.value = page
    if (['study', 'housing', 'volunteer'].includes(page)) activeCategory.value = page
    else activeCategory.value = 'all'
    query.value = ''
    mobileMenu.value = false
    selectedAd.value = null
    selectedArticle.value = null
    nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
    window.setTimeout(() => { routeLoading.value = false }, 350)
  }, 320)
}

function setCategory(id) {
  activeCategory.value = id
  currentPage.value = 'board'
  nextTick(() => document.querySelector('#ads')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

function toggleFavorite(id) {
  favorites.value = favorites.value.includes(id)
    ? favorites.value.filter((item) => item !== id)
    : [...favorites.value, id]
}

function openAd(ad) {
  const target = ads.value.find((item) => item.id === ad.id)
  if (target) target.views += 1
  selectedAd.value = { ...(target || ad) }
  if (backendOnline.value) {
    apiRequest(`/ads/${ad.id}/view`, { method: 'PATCH' })
      .then((result) => {
        const updated = normalizeAd(result.ad || result)
        const index = ads.value.findIndex((item) => item.id === updated.id)
        if (index !== -1) ads.value[index] = updated
        if (selectedAd.value?.id === updated.id) selectedAd.value = updated
      })
      .catch(() => {
        backendOnline.value = false
        backendMessage.value = 'Локальный режим без backend'
      })
  }
}

async function respondToAd(ad) {
  const target = ads.value.find((item) => item.id === ad.id)
  if (target) {
    target.responses += 1
    selectedAd.value = { ...target }
  }
  try {
    if (backendOnline.value) {
      const result = await apiRequest(`/ads/${ad.id}/respond`, { method: 'PATCH' })
      const updated = normalizeAd(result.ad || result)
      const index = ads.value.findIndex((item) => item.id === updated.id)
      if (index !== -1) ads.value[index] = updated
      selectedAd.value = updated
    }
    showToast('Отклик отправлен')
  } catch (error) {
    backendOnline.value = false
    backendMessage.value = 'Локальный режим без backend'
  }
}

async function createAd() {
  if (!newAd.value.title.trim()) return
  const payload = {
    category: newAd.value.category,
    title: newAd.value.title.trim(),
    price: newAd.value.price.trim() || 'Договоримся',
    time: 'Только что',
    responses: 0,
    views: 0,
    place: newAd.value.place.trim() || 'Кампус',
    contacts: newAd.value.contacts.trim() || 'Контакты не указаны',
    iconKey: newAd.value.category === 'study' ? 'book' : newAd.value.category,
    description: newAd.value.description.trim() || 'Описание пока не добавлено.',
    custom: true,
  }

  try {
    if (backendOnline.value) {
      const result = await apiRequest('/ads', { method: 'POST', body: JSON.stringify(payload) })
      ads.value.unshift(normalizeAd(result.ad || result))
      showToast('Объявление сохранено через backend')
    } else {
      ads.value.unshift({ id: Date.now(), ...payload })
      showToast('Объявление сохранено локально')
    }
  } catch (error) {
    backendOnline.value = false
    backendMessage.value = 'Локальный режим без backend'
    ads.value.unshift({ id: Date.now(), ...payload })
    showToast('Backend недоступен — объявление сохранено локально')
  }

  newAd.value = { title: '', category: 'study', description: '', price: '', contacts: '', place: '' }
  showCreateModal.value = false
  currentPage.value = 'board'
  activeCategory.value = 'all'
}

async function deleteAd(id) {
  const previous = [...ads.value]
  ads.value = ads.value.filter((ad) => ad.id !== id)
  favorites.value = favorites.value.filter((item) => item !== id)
  selectedAd.value = null
  try {
    if (backendOnline.value) await apiRequest(`/ads/${id}`, { method: 'DELETE' })
    showToast('Объявление удалено')
  } catch (error) {
    ads.value = previous
    showToast('Не получилось удалить на сервере')
  }
}

function closeWelcome() {
  showWelcome.value = false
  localStorage.setItem('student-board-welcome-v1', '1')
}

function showToast(message) {
  toast.value = message
  window.clearTimeout(showToast.timer)
  showToast.timer = window.setTimeout(() => { toast.value = '' }, 2400)
}

function openNotification(item) {
  showNotifications.value = false
  if (item.target) {
    const ad = ads.value.find((entry) => entry.id === item.target)
    if (ad) openAd(ad)
  } else if (item.event) {
    showEventsModal.value = true
  } else if (item.tip) {
    currentTip.value = (currentTip.value + 1) % tips.length
    showToast('Совет обновлён')
  }
}

async function submitTopic() {
  const text = topicText.value.trim()
  if (!text) return
  try {
    if (backendOnline.value) {
      const result = await apiRequest('/ideas', { method: 'POST', body: JSON.stringify({ text }) })
      ideas.value = result.ideas || [...ideas.value, text]
    } else {
      ideas.value.push(text)
    }
    topicText.value = ''
    showTopicModal.value = false
    showToast('Тема добавлена на доску идей')
  } catch (error) {
    ideas.value.push(text)
    topicText.value = ''
    showTopicModal.value = false
    showToast('Backend недоступен — тема сохранена локально')
  }
}

function fakeUpload() {
  showToast('Интерактивная загрузка включена: в демо фото не сохраняется')
}

function resetDemo() {
  ads.value = initialAds.map(normalizeAd)
  favorites.value = []
  query.value = ''
  activeCategory.value = 'all'
  currentPage.value = 'board'
  showToast('Демо-данные восстановлены')
}
</script>

<template>
  <div v-if="loading" class="startup-loader">
    <div class="writing-loader">
      <div class="loader-sheet">
        <div class="sheet-header">
          <div class="loader-logo"><span>Студ</span><b>Доска</b></div>
          <span class="loader-sticker">пишем письмо ✦</span>
        </div>
        <div class="writing-area">
          <div class="writing-line line-1"><span>Привет! Собираем объявления для студентов…</span></div>
          <div class="writing-line line-2"><span>учёба, жильё, волонтёрство и полезные заметки.</span></div>
          <div class="writing-line line-3"><span>Ещё мгновение — и доска будет готова.</span></div>
          <div class="writing-pen">
            <span class="pen-cap"></span>
            <span class="pen-body"></span>
            <span class="pen-tip"></span>
          </div>
        </div>
      </div>
      <p class="loader-caption">Оформляем интерфейс как страницу тетради — аккуратно, ярко и по‑студенчески.</p>
    </div>
  </div>

  <transition name="fade"><div v-if="routeLoading" class="route-loader"><span class="route-loader-pen">✎</span> Открываем раздел…</div></transition>

  <div class="page-shell">
    <img class="spiral" :src="spiral" alt="Декор тетради" />

    <header class="app-header">
      <button class="mobile-menu" @click="mobileMenu = !mobileMenu" aria-label="Открыть меню"><Menu :size="24" /></button>

      <button class="brand" @click="navigate('board')" aria-label="На главную">
        <span class="paper-plane">✈</span>
        <span class="brand-text"><b>Студ<span>Доска</span></b></span>
      </button>

      <nav class="nav" :class="{ open: mobileMenu }">
        <button v-for="page in pages" :key="page.id" :class="['nav-link', { active: currentPage === page.id }]" @click="navigate(page.id)">
          <component :is="page.icon" :size="17" />{{ page.title }}
        </button>
      </nav>

      <div class="header-actions">
        <button :class="['profile', { active: currentPage === 'profile' }]" @click="navigate('profile')"><UserRound :size="20" /> <span>Профиль</span></button>
      </div>
    </header>

    <main>
      <section v-if="currentPage === 'board'" class="hero">
        <div class="hero-left">
          <div class="hero-kicker">новое!</div>
          <div class="hero-title-block">
            <span class="doodle-mark">✦</span>
            <h1><em>Студенческая</em><strong>доска объявлений</strong></h1>
            <div class="marker-stroke"></div>
          </div>
          <p>Продажа учебников, поиск соседей, волонтёрство, подработка и полезные объявления для студентов.</p>
          <div class="hero-buttons">
            <button class="btn primary" @click="showCreateModal = true"><Plus :size="21" />Разместить объявление</button>
            <button class="btn secondary" @click="document.querySelector('#categories')?.scrollIntoView({ behavior: 'smooth' })"><Grid2X2 :size="19" />Смотреть категории</button>
          </div>
          <div class="scribble note-blue">campus life ♡</div>
        </div>
        <div class="hero-right">
          <img class="collage" :src="heroCollage" alt="Студенческий коллаж" />
        </div>
      </section>

      <section v-else class="page-hero compact-page">
        <div>
          <span class="page-badge"><Sparkles :size="16" /> {{ activeTitle }}</span>
          <h1>{{ activeTitle }}</h1>
          <p v-if="currentPage === 'study'">Учебники, конспекты, помощь с заданиями и обмен материалами между студентами.</p>
          <p v-else-if="currentPage === 'housing'">Комнаты, общежития, поиск соседей и безопасные объявления по жилью рядом с кампусом.</p>
          <p v-else-if="currentPage === 'volunteer'">Добрые дела, фестивали, студенческие проекты и возможности получить полезный опыт.</p>
          <p v-else-if="currentPage === 'community'">Статьи, советы, события и идеи для развития студенческого сообщества.</p>
          <p v-else>Личный раздел: избранные объявления, мои публикации и быстрые действия.</p>
        </div>
        <button class="btn primary" @click="showCreateModal = true"><Plus :size="19" />Новое объявление</button>
      </section>

      <section v-if="currentPage !== 'profile' && currentPage !== 'community'" class="content-layout">
        <div class="main-column">
          <section id="categories" class="categories-section">
            <div class="section-head compact">
              <div><h2>Категории</h2><div class="marker-line small"></div></div>
              <button class="link-button" @click="setCategory('all')">Все категории →</button>
            </div>
            <div class="category-grid">
              <button v-for="cat in categories" :key="cat.id" :class="['category-card', cat.color, { selected: activeCategory === cat.id }]" @click="setCategory(cat.id)">
                <span class="tape"></span>
                <component :is="cat.icon" :size="38" />
                <strong>{{ cat.title }}</strong>
                <small>{{ cat.hint }}</small>
              </button>
            </div>
          </section>

          <section id="ads" class="ads-section">
            <div class="section-head">
              <div><h2>{{ pageCategory ? categoryMap[pageCategory].title : 'Свежие объявления' }}</h2><div class="marker-line"></div></div>
              <div class="ads-tools">
                <button :class="['chip', { active: activeCategory === 'all' && !pageCategory }]" @click="setCategory('all')">Все</button>
                <button :class="['chip', { active: activeCategory === 'favorites' }]" @click="activeCategory = 'favorites'; currentPage = 'board'"><Heart :size="15" />Избранное</button>
                <select v-model="sortMode" class="sort-select">
                  <option value="new">Сначала новые</option>
                  <option value="popular">Популярные</option>
                  <option value="cheap">По цене</option>
                </select>
              </div>
            </div>

            <div class="cards-grid" v-if="activeCategory === 'favorites'">
              <article v-for="ad in favoriteAds" :key="ad.id" class="ad-card" @click="openAd(ad)">
                <div :class="['ad-visual', categoryMap[ad.category]?.color]"><component :is="iconForAd(ad)" :size="56" /><span>{{ categoryMap[ad.category]?.short }}</span><button class="favorite active" @click.stop="toggleFavorite(ad.id)"><Heart :size="19" fill="currentColor" /></button></div>
                <div class="ad-body"><span :class="['tag', categoryMap[ad.category]?.color]">{{ categoryMap[ad.category]?.short }}</span><h3>{{ ad.title }}</h3><strong>{{ ad.price }}</strong><div class="meta"><span>{{ ad.time }}</span><span><MessageCircle :size="14" />{{ ad.responses }}</span></div><button class="details">Подробнее</button></div>
              </article>
              <div v-if="!favoriteAds.length" class="empty-state"><Bookmark :size="46" /><h3>Избранное пустое</h3><p>Отмечайте объявления сердечком, чтобы вернуться к ним позже.</p></div>
            </div>

            <div class="cards-grid" v-else>
              <article v-for="ad in filteredAds" :key="ad.id" class="ad-card" @click="openAd(ad)">
                <div :class="['ad-visual', categoryMap[ad.category]?.color]">
                  <component :is="iconForAd(ad)" :size="58" />
                  <span>{{ categoryMap[ad.category]?.short }}</span>
                  <b>{{ ad.price }}</b>
                  <button :class="['favorite', { active: favorites.includes(ad.id) }]" @click.stop="toggleFavorite(ad.id)"><Heart :size="19" :fill="favorites.includes(ad.id) ? 'currentColor' : 'none'" /></button>
                </div>
                <div class="ad-body"><span :class="['tag', categoryMap[ad.category]?.color]">{{ categoryMap[ad.category]?.short }}</span><h3>{{ ad.title }}</h3><strong>{{ ad.price }}</strong><div class="meta"><span>{{ ad.time }}</span><span><MessageCircle :size="14" />{{ ad.responses }}</span></div><button class="details">Подробнее</button></div>
              </article>
              <div v-if="!filteredAds.length" class="empty-state"><Compass :size="46" /><h3>Пока здесь пусто</h3><p>Попробуйте изменить фильтры или разместить первое объявление.</p><button class="btn primary" @click="showCreateModal = true"><Plus :size="18" />Разместить объявление</button></div>
            </div>
          </section>
        </div>

        <aside class="sidebar">
          <section class="side-card stats-card"><h3><Sparkles :size="18" />Доска сегодня</h3><div :class="['api-status', backendOnline ? 'online' : 'offline']"><span></span>{{ backendMessage }}</div><div class="stat-list"><div v-for="item in stats" :key="item.label"><component :is="item.icon" :size="20" /><b>{{ item.value }}</b><span>{{ item.label }}</span></div></div></section>
          <section class="side-card"><h3><Flame :size="18" />Популярно на этой неделе</h3><button v-for="(ad, idx) in popular" :key="ad.id" class="popular-item" @click="openAd(ad)"><span>{{ idx + 1 }}</span><div><strong>{{ ad.title }}</strong><small>{{ ad.responses }} откликов</small></div></button><button class="link-button" @click="showAllPopular = true">Смотреть всё →</button></section>
          <section class="side-card"><h3><Filter :size="18" />Быстрые фильтры</h3><div class="filter-pills"><button v-for="cat in categories.slice(0,4)" :key="cat.id" :class="['chip', cat.color]" @click="setCategory(cat.id)">{{ cat.short }}</button></div></section>
          <section class="side-card"><h3><CalendarDays :size="18" />Ближайшие события</h3><div v-for="event in events" :key="event.title" class="event-row"><time :class="event.color"><b>{{ event.day }}</b><small>{{ event.month }}</small></time><div><strong>{{ event.title }}</strong><small>{{ event.place }}</small></div></div><button class="link-button" @click="showEventsModal = true">Все события →</button></section>
        </aside>
      </section>

      <section v-if="currentPage === 'community'" class="community-page">
        <div class="section-head"><div><h2>Статьи и полезные материалы</h2><div class="marker-line"></div></div><button class="btn secondary" @click="showTopicModal = true"><Newspaper :size="18" />Предложить тему</button></div>
        <div class="article-grid cards-grid">
          <article v-for="article in articles" :key="article.id" :class="['article-card', article.color]">
            <div class="article-icon"><component :is="article.icon" :size="42" /></div>
            <span>{{ article.category }} • {{ article.time }}</span>
            <h3>{{ article.title }}</h3>
            <p>{{ article.subtitle }}</p>
            <button class="details" @click="selectedArticle = article">Читать</button>
          </article>
        </div>
        <div class="board-wall">
          <div class="section-head compact"><div><h2>Что хочется добавить дальше</h2><div class="marker-line small"></div></div></div>
          <div class="wall-grid"><div v-for="idea in ideas" :key="idea" class="wall-note">{{ idea }}</div></div>
        </div>
      </section>

      <section v-if="currentPage === 'profile'" class="profile-page">
        <aside class="profile-card"><div class="avatar"><GraduationCap :size="48" /></div><h2>Студент</h2><p>Мои объявления, избранное и быстрые действия.</p><button class="btn primary" @click="showCreateModal = true"><Plus :size="18" />Новое объявление</button><button class="btn secondary" @click="resetDemo"><Settings :size="18" />Сбросить демо</button></aside>
        <div class="profile-content"><h2>Избранное</h2><div class="cards-grid"><article v-for="ad in favoriteAds" :key="ad.id" class="ad-card" @click="openAd(ad)"><div :class="['ad-visual', categoryMap[ad.category]?.color]"><component :is="iconForAd(ad)" :size="56" /><span>{{ categoryMap[ad.category]?.short }}</span></div><div class="ad-body"><span :class="['tag', categoryMap[ad.category]?.color]">{{ categoryMap[ad.category]?.short }}</span><h3>{{ ad.title }}</h3><strong>{{ ad.price }}</strong><button class="details">Подробнее</button></div></article><div v-if="!favoriteAds.length" class="empty-state"><Heart :size="46" /><h3>Пока нет избранного</h3><p>Добавляйте объявления сердечком.</p></div></div></div>
      </section>

      <section class="student-tip"><Lightbulb :size="34" /><div><strong>Совет студенту дня</strong><p>{{ tips[currentTip] }}</p></div><button class="btn primary small" @click="currentTip = (currentTip + 1) % tips.length">Ещё советы</button></section>
    </main>

    <button class="fab" @click="showCreateModal = true"><Plus :size="30" /></button>

    <div v-if="showWelcome" class="modal-backdrop welcome-backdrop" @click.self="closeWelcome">
      <article class="welcome-modal">
        <button class="modal-close" @click="closeWelcome"><X :size="20" /></button>
        <div class="welcome-hero"><Megaphone :size="42" /><span>Добро пожаловать!</span></div>
        <h2>Это «СтудДоска» — доска объявлений для студенческой жизни</h2>
        <p>Здесь можно искать учебники, соседей, волонтёрские проекты, подработку и события. Пользуйтесь поиском, фильтрами, добавляйте объявления в избранное и открывайте карточки для подробностей.</p>
        <div class="welcome-steps"><div><Compass :size="20" />Найдите нужное</div><div><Heart :size="20" />Сохраните в избранное</div><div><Plus :size="20" />Разместите своё</div></div>
        <button class="btn primary" @click="closeWelcome">Начать пользоваться</button>
      </article>
    </div>

    <div v-if="showCreateModal" class="modal-backdrop" @click.self="showCreateModal = false">
      <form class="paper-modal" @submit.prevent="createAd">
        <button class="modal-close" type="button" @click="showCreateModal = false"><X :size="20" /></button><span class="modal-tape"></span>
        <h2>Новое объявление</h2><p>Заполните поля, и объявление появится в начале ленты.</p>
        <label>Название объявления<input v-model="newAd.title" placeholder="Например: продам учебник по физике" /></label>
        <div class="form-grid"><label>Категория<select v-model="newAd.category"><option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.title }}</option></select></label><label>Цена или статус<input v-model="newAd.price" placeholder="500 ₽ / бесплатно / ищу команду" /></label></div>
        <label>Описание<textarea v-model="newAd.description" rows="4" placeholder="Опишите условия, состояние, место встречи…"></textarea></label>
        <div class="form-grid"><label>Место<input v-model="newAd.place" placeholder="Корпус, общежитие, библиотека" /></label><label>Контакты<input v-model="newAd.contacts" placeholder="Телеграм, почта или телефон" /></label></div>
        <button class="upload-box" type="button" @click="fakeUpload"><Upload :size="20" /> Нажмите, чтобы выбрать фото</button>
        <div class="modal-actions"><button class="btn secondary" type="button" @click="showCreateModal = false">Отмена</button><button class="btn primary" type="submit">Опубликовать</button></div>
      </form>
    </div>

    <div v-if="selectedAd" class="modal-backdrop" @click.self="selectedAd = null">
      <article class="detail-modal">
        <button class="modal-close" @click="selectedAd = null"><X :size="20" /></button>
        <div :class="['detail-visual', categoryMap[selectedAd.category]?.color]"><component :is="iconForAd(selectedAd)" :size="96" /><span>{{ categoryMap[selectedAd.category]?.short }}</span><b>{{ selectedAd.price }}</b></div>
        <div class="detail-content"><span :class="['tag', categoryMap[selectedAd.category]?.color]">{{ categoryMap[selectedAd.category]?.short }}</span><h2>{{ selectedAd.title }}</h2><strong class="detail-price">{{ selectedAd.price }}</strong><p>{{ selectedAd.description }}</p><div class="detail-meta"><span><MapPin :size="17" />{{ selectedAd.place }}</span><span><Clock3 :size="17" />{{ selectedAd.time }}</span><span><MessageCircle :size="17" />{{ selectedAd.responses }} откликов</span><span><Eye :size="17" />{{ selectedAd.views }} просмотров</span><span><Mail :size="17" />{{ selectedAd.contacts }}</span></div><div class="modal-actions detail-actions"><button class="btn secondary" @click="toggleFavorite(selectedAd.id)"><Heart :size="18" />{{ favorites.includes(selectedAd.id) ? 'В избранном' : 'В избранное' }}</button><button class="btn primary" @click="respondToAd(selectedAd)"><Send :size="18" />Откликнуться</button><button v-if="selectedAd.custom" class="btn danger" @click="deleteAd(selectedAd.id)"><Trash2 :size="18" />Удалить</button></div></div>
      </article>
    </div>

    <div v-if="selectedArticle" class="modal-backdrop" @click.self="selectedArticle = null">
      <article class="article-modal">
        <button class="modal-close" @click="selectedArticle = null"><X :size="20" /></button>
        <div :class="['article-cover', selectedArticle.color]"><component :is="selectedArticle.icon" :size="62" /><span>{{ selectedArticle.category }} • {{ selectedArticle.time }}</span><h2>{{ selectedArticle.title }}</h2></div>
        <div class="article-body"><p v-for="paragraph in selectedArticle.body" :key="paragraph">{{ paragraph }}</p><button class="btn primary" @click="selectedArticle = null">Понятно</button></div>
      </article>
    </div>

    <transition name="fade"><div v-if="toast" class="toast"><CheckCircle2 :size="18" />{{ toast }}</div></transition>

    <div v-if="showAllPopular" class="modal-backdrop" @click.self="showAllPopular = false">
      <article class="paper-modal compact-modal">
        <button class="modal-close" @click="showAllPopular = false"><X :size="20" /></button>
        <h2>Популярные объявления</h2>
        <p>Самые активные карточки по количеству откликов.</p>
        <button v-for="ad in ads.slice().sort((a, b) => b.responses - a.responses)" :key="ad.id" class="modal-list-row" @click="showAllPopular = false; openAd(ad)">
          <span :class="['tag', categoryMap[ad.category]?.color]">{{ categoryMap[ad.category]?.short }}</span>
          <span class="modal-list-content"><strong>{{ ad.title }}</strong><small>{{ ad.responses }} откликов • {{ ad.views }} просмотров</small></span>
          <ChevronRight :size="18" />
        </button>
      </article>
    </div>

    <div v-if="showEventsModal" class="modal-backdrop" @click.self="showEventsModal = false">
      <article class="paper-modal compact-modal events-modal">
        <button class="modal-close" @click="showEventsModal = false"><X :size="20" /></button>
        <h2>Ближайшие события</h2>
        <p>Подборка студенческих активностей. Нажмите на событие, чтобы перейти к объявлениям категории «Мероприятия».</p>
        <div class="event-modal-list">
          <button v-for="event in events" :key="event.title" class="event-modal-row" @click="showEventsModal = false; setCategory('events')">
            <time :class="event.color"><b>{{ event.day }}</b><small>{{ event.month }}</small></time>
            <span class="event-modal-content"><strong>{{ event.title }}</strong><small>{{ event.place }}</small></span>
            <ChevronRight :size="18" />
          </button>
        </div>
        <div class="modal-footer-note">Карточки событий оформлены как полноценные действия, а не как стандартные браузерные кнопки.</div>
      </article>
    </div>

    <div v-if="showTopicModal" class="modal-backdrop" @click.self="showTopicModal = false">
      <form class="paper-modal compact-modal" @submit.prevent="submitTopic">
        <button class="modal-close" type="button" @click="showTopicModal = false"><X :size="20" /></button>
        <h2>Предложить тему</h2>
        <p>Идея появится на стене сообщества как стикер.</p>
        <label>Ваша идея<textarea v-model="topicText" rows="4" placeholder="Например: добавить обмен лабораторными работами"></textarea></label>
        <div class="modal-actions"><button class="btn secondary" type="button" @click="showTopicModal = false">Отмена</button><button class="btn primary" type="submit">Добавить</button></div>
      </form>
    </div>
  </div>
</template>
