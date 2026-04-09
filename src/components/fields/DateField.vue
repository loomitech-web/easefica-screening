<script setup>
import { ref } from 'vue'
const props = defineProps({
    modelValue: {
        type: [String, Date, null],
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
});

const emit = defineEmits(['update:modelValue', 'blur', 'change']);

function onUpdate(value) {
    emit('update:modelValue', value);
    emit('change', value);
}

const showDatePicker = ref(false)

</script>

<template>
    <div class="field-control-anchor">
        <v-btn @click="showDatePicker = !showDatePicker" class="field-control">
            <v-icon icon="mdi-calendar" />
            <span>{{ props.label }}</span>
        </v-btn>
        <div v-if="showDatePicker" class="field-control-overlay">
            <v-date-picker v-if="showDatePicker" v-model="dateRange" :label="props.label" :type="props.type"
                :placeholder="props.placeholder" :hint="props.hint" :error-messages="props.errorMessages"
                :disabled="props.disabled" :loading="props.loading" :clearable="props.clearable" variant="outlined"
                density="comfortable" hide-details="auto" @update:model-value="onUpdate" @blur="$emit('blur', $event)" />
        </div>
    </div>
</template>

<style scoped>
.field-control {
    display: flex;
    align-items: center;
    gap: 8px;
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
}
</style>