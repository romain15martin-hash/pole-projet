<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { useEventsState } from '../composables/useEventsState'
import { ASSOS, THEMES, type EventTheme, type EventItem } from '../types'
import { isoDate, parseISO, formatFr, formatTimeRange } from '../utils/date'
import {
  ShieldAlert,
  Send,
  CheckCircle,
  XCircle,
  Sparkles,
  Edit,
  Trash2,
  AlertCircle,
  PlusCircle,
  Clock,
  Layers,
  Image as ImageIcon,
  UploadCloud,
  X as XIcon,
  Sparkle
} from 'lucide-vue-next'

const {
  currentRole,
  events,
  submissions,
  featuredId,
  editingEvent,
  proposeEvent,
  approveSubmission,
  rejectSubmission,
  toggleFeatured,
  deleteEvent,
  updateEvent,
  showToast
} = useEventsState()

const activeTab = ref<'propose' | 'moderation'>('propose')

// If an event is selected for editing, switch tab immediately
watch(editingEvent, val => {
  if (val) activeTab.value = 'propose'
})

const formData = reactive({
  title: '',
  asso: '',
  theme: 'soirees' as EventTheme,
  date: isoDate(new Date()),
  start: '20:00',
  end: '',
  place: '',
  price: '',
  description: '',
  imageUrl: '',
  directPublish: currentRole.value === 'moderator'
})

const isUploadingImage = ref(false)

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    showToast('L’image est trop volumineuse (max 5 Mo).', 'warn')
    return
  }

  isUploadingImage.value = true
  const reader = new FileReader()
  reader.onload = () => {
    formData.imageUrl = reader.result as string
    isUploadingImage.value = false
    showToast('Affiche importée avec succès ! 📸', 'success')
  }
  reader.onerror = () => {
    isUploadingImage.value = false
    showToast('Erreur lors de la lecture du fichier.', 'error')
  }
  reader.readAsDataURL(file)
}

const applyPresetImage = (url: string) => {
  formData.imageUrl = url
  showToast('Visuel appliqué !', 'info')
}

// Populate form when editing
watch(
  editingEvent,
  val => {
    if (val) {
      formData.title = val.title
      formData.asso = val.asso
      formData.theme = val.theme
      formData.date = val.date
      formData.start = val.start || '20:00'
      formData.end = val.end || ''
      formData.place = val.place || ''
      formData.price = val.price || ''
      formData.description = val.description || ''
      formData.imageUrl = val.imageUrl || ''
      formData.directPublish = false
    }
  },
  { immediate: true }
)

const resetForm = () => {
  editingEvent.value = null
  formData.title = ''
  formData.asso = ''
  formData.theme = 'soirees'
  formData.date = isoDate(new Date())
  formData.start = '20:00'
  formData.end = ''
  formData.place = ''
  formData.price = ''
  formData.description = ''
  formData.imageUrl = ''
  formData.directPublish = currentRole.value === 'moderator'
}

const handleSubmit = () => {
  if (!formData.title.trim() || !formData.asso || !formData.date || !formData.start) {
    showToast('Veuillez remplir le titre, l’association, la date et l’heure.', 'warn')
    return
  }

  if (formData.end && formData.end <= formData.start) {
    showToast('L’heure de fin doit être postérieure à l’heure de début.', 'warn')
    return
  }

  if (editingEvent.value) {
    updateEvent(editingEvent.value.id, {
      title: formData.title.trim(),
      asso: formData.asso,
      theme: formData.theme,
      date: formData.date,
      start: formData.start,
      end: formData.end,
      place: formData.place.trim(),
      price: formData.price.trim(),
      description: formData.description.trim(),
      imageUrl: formData.imageUrl.trim()
    })
    resetForm()
    activeTab.value = 'moderation'
    return
  }

  proposeEvent(
    {
      title: formData.title.trim(),
      asso: formData.asso,
      theme: formData.theme,
      date: formData.date,
      start: formData.start,
      end: formData.end,
      place: formData.place.trim(),
      price: formData.price.trim(),
      description: formData.description.trim(),
      imageUrl: formData.imageUrl.trim()
    },
    formData.directPublish && currentRole.value === 'moderator'
  )

  resetForm()
  activeTab.value = 'moderation'
}

