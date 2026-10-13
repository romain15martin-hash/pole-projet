import { ref, computed, watch, onMounted } from 'vue'
import type { EventItem, EventTheme, UserRole } from '../types'
import { getSeedEvents, getSeedSubmissions } from './useSeedData'
import { getMonday, addDays, isoDate } from '../utils/date'

const events = ref<EventItem[]>([])
const submissions = ref<EventItem[]>([])
const featuredId = ref<string | null>('e-1')
const isInitialized = ref(false)

const currentView = ref<'home' | 'search' | 'coincs' | 'asso'>('home')
const currentRole = ref<UserRole>('moderator') // default to moderator so reviewer can test full workflows easily

const selectedThemes = ref<Set<EventTheme>>(new Set())
const selectedAssos = ref<Set<string>>(new Set())
const searchQuery = ref('')
const upcomingOnly = ref(false)

const weekStart = ref<Date>(getMonday(new Date()))
const selectedModalEvent = ref<EventItem | null>(null)
const editingEvent = ref<EventItem | null>(null)

export interface ToastItem {
  id: number
  message: string
  type: 'info' | 'success' | 'warn' | 'error'
}
const toastList = ref<ToastItem[]>([])

export const useEventsState = () => {
  const showToast = (message: string, type: 'info' | 'success' | 'warn' | 'error' = 'success') => {
    const id = Date.now() + Math.random()
    toastList.value.push({ id, message, type })
    setTimeout(() => {
      toastList.value = toastList.value.filter(t => t.id !== id)
    }, 3800)
  }

  // Load state from localStorage on client side
  const init = () => {
    if (isInitialized.value) return
    if (import.meta.client) {
      try {
        const savedEvents = localStorage.getItem('com_cs_events_v1')
        const savedSubs = localStorage.getItem('com_cs_subs_v1')
        const savedFeatured = localStorage.getItem('com_cs_featured_v1')
        const savedRole = localStorage.getItem('com_cs_role_v1')

        if (savedEvents) {
          events.value = JSON.parse(savedEvents)
        } else {
          events.value = getSeedEvents()
        }

        if (savedSubs) {
          submissions.value = JSON.parse(savedSubs)
        } else {
          submissions.value = getSeedSubmissions()
        }

        if (savedFeatured) {
          featuredId.value = JSON.parse(savedFeatured)
        }

        if (savedRole) {
          currentRole.value = savedRole as UserRole
        }
      } catch (e) {
        events.value = getSeedEvents()
        submissions.value = getSeedSubmissions()
      }
    } else {
      events.value = getSeedEvents()
      submissions.value = getSeedSubmissions()
    }
    isInitialized.value = true
  }

  // Persist whenever state changes
  if (import.meta.client) {
    watch(
      events,
      val => {
        localStorage.setItem('com_cs_events_v1', JSON.stringify(val))
      },
      { deep: true }
    )
    watch(
      submissions,
      val => {
        localStorage.setItem('com_cs_subs_v1', JSON.stringify(val))
      },
      { deep: true }
    )
    watch(featuredId, val => {
      localStorage.setItem('com_cs_featured_v1', JSON.stringify(val))
    })
    watch(currentRole, val => {
      localStorage.setItem('com_cs_role_v1', val)
    })
  }

  // Filtered events
  const filteredEvents = computed(() => {
    const today = isoDate(new Date())
    return events.value.filter(e => {
      if (selectedThemes.value.size > 0 && !selectedThemes.value.has(e.theme)) {
        return false
      }
      if (selectedAssos.value.size > 0 && !selectedAssos.value.has(e.asso)) {
        return false
      }
      if (upcomingOnly.value && e.date < today) {
        return false
      }
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase()
        const text = `${e.title} ${e.asso} ${e.place} ${e.description}`.toLowerCase()
        if (!text.includes(q)) return false
      }
      return true
    })
  })

  // Featured event
  const featuredEvent = computed(() => {
    if (featuredId.value) {
      const found = events.value.find(e => e.id === featuredId.value)
      if (found) return found
    }
    const today = isoDate(new Date())
    const upcoming = events.value
      .filter(e => e.date >= today)
      .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
    return upcoming[0] || events.value[0] || null
  })

  // Week events grouped by day (Monday to Sunday)
  const weekDays = computed(() => {
    const start = weekStart.value
    const days: { date: Date; dateStr: string; label: string; isToday: boolean; events: EventItem[] }[] = []
    const today = isoDate(new Date())

    for (let i = 0; i < 7; i++) {
      const d = addDays(start, i)
      const dStr = isoDate(d)
      const dayEvents = filteredEvents.value
        .filter(e => e.date === dStr)
        .sort((a, b) => (a.start || '00:00').localeCompare(b.start || '00:00'))

      days.push({
        date: d,
        dateStr: dStr,
        label: new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(d),
        isToday: dStr === today,
        events: dayEvents
      })
    }
    return days
  })

  // Navigation and Filter handlers
  const toggleTheme = (theme: EventTheme) => {
    const set = new Set(selectedThemes.value)
    if (set.has(theme)) set.delete(theme)
    else set.add(theme)
    selectedThemes.value = set
  }

  const toggleAsso = (asso: string) => {
    const set = new Set(selectedAssos.value)
    if (set.has(asso)) set.delete(asso)
    else set.add(asso)
    selectedAssos.value = set
  }

  const clearFilters = () => {
    selectedThemes.value = new Set()
    selectedAssos.value = new Set()
    searchQuery.value = ''
    upcomingOnly.value = false
    showToast('Filtres réinitialisés', 'info')
  }

  const prevWeek = () => {
    weekStart.value = addDays(weekStart.value, -7)
  }

  const nextWeek = () => {
    weekStart.value = addDays(weekStart.value, 7)
  }

  const currentWeek = () => {
    weekStart.value = getMonday(new Date())
  }

  // Workflow CRUD
  const proposeEvent = (data: Omit<EventItem, 'id' | 'createdAt' | 'status'>, directPublish = false) => {
    const id = (directPublish ? 'e-' : 'sub-') + Date.now().toString(36)
    const newEvent: EventItem = {
      ...data,
      id,
      createdAt: Date.now(),
      status: directPublish ? 'published' : 'pending'
    }

    if (directPublish) {
      events.value.unshift(newEvent)
      showToast('Évènement publié directement sur l’agenda ! 🎉', 'success')
    } else {
      submissions.value.unshift(newEvent)
      showToast('Proposition enregistrée ! En attente de validation par un modérateur.', 'success')
    }
    return newEvent
  }

  const approveSubmission = (subId: string) => {
    const sub = submissions.value.find(s => s.id === subId)
    if (!sub) return
    submissions.value = submissions.value.filter(s => s.id !== subId)
    const published: EventItem = {
      ...sub,
      id: sub.id.replace(/^sub-/, 'e-'),
      status: 'published'
    }
    events.value.unshift(published)
    showToast(`L'évènement « ${sub.title} » est maintenant publié !`, 'success')
  }

  const rejectSubmission = (subId: string) => {
    const sub = submissions.value.find(s => s.id === subId)
    submissions.value = submissions.value.filter(s => s.id !== subId)
    showToast(`Proposition « ${sub?.title || ''} » refusée.`, 'warn')
  }

  const toggleFeatured = (eventId: string) => {
    if (featuredId.value === eventId) {
      featuredId.value = null
      showToast('Retiré de la mise à la une', 'info')
    } else {
      featuredId.value = eventId
      showToast('Évènement mis à la une ! ⭐', 'success')
    }
  }

  const deleteEvent = (eventId: string) => {
    const ev = events.value.find(e => e.id === eventId)
    events.value = events.value.filter(e => e.id !== eventId)
    if (featuredId.value === eventId) featuredId.value = null
    showToast(`Évènement « ${ev?.title || ''} » supprimé.`, 'warn')
  }

  const updateEvent = (eventId: string, data: Partial<EventItem>) => {
    const index = events.value.findIndex(e => e.id === eventId)
    if (index !== -1) {
      events.value[index] = { ...events.value[index], ...data }
      showToast('Modifications enregistrées !', 'success')
      return
    }
    const subIndex = submissions.value.findIndex(s => s.id === eventId)
    if (subIndex !== -1) {
      submissions.value[subIndex] = { ...submissions.value[subIndex], ...data }
      showToast('Proposition mise à jour !', 'success')
    }
  }

  return {
    events,
    submissions,
    featuredId,
    currentView,
    currentRole,
    selectedThemes,
    selectedAssos,
    searchQuery,
    upcomingOnly,
    weekStart,
    selectedModalEvent,
    editingEvent,
    toastList,
    filteredEvents,
    featuredEvent,
    weekDays,
    init,
    showToast,
    toggleTheme,
    toggleAsso,
    clearFilters,
    prevWeek,
    nextWeek,
    currentWeek,
    proposeEvent,
    approveSubmission,
    rejectSubmission,
    toggleFeatured,
    deleteEvent,
    updateEvent
  }
}
