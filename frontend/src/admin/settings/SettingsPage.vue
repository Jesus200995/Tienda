<script setup lang="ts">
import { ref } from 'vue'
import { useSettingsStore } from '../../stores/settings'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import { CheckCircle2, Sliders, Volume2 } from 'lucide-vue-next'

const settingsStore = useSettingsStore()

// State
const storeName = ref(settingsStore.settings.store_name)
const storeEmail = ref(settingsStore.settings.store_email)
const storePhone = ref(settingsStore.settings.store_phone)
const storeWhatsapp = ref(settingsStore.settings.store_whatsapp)
const facebookUrl = ref(settingsStore.settings.facebook_url || '')
const instagramUrl = ref(settingsStore.settings.instagram_url || '')
const tiktokUrl = ref(settingsStore.settings.tiktok_url || '')

// Audio
const founderAudioUrl = ref(settingsStore.settings.founder_audio_url || '')
const founderAudioTitle = ref(settingsStore.settings.founder_audio_title || '')

const showSuccess = ref(false)

const handleSaveSettings = () => {
  settingsStore.updateSettings({
    store_name: storeName.value,
    store_email: storeEmail.value,
    store_phone: storePhone.value,
    store_whatsapp: storeWhatsapp.value,
    facebook_url: facebookUrl.value,
    instagram_url: instagramUrl.value,
    tiktok_url: tiktokUrl.value,
    founder_audio_url: founderAudioUrl.value,
    founder_audio_title: founderAudioTitle.value
  })

  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 2000)
}
</script>

<template>
  <div class="space-y-8 text-left text-slate-100">
    
    <!-- Title -->
    <div>
      <h1 class="text-2xl sm:text-3xl font-display font-black text-white">
        Configuración Global
      </h1>
      <p class="text-xs text-slate-400 mt-1 font-semibold">
        Personaliza datos generales, redes sociales, banners del hero y el audio del fundador.
      </p>
    </div>

    <!-- Success alert -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform -translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
    >
      <div v-if="showSuccess" class="p-4 bg-success/10 text-success border border-success/20 rounded-xl text-xs font-bold flex items-center gap-2">
        <CheckCircle2 class="w-5 h-5 text-success" />
        <span>¡Cambios generales guardados y aplicados con éxito!</span>
      </div>
    </Transition>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 text-slate-800">
      
      <!-- Box 1: General & Networks info -->
      <div class="bg-[#121324] border border-slate-800 rounded-xl p-6 sm:p-8 shadow-soft space-y-6 text-slate-100">
        <h3 class="text-sm font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-3 flex items-center gap-2">
          <Sliders class="w-4.5 h-4.5 text-secondary" />
          Datos Generales & Contacto
        </h3>

        <form @submit.prevent="handleSaveSettings" class="space-y-4">
          <BaseInput 
            id="set-name"
            v-model="storeName"
            label="Nombre Comercial de la Tienda"
            required
            class="text-primary"
          />
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseInput 
              id="set-email"
              v-model="storeEmail"
              type="email"
              label="Email de Contacto"
              required
              class="text-primary"
            />
            <BaseInput 
              id="set-phone"
              v-model="storePhone"
              label="Teléfono Fijo"
              required
              class="text-primary"
            />
          </div>

          <BaseInput 
            id="set-whatsapp"
            v-model="storeWhatsapp"
            label="WhatsApp Celular (Para enlaces directos, incluye código de país)"
            placeholder="525512345678"
            required
            class="text-primary"
          />

          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 pt-4 border-t border-slate-800/60">Redes Sociales</h4>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseInput 
              id="set-fb"
              v-model="facebookUrl"
              label="Facebook URL"
              class="text-primary"
            />
            <BaseInput 
              id="set-ig"
              v-model="instagramUrl"
              label="Instagram URL"
              class="text-primary"
            />
          </div>

          <BaseInput 
            id="set-tt"
            v-model="tiktokUrl"
            label="TikTok URL"
            class="text-primary"
          />

          <div class="pt-4 border-t border-slate-800/60">
            <BaseButton type="submit" variant="secondary" class="cursor-pointer font-bold">
              Guardar Configuración
            </BaseButton>
          </div>
        </form>
      </div>

      <!-- Box 2: Audio & Media Manager -->
      <div class="bg-[#121324] border border-slate-800 rounded-xl p-6 sm:p-8 shadow-soft space-y-6 text-slate-100 flex flex-col justify-between">
        
        <div class="space-y-6">
          <h3 class="text-sm font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Volume2 class="w-4.5 h-4.5 text-secondary" />
            Audio de Bienvenida del Fundador
          </h3>

          <div class="space-y-4">
            <BaseInput 
              id="set-audio-title"
              v-model="founderAudioTitle"
              label="Título del Audio / Mensaje"
              placeholder="Un mensaje de nuestro fundador, El Comerciambre"
              class="text-primary"
            />
            
            <BaseInput 
              id="set-audio-url"
              v-model="founderAudioUrl"
              label="Ruta o URL del archivo MP3"
              placeholder="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
              class="text-primary"
            />
          </div>

          <div class="p-4 bg-white/5 border border-slate-800 rounded-lg text-xs leading-relaxed text-slate-400 font-semibold space-y-2">
            <span class="block text-white font-bold uppercase tracking-wider text-[9px] text-secondary">Nota de Uso:</span>
            <p>
              El archivo MP3 ingresado se reproducirá a través del reproductor interactivo Equalizer en la Página de Inicio (Home). Asegúrate de proporcionar una URL válida o colocar el archivo en la carpeta public del frontend.
            </p>
          </div>
        </div>

        <div class="pt-6 border-t border-slate-800/60 text-right">
          <BaseButton variant="secondary" class="cursor-pointer font-bold" @click="handleSaveSettings">
            Guardar Audio
          </BaseButton>
        </div>

      </div>

    </div>
  </div>
</template>
