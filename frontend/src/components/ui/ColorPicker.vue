<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string
  colorName: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:colorName', value: string): void
}>()

interface PresetColor {
  hex: string
  name: string
}

const presetColors: PresetColor[] = [
  { hex: '#000000', name: 'Negro' },
  { hex: '#FFFFFF', name: 'Blanco' },
  { hex: '#6B7280', name: 'Gris Oscuro' },
  { hex: '#D1D5DB', name: 'Gris Claro' },
  { hex: '#EF4444', name: 'Rojo' },
  { hex: '#F97316', name: 'Coral' },
  { hex: '#EC4899', name: 'Rosa' },
  { hex: '#D946EF', name: 'Fucsia' },
  { hex: '#3B82F6', name: 'Azul' },
  { hex: '#1E3A5F', name: 'Azul Marino' },
  { hex: '#06B6D4', name: 'Celeste' },
  { hex: '#14B8A6', name: 'Turquesa' },
  { hex: '#22C55E', name: 'Verde' },
  { hex: '#65A30D', name: 'Verde Olivo' },
  { hex: '#EAB308', name: 'Amarillo' },
  { hex: '#F59E0B', name: 'Dorado' },
  { hex: '#92400E', name: 'Café' },
  { hex: '#D2B48C', name: 'Beige' },
  { hex: '#8B5CF6', name: 'Morado' },
  { hex: '#A78BFA', name: 'Lavanda' }
]

const customColorInput = ref(props.modelValue || '#3B82F6')

// Watch for external changes
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    customColorInput.value = newVal
  }
})

const selectColor = (color: PresetColor) => {
  emit('update:modelValue', color.hex)
  emit('update:colorName', color.name)
}

const handleCustomColorChange = (event: Event) => {
  const hex = (event.target as HTMLInputElement).value
  emit('update:modelValue', hex)
  // Try to find if this custom hex matches any preset
  const matched = presetColors.find(c => c.hex.toLowerCase() === hex.toLowerCase())
  if (matched) {
    emit('update:colorName', matched.name)
  } else if (props.colorName === '' || presetColors.some(c => c.name === props.colorName)) {
    emit('update:colorName', 'Personalizado')
  }
}
</script>

<template>
  <div class="space-y-3">
    <label class="block text-sm font-medium text-slate-700">Color de la Variante</label>
    
    <!-- Presets Grid -->
    <div class="grid grid-cols-5 sm:grid-cols-10 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
      <button
        v-for="color in presetColors"
        :key="color.hex"
        type="button"
        @click="selectColor(color)"
        class="relative w-8 h-8 rounded-full border border-slate-300 focus:outline-none transition-all duration-200 hover:scale-110 flex items-center justify-center cursor-pointer"
        :style="{ backgroundColor: color.hex }"
        :title="color.name"
      >
        <!-- Selection Checkmark -->
        <span 
          v-if="modelValue.toLowerCase() === color.hex.toLowerCase()" 
          class="flex items-center justify-center text-[10px] font-bold"
          :class="color.hex === '#FFFFFF' || color.hex === '#D1D5DB' || color.hex === '#D2B48C' ? 'text-black' : 'text-white'"
        >
          ✓
        </span>
      </button>
    </div>

    <!-- Custom Color Selector -->
    <div class="flex items-center space-x-3">
      <div class="flex items-center space-x-2">
        <label class="relative w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center cursor-pointer hover:scale-105 transition-all overflow-hidden">
          <input
            type="color"
            :value="customColorInput"
            @input="handleCustomColorChange"
            class="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
          <span class="text-lg font-bold text-slate-500 hover:text-slate-700">+</span>
        </label>
        <span class="text-xs font-semibold text-slate-500">Color Personalizado</span>
      </div>
      
      <div class="flex-1 flex space-x-2 items-center">
        <div class="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700">
          {{ modelValue || '#000000' }}
        </div>
        <input
          type="text"
          :value="colorName"
          @input="$emit('update:colorName', ($event.target as HTMLInputElement).value)"
          placeholder="Nombre del color (ej. Azul Marino)"
          class="flex-1 min-w-[120px] px-3 py-1 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
        />
      </div>
    </div>
  </div>
</template>
