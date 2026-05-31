<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const errorMsg = ref('')
const fileName = ref('')
const fileSize = ref('')

const triggerSelect = () => {
  fileInput.value?.click()
}

const handleFile = (file: File) => {
  errorMsg.value = ''
  if (!file.type.startsWith('audio/')) {
    errorMsg.value = 'El archivo seleccionado debe ser un audio (MP3, WAV, OGG, etc.)'
    return
  }
  
  if (file.size > 10 * 1024 * 1024) {
    errorMsg.value = 'El archivo de audio es demasiado grande. El límite es 10MB.'
    return
  }

  fileName.value = file.name
  fileSize.value = (file.size / (1024 * 1024)).toFixed(2) + ' MB'

  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result && typeof e.target.result === 'string') {
      emit('update:modelValue', e.target.result)
    }
  }
  reader.readAsDataURL(file)
}

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    handleFile(target.files[0])
  }
}

const clearAudio = () => {
  emit('update:modelValue', '')
  fileName.value = ''
  fileSize.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<template>
  <div class="space-y-3">
    <label class="block text-sm font-medium text-slate-700">Audio del Mensaje del Fundador</label>
    
    <!-- Hidden input -->
    <input
      type="file"
      ref="fileInput"
      accept="audio/*"
      @change="onFileChange"
      class="hidden"
    />

    <!-- Upload Box or Preview Player -->
    <div v-if="!modelValue"
      @click="triggerSelect"
      class="border-2 border-dashed border-slate-300 rounded-2xl p-6 bg-white text-slate-500 hover:border-indigo-400 hover:bg-slate-50 cursor-pointer flex flex-col items-center justify-center transition-all duration-200"
    >
      <!-- Audio Icon -->
      <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      </div>
      
      <span class="text-sm font-bold text-slate-700">Seleccionar audio</span>
      <span class="text-xs text-slate-400 mt-1">Haz click para buscar archivo MP3, WAV u OGG</span>
      <span class="text-[10px] text-slate-400 mt-1">Límite: 10MB</span>
    </div>

    <!-- Preview Container -->
    <div v-else class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </div>

        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-bold text-slate-800 truncate" v-if="fileName">{{ fileName }}</h4>
          <h4 class="text-sm font-bold text-slate-800 truncate" v-else>Audio cargado</h4>
          <p class="text-xs text-slate-400 mt-0.5" v-if="fileSize">{{ fileSize }}</p>
          <p class="text-xs text-slate-400 mt-0.5" v-else>Audio del Fundador guardado</p>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-2">
          <button
            type="button"
            @click="triggerSelect"
            class="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition"
          >
            Cambiar
          </button>
          <button
            type="button"
            @click="clearAudio"
            class="p-1.5 text-red-500 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition"
            title="Eliminar audio"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Live Player Preview -->
      <div class="pt-2 border-t border-slate-200">
        <audio
          :src="modelValue"
          controls
          class="w-full h-8 rounded-lg focus:outline-none bg-slate-100"
        ></audio>
      </div>
    </div>

    <!-- Error message -->
    <p v-if="errorMsg" class="text-xs text-red-500 font-semibold bg-red-50 p-2 rounded-lg border border-red-100 flex items-center space-x-1">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span>{{ errorMsg }}</span>
    </p>
  </div>
</template>
