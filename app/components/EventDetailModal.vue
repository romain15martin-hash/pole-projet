<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useEventsState } from '../composables/useEventsState'
import { parseISO, formatFr, formatTimeRange, downloadIcs, getGoogleCalendarUrl } from '../utils/date'
import { THEMES } from '../types'
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Download,
  Share2,
  ExternalLink,
  Sparkles,
  Trash2,
  Edit,
  Tag
} from 'lucide-vue-next'

const {
  selectedModalEvent,
  currentRole,
  featuredId,
  toggleFeatured,
  deleteEvent,
  editingEvent,
  currentView,
  showToast
} = useEventsState()

const event = computed(() => selectedModalEvent.value)

const themeInfo = computed(() => {
  if (!event.value) return null
  return THEMES.find(t => t.id === event.value?.theme)
})

const eventDate = computed(() => {
  if (!event.value) return null
  return parseISO(event.value.date)
})

const isFeatured = computed(() => {
  return event.value && featuredId.value === event.value.id
})

const closeModal = () => {
  selectedModalEvent.value = null
}

const copyLink = () => {
  if (!event.value) return
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.origin + '#' + event.value.id)
    showToast('Lien de l’évènement copié !', 'info')
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && selectedModalEvent.value) {
    closeModal()
  }
}

const triggerEdit = () => {
  if (!event.value) return
  editingEvent.value = { ...event.value }
  selectedModalEvent.value = null
  currentView.value = 'asso'
}

const triggerDelete = () => {
  if (!event.value) return
  if (confirm(`Voulez-vous vraiment supprimer « ${event.value.title} » ?`)) {
    deleteEvent(event.value.id)
    closeModal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div
    v-if="event"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cs-dark/80 backdrop-blur-md animate-in fade-in duration-200"
    @click.self="closeModal"
  >
    <div
      class="w-full max-w-xl bg-cs-surface border border-cs-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="event.id + '-title'"
    >
      <!-- Header bar with theme color strip -->
      <div
        class="h-2 w-full"
        :style="{ backgroundColor: themeInfo ? themeInfo.color : '#D6226B' }"
      ></div>

      <!-- Event Poster Image Banner if present -->
      <div v-if="event.imageUrl" class="relative w-full h-48 sm:h-60 overflow-hidden bg-slate-950 flex-shrink-0 border-b border-cs-border">
        <img
          :src="event.imageUrl"
          :alt="event.title"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-cs-surface via-transparent to-black/40"></div>
        <button
          @click="closeModal"
          class="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors shadow-lg"
          aria-label="Fermer la boîte de dialogue"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-6 overflow-y-auto space-y-5">
        <!-- Top bar: Asso + Theme + Close (if no banner image) -->
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/10">
              {{ event.asso }}
            </span>

            <span
              v-if="themeInfo"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              :style="{ color: themeInfo.color, backgroundColor: `${themeInfo.color}15`, borderColor: `${themeInfo.color}30` }"
            >
              <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: themeInfo.color }"></span>
              {{ themeInfo.label }}
            </span>

            <span v-if="isFeatured" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300">
              <Sparkles class="w-3 h-3" />
              À la une
            </span>
          </div>

          <button
            v-if="!event.imageUrl"
            @click="closeModal"
            class="p-2 rounded-full text-slate-400 hover:text-white hover:bg-cs-surface-light transition-colors"
            aria-label="Fermer la boîte de dialogue"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Event Title -->
        <h2 :id="event.id + '-title'" class="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-tight">
          {{ event.title }}
        </h2>

        <!-- Details Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-cs-dark/50 border border-cs-border/80 text-xs sm:text-sm">
          <div v-if="eventDate" class="flex items-center gap-2.5 text-slate-200">
            <Calendar class="w-4 h-4 text-cs-pink flex-shrink-0" />
            <div>
              <span class="text-[11px] text-slate-400 block font-medium">Date</span>
              <span class="font-semibold capitalize">{{ formatFr(eventDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}</span>
            </div>
          </div>

          <div v-if="event.start" class="flex items-center gap-2.5 text-slate-200 tabular-nums">
            <Clock class="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div>
              <span class="text-[11px] text-slate-400 block font-medium">Horaire</span>
              <span class="font-semibold">{{ formatTimeRange(event.start, event.end) }}</span>
            </div>
          </div>

          <div v-if="event.place" class="flex items-center gap-2.5 text-slate-200 sm:col-span-2">
            <MapPin class="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div>
              <span class="text-[11px] text-slate-400 block font-medium">Lieu</span>
              <span class="font-semibold">{{ event.place }}</span>
            </div>
          </div>

          <div v-if="event.price" class="flex items-center gap-2.5 text-slate-200 sm:col-span-2">
            <Tag class="w-4 h-4 text-purple-400 flex-shrink-0" />
            <div>
              <span class="text-[11px] text-slate-400 block font-medium">Tarif / Inscription</span>
              <span class="font-semibold">{{ event.price }}</span>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div v-if="event.description" class="space-y-1.5">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h4>
          <p class="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap bg-cs-surface-light/40 p-4 rounded-2xl border border-cs-border/40">
            {{ event.description }}
          </p>
        </div>

        <!-- Moderator Controls (visible in moderator mode) -->
        <div v-if="currentRole === 'moderator'" class="p-3.5 rounded-2xl bg-cs-pink/10 border border-cs-pink/30 space-y-2">
          <span class="text-[11px] font-bold uppercase tracking-wider text-cs-pink block">Actions Modérateur</span>
          <div class="flex flex-wrap items-center gap-2">
            <button
              @click="toggleFeatured(event.id)"
              class="px-3 py-1.5 rounded-xl bg-cs-surface border border-cs-border hover:border-cs-pink text-xs font-semibold text-white transition-all flex items-center gap-1.5"
            >
              <Sparkles class="w-3.5 h-3.5 text-amber-400" />
              <span>{{ isFeatured ? 'Retirer de la une' : 'Mettre à la une' }}</span>
            </button>

            <button
              @click="triggerEdit"
              class="px-3 py-1.5 rounded-xl bg-cs-surface border border-cs-border hover:border-blue-400 text-xs font-semibold text-white transition-all flex items-center gap-1.5"
            >
              <Edit class="w-3.5 h-3.5 text-blue-400" />
              <span>Modifier</span>
            </button>

            <button
              @click="triggerDelete"
              class="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Supprimer</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="p-4 sm:p-5 bg-cs-dark border-t border-cs-border flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <button
            @click="downloadIcs(event)"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cs-surface border border-cs-border hover:border-slate-400 text-xs font-semibold text-white transition-all"
            title="Télécharger le fichier .ics pour Apple Calendar / Outlook"
          >
            <Download class="w-3.5 h-3.5 text-cs-pink" />
            <span>Fichier .ics</span>
          </button>

          <a
            :href="getGoogleCalendarUrl(event)"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cs-surface border border-cs-border hover:border-slate-400 text-xs font-semibold text-white transition-all"
            title="Ajouter directement à Google Agenda"
          >
            <ExternalLink class="w-3.5 h-3.5 text-amber-400" />
            <span>Google Agenda</span>
          </a>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="copyLink"
            class="p-2 rounded-xl bg-cs-surface border border-cs-border hover:border-slate-400 text-slate-300 hover:text-white transition-all"
            title="Copier le lien"
          >
            <Share2 class="w-4 h-4" />
          </button>

          <button
            @click="closeModal"
            class="px-4 py-2 rounded-xl bg-cs-pink text-white font-bold text-xs shadow-md shadow-cs-pink/20 hover:bg-cs-pink-hover transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
