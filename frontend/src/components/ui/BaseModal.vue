<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'

interface Props {
  show: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  size: 'md'
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

// Close on escape key
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.show) {
    close()
  }
}

// Prevent body scroll when modal is open
watch(() => props.show, (open) => {
  if (open) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
  full: 'max-w-full mx-2 sm:mx-4'
}
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="show" 
        class="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-start sm:items-center justify-center overflow-y-auto"
        @click.self="close"
      >
        <!-- Modal Card -->
        <Transition
          enter-active-class="transition duration-300 ease-out-expo"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div 
            v-if="show"
            :class="[
              'w-full bg-white shadow-xl overflow-hidden flex flex-col relative my-2 sm:my-8',
              'rounded-xl sm:rounded-lg',
              'max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100vh-4rem)]',
              'mx-2 sm:mx-4',
              sizeClasses[size]
            ]"
          >
            <!-- Header -->
            <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <h3 v-if="title" class="text-base sm:text-lg font-display font-semibold text-primary pr-4 truncate">
                {{ title }}
              </h3>
              <button 
                @click="close" 
                class="text-slate-400 hover:text-primary transition-colors cursor-pointer p-1.5 rounded-full hover:bg-slate-50 flex-shrink-0"
                aria-label="Cerrar modal"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <!-- Content -->
            <div class="p-4 sm:p-6 overflow-y-auto flex-grow overscroll-contain">
              <slot />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
