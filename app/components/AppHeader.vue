<script setup lang="ts">
import { ref } from 'vue'
import { useEventsState } from '../composables/useEventsState'
import { ASSOS } from '../types'
import {
  Calendar,
  Search,
  Trophy,
  PlusCircle,
  ShieldCheck,
  ChevronDown,
  Layers,
  Sparkles,
  UserCheck
} from 'lucide-vue-next'

const {
  currentView,
  currentRole,
  events,
  selectedAssos,
  toggleAsso
} = useEventsState()

const isAssoDropdownOpen = ref(false)

const getEventsCountForAsso = (asso: string) => {
  return events.value.filter(e => e.asso === asso).length
}

const assosWithEvents = computed(() => {
  return ASSOS.filter(a => getEventsCountForAsso(a) > 0)
})

const assosWithoutEvents = computed(() => {
  return ASSOS.filter(a => getEventsCountForAsso(a) === 0)
})

const selectAssoFilter = (asso: string) => {
  toggleAsso(asso)
  currentView.value = 'home'
  isAssoDropdownOpen.value = false
}
</script>

<template>
  <header class="sticky top-0 z-40 bg-cs-dark/90 backdrop-blur-xl border-b border-cs-border/80 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20 gap-4">
        <!-- Brand / Logo -->
        <button
          @click="currentView = 'home'"
          class="flex items-center gap-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-cs-pink rounded-xl p-1 -m-1 text-left"
          aria-label="Com CS - Retour à l'accueil"
        >
          <!-- CentraleSupélec Logo Badge -->
          <div class="h-10 px-2.5 rounded-lg bg-cs-surface border border-cs-border flex items-center gap-2 group-hover:border-cs-pink/50 transition-colors">
            <div class="w-2.5 h-6 rounded-sm bg-cs-pink flex-shrink-0 animate-pulse"></div>
            <div class="flex flex-col leading-none">
              <span class="font-display font-black text-sm tracking-tight text-white">Centrale</span>
              <span class="font-display font-semibold text-xs tracking-tight text-slate-300">Supélec</span>
            </div>
          </div>

          <div class="flex items-center gap-2.5 border-l border-cs-border pl-3.5">
            <span class="font-display font-extrabold text-xl tracking-tight text-white group-hover:text-cs-pink transition-colors">
              Com CS
            </span>
            <span class="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-cs-pink/15 text-cs-pink border border-cs-pink/30 rounded-full">
              Agenda 2026
            </span>
          </div>
        </button>

        <!-- Navigation Tabs -->
        <nav class="hidden md:flex items-center gap-1.5" aria-label="Navigation principale">
          <button
            @click="currentView = 'home'"
            :class="[
              'px-3.5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2',
              currentView === 'home'
                ? 'bg-cs-pink text-white shadow-lg shadow-cs-pink/25'
                : 'text-slate-300 hover:text-white hover:bg-cs-surface'
            ]"
          >
            <Calendar class="w-4 h-4" />
            <span>Planning</span>
          </button>

          <!-- Dropdown Assos -->
          <div class="relative">
            <button
              @click="isAssoDropdownOpen = !isAssoDropdownOpen"
              :class="[
                'px-3.5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5',
                selectedAssos.size > 0
                  ? 'bg-cs-surface border border-cs-pink/50 text-cs-pink'
                  : 'text-slate-300 hover:text-white hover:bg-cs-surface'
              ]"
            >
              <Layers class="w-4 h-4" />
              <span>Par asso</span>
              <span
                v-if="selectedAssos.size > 0"
                class="w-5 h-5 rounded-full bg-cs-pink text-white text-[11px] font-bold flex items-center justify-center ml-0.5"
              >
                {{ selectedAssos.size }}
              </span>
              <ChevronDown class="w-3.5 h-3.5 ml-0.5 transition-transform" :class="{ 'rotate-180': isAssoDropdownOpen }" />
            </button>

            <!-- Dropdown Panel -->
            <div
              v-if="isAssoDropdownOpen"
              class="absolute left-0 mt-2 w-80 max-h-[75vh] overflow-y-auto bg-cs-surface border border-cs-border rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div class="px-2 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-cs-border/60 mb-2">
                Associations actives
              </div>
              
              <div v-if="assosWithEvents.length" class="space-y-1 mb-3">
                <button
                  v-for="asso in assosWithEvents"
                  :key="asso"
                  @click="selectAssoFilter(asso)"
                  :class="[
                    'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors',
                    selectedAssos.has(asso)
                      ? 'bg-cs-pink text-white'
                      : 'text-slate-200 hover:bg-cs-surface-light'
                  ]"
                >
                  <span>{{ asso }}</span>
                  <span
                    :class="[
                      'px-2 py-0.5 rounded-full text-[10px] font-bold',
                      selectedAssos.has(asso)
                        ? 'bg-white/20 text-white'
                        : 'bg-cs-border text-slate-300'
                    ]"
                  >
                    {{ getEventsCountForAsso(asso) }} évt{{ getEventsCountForAsso(asso) > 1 ? 's' : '' }}
                  </span>
                </button>
              </div>

              <div class="px-2 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-cs-border/60 mb-2">
                Autres assos du campus
              </div>
              <div class="flex flex-wrap gap-1 px-1">
                <button
                  v-for="asso in assosWithoutEvents"
                  :key="asso"
                  @click="selectAssoFilter(asso)"
                  :class="[
                    'px-2 py-1 rounded-lg text-[11px] font-medium transition-colors',
                    selectedAssos.has(asso)
                      ? 'bg-cs-pink text-white'
                      : 'bg-cs-surface-light text-slate-400 hover:text-slate-200 hover:bg-cs-border'
                  ]"
                >
                  {{ asso }}
                </button>
              </div>
            </div>
          </div>

          <button
            @click="currentView = 'search'"
            :class="[
              'px-3.5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2',
              currentView === 'search'
                ? 'bg-cs-pink text-white shadow-lg shadow-cs-pink/25'
                : 'text-slate-300 hover:text-white hover:bg-cs-surface'
            ]"
          >
            <Search class="w-4 h-4" />
            <span>Recherche</span>
          </button>

          <button
            @click="currentView = 'coincs'"
            :class="[
              'px-3.5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2',
              currentView === 'coincs'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
            ]"
          >
            <Trophy class="w-4 h-4" />
            <span>CoinCS</span>
          </button>

          <button
            @click="currentView = 'asso'"
            :class="[
              'px-3.5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2',
              currentView === 'asso'
                ? 'bg-cs-pink text-white shadow-lg shadow-cs-pink/25'
                : 'text-slate-300 hover:text-white hover:bg-cs-surface'
            ]"
          >
            <ShieldCheck class="w-4 h-4" />
            <span>Espace Asso</span>
          </button>
        </nav>

        <!-- Right Controls: Role Persona Switcher & New Event CTA -->
        <div class="flex items-center gap-2.5">
          <!-- Role selector Pill (Allows immediate demo testing of moderator features) -->
          <div class="relative group">
            <div class="flex items-center bg-cs-surface border border-cs-border rounded-full p-0.5 text-xs font-semibold text-slate-300">
              <button
                @click="currentRole = 'student'"
                :class="[
                  'px-2.5 py-1 rounded-full transition-all',
                  currentRole === 'student' ? 'bg-slate-700 text-white font-bold' : 'hover:text-white'
                ]"
                title="Mode Étudiant / Visiteur"
              >
                Étudiant
              </button>
              <button
                @click="currentRole = 'asso'"
                :class="[
                  'px-2.5 py-1 rounded-full transition-all',
                  currentRole === 'asso' ? 'bg-indigo-600 text-white font-bold' : 'hover:text-white'
                ]"
                title="Mode Responsable Associatif"
              >
                Asso
              </button>
              <button
                @click="currentRole = 'moderator'"
                :class="[
                  'px-2.5 py-1 rounded-full transition-all flex items-center gap-1',
                  currentRole === 'moderator' ? 'bg-cs-pink text-white font-bold' : 'hover:text-white'
                ]"
                title="Mode Modérateur / BDE (Validation & Modération)"
              >
                <ShieldCheck class="w-3 h-3" />
                <span>Modo</span>
              </button>
            </div>
          </div>

          <button
            @click="currentView = 'asso'"
            class="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cs-pink to-rose-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-cs-pink/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <PlusCircle class="w-4 h-4" />
            <span>Proposer</span>
          </button>
        </div>
      </div>

      <!-- Mobile navigation bar -->
      <div class="md:hidden flex items-center justify-between py-2 border-t border-cs-border/60 overflow-x-auto gap-2">
        <button
          @click="currentView = 'home'"
          :class="[
            'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5',
            currentView === 'home' ? 'bg-cs-pink text-white' : 'text-slate-400'
          ]"
        >
          <Calendar class="w-3.5 h-3.5" />
          <span>Planning</span>
        </button>

        <button
          @click="currentView = 'search'"
          :class="[
            'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5',
            currentView === 'search' ? 'bg-cs-pink text-white' : 'text-slate-400'
          ]"
        >
          <Search class="w-3.5 h-3.5" />
          <span>Recherche</span>
        </button>

        <button
          @click="currentView = 'coincs'"
          :class="[
            'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5',
            currentView === 'coincs' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-amber-400'
          ]"
        >
          <Trophy class="w-3.5 h-3.5" />
          <span>CoinCS</span>
        </button>

        <button
          @click="currentView = 'asso'"
          :class="[
            'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5',
            currentView === 'asso' ? 'bg-cs-pink text-white' : 'text-slate-400'
          ]"
        >
          <ShieldCheck class="w-3.5 h-3.5" />
          <span>Espace Asso</span>
        </button>
      </div>
    </div>
  </header>
</template>
