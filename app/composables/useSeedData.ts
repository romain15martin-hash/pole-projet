import type { EventItem, CoinPlayer, CoinMatch } from '../types'
import { isoDate, getMonday, addDays } from '../utils/date'

export const getSeedEvents = (): EventItem[] => {
  const mon = getMonday(new Date())
  
  const dMon = isoDate(mon)
  const dTue = isoDate(addDays(mon, 1))
  const dWed = isoDate(addDays(mon, 2))
  const dThu = isoDate(addDays(mon, 3))
  const dFri = isoDate(addDays(mon, 4))
  const dSat = isoDate(addDays(mon, 5))
  const dSun = isoDate(addDays(mon, 6))
  const dNextMon = isoDate(addDays(mon, 7))
  const dNextThu = isoDate(addDays(mon, 10))

  return [
    {
      id: 'e-1',
      title: 'Soirée de Rentrée BDE : Neon Wave',
      asso: 'BDE',
      theme: 'soirees',
      date: dFri,
      start: '22:00',
      end: '04:00',
      place: 'Foyer des Élèves – Bâtiment Bouygues',
      description: 'La grande soirée de lancement du semestre ! Deux scènes DJ, scénographie immersive par Hyris, bar associatif et vestiaire surveillé. Entrée avec bracelet pré-réservé.',
      status: 'published',
      isFeatured: true,
      price: '8€ adhérents / 12€ extérieurs',
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
      createdAt: Date.now() - 86400000 * 4
    },
    {
      id: 'e-2',
      title: 'Scène Ouverte Acoustique & Stand-up',
      asso: 'BDA',
      theme: 'art',
      date: dTue,
      start: '20:30',
      end: '23:30',
      place: 'Musée Bouygues',
      description: 'Venez partager vos compositions, morceaux préférés ou sketches d’humour dans une ambiance feutrée et conviviale. Boissons chaudes et gâteaux préparés par SBCS offerts aux spectateurs !',
      status: 'published',
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
      createdAt: Date.now() - 86400000 * 3
    },
    {
      id: 'e-3',
      title: 'Nuit du Volley-Ball & Spikeball',
      asso: 'BDS',
      theme: 'sports',
      date: dWed,
      start: '19:30',
      end: '23:00',
      place: 'Gymnase du Bâtiment Eiffel',
      description: 'Tournoi mixte 4v4 ouvert à toutes les promos et personnels de CentraleSupélec. Inscription sur place ou en ligne avec votre équipe.',
      status: 'published',
      imageUrl: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80',
      createdAt: Date.now() - 86400000 * 2
    },
    {
      id: 'e-4',
      title: 'Conférence : L’IA et la transition énergétique',
      asso: 'Symposium',
      theme: 'culture',
      date: dThu,
      start: '18:15',
      end: '20:00',
      place: 'Amphithéâtre Janet (Bât. Bouygues)',
      description: 'Table ronde exceptionnelle animée par des chercheurs du laboratoire L2S et des ingénieurs d’EDF R&D sur l’optimisation des réseaux électriques intelligents grâce aux modèles de fondation.',
      status: 'published',
      createdAt: Date.now() - 86400000 * 5
    },
    {
      id: 'e-5',
      title: 'Barbecue des Résidences & Apéro Chill',
      asso: 'ADR',
      theme: 'soirees',
      date: dMon,
      start: '19:00',
      end: '22:30',
      place: 'Esplanade du Campus – Près de la Césal',
      description: 'Retrouvons-nous pour le grand barbecue hebdomadaire de l’ADR. Grillades, options végétariennes, musique et retrouvailles inter-résidences.',
      status: 'published',
      createdAt: Date.now() - 86400000 * 1
    },
    {
      id: 'e-6',
      title: 'Séance Ciné-Club : Rétrospective Sci-Fi',
      asso: 'Hyris',
      theme: 'culture',
      date: dMon,
      start: '20:30',
      end: '23:00',
      place: 'Amphithéâtre Michelin',
      description: 'Projection sur grand écran suivie d’un débat et d’un vote pour le film de la semaine prochaine. Pop-corn maison garanti !',
      status: 'published',
      createdAt: Date.now() - 86400000 * 2
    },
    {
      id: 'e-7',
      title: 'Jam Session Jazz & Funk',
      asso: 'Musics',
      theme: 'art',
      date: dThu,
      start: '21:00',
      end: '00:30',
      place: 'Salle Musique – Sous-sol Eiffel',
      description: 'Tous les instruments et niveaux sont les bienvenus. Batterie, amplis guitare/basse et piano à disposition sur place.',
      status: 'published',
      createdAt: Date.now() - 86400000 * 1
    },
    {
      id: 'e-8',
      title: 'Rando Trail & Sortie VTT en Vallée de Chevreuse',
      asso: 'RAID CS',
      theme: 'sports',
      date: dSat,
      start: '09:00',
      end: '13:00',
      place: 'Départ devant l’accueil Bouygues',
      description: 'Parcours de 18km en pleine nature pour préparer les épreuves d’endurance du printemps. Prévoyez vos gourdes et casques.',
      status: 'published',
      createdAt: Date.now() - 86400000 * 3
    },
    {
      id: 'e-9',
      title: 'Répétition Publique : Spectacle Commus 2026',
      asso: 'Commus',
      theme: 'art',
      date: dSun,
      start: '15:00',
      end: '18:00',
      place: 'Grand Théâtre Bouygues',
      description: 'Premier aperçu en coulisses des chorégraphies et des tableaux musicaux originaux de la comédie musicale annuelle de CentraleSupélec.',
      status: 'published',
      createdAt: Date.now() - 86400000 * 6
    },
    {
      id: 'e-10',
      title: 'Soirée Jeux de Société & Loup-Garou Géant',
      asso: 'Clubs BDE',
      theme: 'culture',
      date: dNextMon,
      start: '20:00',
      end: '23:30',
      place: 'Foyer des Élèves',
      description: 'Plus de 80 jeux modernes disponibles, des jeux d’ambiance aux jeux experts, avec animateurs pour expliquer les règles en 3 minutes.',
      status: 'published',
      createdAt: Date.now() - 86400000 * 1
    },
    {
      id: 'e-11',
      title: 'Conférence Partenariats & Stages d’Ingénieur',
      asso: 'Forum CS',
      theme: 'culture',
      date: dNextThu,
      start: '17:30',
      end: '19:30',
      place: 'Auditorium Magat',
      description: 'Rencontre informelle avec des alumni CS travaillant en deeptech, spatial et conseil stratégique. Conseils CV et simulations d’entretiens.',
      status: 'published',
      createdAt: Date.now() - 86400000 * 2
    }
  ]
}

