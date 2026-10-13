<script setup lang="ts">
import { computed } from 'vue'
import { useEventsState } from '../composables/useEventsState'
import { parseISO, formatFr, formatTimeRange } from '../utils/date'
import { THEMES } from '../types'
import EventFilters from './EventFilters.vue'
import {
  Search,
  X,
  Calendar,
  Clock,
  MapPin,
  Sparkles
} from 'lucide-vue-next'

const {
  searchQuery,
  filteredEvents,
  selectedModalEvent
} = useEventsState()

const results = computed(() => {
  return [...filteredEvents.value].sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
})

const getThemeColor = (themeId: string) => {
  const found = THEMES.find(t => t.id === themeId)
  return found ? found.color : '#D6226B'
}

const clearSearch = () => {
  searchQuery.value = ''
}
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <!-- Page Header -->
    <div class="text-center space-y-2">
      <h2 class="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
        Recherche d'évènements
      </h2>
      <p class="text-slate-400 text-sm max-w-lg mx-auto">
        Trouvez un concert, un tournoi sportif, une conférence ou une soirée parmi toutes les assos de CentraleSupélec.
      </p>
    </div>

    <!-- Search Input Bar -->
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
        <Search class="w-5 h-5" />
      </div>

      <input
        type="search"
        v-model="searchQuery"
        placeholder="Rechercher par titre, asso (BDE, BDS, BDA...), lieu ou mot-clé..."
        class="w-full pl-11 pr-12 py-3.5 bg-cs-surface border border-cs-border focus:border-cs-pink focus:ring-2 focus:ring-cs-pink/30 rounded-2xl text-white placeholder-slate-400 text-sm sm:text-base outline-none transition-all shadow-xl"
        autocomplete="off"
      />

      <button
        v-if="searchQuery"
        @click="clearSearch"
        class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white"
        aria-label="Effacer la recherche"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Integrated Filters -->
    <EventFilters />

    <!-- Results count & list -->
    <div class="space-y-3">
      <div class="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
        <span>{{ results.length }} résultat{{ results.length > 1 ? 's' : '' }} trouvé{{ results.length > 1 ? 's' : '' }}</span>
      </div>

      <!-- Result Cards -->
      <div v-if="results.length > 0" class="space-y-2.5">
        <button
          v-for="event in results"
          :key="event.id"
          @click="selectedModalEvent = event"
          class="w-full text-left p-4 rounded-2xl bg-cs-surface hover:bg-cs-surface-light border border-cs-border hover:border-slate-500 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md group"
          :style="{ borderLeftWidth: '5px', borderLeftColor: getThemeColor(event.theme) }"
        >
          <div class="flex items-start sm:items-center gap-3">
            <img
              v-if="event.imageUrl"
              :src="event.imageUrl"
              :alt="event.title"
              class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-cs-border flex-shrink-0 group-hover:scale-105 transition-transform"
            />
            <div class="space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  class="px-2.5 py-0.5 rounded-md text-xs font-bold"
                  :style="{ color: getThemeColor(event.theme), backgroundColor: `${getThemeColor(event.theme)}15` }"
                >
                  {{ event.asso }}
                </span>

                <span v-if="event.isFeatured" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300">
                  <Sparkles class="w-3 h-3" />
                  À la une
                </span>

                <div class="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Calendar class="w-3.5 h-3.5 text-cs-pink" />
                  <span class="capitalize">{{ formatFr(parseISO(event.date), { weekday: 'short', day: 'numeric', month: 'short' }) }}</span>
                </div>

                <div class="flex items-center gap-1 text-xs text-slate-400 font-medium tabular-nums">
                  <Clock class="w-3.5 h-3.5 text-amber-400" />
                  <span>{{ formatTimeRange(event.start, event.end) }}</span>
                </div>
              </div>

              <h3 class="font-display font-bold text-base sm:text-lg text-white group-hover:text-cs-pink transition-colors">
              {{ event.title }}
            </h3>

            <p v-if="event.description" class="text-xs text-slate-400 line-clamp-2 max-w-xl">
              {{ event.description }}
            </p>
          </div>
        </div>

        <div v-if="event.place" class="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-cs-dark px-3 py-1.5 rounded-xl border border-cs-border self-start sm:self-center">
            <MapPin class="w-3.5 h-3.5 text-emerald-400" />
            <span class="truncate max-w-[180px]">{{ event.place }}</span>
          </div>
        </button>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 px-4 rounded-2xl bg-cs-surface/50 border border-cs-border border-dashed space-y-3">
        <p class="font-display font-bold text-lg text-slate-200">Aucun évènement ne correspond à votre recherche</p>
        <p class="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Essayez de modifier votre mot-clé ou réinitialisez les filtres thématiques et associatifs.
        </p>
      </div>
    </div>
  </div>
</template>
