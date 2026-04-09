<script setup>
const props = defineProps({
  modelValue: {
    type: [Array, Object, null],
    default: () => [],
  },
  label: {
    type: String,
    default: 'Upload file',
  },
  accept: {
    type: String,
    default: '.csv,.xlsx,.xls,.json,.pdf',
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
  multiple: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'blur', 'change']);

function onUpdate(value) {
  emit('update:modelValue', value);
  emit('change', value);
}
</script>

<template>
  <div class="field-control-anchor">
    <v-file-input class="field-control" :model-value="props.modelValue" :label="props.label" :accept="props.accept"
      :error-messages="props.errorMessages" :disabled="props.disabled" :loading="props.loading" variant="plain"
      density="comfortable" hide-details="auto" show-size prepend-icon="mdi-paperclip" @update:model-value="onUpdate" />
  </div>
</template>

<style scoped>
.field-control-anchor {
  display: block;
  width: 100%;
}

.field-control {
  width: 220px;
  max-width: 100%;
  border-radius: var(--border-radius) !important;
  border: dashed 2px #a7a7a7;
}
</style>
