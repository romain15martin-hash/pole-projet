<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCoinState } from '../composables/useCoinState'
import { useEventsState } from '../composables/useEventsState'
import confetti from 'canvas-confetti'
import {
  Trophy,
  Users,
  Search,
  Plus,
  Flame,
  Award,
  Flag,
  Trash2,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-vue-next'

const {
  players,
  computedState,
  addPlayer,
  recordMatch,
  deleteMatch,
  reportPlayer,
  getPlayerName
} = useCoinState()

const { currentRole, showToast } = useEventsState()

const activeTab = ref<'play' | 'rank' | 'search'>('play')
const matchSize = ref<2 | 3>(2)

// Selection state for recording a match
const selA = ref<string[]>(['', '', ''])
const selB = ref<string[]>(['', '', ''])
const matchError = ref('')

// Add player state
const newPlayerName = ref('')

// Search state
const searchQ = ref('')
const selectedPlayerId = ref<string | null>(null)

// Report state
const isReportOpen = ref(false)
const reportReason = ref('Faux résultats')
const reportComment = ref('')

// Available players sorted by name
const sortedPlayers = computed(() => {
  return [...computedState.value.rankedPlayers].sort((a, b) => a.name.localeCompare(b.name))
})

// Current team IDs
const currentTeamA = computed(() => selA.value.slice(0, matchSize.value).filter(Boolean))
const currentTeamB = computed(() => selB.value.slice(0, matchSize.value).filter(Boolean))

// Average Elos
const avgA = computed(() => {
  const ids = currentTeamA.value
  if (!ids.length) return null
  const sum = ids.reduce((acc, id) => acc + (computedState.value.stats[id]?.elo || 1000), 0)
  return Math.round(sum / ids.length)
})

const avgB = computed(() => {
  const ids = currentTeamB.value
  if (!ids.length) return null
  const sum = ids.reduce((acc, id) => acc + (computedState.value.stats[id]?.elo || 1000), 0)
  return Math.round(sum / ids.length)
})

const handleAddPlayer = () => {
  if (!newPlayerName.value.trim()) return
  const ok = addPlayer(newPlayerName.value)
  if (ok) {
    showToast(`Joueur « ${newPlayerName.value.trim()} » ajouté avec 1000 pts Elo !`, 'success')
    newPlayerName.value = ''
  } else {
    showToast('Ce joueur existe déjà.', 'warn')
  }
}

const handleRecordMatch = (win: 'A' | 'B') => {
  matchError.value = ''
  const a = selA.value.slice(0, matchSize.value)
  const b = selB.value.slice(0, matchSize.value)

  if (a.some(id => !id) || b.some(id => !id)) {
    matchError.value = `Sélectionnez ${matchSize.value} joueurs pour chaque équipe.`
    return
  }

  const all = [...a, ...b]
  if (new Set(all).size !== all.length) {
    matchError.value = 'Un joueur ne peut être sélectionné qu’une seule fois.'
    return
  }

  const success = recordMatch(a, b, win)
  if (success) {
    // Fire celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    })

    showToast(`Partie enregistrée ! Victoire de l'équipe ${win} 🏆`, 'success')
    selA.value = ['', '', '']
    selB.value = ['', '', '']
    activeTab.value = 'rank'
  }
}

// Search hits
const searchHits = computed(() => {
  if (!searchQ.value.trim()) return []
  const q = searchQ.value.toLowerCase()
  return computedState.value.rankedPlayers.filter(p => p.name.toLowerCase().includes(q))
})

const selectedProfile = computed(() => {
  if (!selectedPlayerId.value) return null
  return computedState.value.rankedPlayers.find(p => p.id === selectedPlayerId.value) || null
})

const selectedPlayerMatches = computed(() => {
  if (!selectedPlayerId.value) return []
  const id = selectedPlayerId.value
  return computedState.value.processedMatches
    .filter(o => o.match.teamA.includes(id) || o.match.teamB.includes(id))
    .slice(-10)
    .reverse()
})

const openProfile = (id: string) => {
  selectedPlayerId.value = id
  activeTab.value = 'search'
}

const sendReport = () => {
  if (!selectedPlayerId.value) return
  reportPlayer(selectedPlayerId.value, reportReason.value, reportComment.value)
  showToast('Signalement enregistré. Merci pour votre vigilance.', 'info')
  isReportOpen.value = false
  reportComment.value = ''
}
</script>

<template>
  <div class="space-y-8 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="text-center space-y-2">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
        <Trophy class="w-4 h-4 text-amber-400" />
        <span>CentraleSupélec Gaming</span>
      </div>
      <h2 class="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
        Coin<span class="text-amber-400">CS</span> 🍺
      </h2>
      <p class="text-slate-400 text-sm max-w-lg mx-auto">
        Le classement Elo officiel du jeu du coincoin à CentraleSupélec. Enregistre ta partie, grimpe au classement et défie les promos !
      </p>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex items-center justify-center gap-2 p-1 bg-cs-surface border border-cs-border rounded-full max-w-md mx-auto">
      <button
        @click="activeTab = 'play'"
        :class="[
          'flex-1 py-2 px-4 rounded-full text-xs sm:text-sm font-bold transition-all text-center',
          activeTab === 'play' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
        ]"
      >
        🎯 Match
      </button>

      <button
        @click="activeTab = 'rank'"
        :class="[
          'flex-1 py-2 px-4 rounded-full text-xs sm:text-sm font-bold transition-all text-center',
          activeTab === 'rank' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
        ]"
      >
        🌍 Classement
      </button>

      <button
        @click="activeTab = 'search'"
        :class="[
          'flex-1 py-2 px-4 rounded-full text-xs sm:text-sm font-bold transition-all text-center',
          activeTab === 'search' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
        ]"
      >
        🔍 Profils
      </button>
    </div>

    <!-- TAB 1: NOUVELLE PARTIE -->
    <div v-if="activeTab === 'play'" class="space-y-6">
      <!-- Card: Enregistrer une partie -->
      <div class="p-6 sm:p-8 rounded-3xl bg-cs-surface border border-cs-border shadow-2xl space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cs-border pb-4">
          <h3 class="font-display font-bold text-xl text-white flex items-center gap-2">
            <span>Enregistrer un match</span>
          </h3>

          <!-- Mode 2v2 vs 3v3 -->
          <div class="flex items-center gap-1 bg-cs-dark border border-cs-border p-1 rounded-xl self-start sm:self-auto">
            <button
              @click="matchSize = 2"
              :class="[
                'px-3 py-1 rounded-lg text-xs font-bold transition-all',
                matchSize === 2 ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              ]"
            >
              2 vs 2 (4 joueurs)
            </button>
            <button
              @click="matchSize = 3"
              :class="[
                'px-3 py-1 rounded-lg text-xs font-bold transition-all',
                matchSize === 3 ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              ]"
            >
              3 vs 3 (6 joueurs)
            </button>
          </div>
        </div>

        <!-- Teams Column Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <!-- Equipe A (Rose / Rouge) -->
          <div class="p-5 rounded-2xl bg-rose-500/10 border-2 border-rose-500/30 space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-display font-bold text-base text-rose-400">Équipe A</span>
              <span v-if="avgA" class="text-xs font-mono font-bold text-slate-300">
                Moyenne : {{ avgA }} pts
              </span>
            </div>

            <div class="space-y-2">
              <select
                v-for="idx in matchSize"
                :key="'a-' + idx"
                v-model="selA[idx - 1]"
                class="w-full px-3 py-2.5 bg-cs-dark border border-cs-border rounded-xl text-white text-xs sm:text-sm outline-none focus:border-rose-500"
              >
                <option value="">— Joueur {{ idx }} —</option>
                <option
                  v-for="p in sortedPlayers"
                  :key="p.id"
                  :value="p.id"
                >
                  {{ p.name }} ({{ Math.round(p.elo) }} pts)
                </option>
              </select>
            </div>
          </div>

          <!-- Equipe B (Bleu / Indigo) -->
          <div class="p-5 rounded-2xl bg-indigo-500/10 border-2 border-indigo-500/30 space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-display font-bold text-base text-indigo-400">Équipe B</span>
              <span v-if="avgB" class="text-xs font-mono font-bold text-slate-300">
                Moyenne : {{ avgB }} pts
              </span>
            </div>

            <div class="space-y-2">
              <select
                v-for="idx in matchSize"
                :key="'b-' + idx"
                v-model="selB[idx - 1]"
                class="w-full px-3 py-2.5 bg-cs-dark border border-cs-border rounded-xl text-white text-xs sm:text-sm outline-none focus:border-indigo-500"
              >
                <option value="">— Joueur {{ idx }} —</option>
                <option
                  v-for="p in sortedPlayers"
                  :key="p.id"
                  :value="p.id"
                >
                  {{ p.name }} ({{ Math.round(p.elo) }} pts)
                </option>
              </select>
            </div>
          </div>
        </div>

        <p v-if="matchError" class="text-xs font-semibold text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
          {{ matchError }}
        </p>

        <!-- Winner Buttons -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <button
            @click="handleRecordMatch('A')"
            class="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-600/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Trophy class="w-4 h-4" />
            <span>Victoire Équipe A</span>
          </button>

          <button
            @click="handleRecordMatch('B')"
            class="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Trophy class="w-4 h-4" />
            <span>Victoire Équipe B</span>
          </button>
        </div>
      </div>

      <!-- Card: Ajouter un nouveau joueur -->
      <div class="p-6 rounded-2xl bg-cs-surface border border-cs-border space-y-3">
        <h4 class="font-display font-bold text-base text-white">Nouveau joueur sur le campus ?</h4>
        <div class="flex items-center gap-3">
          <input
            v-model="newPlayerName"
            @keydown.enter.prevent="handleAddPlayer"
            placeholder="Prénom ou pseudo (ex: Thomas, BDE-Robin...)"
            maxlength="24"
            class="flex-1 px-4 py-2.5 bg-cs-dark border border-cs-border rounded-xl text-white placeholder-slate-500 text-sm outline-none focus:border-amber-400"
          />
          <button
            @click="handleAddPlayer"
            class="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md hover:bg-amber-400 transition-all flex items-center gap-1.5 flex-shrink-0"
          >
            <Plus class="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>
      </div>
    </div>

    <!-- TAB 2: CLASSEMENT GENERAL -->
    <div v-if="activeTab === 'rank'" class="space-y-8">
      <!-- Podium Top 3 -->
      <div class="grid grid-cols-3 gap-3 pt-4 items-end max-w-lg mx-auto text-center">
        <!-- 2nd place -->
        <div v-if="computedState.rankedPlayers[1]" class="space-y-2">
          <div class="w-14 h-14 mx-auto rounded-full bg-slate-300 text-slate-900 font-extrabold text-xl flex items-center justify-center shadow-lg border-2 border-white">
            🥈
          </div>
          <div class="font-display font-bold text-sm text-white truncate px-1">
            {{ computedState.rankedPlayers[1].name }}
          </div>
          <div class="text-xs font-mono font-bold text-slate-300">
            {{ Math.round(computedState.rankedPlayers[1].elo) }} pts
          </div>
          <div class="h-20 bg-slate-700/60 rounded-t-2xl border-t border-slate-500 flex items-center justify-center text-xs font-bold text-slate-400">
            #2
          </div>
        </div>

        <!-- 1st place -->
        <div v-if="computedState.rankedPlayers[0]" class="space-y-2">
          <div class="w-16 h-16 mx-auto rounded-full bg-amber-400 text-slate-950 font-extrabold text-2xl flex items-center justify-center shadow-xl border-4 border-amber-300 animate-bounce">
            🥇
          </div>
          <div class="font-display font-extrabold text-base text-white truncate px-1">
            {{ computedState.rankedPlayers[0].name }}
          </div>
          <div class="text-sm font-mono font-bold text-amber-400">
            {{ Math.round(computedState.rankedPlayers[0].elo) }} pts
          </div>
          <div class="h-28 bg-amber-500/30 rounded-t-2xl border-t-2 border-amber-400 flex items-center justify-center text-sm font-black text-amber-300 shadow-inner">
            #1
          </div>
        </div>

        <!-- 3rd place -->
        <div v-if="computedState.rankedPlayers[2]" class="space-y-2">
          <div class="w-12 h-12 mx-auto rounded-full bg-amber-700 text-amber-100 font-extrabold text-lg flex items-center justify-center shadow-lg border-2 border-amber-600">
            🥉
          </div>
          <div class="font-display font-bold text-xs text-white truncate px-1">
            {{ computedState.rankedPlayers[2].name }}
          </div>
          <div class="text-xs font-mono font-bold text-slate-300">
            {{ Math.round(computedState.rankedPlayers[2].elo) }} pts
          </div>
          <div class="h-14 bg-amber-900/40 rounded-t-2xl border-t border-amber-700 flex items-center justify-center text-xs font-bold text-amber-500">
            #3
          </div>
        </div>
      </div>

      <!-- Rankings Table -->
      <div class="p-4 sm:p-6 rounded-3xl bg-cs-surface border border-cs-border shadow-xl overflow-hidden">
        <h3 class="font-display font-bold text-lg text-white mb-4">Tableau des scores Elo</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr class="border-b border-cs-border text-slate-400 uppercase tracking-wider text-[11px]">
                <th class="pb-3 px-3">#</th>
                <th class="pb-3 px-3">Joueur</th>
                <th class="pb-3 px-3 text-right">Elo</th>
                <th class="pb-3 px-3 text-right">Parties</th>
                <th class="pb-3 px-3 text-right">V</th>
                <th class="pb-3 px-3 text-right">D</th>
                <th class="pb-3 px-3 text-right">% Victoire</th>
                <th class="pb-3 px-3 text-right">Série</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-cs-border/50">
              <tr
                v-for="r in computedState.rankedPlayers"
                :key="r.id"
                @click="openProfile(r.id)"
                class="hover:bg-cs-surface-light cursor-pointer transition-colors"
              >
                <td class="py-3 px-3 font-mono font-bold text-slate-400">
                  <span v-if="r.rank === 1">🥇</span>
                  <span v-else-if="r.rank === 2">🥈</span>
                  <span v-else-if="r.rank === 3">🥉</span>
                  <span v-else>{{ r.rank }}</span>
                </td>
                <td class="py-3 px-3 font-bold text-white">{{ r.name }}</td>
                <td class="py-3 px-3 font-mono font-black text-amber-400 text-right tabular-nums">
                  {{ Math.round(r.elo) }}
                </td>
                <td class="py-3 px-3 text-right text-slate-300 tabular-nums">{{ r.games }}</td>
                <td class="py-3 px-3 text-right text-emerald-400 font-semibold tabular-nums">{{ r.wins }}</td>
                <td class="py-3 px-3 text-right text-rose-400 font-semibold tabular-nums">{{ r.losses }}</td>
                <td class="py-3 px-3 text-right tabular-nums text-slate-300 font-medium">
                  {{ r.games ? Math.round((100 * r.wins) / r.games) + '%' : '–' }}
                </td>
                <td class="py-3 px-3 text-right tabular-nums font-bold">
                  <span
                    :class="[
                      r.streak > 0 ? 'text-emerald-400' : (r.streak < 0 ? 'text-rose-400' : 'text-slate-400')
                    ]"
                  >
                    {{ r.streak > 0 ? '+' + r.streak : (r.streak || '–') }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Matches Log -->
      <div class="p-6 rounded-3xl bg-cs-surface border border-cs-border space-y-4">
        <h3 class="font-display font-bold text-lg text-white">Dernières parties enregistrées</h3>
        <div v-if="computedState.processedMatches.length > 0" class="space-y-3">
          <div
            v-for="item in [...computedState.processedMatches].reverse().slice(0, 10)"
            :key="item.match.id"
            class="p-4 rounded-xl bg-cs-dark border border-cs-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span
                  :class="[
                    'font-bold px-2 py-0.5 rounded-md text-[11px]',
                    item.match.win === 'A' ? 'bg-rose-500/20 text-rose-300' : 'bg-indigo-500/20 text-indigo-300'
                  ]"
                >
                  Victoire Équipe {{ item.match.win }}
                </span>
                <span class="text-slate-400">
                  {{ new Date(item.match.timestamp).toLocaleDateString('fr-FR') }}
                </span>
              </div>
              <div class="text-slate-300">
                <span class="font-semibold text-rose-400">A:</span>
                {{ item.match.teamA.map(getPlayerName).join(', ') }}
                <span class="text-slate-500 mx-1">vs</span>
                <span class="font-semibold text-indigo-400">B:</span>
                {{ item.match.teamB.map(getPlayerName).join(', ') }}
              </div>
            </div>

            <button
              v-if="currentRole === 'moderator'"
              @click="deleteMatch(item.match.id)"
              class="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors self-start sm:self-center"
              title="Supprimer la partie"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
        <div v-else class="text-slate-400 text-xs text-center py-4">
          Aucune partie enregistrée pour l'instant.
        </div>
      </div>
    </div>

    <!-- TAB 3: RECHERCHE & PROFIL -->
    <div v-if="activeTab === 'search'" class="space-y-6">
      <div class="relative">
        <input
          v-model="searchQ"
          placeholder="Rechercher un joueur (ex: Baudouin, Arthur...)"
          class="w-full pl-11 pr-4 py-3 bg-cs-surface border border-cs-border focus:border-amber-400 rounded-2xl text-white placeholder-slate-400 text-sm outline-none"
        />
        <Search class="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      </div>

      <!-- Search results list -->
      <div v-if="searchQ.trim() && searchHits.length > 0" class="flex flex-wrap gap-2">
        <button
          v-for="p in searchHits"
          :key="p.id"
          @click="selectedPlayerId = p.id"
          class="px-3 py-1.5 rounded-xl bg-cs-surface border border-cs-border hover:border-amber-400 text-xs font-semibold text-white flex items-center gap-2"
        >
          <span>{{ p.name }}</span>
          <span class="font-mono text-amber-400">{{ Math.round(p.elo) }} pts</span>
        </button>
      </div>

      <!-- Selected Profile Details Card -->
      <div v-if="selectedProfile" class="p-6 sm:p-8 rounded-3xl bg-cs-surface border border-cs-border shadow-2xl space-y-6">
        <div class="flex items-center justify-between border-b border-cs-border pb-4">
          <div>
            <h3 class="font-display font-extrabold text-2xl text-white">{{ selectedProfile.name }}</h3>
            <span class="text-xs text-slate-400">Profil joueur CoinCS</span>
          </div>

          <button
            @click="isReportOpen = !isReportOpen"
            class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Flag class="w-3.5 h-3.5" />
            <span>Signaler</span>
          </button>
        </div>

        <!-- Big Stats Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div class="p-4 rounded-2xl bg-cs-dark border border-cs-border">
            <span class="font-display font-black text-2xl sm:text-3xl text-amber-400 block tabular-nums">
              {{ Math.round(selectedProfile.elo) }}
            </span>
            <span class="text-xs text-slate-400 font-medium">Score Elo</span>
          </div>

          <div class="p-4 rounded-2xl bg-cs-dark border border-cs-border">
            <span class="font-display font-black text-2xl sm:text-3xl text-white block tabular-nums">
              #{{ selectedProfile.rank }}
            </span>
            <span class="text-xs text-slate-400 font-medium">Classement</span>
          </div>

          <div class="p-4 rounded-2xl bg-cs-dark border border-cs-border">
            <span class="font-display font-black text-2xl sm:text-3xl text-emerald-400 block tabular-nums">
              {{ selectedProfile.games ? Math.round((100 * selectedProfile.wins) / selectedProfile.games) + '%' : '–' }}
            </span>
            <span class="text-xs text-slate-400 font-medium">Victoires</span>
          </div>

          <div class="p-4 rounded-2xl bg-cs-dark border border-cs-border">
            <span class="font-display font-black text-2xl sm:text-3xl text-slate-300 block tabular-nums">
              {{ selectedProfile.wins }}V · {{ selectedProfile.losses }}D
            </span>
            <span class="text-xs text-slate-400 font-medium">Bilan</span>
          </div>
        </div>

        <!-- Recent matches for player -->
        <div class="space-y-3">
          <h4 class="font-display font-bold text-sm text-slate-300">Dernières parties de ce joueur</h4>
          <div v-if="selectedPlayerMatches.length > 0" class="space-y-2">
            <div
              v-for="item in selectedPlayerMatches"
              :key="item.match.id"
              class="p-3.5 rounded-xl bg-cs-dark border border-cs-border flex items-center justify-between text-xs"
            >
              <div class="space-y-0.5">
                <div class="flex items-center gap-2">
                  <span
                    :class="[
                      'font-bold px-2 py-0.5 rounded text-[10px]',
                      (item.match.win === 'A' && item.match.teamA.includes(selectedProfile.id)) ||
                      (item.match.win === 'B' && item.match.teamB.includes(selectedProfile.id))
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    ]"
                  >
                    {{
                      (item.match.win === 'A' && item.match.teamA.includes(selectedProfile.id)) ||
                      (item.match.win === 'B' && item.match.teamB.includes(selectedProfile.id))
                        ? 'VICTOIRE'
                        : 'DÉFAITE'
                    }}
                  </span>
                  <span class="text-slate-400">
                    {{ new Date(item.match.timestamp).toLocaleDateString('fr-FR') }}
                  </span>
                </div>
              </div>

              <div class="font-mono font-bold" :class="item.delta[selectedProfile.id] >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                {{ item.delta[selectedProfile.id] >= 0 ? '+' : '' }}{{ item.delta[selectedProfile.id]?.toFixed(1) }} pts
              </div>
            </div>
          </div>
          <div v-else class="text-slate-400 text-xs text-center py-3">
            Pas encore de partie enregistrée pour ce joueur.
          </div>
        </div>

        <!-- Reporting Form -->
        <div v-if="isReportOpen" class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
          <span class="font-bold text-xs text-rose-300 block">Signaler le joueur {{ selectedProfile.name }}</span>
          <select v-model="reportReason" class="w-full px-3 py-2 bg-cs-dark border border-cs-border rounded-xl text-white text-xs">
            <option>Faux résultats</option>
            <option>Triche</option>
            <option>Pseudo inapproprié</option>
            <option>Comportement toxique</option>
            <option>Autre</option>
          </select>
          <input
            v-model="reportComment"
            placeholder="Précisions utiles (optionnel)..."
            maxlength="200"
            class="w-full px-3 py-2 bg-cs-dark border border-cs-border rounded-xl text-white text-xs"
          />
          <button
            @click="sendReport"
            class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
          >
            Envoyer le signalement
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
