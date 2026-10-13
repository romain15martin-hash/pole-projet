<script setup lang="ts">
import { computed } from 'vue'
import { useEventsState } from '../composables/useEventsState'
import { parseISO, formatFr, formatTimeRange, downloadIcs } from '../utils/date'
import { THEMES } from '../types'
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Download,
  Share2,
  ArrowRight,
  Ticket
} from 'lucide-vue-next'

const {
  featuredEvent,
  selectedModalEvent,
  currentView,
  showToast
} = useEventsState()

const themeInfo = computed(() => {
  if (!featuredEvent.value) return null
  return THEMES.find(t => t.id === featuredEvent.value?.theme)
})

const eventDate = computed(() => {
  if (!featuredEvent.value) return null
  return parseISO(featuredEvent.value.date)
})

const copyLink = () => {
  if (!featuredEvent.value) return
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.origin + '#' + featuredEvent.value.id)
    showToast('Lien de l’évènement copié dans le presse-papier !', 'info')
  }
}
</script>

<template>
  <section class="relative overflow-hidden bg-gradient-to-b from-cs-surface to-cs-dark border-b border-cs-border">
    <!-- Glow aura in background -->
    <div class="absolute -top-40 left-1/4 w-96 h-96 bg-cs-pink/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-20 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 relative z-10">
      <div v-if="featuredEvent" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <!-- Main Content (Left 8 cols) -->
        <div class="lg:col-span-8 space-y-4">
          <!-- Kicker -->
          <div class="flex flex-wrap items-center gap-2.5">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-cs-pink text-white shadow-md shadow-cs-pink/30">
              <Sparkles class="w-3.5 h-3.5" />
              <span>À la une</span>
            </span>

            <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/10">
              {{ featuredEvent.asso }}
            </span>

            <span
              v-if="themeInfo"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              :style="{ color: themeInfo.color, backgroundColor: `${themeInfo.color}15`, borderColor: `${themeInfo.color}30` }"
            >
              <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: themeInfo.color }"></span>
              {{ themeInfo.label }}
            </span>
          </div>

          <!-- Title -->
          <h1 class="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-[1.1] max-w-2xl">
            {{ featuredEvent.title }}
          </h1>

          <!-- Description preview -->
          <p v-if="featuredEvent.description" class="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl line-clamp-2">
            {{ featuredEvent.description }}
          </p>

          <!-- Meta badges (Date, Time, Location) -->
          <div class="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-medium text-slate-300 pt-1">
            <div v-if="eventDate" class="flex items-center gap-2 bg-cs-surface-light/80 px-3 py-1.5 rounded-xl border border-cs-border">
              <Calendar class="w-4 h-4 text-cs-pink flex-shrink-0" />
              <span>{{ formatFr(eventDate, { weekday: 'long', day: 'numeric', month: 'long' }) }}</span>
            </div>

            <div v-if="featuredEvent.start" class="flex items-center gap-2 bg-cs-surface-light/80 px-3 py-1.5 rounded-xl border border-cs-border tabular-nums">
              <Clock class="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{{ formatTimeRange(featuredEvent.start, featuredEvent.end) }}</span>
            </div>

            <div v-if="featuredEvent.place" class="flex items-center gap-2 bg-cs-surface-light/80 px-3 py-1.5 rounded-xl border border-cs-border">
              <MapPin class="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{{ featuredEvent.place }}</span>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="flex flex-wrap items-center gap-3 pt-3">
            <button
              @click="selectedModalEvent = featuredEvent"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cs-pink text-white font-bold text-sm shadow-xl shadow-cs-pink/30 hover:bg-cs-pink-hover active:scale-95 transition-all"
            >
              <span>Voir les détails</span>
              <ArrowRight class="w-4 h-4" />
            </button>

            <button
              @click="downloadIcs(featuredEvent)"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-cs-surface-light border border-cs-border text-slate-200 hover:text-white hover:bg-cs-border font-semibold text-sm transition-all"
              title="Télécharger l'évènement pour votre calendrier"
            >
              <Download class="w-4 h-4 text-cs-pink" />
              <span>Exporter (.ics)</span>
            </button>

            <button
              @click="copyLink"
              class="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-cs-surface-light border border-cs-border text-slate-400 hover:text-white font-semibold text-sm transition-all"
              title="Copier le lien de l'évènement"
            >
              <Share2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Right 4 cols: Physical Campus Ticket Stub and Poster -->
        <div class="lg:col-span-4 flex flex-col items-center lg:items-end gap-4">
          <!-- Official Poster Card if present -->
          <div
            v-if="featuredEvent.imageUrl"
            @click="selectedModalEvent = featuredEvent"
            class="w-full max-w-xs relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl group cursor-pointer bg-slate-950"
          >
            <img
              :src="featuredEvent.imageUrl"
              :alt="featuredEvent.title"
              class="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
              <span class="text-xs font-semibold text-white/90 drop-shadow flex items-center gap-1.5">
                <Ticket class="w-3.5 h-3.5 text-cs-pink" />
                <span>Affiche officielle de l'évènement</span>
              </span>
            </div>
          </div>

          <div
            v-if="eventDate"
            class="w-full max-w-xs relative rounded-3xl bg-gradient-to-b from-[#16234B] to-[#0D1530] border-2 border-dashed border-white/20 p-5 text-center shadow-2xl backdrop-blur-md group hover:border-cs-pink/50 transition-colors"
          >
            <!-- Ticket notch cutouts left and right -->
            <div class="absolute -left-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-cs-dark border border-cs-border"></div>
            <div class="absolute -right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-cs-dark border border-cs-border"></div>

            <div class="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cs-pink mb-1">
              <Ticket class="w-3.5 h-3.5" />
              <span>Billet Campus</span>
            </div>

            <div class="font-display font-bold text-base text-slate-200 capitalize">
              {{ formatFr(eventDate, { weekday: 'long' }) }}
            </div>

            <div class="font-display font-extrabold text-5xl text-white my-0.5 tabular-nums tracking-tighter">
              {{ eventDate.getDate() }}
            </div>

            <div class="font-display font-semibold text-sm text-slate-300 capitalize">
              {{ formatFr(eventDate, { month: 'long', year: 'numeric' }) }}
            </div>

            <div v-if="featuredEvent.start" class="mt-3 pt-2.5 border-t border-white/10 text-xs font-mono font-bold text-amber-300 tabular-nums">
              {{ featuredEvent.start }}
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state when no events -->
      <div v-else class="text-center py-12 max-w-md mx-auto space-y-4">
        <h2 class="font-display font-bold text-2xl text-white">Aucun évènement programmé</h2>
        <p class="text-slate-400 text-sm">Votre association a un projet ? Proposez-le dès maintenant pour l'afficher sur le planning du campus.</p>
        <button
          @click="currentView = 'asso'"
          class="px-5 py-2.5 rounded-full bg-cs-pink text-white font-bold text-sm shadow-lg shadow-cs-pink/30 hover:bg-cs-pink-hover transition-all"
        >
          Proposer un évènement
        </button>
      </div>
    </div>
  </section>
</template>
