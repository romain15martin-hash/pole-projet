<script setup lang="ts">
import { useEventsState } from '../composables/useEventsState'

const { currentView } = useEventsState()
</script>

<template>
  <footer class="mt-20 border-t border-cs-border/80 bg-cs-surface/60 py-12 text-slate-400 text-xs sm:text-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div class="space-y-1">
          <div class="flex items-center justify-center md:justify-start gap-2">
            <span class="font-display font-extrabold text-white text-base">Com CS</span>
            <span class="text-slate-500">·</span>
            <span class="font-medium text-slate-300">CentraleSupélec (Université Paris-Saclay)</span>
          </div>
          <p class="text-xs text-slate-500 max-w-xl">
            L'agenda commun des associations et clubs étudiants de CentraleSupélec.
            Chaque évènement proposé est modéré par les équipes associatives avant sa publication.
          </p>
        </div>

        <div class="flex items-center gap-4 text-xs font-semibold">
          <button @click="currentView = 'home'" class="hover:text-white transition-colors">Planning</button>
          <button @click="currentView = 'search'" class="hover:text-white transition-colors">Recherche</button>
          <button @click="currentView = 'coincs'" class="hover:text-amber-300 transition-colors">CoinCS</button>
          <button @click="currentView = 'asso'" class="hover:text-cs-pink transition-colors">Espace Asso</button>
        </div>
      </div>

      <div class="pt-6 border-t border-cs-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
        <div>
          © 2026 CentraleSupélec · Bâtiments Eiffel, Bouygues, Breguet · Campus Paris-Saclay
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Système synchronisé en local</span>
        </div>
      </div>
    </div>
  </footer>
</template>
