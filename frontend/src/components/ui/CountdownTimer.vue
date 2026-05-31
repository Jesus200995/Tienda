<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps<{
  endDate: string
}>()

const emit = defineEmits<{
  (e: 'expired'): void
}>()

const days = ref('00')
const hours = ref('00')
const minutes = ref('00')
const seconds = ref('00')
const totalSecondsLeft = ref(99999)
let timerInterval: number | null = null

const calculateTimeLeft = () => {
  const difference = new Date(props.endDate).getTime() - new Date().getTime()
  
  if (difference <= 0) {
    days.value = '00'
    hours.value = '00'
    minutes.value = '00'
    seconds.value = '00'
    totalSecondsLeft.value = 0
    emit('expired')
    if (timerInterval) {
      clearInterval(timerInterval)
    }
    return
  }

  const d = Math.floor(difference / (1000 * 60 * 60 * 24))
  const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
  const s = Math.floor((difference % (1000 * 60)) / 1000)

  days.value = String(d).padStart(2, '0')
  hours.value = String(h).padStart(2, '0')
  minutes.value = String(m).padStart(2, '0')
  seconds.value = String(s).padStart(2, '0')
  totalSecondsLeft.value = Math.floor(difference / 1000)
}

onMounted(() => {
  calculateTimeLeft()
  timerInterval = window.setInterval(calculateTimeLeft, 1000)
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})

// Urgency States
const isLess24Hours = computed(() => totalSecondsLeft.value > 0 && totalSecondsLeft.value < 24 * 60 * 60)
const isLess1Hour = computed(() => totalSecondsLeft.value > 0 && totalSecondsLeft.value < 60 * 60)
</script>

<template>
  <div 
    class="flex items-center space-x-2 justify-center select-none font-mono"
    :class="{ 
      'animate-pulse': isLess24Hours && !isLess1Hour,
      'animate-[bounce_1.5s_infinite]': isLess1Hour 
    }"
  >
    <!-- Days -->
    <div class="flex flex-col items-center">
      <div 
        class="w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 text-white rounded-xl shadow-lg flex items-center justify-center text-base sm:text-lg font-black border transition-colors duration-300"
        :class="isLess24Hours ? 'border-red-500 bg-red-950 text-red-200' : 'border-slate-800'"
      >
        {{ days }}
      </div>
      <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Días</span>
    </div>

    <span class="text-lg sm:text-xl font-bold text-slate-400 mb-4 animate-[ping_1.5s_infinite]">:</span>

    <!-- Hours -->
    <div class="flex flex-col items-center">
      <div 
        class="w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 text-white rounded-xl shadow-lg flex items-center justify-center text-base sm:text-lg font-black border transition-colors duration-300"
        :class="isLess24Hours ? 'border-red-500 bg-red-950 text-red-200' : 'border-slate-800'"
      >
        {{ hours }}
      </div>
      <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Hrs</span>
    </div>

    <span class="text-lg sm:text-xl font-bold text-slate-400 mb-4 animate-[ping_1.5s_infinite]">:</span>

    <!-- Minutes -->
    <div class="flex flex-col items-center">
      <div 
        class="w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 text-white rounded-xl shadow-lg flex items-center justify-center text-base sm:text-lg font-black border transition-colors duration-300"
        :class="isLess24Hours ? 'border-red-500 bg-red-950 text-red-200' : 'border-slate-800'"
      >
        {{ minutes }}
      </div>
      <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Min</span>
    </div>

    <span class="text-lg sm:text-xl font-bold text-slate-400 mb-4 animate-[ping_1.5s_infinite]">:</span>

    <!-- Seconds -->
    <div class="flex flex-col items-center">
      <div 
        class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-lg flex items-center justify-center text-base sm:text-lg font-black border transition-colors duration-300"
        :class="isLess24Hours 
          ? 'bg-red-600 border-red-400 text-white animate-pulse' 
          : 'bg-slate-900 border-slate-800 text-white'"
      >
        {{ seconds }}
      </div>
      <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Seg</span>
    </div>
  </div>
</template>
