<script setup lang="ts">
import { useSettingsStore } from '../../stores/settings'
import { Facebook, Instagram, MessageSquare } from 'lucide-vue-next'

const settingsStore = useSettingsStore()
</script>

<template>
  <footer class="bg-primary text-white border-t border-primary-light">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 grid grid-cols-1 md:grid-cols-4 gap-10 text-left">
      
      <!-- Brand Description -->
      <div class="space-y-4">
        <h3 class="text-lg font-display font-bold tracking-wider text-white">
          🛍️ EL COMERCIAMBRE
        </h3>
        <p class="text-slate-400 text-xs leading-relaxed max-w-sm">
          Tu tienda de ropa favorita de corte premium y estilo de vida streetwear. Ropa que define tu identidad, diseñada y fabricada con la máxima calidad.
        </p>
        
        <!-- Social Icons -->
        <div class="flex items-center gap-4.5 pt-2">
          <a v-if="settingsStore.settings.facebook_url" :href="settingsStore.settings.facebook_url" target="_blank" rel="noopener" class="text-slate-400 hover:text-white transition-colors cursor-pointer" aria-label="Facebook">
            <Facebook class="w-4.5 h-4.5" />
          </a>
          <a v-if="settingsStore.settings.instagram_url" :href="settingsStore.settings.instagram_url" target="_blank" rel="noopener" class="text-slate-400 hover:text-white transition-colors cursor-pointer" aria-label="Instagram">
            <Instagram class="w-4.5 h-4.5" />
          </a>
          <a :href="settingsStore.whatsAppLink" target="_blank" rel="noopener" class="text-slate-400 hover:text-white transition-colors cursor-pointer" aria-label="WhatsApp">
            <MessageSquare class="w-4.5 h-4.5" />
          </a>
        </div>
      </div>

      <!-- Quick Navigation -->
      <div>
        <h4 class="text-xs uppercase tracking-wider font-bold text-slate-300 mb-4">
          Navegación
        </h4>
        <ul class="space-y-2.5 text-xs text-slate-400">
          <li>
            <RouterLink :to="{ name: 'home' }" class="hover:text-white transition-colors">Inicio</RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'catalog' }" class="hover:text-white transition-colors">Catálogo de Ropa</RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'cart' }" class="hover:text-white transition-colors">Mi Carrito</RouterLink>
          </li>
        </ul>
      </div>

      <!-- Customer Help -->
      <div>
        <h4 class="text-xs uppercase tracking-wider font-bold text-slate-300 mb-4">
          Soporte
        </h4>
        <ul class="space-y-2.5 text-xs text-slate-400">
          <li>
            <a :href="settingsStore.whatsAppLink" target="_blank" class="hover:text-white transition-colors">Contacto WhatsApp</a>
          </li>
          <li>
            <span class="block">Email: {{ settingsStore.settings.store_email }}</span>
          </li>
          <li>
            <span class="block">Tel: {{ settingsStore.settings.store_phone }}</span>
          </li>
        </ul>
      </div>

      <!-- Legal Info -->
      <div>
        <h4 class="text-xs uppercase tracking-wider font-bold text-slate-300 mb-4">
          Políticas
        </h4>
        <ul class="space-y-2.5 text-xs text-slate-400">
          <li class="hover:text-white transition-colors cursor-pointer">Términos de servicio</li>
          <li class="hover:text-white transition-colors cursor-pointer">Políticas de envío</li>
          <li class="hover:text-white transition-colors cursor-pointer">Garantía de reembolso</li>
        </ul>
      </div>

    </div>

    <!-- Bottom copyrights -->
    <div class="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
      <p>© 2026 El Comerciambre. Todos los derechos reservados. Desarrollado con ⚡ Vue 3 & PWA.</p>
    </div>
  </footer>
</template>
