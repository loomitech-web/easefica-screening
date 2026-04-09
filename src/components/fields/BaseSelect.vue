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
  console.log('BaseSelect | onUpdate', value);
  emit('update:modelValue', value);
  emit('change', value);
}

function onClear() {
  emit('update:modelValue', null);
  emit('change', null);

}
</script>

<template>
  <v-row>
    <div class="field-control-anchor">
      <v-select class="field-control" :model-value="props.modelValue" :items="props.items" :label="props.label"
        :item-title="props.itemTitle" :item-value="props.itemValue" :hint="props.hint"
        :error-messages="props.errorMessages" :disabled="props.disabled" :loading="props.loading"
        :multiple="props.multiple" variant="outlined" density="comfortable" hide-details="auto"
        @update:model-value="onUpdate" @blur="$emit('blur', $event)" />
    </div>
    <div class="clear-button-container">
      <v-btn v-if="props.modelValue" class="clear-button" @click="onClear"> <v-icon icon="mdi-close" /> </v-btn>
    </div>
  </v-row>
</template>

<style scoped>
.field-control-anchor {
  display: block;
  width: 220px;
  max-width: 100%;
}

.clear-button-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.clear-button {
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--ef-text-soft);
  background: var(--ef-surface);
  border-radius: var(--border-radius);

  &:hover {
    color: #fff;
    background: var(--ef-surface-hover);
    border-radius: var(--border-radius);
  }
}
</style>