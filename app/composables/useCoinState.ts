import { ref, computed, watch } from 'vue'
import type { CoinPlayer, CoinMatch, CoinReport } from '../types'
import { getSeedCoinPlayers, getSeedCoinMatches } from './useSeedData'

const players = ref<CoinPlayer[]>([])
const matches = ref<CoinMatch[]>([])
const reports = ref<CoinReport[]>([])
const isCoinInitialized = ref(false)

export const useCoinState = () => {
  const init = () => {
    if (isCoinInitialized.value) return
    if (import.meta.client) {
      try {
        const sp = localStorage.getItem('coincs_players_v1')
        const sm = localStorage.getItem('coincs_matches_v1')
        const sr = localStorage.getItem('coincs_reports_v1')

        if (sp) players.value = JSON.parse(sp)
        else players.value = getSeedCoinPlayers()

        if (sm) matches.value = JSON.parse(sm)
        else matches.value = getSeedCoinMatches()

        if (sr) reports.value = JSON.parse(sr)
        else reports.value = []
      } catch (e) {
        players.value = getSeedCoinPlayers()
        matches.value = getSeedCoinMatches()
      }
    } else {
      players.value = getSeedCoinPlayers()
      matches.value = getSeedCoinMatches()
    }
    isCoinInitialized.value = true
  }

  if (import.meta.client) {
    watch(
      players,
      val => {
        localStorage.setItem('coincs_players_v1', JSON.stringify(val))
      },
      { deep: true }
    )
    watch(
      matches,
      val => {
        localStorage.setItem('coincs_matches_v1', JSON.stringify(val))
      },
      { deep: true }
    )
    watch(
      reports,
      val => {
        localStorage.setItem('coincs_reports_v1', JSON.stringify(val))
      },
      { deep: true }
    )
  }

  // Exact Elo computation from chronological matches
  const computedState = computed(() => {
    const stats: Record<string, { elo: number; games: number; wins: number; losses: number; streak: number }> = {}

    players.value.forEach(p => {
      stats[p.id] = { elo: 1000, games: 0, wins: 0, losses: 0, streak: 0 }
    })

    const processedMatches: { match: CoinMatch; delta: Record<string, number>; probA: number }[] = []

    const sortedMatches = [...matches.value].sort((a, b) => a.timestamp - b.timestamp)

    for (const m of sortedMatches) {
      const allIds = [...m.teamA, ...m.teamB]
      if (allIds.some(id => !stats[id])) continue

      const avg = (teamIds: string[]) => teamIds.reduce((sum, id) => sum + stats[id].elo, 0) / teamIds.length
      const avgA = avg(m.teamA)
      const avgB = avg(m.teamB)

      const expA = 1 / (1 + Math.pow(10, (avgB - avgA) / 400))
      const expB = 1 - expA

      const deltaMap: Record<string, number> = {}

      const apply = (teamIds: string[], expected: number, won: boolean) => {
        teamIds.forEach(id => {
          const s = stats[id]
          const k = s.games < 10 ? 40 : 24
          const delta = k * ((won ? 1 : 0) - expected)
          deltaMap[id] = delta
          s.elo += delta
          s.games += 1
          if (won) {
            s.wins += 1
            s.streak = s.streak > 0 ? s.streak + 1 : 1
          } else {
            s.losses += 1
            s.streak = s.streak < 0 ? s.streak - 1 : -1
          }
        })
      }

      apply(m.teamA, expA, m.win === 'A')
      apply(m.teamB, expB, m.win === 'B')

      processedMatches.push({ match: m, delta: deltaMap, probA: expA })
    }

    const rankedPlayers = players.value
      .map(p => ({
        ...p,
        ...(stats[p.id] || { elo: 1000, games: 0, wins: 0, losses: 0, streak: 0 })
      }))
      .sort((a, b) => b.elo - a.elo || b.games - a.games)
      .map((p, idx) => ({ ...p, rank: idx + 1 }))

    return {
      stats,
      rankedPlayers,
      processedMatches
    }
  })

  // Add a new player
  const addPlayer = (name: string): boolean => {
    const trimmed = name.trim()
    if (!trimmed) return false
    if (players.value.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
      return false
    }

    const newP: CoinPlayer = {
      id: 'p-' + Date.now().toString(36),
      name: trimmed,
      elo: 1000,
      games: 0,
      wins: 0,
      losses: 0,
      streak: 0,
      createdAt: Date.now()
    }
    players.value.push(newP)
    return true
  }

  // Record a match
  const recordMatch = (teamA: string[], teamB: string[], win: 'A' | 'B'): boolean => {
    const all = [...teamA, ...teamB]
    if (all.some(id => !id)) return false
    if (new Set(all).size !== all.length) return false

    const newM: CoinMatch = {
      id: 'm-' + Date.now().toString(36),
      teamA,
      teamB,
      win,
      timestamp: Date.now(),
      eloDelta: {},
      expectedProbA: 0.5
    }
    matches.value.push(newM)
    return true
  }

  // Delete a match
  const deleteMatch = (matchId: string) => {
    matches.value = matches.value.filter(m => m.id !== matchId)
  }

  // Send a report
  const reportPlayer = (targetId: string, reason: string, comment = '') => {
    reports.value.push({
      targetId,
      reason,
      comment,
      timestamp: Date.now()
    })
  }

  const getPlayerName = (id: string): string => {
    const p = players.value.find(p => p.id === id)
    return p ? p.name : 'Joueur inconnu'
  }

  return {
    players,
    matches,
    reports,
    computedState,
    init,
    addPlayer,
    recordMatch,
    deleteMatch,
    reportPlayer,
    getPlayerName
  }
}