export const getSeedSubmissions = (): EventItem[] => {
  const mon = getMonday(new Date())
  const dFri = isoDate(addDays(mon, 4))
  const dSat = isoDate(addDays(mon, 5))

  return [
    {
      id: 'sub-1',
      title: 'Vente de Crêpes & Pâtisseries Solidaires',
      asso: 'Cheer up',
      theme: 'culture',
      date: dFri,
      start: '11:30',
      end: '14:30',
      place: 'Hall Eiffel',
      description: 'Venez soutenir les projets de l’association Cheer up pour les jeunes atteints de cancer. Crêpes fraîches au Nutella, confiture et caramel beurre salé.',
      status: 'pending',
      createdAt: Date.now() - 3600000 * 5
    },
    {
      id: 'sub-2',
      title: 'Initiation Régate & Matelotage',
      asso: 'Club voile',
      theme: 'sports',
      date: dSat,
      start: '14:00',
      end: '17:00',
      place: 'Bassin de Gif / Local Voile',
      description: 'Découverte des manœuvres de base, nœuds marins et préparation aux entraînements en dériveur pour la Coupe de France.',
      status: 'pending',
      createdAt: Date.now() - 3600000 * 2
    }
  ]
}

export const getSeedCoinPlayers = (): CoinPlayer[] => [
  { id: 'p-1', name: 'Baudouin (BDE)', elo: 1245, games: 28, wins: 22, losses: 6, streak: 5, createdAt: 1 },
  { id: 'p-2', name: 'Arthur (BDS)', elo: 1180, games: 32, wins: 21, losses: 11, streak: 3, createdAt: 2 },
  { id: 'p-3', name: 'Clémence (ADR)', elo: 1140, games: 19, wins: 14, losses: 5, streak: 2, createdAt: 3 },
  { id: 'p-4', name: 'Maxime (Hyris)', elo: 1085, games: 15, wins: 9, losses: 6, streak: -1, createdAt: 4 },
  { id: 'p-5', name: 'Inès (PICS)', elo: 1050, games: 12, wins: 7, losses: 5, streak: 1, createdAt: 5 },
  { id: 'p-6', name: 'Antoine (Commus)', elo: 1010, games: 10, wins: 5, losses: 5, streak: -2, createdAt: 6 },
  { id: 'p-7', name: 'Léopold (Forum)', elo: 975, games: 14, wins: 6, losses: 8, streak: -1, createdAt: 7 },
  { id: 'p-8', name: 'Camille (SBCS)', elo: 920, games: 11, wins: 3, losses: 8, streak: -3, createdAt: 8 }
]

export const getSeedCoinMatches = (): CoinMatch[] => [
  {
    id: 'm-1',
    teamA: ['p-1', 'p-3'],
    teamB: ['p-2', 'p-4'],
    win: 'A',
    timestamp: Date.now() - 86400000 * 2,
    eloDelta: { 'p-1': 14.2, 'p-3': 14.2, 'p-2': -14.2, 'p-4': -14.2 },
    expectedProbA: 0.52
  },
  {
    id: 'm-2',
    teamA: ['p-1', 'p-5'],
    teamB: ['p-2', 'p-6'],
    win: 'A',
    timestamp: Date.now() - 86400000 * 1,
    eloDelta: { 'p-1': 11.5, 'p-5': 11.5, 'p-2': -11.5, 'p-6': -11.5 },
    expectedProbA: 0.54
  },
  {
    id: 'm-3',
    teamA: ['p-7', 'p-8'],
    teamB: ['p-3', 'p-4'],
    win: 'B',
    timestamp: Date.now() - 3600000 * 4,
    eloDelta: { 'p-7': -8.1, 'p-8': -8.1, 'p-3': 8.1, 'p-4': 8.1 },
    expectedProbA: 0.35
  }
]
