<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useSettingsStore } from '../../stores/settings'
import { Play, Pause, Volume2, VolumeX } from 'lucide-vue-next'

const settingsStore = useSettingsStore()

const audioUrl = settingsStore.settings.founder_audio_url
const audioTitle = settingsStore.settings.founder_audio_title || 'Un mensaje de nuestro fundador'

// Audio State
const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const isMuted = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.8)

const togglePlay = () => {
  if (!audioRef.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play().catch(err => {
      console.warn('Playback blocked by browser settings. User interaction required.', err)
    })
  }
}

const toggleMute = () => {
  if (!audioRef.value) return
  isMuted.value = !isMuted.value
  audioRef.value.muted = isMuted.value
}

const onTimeUpdate = () => {
  if (!audioRef.value) return
  currentTime.value = audioRef.value.currentTime
}

const onLoadedMetadata = () => {
  if (!audioRef.value) return
  duration.value = audioRef.value.duration
}

const onAudioEnded = () => {
  isPlaying.value = false
  currentTime.value = 0
}

const seek = (e: Event) => {
  if (!audioRef.value) return
  const target = e.target as HTMLInputElement
  const newTime = parseFloat(target.value)
  audioRef.value.currentTime = newTime
  currentTime.value = newTime
}

const onVolumeChange = (e: Event) => {
  if (!audioRef.value) return
  const target = e.target as HTMLInputElement
  const newVolume = parseFloat(target.value)
  volume.value = newVolume
  audioRef.value.volume = newVolume
  isMuted.value = newVolume === 0
  audioRef.value.muted = isMuted.value
}

const formatTime = (time: number) => {
  const mins = Math.floor(time / 60)
  const secs = Math.floor(time % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

onMounted(() => {
  if (audioRef.value) {
    audioRef.value.volume = volume.value
  }
})

onBeforeUnmount(() => {
  if (audioRef.value) {
    audioRef.value.pause()
  }
})
</script>

<template>
  <section class="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
    
    <!-- Audio Element -->
    <audio 
      ref="audioRef" 
      :src="audioUrl" 
      @timeupdate="onTimeUpdate" 
      @loadedmetadata="onLoadedMetadata" 
      @ended="onAudioEnded"
      @play="isPlaying = true"
      @pause="isPlaying = false"
    ></audio>

    <div class="relative bg-primary text-white rounded-2xl p-8 sm:p-12 overflow-hidden shadow-medium border border-white/5">
      <!-- Background pattern decor -->
      <div class="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-secondary/10 blur-3xl pointer-events-none"></div>
      <div class="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-accent/20 blur-3xl pointer-events-none"></div>
      
      <div class="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        
        <!-- Left Column: Waveform visualizer & play button -->
        <div class="flex-shrink-0 relative flex items-center justify-center">
          <button 
            @click="togglePlay"
            class="w-20 h-20 rounded-full bg-secondary hover:bg-opacity-90 hover:scale-105 active:scale-95 transition-all text-white flex items-center justify-center shadow-lg cursor-pointer z-10"
            aria-label="Reproducir mensaje"
          >
            <Play v-if="!isPlaying" class="w-8 h-8 fill-current translate-x-0.5" />
            <Pause v-else class="w-8 h-8 fill-current" />
          </button>
          
          <!-- Waveform ring visual decorative -->
          <div 
            class="absolute w-24 h-24 rounded-full border border-secondary/30 transition-all duration-1000"
            :class="{ 'animate-ping duration-1500': isPlaying }"
          ></div>
        </div>
        
        <!-- Right Column: Info & controls -->
        <div class="flex-grow space-y-4 w-full text-left">
          <div>
            <span class="text-[10px] font-extrabold uppercase tracking-widest text-secondary block mb-1">
              Mensaje Especial
            </span>
            <h3 class="text-xl sm:text-2xl font-display font-bold leading-tight">
              {{ audioTitle }}
            </h3>
            <p class="text-xs text-slate-400 mt-1 font-semibold">
              Escucha la historia y visión detrás del comerciambre de ropa de mayor crecimiento.
            </p>
          </div>
          
          <!-- Animated equalizer simulation -->
          <div class="flex items-center gap-1 h-8 py-2">
            <span 
              v-for="i in 32" 
              :key="i"
              class="w-1 bg-secondary rounded-full transition-all duration-300"
              :class="isPlaying ? 'animate-equalizer' : 'h-1 bg-white/20'"
              :style="{ 
                animationDelay: `${i * 40}ms`,
                height: isPlaying ? 'auto' : '4px'
              }"
            ></span>
          </div>

          <!-- Progress Bar & duration -->
          <div class="space-y-1">
            <div class="flex items-center gap-3">
              <span class="text-[10px] font-mono text-slate-400 w-8">{{ formatTime(currentTime) }}</span>
              
              <input 
                type="range" 
                min="0" 
                :max="duration || 100" 
                step="0.1" 
                :value="currentTime" 
                @input="seek"
                class="flex-grow h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-secondary focus:outline-none"
              />
              
              <span class="text-[10px] font-mono text-slate-400 w-8 text-right">{{ formatTime(duration) }}</span>
            </div>
          </div>
          
          <!-- Volume control and mute -->
          <div class="flex items-center justify-between pt-2">
            <div class="flex items-center gap-2">
              <button 
                @click="toggleMute" 
                class="text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Silenciar"
              >
                <VolumeX v-if="isMuted" class="w-4 h-4" />
                <Volume2 v-else class="w-4 h-4" />
              </button>
              
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                :value="volume" 
                @input="onVolumeChange"
                class="w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-secondary focus:outline-none"
              />
            </div>
            
            <span class="text-[9px] uppercase tracking-wider font-extrabold text-slate-500">
              El Comerciambre Originals
            </span>
          </div>

        </div>
        
      </div>
    </div>
  </section>
</template>

<style>
@keyframes equalizer {
  0%, 100% { height: 4px; }
  50% { height: 24px; }
}

.animate-equalizer {
  animation: equalizer 1.2s ease-in-out infinite;
}
</style>