const handleCancelEdit = () => {
  resetForm()
}

const getThemeColor = (themeId: string) => {
  const found = THEMES.find(t => t.id === themeId)
  return found ? found.color : '#D6226B'
}
</script>

<template>
  <div class="space-y-8 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="text-center space-y-2">
      <h2 class="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
        Espace Associatif & Modération
      </h2>
      <p class="text-slate-400 text-sm max-w-lg mx-auto">
        Déposez les prochains temps forts de votre association ou gérez les validations pour l'agenda commun du campus.
      </p>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex items-center justify-center gap-2 p-1 bg-cs-surface border border-cs-border rounded-full max-w-md mx-auto">
      <button
        @click="activeTab = 'propose'"
        :class="[
          'flex-1 py-2 px-4 rounded-full text-xs sm:text-sm font-bold transition-all text-center',
          activeTab === 'propose' ? 'bg-cs-pink text-white shadow-md' : 'text-slate-400 hover:text-white'
        ]"
      >
        {{ editingEvent ? 'Modifier l’évènement' : 'Proposer un évènement' }}
      </button>

      <button
        @click="activeTab = 'moderation'"
        :class="[
          'flex-1 py-2 px-4 rounded-full text-xs sm:text-sm font-bold transition-all text-center flex items-center justify-center gap-2',
          activeTab === 'moderation' ? 'bg-cs-pink text-white shadow-md' : 'text-slate-400 hover:text-white'
        ]"
      >
        <span>Modération</span>
        <span
          v-if="submissions.length > 0"
          class="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950"
        >
          {{ submissions.length }}
        </span>
      </button>
    </div>

    <!-- Mode Notification Banner -->
    <div
      v-if="currentRole !== 'moderator'"
      class="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-3 text-xs sm:text-sm text-slate-300"
    >
      <AlertCircle class="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
      <div>
        <span class="font-bold text-white block">Mode {{ currentRole === 'asso' ? 'Responsable Asso' : 'Étudiant' }}</span>
        <span>
          Vos propositions seront examinées et validées par un modérateur du BDE avant d'apparaître sur le planning.
          (Vous pouvez basculer en mode <b>Modo</b> en haut à droite pour tester l'approbation immédiate).
        </span>
      </div>
    </div>

    <!-- TAB 1: FORMULAIRE -->
    <div v-if="activeTab === 'propose'" class="p-6 sm:p-8 rounded-3xl bg-cs-surface border border-cs-border shadow-2xl">
      <h3 class="font-display font-bold text-xl text-white mb-6 flex items-center gap-2">
        <PlusCircle class="w-5 h-5 text-cs-pink" />
        <span>{{ editingEvent ? 'Modifier la proposition' : 'Nouvel évènement associatif' }}</span>
      </h3>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div class="space-y-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-slate-300 block">Titre de l'évènement *</label>
          <input
            v-model="formData.title"
            required
            maxlength="90"
            placeholder="Ex: Soirée Neon, Scène ouverte, Nuit du Volley..."
            class="w-full px-4 py-3 bg-cs-dark border border-cs-border focus:border-cs-pink focus:ring-2 focus:ring-cs-pink/30 rounded-xl text-white placeholder-slate-500 text-sm outline-none transition-all"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-300 block">Association organisatrice *</label>
            <select
              v-model="formData.asso"
              required
              class="w-full px-4 py-3 bg-cs-dark border border-cs-border focus:border-cs-pink focus:ring-2 focus:ring-cs-pink/30 rounded-xl text-white text-sm outline-none transition-all"
            >
              <option value="" disabled>Sélectionner une association...</option>
              <option v-for="asso in ASSOS" :key="asso" :value="asso">{{ asso }}</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-300 block">Thématique principale *</label>
            <select
              v-model="formData.theme"
              required
              class="w-full px-4 py-3 bg-cs-dark border border-cs-border focus:border-cs-pink focus:ring-2 focus:ring-cs-pink/30 rounded-xl text-white text-sm outline-none transition-all"
            >
              <option v-for="theme in THEMES" :key="theme.id" :value="theme.id">{{ theme.label }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-300 block">Date *</label>
            <input
              type="date"
              v-model="formData.date"
              required
              class="w-full px-4 py-3 bg-cs-dark border border-cs-border focus:border-cs-pink focus:ring-2 focus:ring-cs-pink/30 rounded-xl text-white text-sm outline-none transition-all"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-300 block">Heure de début *</label>
            <input
              type="time"
              v-model="formData.start"
              required
              class="w-full px-4 py-3 bg-cs-dark border border-cs-border focus:border-cs-pink focus:ring-2 focus:ring-cs-pink/30 rounded-xl text-white text-sm outline-none transition-all"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-300 block">Heure de fin (optionnelle)</label>
            <input
              type="time"
              v-model="formData.end"
              class="w-full px-4 py-3 bg-cs-dark border border-cs-border focus:border-cs-pink focus:ring-2 focus:ring-cs-pink/30 rounded-xl text-white text-sm outline-none transition-all"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-300 block">Lieu</label>
            <input
              v-model="formData.place"
              placeholder="Ex: Foyer Bouygues, Amphi Janet, Gymnase Eiffel..."
              maxlength="80"
              class="w-full px-4 py-3 bg-cs-dark border border-cs-border focus:border-cs-pink focus:ring-2 focus:ring-cs-pink/30 rounded-xl text-white placeholder-slate-500 text-sm outline-none transition-all"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-300 block">Tarif / Inscription</label>
            <input
              v-model="formData.price"
              placeholder="Ex: Gratuit, 5€ sur Lydia, Entrée libre..."
              maxlength="60"
              class="w-full px-4 py-3 bg-cs-dark border border-cs-border focus:border-cs-pink focus:ring-2 focus:ring-cs-pink/30 rounded-xl text-white placeholder-slate-500 text-sm outline-none transition-all"
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-slate-300 block">Description détaillée</label>
          <textarea
            v-model="formData.description"
            rows="4"
            maxlength="800"
            placeholder="Détails du programme, intervenants, modalités d'accès, vestiaire, liens utiles..."
            class="w-full px-4 py-3 bg-cs-dark border border-cs-border focus:border-cs-pink focus:ring-2 focus:ring-cs-pink/30 rounded-xl text-white placeholder-slate-500 text-sm outline-none transition-all"
          ></textarea>
        </div>

        <!-- Visuel / Affiche de l'évènement -->
        <div class="space-y-3 p-4 rounded-2xl bg-cs-dark/50 border border-cs-border">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <ImageIcon class="w-4 h-4 text-cs-pink" />
              <span>Affiche ou Visuel de l'évènement</span>
            </label>
            <span class="text-[11px] text-slate-400">Optionnel (PNG, JPG, WebP)</span>
          </div>

          <!-- Preview if image exists -->
          <div v-if="formData.imageUrl" class="relative rounded-2xl overflow-hidden border border-cs-border group max-h-48 bg-slate-950">
            <img :src="formData.imageUrl" alt="Aperçu de l'affiche" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-3">
              <span class="text-xs font-semibold text-white drop-shadow">Visuel sélectionné</span>
              <button
                type="button"
                @click="formData.imageUrl = ''"
                class="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1"
              >
                <XIcon class="w-3.5 h-3.5" />
                <span>Supprimer</span>
              </button>
            </div>
          </div>

          <!-- Upload / URL Input Controls -->
          <div v-else class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- File Upload Input -->
              <label class="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-cs-border hover:border-cs-pink/50 bg-cs-surface cursor-pointer transition-colors group">
                <UploadCloud class="w-6 h-6 text-slate-400 group-hover:text-cs-pink mb-1 transition-colors" />
                <span class="text-xs font-bold text-slate-200 group-hover:text-white">Importer depuis l'appareil</span>
                <span class="text-[10px] text-slate-400">Glisser-déposer ou parcourir</span>
                <input
                  type="file"
                  accept="image/*"
                  @change="handleFileUpload"
                  class="hidden"
                />
              </label>

              <!-- Image URL Input -->
              <div class="flex flex-col justify-center p-3 rounded-xl bg-cs-surface border border-cs-border space-y-2">
                <span class="text-xs font-bold text-slate-300">Ou lien direct (URL)</span>
                <input
                  v-model="formData.imageUrl"
                  placeholder="https://images.unsplash.com/..."
                  class="w-full px-3 py-1.5 bg-cs-dark border border-cs-border rounded-lg text-white placeholder-slate-500 text-xs outline-none focus:border-cs-pink"
                />
              </div>
            </div>

            <!-- Instant Presets -->
            <div class="pt-1">
              <span class="text-[11px] font-semibold text-slate-400 block mb-1.5">Suggestions d'affiches thématiques :</span>
              <div class="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  @click="applyPresetImage('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80')"
                  class="px-2.5 py-1 rounded-lg bg-cs-surface hover:bg-cs-surface-light border border-cs-border text-[11px] text-slate-300 hover:text-white transition-colors"
                >
                  🎉 Soirée Festif
                </button>
                <button
                  type="button"
                  @click="applyPresetImage('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80')"
                  class="px-2.5 py-1 rounded-lg bg-cs-surface hover:bg-cs-surface-light border border-cs-border text-[11px] text-slate-300 hover:text-white transition-colors"
                >
                  🎸 Concert & Scène
                </button>
                <button
                  type="button"
                  @click="applyPresetImage('https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80')"
                  class="px-2.5 py-1 rounded-lg bg-cs-surface hover:bg-cs-surface-light border border-cs-border text-[11px] text-slate-300 hover:text-white transition-colors"
                >
                  🏆 Tournoi Sportif
                </button>
                <button
                  type="button"
                  @click="applyPresetImage('https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80')"
                  class="px-2.5 py-1 rounded-lg bg-cs-surface hover:bg-cs-surface-light border border-cs-border text-[11px] text-slate-300 hover:text-white transition-colors"
                >
                  🎙️ Conférence & Débat
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Direct publish checkbox for moderators -->
        <div v-if="currentRole === 'moderator' && !editingEvent" class="pt-2">
          <label class="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-semibold text-slate-200">
            <input
              type="checkbox"
              v-model="formData.directPublish"
              class="rounded bg-cs-dark border-cs-border text-cs-pink focus:ring-cs-pink"
            />
            <span>Publier directement sur l'agenda sans passer par la modération</span>
          </label>
        </div>

        <!-- Submit & Cancel buttons -->
        <div class="flex items-center gap-3 pt-4 border-t border-cs-border/60">
          <button
            type="submit"
            class="px-6 py-3 rounded-full bg-cs-pink text-white font-bold text-sm shadow-xl shadow-cs-pink/30 hover:bg-cs-pink-hover active:scale-95 transition-all flex items-center gap-2"
          >
            <Send class="w-4 h-4" />
            <span>{{ editingEvent ? 'Enregistrer les modifications' : (formData.directPublish && currentRole === 'moderator' ? 'Publier immédiatement' : 'Envoyer pour validation') }}</span>
          </button>

          <button
            v-if="editingEvent"
            type="button"
            @click="handleCancelEdit"
            class="px-5 py-3 rounded-full bg-cs-surface-light border border-cs-border text-slate-300 hover:text-white text-sm font-semibold transition-all"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>

    <!-- TAB 2: MODERATION & SUIVI -->
    <div v-else class="space-y-8">
      <!-- Pending Submissions -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-display font-bold text-xl text-white flex items-center gap-2">
            <Clock class="w-5 h-5 text-amber-400" />
            <span>Propositions en attente ({{ submissions.length }})</span>
          </h3>
        </div>

        <div v-if="submissions.length > 0" class="space-y-3">
          <div
            v-for="sub in submissions"
            :key="sub.id"
            class="p-4 sm:p-5 rounded-2xl bg-cs-surface border border-cs-border shadow-lg space-y-3"
            :style="{ borderLeftWidth: '5px', borderLeftColor: getThemeColor(sub.theme) }"
          >
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-start gap-3">
                <img
                  v-if="sub.imageUrl"
                  :src="sub.imageUrl"
                  alt="Affiche"
                  class="w-16 h-16 rounded-xl object-cover border border-cs-border flex-shrink-0"
                />
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="px-2.5 py-0.5 rounded-md text-xs font-bold bg-white/10 text-white">
                      {{ sub.asso }}
                    </span>
                    <span class="text-xs text-amber-400 font-semibold flex items-center gap-1">
                      <Clock class="w-3.5 h-3.5" />
                      En attente de validation
                    </span>
                  </div>
                  <h4 class="font-display font-bold text-lg text-white">{{ sub.title }}</h4>
                  <div class="text-xs text-slate-400">
                    {{ formatFr(parseISO(sub.date), { weekday: 'short', day: 'numeric', month: 'short' }) }} · {{ formatTimeRange(sub.start, sub.end) }} {{ sub.place ? `· ${sub.place}` : '' }}
                  </div>
                </div>
              </div>

              <!-- Moderation action buttons -->
              <div class="flex items-center gap-2 pt-2 sm:pt-0">
                <button
                  v-if="currentRole === 'moderator'"
                  @click="approveSubmission(sub.id)"
                  class="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <CheckCircle class="w-4 h-4" />
                  <span>Valider & Publier</span>
                </button>

                <button
                  @click="editingEvent = { ...sub }"
                  class="px-3 py-1.5 rounded-xl bg-cs-surface-light border border-cs-border hover:border-blue-400 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-1"
                >
                  <Edit class="w-3.5 h-3.5" />
                  <span>Modifier</span>
                </button>

                <button
                  @click="rejectSubmission(sub.id)"
                  class="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition-all flex items-center gap-1"
                >
                  <XCircle class="w-3.5 h-3.5" />
                  <span>Refuser</span>
                </button>
              </div>
            </div>

            <p v-if="sub.description" class="text-xs text-slate-300 bg-cs-dark/50 p-3 rounded-xl border border-cs-border/60">
              {{ sub.description }}
            </p>
          </div>
        </div>

        <div v-else class="text-center py-8 rounded-2xl bg-cs-surface/40 border border-cs-border border-dashed text-slate-400 text-sm">
          Aucune proposition en attente pour le moment.
        </div>
      </div>

      <!-- Published Events (Management) -->
      <div v-if="currentRole === 'moderator'" class="space-y-4 pt-4 border-t border-cs-border/60">
        <h3 class="font-display font-bold text-xl text-white flex items-center gap-2">
          <Layers class="w-5 h-5 text-cs-pink" />
          <span>Évènements publiés ({{ events.length }})</span>
        </h3>

        <div class="space-y-2 max-h-96 overflow-y-auto pr-1">
          <div
            v-for="e in events"
            :key="e.id"
            class="p-3.5 rounded-xl bg-cs-surface border border-cs-border/80 flex items-center justify-between gap-3 text-xs"
          >
            <div class="flex items-center gap-3">
              <img
                v-if="e.imageUrl"
                :src="e.imageUrl"
                alt="Affiche"
                class="w-10 h-10 rounded-lg object-cover border border-cs-border flex-shrink-0"
              />
              <div class="space-y-0.5">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-white">{{ e.title }}</span>
                  <span class="text-[11px] text-slate-400">({{ e.asso }})</span>
                  <span v-if="featuredId === e.id" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                    À la une
                  </span>
                </div>
                <div class="text-[11px] text-slate-400">
                  {{ formatFr(parseISO(e.date), { day: 'numeric', month: 'short' }) }} · {{ formatTimeRange(e.start, e.end) }}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-1.5 flex-shrink-0">
              <button
                @click="toggleFeatured(e.id)"
                class="p-1.5 rounded-lg bg-cs-surface-light border border-cs-border hover:border-amber-400 text-slate-300 hover:text-amber-300 transition-colors"
                :title="featuredId === e.id ? 'Retirer de la une' : 'Mettre à la une'"
              >
                <Sparkles class="w-3.5 h-3.5" />
              </button>

              <button
                @click="editingEvent = { ...e }"
                class="p-1.5 rounded-lg bg-cs-surface-light border border-cs-border hover:border-blue-400 text-slate-300 hover:text-blue-300 transition-colors"
                title="Modifier"
              >
                <Edit class="w-3.5 h-3.5" />
              </button>

              <button
                @click="deleteEvent(e.id)"
                class="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors"
                title="Supprimer"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
