<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number, Object, Array, null],
    default: null,
  },
  items: {
    type: Array,
    default: () => [],
  },
  label: {
    type: String,
    default: '',
  },
  itemTitle: {
    type: String,
    default: 'title',
  },
  itemValue: {
    type: String,
    default: 'value',
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
  <v-select
    class="field-control"
    :model-value="props.modelValue"
    :items="props.items"
    :label="props.label"
    :item-title="props.itemTitle"
    :item-value="props.itemValue"
    :hint="props.hint"
    :error-messages="props.errorMessages"
    :disabled="props.disabled"
    :loading="props.loading"
    :multiple="props.multiple"
    variant="outlined"
    density="comfortable"
    hide-details="auto"
    @update:model-value="onUpdate"
    @blur="$emit('blur', $event)"
  />
</template>
