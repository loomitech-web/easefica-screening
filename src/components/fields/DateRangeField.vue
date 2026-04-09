<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Object, null],
    default: null,
  },
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  errorMessages: {
    type: [String, Array],
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'blur', 'change'])

const showDatePicker = ref(false)
const showFromPicker = ref(false)
const showToPicker = ref(false)
const rootEl = ref(null)

const startDate = computed({
  get() {
    return props.modelValue?.startDate ?? null
  },
  set(value) {
    onUpdate(value, endDate.value)
  },
})

const endDate = computed({
  get() {
    return props.modelValue?.endDate ?? null
  },
  set(value) {
    onUpdate(startDate.value, value)
  },
})

function onUpdate(start, end) {
  const value = {
    startDate: normalizeDate(start),
    endDate: normalizeDate(end),
  }

  emit('update:modelValue', value)
  emit('change', value)
}

function onClear() {
  onUpdate(null, null)
}

function formatDisplayDate(value) {
  if (!value) return ''
  return normalizeDate(value) || ''
}

function normalizeDate(value) {
  if (!value) return null

  if (typeof value === 'string') {
    return value.includes('T') ? value.split('T')[0] : value
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return String(value)
}

function onStartSelected(value) {
  startDate.value = value
  showFromPicker.value = false
}

function onEndSelected(value) {
  endDate.value = value
  showToPicker.value = false
}

function closeAllPickers() {
  showDatePicker.value = false
  showFromPicker.value = false
  showToPicker.value = false
}

function handleDocumentClick(event) {
  if (!showDatePicker.value) return
  const target = event.target
  const clickPath = typeof event.composedPath === 'function' ? event.composedPath() : []
  const clickedInsidePickerOverlay = clickPath.some((node) =>
    node?.classList?.contains?.('date-range-menu-content')
  )

  if (clickedInsidePickerOverlay) {
    return
  }

  if (rootEl.value && !rootEl.value.contains(target)) {
    closeAllPickers()
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<template>
  <div ref="rootEl" class="field-control-anchor">
    <v-btn @click="showDatePicker = !showDatePicker" class="field-control">
      <v-icon icon="mdi-calendar" />
      <span>{{ props.label }}</span>
    </v-btn>
    <div v-if="showDatePicker" class="field-control-overlay">
      <div class="date-range-fields">
        <v-menu v-model="showFromPicker" :close-on-content-click="false" content-class="date-range-menu-content"
          location="bottom start">
          <template #activator="{ props: menuProps }">
            <v-text-field v-bind="menuProps" :model-value="formatDisplayDate(startDate)" label="From date" readonly
              class="date-dropdown-field" append-inner-icon="mdi-calendar" variant="outlined" density="comfortable"
              hide-details="auto" />
          </template>
          <div class="picker-dropdown-content">
            <v-date-picker v-model="startDate" color="#0a7cb9" :disabled="props.disabled" :loading="props.loading"
              @update:model-value="onStartSelected" />
          </div>
        </v-menu>

        <v-menu v-model="showToPicker" :close-on-content-click="false" content-class="date-range-menu-content"
          location="bottom start">
          <template #activator="{ props: menuProps }">
            <v-text-field v-bind="menuProps" :model-value="formatDisplayDate(endDate)" label="To date" readonly
              class="date-dropdown-field" append-inner-icon="mdi-calendar" variant="outlined" density="comfortable"
              hide-details="auto" />
          </template>
          <div class="picker-dropdown-content">
            <v-date-picker v-model="endDate" color="#0a7cb9" :disabled="props.disabled" :loading="props.loading"
              @update:model-value="onEndSelected" />
          </div>
        </v-menu>
      </div>
      <v-btn v-if="startDate || endDate" class="clear-button" @click="onClear">
        Clear
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.field-control-anchor {
  display: block;
  width: 100%;
}

.field-control {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  width: 220px;
  max-width: 100%;
  padding: 8px 16px;
  border-radius: var(--border-radius);
  background: var(--ef-surface);
  border: 1px solid var(--ef-border);
  cursor: pointer;
  color: var(--ef-text-soft);
  transition: all 0.3s ease;

  &:hover {
    background: var(--ef-surface-hover);
    border-color: var(--ef-border-hover);
    color: #fff;
  }

  &:focus {
    background: var(--ef-surface-hover);
    border-color: var(--ef-border-hover);
    color: #fff;
  }
}

.field-control-overlay {
  margin-top: 8px;
}

.date-range-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.date-dropdown-field {
  width: 220px;
  max-width: 100%;
}

.picker-dropdown-content {
  max-height: 70vh;
  overflow-y: auto;
}

.clear-button {
  margin-top: 8px;
  color: var(--ef-text-soft);
  background: var(--ef-surface);

  &:hover {
    color: #fff;
    background: var(--ef-surface-hover);
  }
}

:deep(.v-date-picker-month__day--selected .v-btn) {
  background-color: #0a7cb9 !important;
}
</style>
