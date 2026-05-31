<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button'
})

const classes = computed(() => {
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none cursor-pointer select-none rounded-md'
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-opacity-90 active:scale-98 shadow-sm',
    secondary: 'bg-secondary text-white hover:bg-opacity-90 active:scale-98 shadow-sm',
    accent: 'bg-accent text-white hover:bg-opacity-90 active:scale-98 shadow-sm',
    outline: 'border border-primary/20 text-primary hover:bg-primary/5 active:scale-98',
    ghost: 'text-primary hover:bg-primary/5 active:scale-98',
    danger: 'bg-danger text-white hover:bg-opacity-90 active:scale-98 shadow-sm',
    success: 'bg-success text-white hover:bg-opacity-90 active:scale-98 shadow-sm'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-semibold tracking-wide uppercase',
    md: 'px-6 py-2.5 text-sm tracking-wide',
    lg: 'px-8 py-3.5 text-base tracking-wide font-semibold'
  }
  
  const states = props.disabled || props.loading
    ? 'opacity-60 cursor-not-allowed pointer-events-none active:scale-100 shadow-none'
    : ''
    
  return `${base} ${variants[props.variant]} ${sizes[props.size]} ${states}`
})
</script>

<template>
  <button :type="type" :class="classes" :disabled="disabled || loading">
    <!-- Spinner for loading state -->
    <svg 
      v-if="loading" 
      class="animate-spin -ml-1 mr-2.5 h-4.5 w-4.5 text-current" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <slot />
  </button>
</template>
