<script setup lang="ts">
import { computed } from 'vue'
import type { OrderStatus, OrderStatusEntry } from '../../types'
import { 
  FileText, 
  CreditCard, 
  Box, 
  Truck, 
  CheckCircle,
  XCircle
} from 'lucide-vue-next'

const props = defineProps<{
  status: OrderStatus
  statusHistory?: OrderStatusEntry[]
  trackingNumber?: string
}>()

// Definir los pasos ordenados de la entrega
const steps = [
  { key: 'pending', label: 'Pedido Realizado', desc: 'Recibimos tu solicitud, esperando confirmación.', icon: FileText },
  { key: 'paid', label: 'Pago Acreditado', desc: '¡Tu pago de Mercado Pago fue aprobado!', icon: CreditCard },
  { key: 'preparing', label: 'Preparando Paquete', desc: 'Estamos empacando tus prendas en bodega.', icon: Box },
  { key: 'shipped', label: 'En Camino', desc: 'Tu paquete fue entregado a la paquetería.', icon: Truck },
  { key: 'delivered', label: 'Entregado', desc: '¡Disfruta tus prendas de El Comerciambre!', icon: CheckCircle }
]

// Determinar el índice del estado actual en el flujo
const currentStepIndex = computed(() => {
  if (props.status === 'cancelled') return -1
  return steps.findIndex(step => step.key === props.status)
})

// Buscar la fecha/hora en el historial para un estado específico
const getStatusTime = (targetStatus: string) => {
  if (!props.statusHistory) return ''
  const entry = props.statusHistory.find(h => h.status === targetStatus)
  if (!entry) return ''
  
  const date = new Date(entry.timestamp)
  return date.toLocaleString('es-MX', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Obtener nota adjunta a un paso
const getStatusNote = (targetStatus: string) => {
  if (!props.statusHistory) return ''
  const entry = props.statusHistory.find(h => h.status === targetStatus)
  return entry?.note || ''
}
</script>

<template>
  <div class="bg-white border border-slate-100 rounded-xl p-5 md:p-6 shadow-soft text-left w-full">
    <h3 class="text-sm font-bold uppercase tracking-wider text-primary mb-6">
      Estado de Entrega
    </h3>

    <!-- Cancelled State Special Banner -->
    <div v-if="status === 'cancelled'" class="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl mb-6">
      <XCircle class="w-6 h-6 text-rose-500 flex-shrink-0" />
      <div>
        <h4 class="font-bold text-sm">Pedido Cancelado</h4>
        <p class="text-xs text-rose-600 mt-0.5 leading-normal">
          Este pedido ha sido cancelado. Si tienes dudas, ponte en contacto con soporte técnico a través del chat de ayuda.
          <span v-if="getStatusNote('cancelled')" class="block mt-2 font-bold bg-white/50 p-2 rounded-md border border-rose-100/30">
            Motivo: {{ getStatusNote('cancelled') }}
          </span>
        </p>
      </div>
    </div>

    <!-- Timeline Stepper -->
    <div class="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
      <div 
        v-for="(step, index) in steps" 
        :key="step.key"
        class="relative"
      >
        <!-- Icon Marker Container -->
        <div 
          class="absolute -left-8 top-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 bg-white"
          :class="[
            index <= currentStepIndex 
              ? 'border-success text-success bg-success/5 shadow-xs scale-105 font-bold' 
              : index === currentStepIndex + 1 && status !== 'cancelled'
                ? 'border-secondary text-secondary bg-white ring-4 ring-secondary/15 animate-pulse'
                : 'border-slate-200 text-slate-400 bg-white'
          ]"
        >
          <component :is="step.icon" class="w-3.5 h-3.5" />
        </div>

        <!-- Connection line highlighting (Green path) -->
        <div 
          v-if="index < steps.length - 1 && index < currentStepIndex"
          class="absolute -left-[1.375rem] top-7.5 w-[2px] h-[calc(100%+1rem)] bg-success transition-all duration-500 z-0"
        ></div>

        <!-- Step content -->
        <div class="space-y-1">
          <div class="flex items-center justify-between gap-4">
            <h4 
              class="text-sm font-bold transition-colors"
              :class="index <= currentStepIndex ? 'text-primary' : 'text-slate-400'"
            >
              {{ step.label }}
            </h4>
            
            <!-- Date marker -->
            <span v-if="getStatusTime(step.key)" class="text-[10px] font-semibold text-slate-400">
              {{ getStatusTime(step.key) }}
            </span>
          </div>

          <p 
            class="text-xs leading-normal"
            :class="index <= currentStepIndex ? 'text-slate-600' : 'text-slate-400'"
          >
            {{ step.desc }}
          </p>

          <!-- Tracking Info in Step "En Camino" -->
          <div 
            v-if="step.key === 'shipped' && index <= currentStepIndex && trackingNumber" 
            class="mt-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100/70 inline-block"
          >
            <span class="block text-[9px] uppercase tracking-widest font-black text-slate-400">Número de Guía</span>
            <span class="font-mono text-xs font-black text-primary select-all">{{ trackingNumber }}</span>
            <span class="block text-[9px] text-emerald-600 font-semibold mt-1">Paquetería: Estafeta / DHL Express</span>
          </div>

          <!-- Note text if provided -->
          <p 
            v-if="getStatusNote(step.key) && step.key !== 'cancelled'" 
            class="text-xs text-secondary italic font-medium mt-1 bg-slate-50 border-l-2 border-secondary/35 pl-2 py-0.5 rounded-r"
          >
            "{{ getStatusNote(step.key) }}"
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
