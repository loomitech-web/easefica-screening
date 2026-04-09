<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
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
  prependInnerIcon: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue', 'blur', 'change']);

function onUpdate(value) {
  emit('update:modelValue', value);
  emit('change', value);
}
</script>

<template>
  <v-text-field class="field-control" :model-value="props.modelValue" :label="props.label" :type="props.type"
    :placeholder="props.placeholder" :hint="props.hint" :error-messages="props.errorMessages" :disabled="props.disabled"
    :loading="props.loading" :clearable="props.clearable" :prepend-inner-icon="props.prependInnerIcon"
    variant="outlined" density="comfortable" hide-details="auto" @update:model-value="onUpdate"
    @blur="$emit('blur', $event)" />
</template>

<style scoped>
.field-control {
  width: 220px;
  max-width: 100%;
}
</style>
