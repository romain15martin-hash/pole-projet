<script setup lang="ts">
import { computed } from 'vue'
import { useEventsState } from '../composables/useEventsState'
import { formatFr, formatTimeRange, addDays } from '../utils/date'
import { THEMES } from '../types'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Sparkles
} from 'lucide-vue-next'

const {
  weekStart,
  weekDays,
  prevWeek,
  nextWeek,
  currentWeek,
  selectedModalEvent
} = useEventsState()

const weekRangeLabel = computed(() => {
  const ws = weekStart.value
  const we = addDays(ws, 6)
  if (ws.getMonth() === we.getMonth()) {
    return `${ws.getDate()} – ${formatFr(we, { day: 'numeric', month: 'long', year: 'numeric' })}`
  }
  return `${formatFr(ws, { day: 'numeric', month: 'long' })} – ${formatFr(we, { day: 'numeric', month: 'long', year: 'numeric' })}`
})

const getThemeColor = (themeId: string) => {
  const found = THEMES.find(t => t.id === themeId)
  return found ? found.color : '#D6226B'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header & Week Controls -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div>
        <div class="flex items-center gap-2">
          <CalendarIcon class="w-5 h-5 text-cs-pink" />
          <h2 class="font-display font-extrabold text-2xl text-white tracking-tight">
            Planning de la semaine
          </h2>
        </div>
        <p class="text-xs sm:text-sm font-medium text-slate-400 capitalize mt-0.5">
          {{ weekRangeLabel }}
        </p>
      </div>

      <!-- Navigation buttons -->
      <div class="flex items-center gap-2 self-start sm:self-auto">
        <button
          @click="prevWeek"
          class="flex items-center gap-1 px-3 py-1.5 rounded-full bg-cs-surface border border-cs-border hover:border-slate-500 text-slate-200 hover:text-white text-xs font-semibold transition-all active:scale-95"
          aria-label="Semaine précédente"
        >
          <ChevronLeft class="w-4 h-4" />
          <span>Précédente</span>
        </button>

        <button
          @click="currentWeek"
          class="px-3.5 py-1.5 rounded-full bg-cs-pink/15 border border-cs-pink/40 text-cs-pink hover:bg-cs-pink hover:text-white text-xs font-bold transition-all active:scale-95"
        >
          Aujourd'hui
        </button>

        <button
          @click="nextWeek"
          class="flex items-center gap-1 px-3 py-1.5 rounded-full bg-cs-surface border border-cs-border hover:border-slate-500 text-slate-200 hover:text-white text-xs font-semibold transition-all active:scale-95"
          aria-label="Semaine suivante"
        >
          <span>Suivante</span>
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Days List / Timeline -->
    <div class="space-y-4">
      <div
        v-for="day in weekDays"
        :key="day.dateStr"
        :class="[
          'rounded-2xl border transition-all p-4 sm:p-5',
          day.isToday
            ? 'bg-gradient-to-r from-cs-surface to-cs-surface-light border-cs-pink shadow-xl shadow-cs-pink/10 ring-1 ring-cs-pink/40'
            : 'bg-cs-surface/80 border-cs-border hover:border-cs-border/80'
        ]"
      >
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <!-- Day Header Column (Left 3 cols on MD) -->
          <div class="md:col-span-3 flex md:flex-col items-center md:items-start justify-between md:justify-start gap-1 pb-2 md:pb-0 md:border-b-0 border-b border-cs-border/40">
            <div class="flex items-center gap-2">
              <span class="font-display font-extrabold text-lg sm:text-xl text-white capitalize">
                {{ day.label }}
              </span>
              <span
                v-if="day.isToday"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cs-pink text-white animate-pulse"
              >
                Aujourd'hui
              </span>
            </div>

            <div class="text-xs sm:text-sm font-semibold text-slate-400 tabular-nums">
              {{ day.date.getDate() }} {{ formatFr(day.date, { month: 'short' }) }}
            </div>

            <div class="hidden md:block text-[11px] text-slate-400 mt-2">
              {{ day.events.length }} évènement{{ day.events.length > 1 ? 's' : '' }}
            </div>
          </div>

          <!-- Day Events Column (Right 9 cols on MD) -->
          <div class="md:col-span-9 space-y-2.5">
            <div v-if="day.events.length === 0" class="py-4 px-3 text-xs sm:text-sm text-slate-400 italic bg-cs-dark/30 rounded-xl border border-cs-border/40 flex items-center justify-between">
              <span>Aucun évènement prévu pour ce jour.</span>
            </div>

            <!-- Event Card Items -->
            <button
              v-for="event in day.events"
              :key="event.id"
              @click="selectedModalEvent = event"
              class="w-full text-left p-3.5 sm:p-4 rounded-xl bg-cs-dark/60 hover:bg-cs-surface-light border border-cs-border/80 hover:border-slate-500 shadow-sm transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden"
              :style="{ borderLeftWidth: '5px', borderLeftColor: getThemeColor(event.theme) }"
            >
              <div class="flex items-start sm:items-center gap-3 pr-2">
                <img
                  v-if="event.imageUrl"
                  :src="event.imageUrl"
                  :alt="event.title"
                  class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-cs-border/80 flex-shrink-0 group-hover:scale-105 transition-transform"
                />

                <div class="space-y-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span
                      class="px-2 py-0.5 rounded-md text-[11px] font-bold"
                      :style="{ color: getThemeColor(event.theme), backgroundColor: `${getThemeColor(event.theme)}15` }"
                    >
                      {{ event.asso }}
                    </span>

                    <span v-if="event.isFeatured" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300">
                      <Sparkles class="w-3 h-3" />
                      À la une
                    </span>

                    <div class="flex items-center gap-1 text-[11px] font-semibold text-slate-400 tabular-nums">
                      <Clock class="w-3.5 h-3.5 text-slate-400" />
                      <span>{{ formatTimeRange(event.start, event.end) }}</span>
                    </div>
                  </div>

                  <h3 class="font-display font-bold text-base sm:text-lg text-white group-hover:text-cs-pink transition-colors">
                    {{ event.title }}
                  </h3>

                  <p v-if="event.description" class="text-xs text-slate-400 line-clamp-1 max-w-xl">
                    {{ event.description }}
                  </p>
                </div>
              </div>

              <!-- Location Tag -->
              <div v-if="event.place" class="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-cs-surface px-2.5 py-1 rounded-lg border border-cs-border self-start sm:self-center">
                <MapPin class="w-3.5 h-3.5 text-emerald-400" />
                <span class="truncate max-w-[160px]">{{ event.place }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
