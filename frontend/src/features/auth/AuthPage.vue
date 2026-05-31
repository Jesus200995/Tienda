<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRoute, useRouter } from 'vue-router'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import { ShieldAlert, ArrowLeft, Key, ShoppingCart, Shield } from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// State
const isLoginMode = ref(true)
const email = ref('')
const name = ref('')
const password = ref('')
const confirmPassword = ref('')
const localError = ref('')

const loading = computed(() => authStore.loading)
const authError = computed(() => authStore.error)

const redirectPath = computed(() => (route.query.redirect as string) || '/')

const handleSubmit = async () => {
  localError.value = ''
  
  if (isLoginMode.value) {
    if (!email.value || !password.value) {
      localError.value = 'Por favor completa todos los campos.'
      return
    }
    
    const success = await authStore.login(email.value, password.value)
    if (success) {
      if (authStore.isAdmin) {
        router.push({ name: 'admin-dashboard' })
      } else {
        router.push(redirectPath.value)
      }
    }
  } else {
    if (!name.value || !email.value || !password.value) {
      localError.value = 'Por favor completa todos los campos requeridos.'
      return
    }
    
    if (password.value !== confirmPassword.value) {
      localError.value = 'Las contraseñas no coinciden.'
      return
    }
    
    const success = await authStore.register(name.value, email.value, password.value)
    if (success) {
      router.push(redirectPath.value)
    }
  }
}

// Quick Login Helper
const quickLogin = async (role: 'admin' | 'customer') => {
  if (role === 'admin') {
    email.value = 'admin@elcomerciambre.com'
    password.value = 'admin'
  } else {
    email.value = 'cliente@gmail.com'
    password.value = 'password'
  }
  isLoginMode.value = true
  
  // Auto submit
  const success = await authStore.login(email.value, password.value)
  if (success) {
    if (authStore.isAdmin) {
      router.push({ name: 'admin-dashboard' })
    } else {
      router.push(redirectPath.value)
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-secondary selection:text-white">
    
    <!-- Top-left Back button -->
    <div class="absolute top-6 left-6">
      <button 
        @click="router.push('/')" 
        class="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-primary transition-colors cursor-pointer"
      >
        <ArrowLeft class="w-4 h-4 mr-1.5" />
        Regresar al Inicio
      </button>
    </div>

    <!-- Center Card -->
    <div class="w-full max-w-md bg-white border border-slate-100 rounded-lg shadow-soft overflow-hidden p-8 space-y-6">
      
      <!-- Logo & Title -->
      <div class="text-center">
        <div class="flex justify-center mb-2 text-secondary">
          <ShoppingCart class="w-10 h-10" />
        </div>
        <h2 class="text-2xl font-display font-black tracking-wider text-primary mt-2 uppercase">
          El Comerciambre
        </h2>
        <p class="text-xs text-slate-400 font-semibold mt-1">
          {{ isLoginMode ? 'Inicia sesión para proceder a tu bolsa' : 'Crea una cuenta en segundos' }}
        </p>
      </div>

      <!-- Error Alerts -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform -translate-y-2 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
      >
        <div v-if="localError || authError" class="p-3.5 bg-danger/5 rounded-md border border-danger/20 flex gap-2.5 items-start text-left text-xs font-medium text-danger">
          <ShieldAlert class="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
          <span>{{ localError || authError }}</span>
        </div>
      </Transition>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4 text-left">
        <!-- Name (Register Only) -->
        <div v-if="!isLoginMode">
          <BaseInput 
            id="auth-name"
            v-model="name"
            label="Nombre completo"
            placeholder="Juan Pérez"
            required
          />
        </div>

        <!-- Email -->
        <div>
          <BaseInput 
            id="auth-email"
            v-model="email"
            type="email"
            label="Correo electrónico"
            placeholder="correo@ejemplo.com"
            required
          />
        </div>

        <!-- Password -->
        <div>
          <BaseInput 
            id="auth-password"
            v-model="password"
            type="password"
            label="Contraseña"
            placeholder="••••••••"
            required
          />
        </div>

        <!-- Confirm Password (Register Only) -->
        <div v-if="!isLoginMode">
          <BaseInput 
            id="auth-confirm-password"
            v-model="confirmPassword"
            type="password"
            label="Confirmar contraseña"
            placeholder="••••••••"
            required
          />
        </div>

        <!-- Submit Button -->
        <BaseButton 
          type="submit" 
          variant="secondary" 
          class="w-full cursor-pointer h-11"
          :loading="loading"
        >
          {{ isLoginMode ? 'Ingresar a mi cuenta' : 'Registrarme ahora' }}
        </BaseButton>
      </form>

      <!-- Toggle mode links -->
      <div class="text-center text-xs pt-2">
        <button 
          @click="isLoginMode = !isLoginMode; localError = ''" 
          class="text-secondary font-bold hover:underline cursor-pointer"
        >
          {{ isLoginMode ? '¿No tienes cuenta? Registrate aquí' : '¿Ya tienes una cuenta? Inicia sesión' }}
        </button>
      </div>

      <!-- Quick Login helper box (ONLY for local development testing!) -->
      <div class="p-4 bg-slate-50 border border-slate-100 rounded-lg space-y-3 text-left">
        <div class="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wide">
          <Key class="w-4 h-4 text-secondary" />
          <span>Acceso Rápido (Pruebas)</span>
        </div>
        <p class="text-[10px] text-slate-400 font-semibold leading-normal">
          Usa estos accesos directos para probar ambos roles inmediatamente:
        </p>
        <div class="grid grid-cols-2 gap-3">
          <button 
            @click="quickLogin('customer')"
            class="px-3 py-2 flex items-center justify-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-bold rounded-md text-primary transition-all text-center cursor-pointer shadow-xs"
          >
            <Key class="w-3.5 h-3.5 text-secondary" /> Cliente Prueba
          </button>
          <button 
            @click="quickLogin('admin')"
            class="px-3 py-2 flex items-center justify-center gap-1.5 bg-primary hover:bg-opacity-90 border border-transparent text-[10px] font-bold rounded-md text-white transition-all text-center cursor-pointer shadow-xs"
          >
            <Shield class="w-3.5 h-3.5" /> Admin Prueba
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
