export type EventTheme = 'soirees' | 'culture' | 'art' | 'sports'

export interface EventItem {
  id: string
  title: string
  asso: string
  theme: EventTheme
  date: string // YYYY-MM-DD
  start: string // HH:mm
  end?: string // HH:mm
  place: string
  description: string
  createdBy?: string
  createdAt?: number
  status?: 'published' | 'pending' | 'rejected'
  isFeatured?: boolean
  price?: string
  link?: string
  imageUrl?: string
}

export interface CoinPlayer {
  id: string
  name: string
  elo: number
  games: number
  wins: number
  losses: number
  streak: number
  createdAt: number
}

export interface CoinMatch {
  id: string
  teamA: string[]
  teamB: string[]
  win: 'A' | 'B'
  timestamp: number
  eloDelta: Record<string, number>
  expectedProbA: number
}

export interface CoinReport {
  targetId: string
  reason: string
  comment: string
  timestamp: number
}

export type UserRole = 'student' | 'asso' | 'moderator'

export const ASSOS: string[] = [
  'BDE',
  'Clubs BDE',
  'BDA',
  'ADR',
  'BDS',
  'Commus',
  'Forum CS',
  'JCS',
  'Cheer up',
  'WACS',
  'Huma',
  'Club voile',
  'RAID CS',
  'Hyris',
  'PICS',
  'Musics',
  'SBCS',
  'FIR',
  'IMPACT',
  'ça pèse',
  'Symposium',
  'Baj',
  'WEI CS',
  'Pascal',
  'Magnum',
  'CC'
]

export const THEMES: { id: EventTheme; label: string; color: string; bg: string; border: string }[] = [
  { id: 'soirees', label: 'Soirées & Fêtes', color: '#F43F5E', bg: 'bg-rose-500/10', border: 'border-rose-500' },
  { id: 'culture', label: 'Culture & Débats', color: '#F59E0B', bg: 'bg-amber-500/10', border: 'border-amber-500' },
  { id: 'art', label: 'Art & Musique', color: '#8B5CF6', bg: 'bg-violet-500/10', border: 'border-violet-500' },
  { id: 'sports', label: 'Sports & Tournois', color: '#10B981', bg: 'bg-emerald-500/10', border: 'border-emerald-500' }
]
