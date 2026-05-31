<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { OrderStatus } from '../../types'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import { Truck, Check } from 'lucide-vue-next'

const props = defineProps<{
  currentStatus: OrderStatus
  currentTrackingNumber?: string
}>()

const emit = defineEmits<{
  (e: 'update', data: { status: OrderStatus; trackingNumber: string; note: string; notifyCustomer: boolean }): void
}>()

const selectedStatus = ref<OrderStatus>(props.currentStatus)
const trackingNumber = ref(props.currentTrackingNumber || '')
const note = ref('')
const notifyCustomer = ref(true)

// Watch props changes to sync local ref state
watch(() => props.currentStatus, (newVal) => {
  selectedStatus.value = newVal
}, { immediate: true })

watch(() => props.currentTrackingNumber, (newVal) => {
  trackingNumber.value = newVal || ''
}, { immediate: true })

const statuses: { key: OrderStatus; label: string }[] = [
  { key: 'pending', label: 'Pendiente de Pago' },
  { key: 'paid', label: 'Pago Acreditado / Pagado' },
  { key: 'preparing', label: 'Preparando en Bodega' },
  { key: 'shipped', label: 'Enviado / En camino' },
  { key: 'delivered', label: 'Entregado al Domicilio' },
  { key: 'cancelled', label: 'Cancelado / Reembolsado' }
]

const isShippedSelected = computed(() => selectedStatus.value === 'shipped')

const handleSubmit = () => {
  emit('update', {
    status: selectedStatus.value,
    trackingNumber: trackingNumber.value,
    note: note.value,
    notifyCustomer: notifyCustomer.value
  })
  
  // Clear notes for next update
  note.value = ''
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4 text-left p-4 bg-slate-50 border border-slate-100 rounded-xl">
    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
      Actualizar Estado del Pedido
    </h4>

    <!-- Status Dropdown -->
    <div>
      <label for="status-select" class="block text-[10px] font-bold text-primary uppercase tracking-wider mb-2">
        Nuevo Estado
      </label>
      <select
        id="status-select"
        v-model="selectedStatus"
        class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:border-primary transition-all cursor-pointer"
      >
        <option 
          v-for="st in statuses" 
          :key="st.key" 
          :value="st.key"
        >
          {{ st.label }}
        </option>
      </select>
    </div>

    <!-- Tracking Number (Visible only for shipped status) -->
    <Transition
      enter-active-class="transition duration-300 ease-out-expo"
      enter-from-class="opacity-0 -translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-2 scale-95"
    >
      <div v-if="isShippedSelected" class="space-y-2">
        <BaseInput 
          id="admin-tracking"
          v-model="trackingNumber"
          label="Número de Guía (Tracking)"
          placeholder="DHL123456789MX"
          required
        />
        <p class="text-[9px] text-slate-400 font-semibold flex items-center gap-1">
          <Truck class="w-3.5 h-3.5 text-secondary" />
          Muestra esta guía en el timeline de rastreo del cliente.
        </p>
      </div>
    </Transition>

    <!-- Custom note -->
    <div>
      <label for="admin-note" class="block text-[10px] font-bold text-primary uppercase tracking-wider mb-2">
        Comentario / Nota (Visible al cliente)
      </label>
      <textarea
        id="admin-note"
        v-model="note"
        placeholder="Ej: Paquete enviado por DHL Express, llega el martes. / En preparación..."
        class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-primary transition-all h-20 leading-normal"
      ></textarea>
    </div>

    <!-- Notification Toggle -->
    <div class="flex items-center gap-2">
      <input
        type="checkbox"
        id="notify-client"
        v-model="notifyCustomer"
        class="w-4.5 h-4.5 text-secondary border-slate-300 rounded focus:ring-secondary/20 cursor-pointer accent-secondary"
      />
      <label for="notify-client" class="text-[10px] font-bold uppercase tracking-wider text-slate-500 cursor-pointer select-none">
        Notificar al cliente por buzón interno
      </label>
    </div>

    <!-- Action Buttons -->
    <div class="pt-2">
      <BaseButton 
        type="submit" 
        variant="secondary" 
        class="w-full h-9 text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
      >
        <Check class="w-4 h-4" />
        Guardar Actualización
      </BaseButton>
    </div>
  </form>
</template>
