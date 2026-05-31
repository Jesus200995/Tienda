<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string | number
  label?: string
  type?: string
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  id: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  required: false,
  disabled: false
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const inputClass = computed(() => {
  const base = 'w-full px-4 py-2.5 text-sm bg-white border rounded-md transition-all duration-300 outline-none'
  const state = props.error
    ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger'
    : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
  const disabled = props.disabled ? 'bg-slate-50 cursor-not-allowed text-slate-400' : ''
  return `${base} ${state} ${disabled}`
})

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="w-full text-left">
    <label v-if="label" :for="id" class="block text-xs font-semibold text-primary uppercase tracking-wider mb-2">
      {{ label }} <span v-if="required" class="text-danger">*</span>
    </label>
    <div class="relative">
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        @input="onInput"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClass"
        :required="required"
      />
    </div>
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform -translate-y-1 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-1 opacity-0"
    >
      <p v-if="error" class="text-xs text-danger mt-1.5 font-medium leading-none">
        {{ error }}
      </p>
    </Transition>
  </div>
</template>
