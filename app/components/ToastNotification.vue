<script setup lang="ts">
import { useEventsState } from '../composables/useEventsState'
import { CheckCircle2, AlertCircle, Info } from 'lucide-vue-next'

const { toastList } = useEventsState()
</script>

<template>
  <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-full max-w-md px-4">
    <transition-group
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-4 opacity-0 scale-95"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-for="t in toastList"
        :key="t.id"
        class="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900/95 border border-slate-700/80 text-white text-xs sm:text-sm font-semibold shadow-2xl backdrop-blur-md"
      >
        <CheckCircle2 v-if="t.type === 'success'" class="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <AlertCircle v-else-if="t.type === 'warn' || t.type === 'error'" class="w-4 h-4 text-rose-400 flex-shrink-0" />
        <Info v-else class="w-4 h-4 text-cs-pink flex-shrink-0" />
        <span>{{ t.message }}</span>
      </div>
    </transition-group>
  </div>
</template>
