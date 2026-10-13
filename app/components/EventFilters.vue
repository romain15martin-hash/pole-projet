<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEventsState } from '../composables/useEventsState'
import { THEMES, ASSOS } from '../types'
import { Filter, ChevronDown, RotateCcw, Check } from 'lucide-vue-next'

const {
  selectedThemes,
  selectedAssos,
  upcomingOnly,
  toggleTheme,
  toggleAsso,
  clearFilters,
  events
} = useEventsState()

const isOpen = ref(false)

const activeFiltersCount = computed(() => {
  return selectedThemes.value.size + selectedAssos.value.size + (upcomingOnly.value ? 1 : 0)
})

// Only show assos that actually have at least 1 event in the chip list, plus active ones
const availableAssos = computed(() => {
  const assosWithEvents = new Set(events.value.map(e => e.asso))
  return ASSOS.filter(a => assosWithEvents.has(a) || selectedAssos.value.has(a))
})
</script>

<template>
  <div class="bg-cs-surface border border-cs-border rounded-2xl overflow-hidden shadow-lg mb-8 transition-all">
    <!-- Filter Header Bar -->
    <div class="flex items-center justify-between p-3.5 sm:p-4 gap-4">
      <button
        @click="isOpen = !isOpen"
        class="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cs-pink rounded-lg p-1 -m-1"
        :aria-expanded="isOpen"
      >
        <div class="w-8 h-8 rounded-xl bg-cs-surface-light border border-cs-border flex items-center justify-center text-cs-pink">
          <Filter class="w-4 h-4" />
        </div>
        <div>
          <span class="font-display font-bold text-sm sm:text-base text-white">Filtrer les évènements</span>
          <div class="text-xs text-slate-400">
            <span v-if="activeFiltersCount > 0" class="text-cs-pink font-semibold">
              {{ activeFiltersCount }} filtre{{ activeFiltersCount > 1 ? 's' : '' }} actif{{ activeFiltersCount > 1 ? 's' : '' }}
            </span>
            <span v-else>Par thème, association ou date</span>
          </div>
        </div>
      </button>

      <div class="flex items-center gap-2">
        <button
          v-if="activeFiltersCount > 0"
          @click="clearFilters"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Réinitialiser</span>
        </button>

        <button
          @click="isOpen = !isOpen"
          class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-cs-surface-light transition-colors"
          :aria-label="isOpen ? 'Fermer les filtres' : 'Ouvrir les filtres'"
        >
          <ChevronDown class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" />
        </button>
      </div>
    </div>

    <!-- Filter Collapsible Body -->
    <div
      v-if="isOpen"
      class="border-t border-cs-border/60 p-4 sm:p-5 space-y-5 bg-cs-dark/40 animate-in fade-in duration-150"
    >
      <!-- Themes Filter -->
      <div class="space-y-2">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block">Thématiques</span>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="theme in THEMES"
            :key="theme.id"
            @click="toggleTheme(theme.id)"
            :class="[
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border',
              selectedThemes.has(theme.id)
                ? 'bg-white text-slate-950 border-white shadow-md'
                : 'bg-cs-surface-light text-slate-300 border-cs-border hover:border-slate-500'
            ]"
          >
            <span
              class="w-2 h-2 rounded-full flex-shrink-0"
              :style="{ backgroundColor: theme.color }"
            ></span>
            <span>{{ theme.label }}</span>
            <Check v-if="selectedThemes.has(theme.id)" class="w-3.5 h-3.5 ml-0.5 text-slate-950" />
          </button>
        </div>
      </div>

      <!-- Associations Filter -->
      <div class="space-y-2">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block">Associations</span>
        <div class="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
          <button
            v-for="asso in availableAssos"
            :key="asso"
            @click="toggleAsso(asso)"
            :class="[
              'px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
              selectedAssos.has(asso)
                ? 'bg-cs-pink text-white border-cs-pink shadow-md'
                : 'bg-cs-surface-light text-slate-300 border-cs-border hover:bg-cs-border'
            ]"
          >
            {{ asso }}
          </button>
        </div>
      </div>

      <!-- Upcoming Only Toggle -->
      <div class="pt-2 border-t border-cs-border/40 flex items-center justify-between">
        <label class="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-medium text-slate-200">
          <input
            type="checkbox"
            v-model="upcomingOnly"
            class="rounded bg-cs-surface border-cs-border text-cs-pink focus:ring-cs-pink"
          />
          <span>Afficher uniquement les évènements à venir (masquer les passés)</span>
        </label>
      </div>
    </div>
  </div>
</template>
