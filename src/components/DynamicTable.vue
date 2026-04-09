<template>
    <v-card class="dynamic-table-panel">
        <div v-if="filterControls" class="dynamic-table-panel__toolbar">
            <v-row class="align-center justify-end dynamic-table-panel__toolbar-row" compact>
                <v-col v-if="filterControls.search" cols="12" md="auto" class="dynamic-table-panel__filter-col">
                    <InputField v-model="search" label="Search subjects..." prepend-inner-icon="mdi-magnify"
                        placeholder="Search subjects..." />
                </v-col>

                <v-col v-if="filterControls.categoryFilter" cols="12" md="auto" class="dynamic-table-panel__filter-col">
                    <BaseSelect v-model="selectedCategory" :items="filterControls.categoryFilters" label="Sort by..." />
                </v-col>

                <v-col v-if="filterControls.dateFilter" cols="12" md="auto" class="dynamic-table-panel__filter-col">
                    <DateField v-model="selectedDateRange" label="Select date" />
                </v-col>
                <v-col v-if="filterControls.dateRangeFilter" cols="12" md="auto"
                    class="dynamic-table-panel__filter-col">
                    <DateRangeField v-model="selectedDateRange" label="Select date" />
                </v-col>
            </v-row>
        </div>

        <v-data-table-server :headers="headers" :items="filteredContent" :search="search" class="dynamic-table" hover
            :items-per-page="pageSize" :page="page" :items-per-page-text="`Items per page`"
            :page-text="`Page ${page} of ${pagination.pageCount}`" :items-length="totalCount"
            :items-per-page-options="[10, 25, 50, 100]" @update:page="onPageChange"
            @update:items-per-page="onItemsPerPageChange">
            <template v-for="header in headers" :key="header.key" v-slot:[`item.${header.key}`]="{ value, item }">
                <slot :name="`item.${header.key}`" :value="value" :item="item">
                    {{ value }}
                </slot>
            </template>
        </v-data-table-server>
    </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import InputField from './fields/InputField.vue'
import DateField from './fields/DateField.vue'
import BaseSelect from './fields/BaseSelect.vue'
import DateRangeField from './fields/DateRangeField.vue'

const props = defineProps({
    headers: { type: Array, required: true },
    content: { type: Array, required: true },
    filterControls: {
        type: Object,
        default: () => ({
            search: false,
            dateFilter: false,
            dateRangeFilter: false,
            categoryFilter: false,
            categoryFilters: []
        })
    },
    totalCount: { type: Number, required: true },
    page: { type: Number, required: true },
    pageSize: { type: Number, required: true },
})

const emit = defineEmits(['update:page', 'update:pageSize', 'update:dateRange'])

function onPageChange(value) {
    console.log('DynamicTable | page changed', {
        from: props.page,
        to: value,
        totalCount: props.totalCount,
        pageSize: props.pageSize,
    })
    emit('update:page', value)
}

function onItemsPerPageChange(value) {
    console.log('DynamicTable | page size changed', {
        page: props.page,
        from: props.pageSize,
        to: value,
        totalCount: props.totalCount,
    })
    emit('update:pageSize', value)
}

const search = ref('')
const selectedDateRange = ref({
    startDate: null,
    endDate: null,
})
const selectedCategory = ref(null)
const pagination = computed(() => ({
    page: props.page,
    pageSize: props.pageSize,
    total: props.totalCount,
    pageCount: Math.max(1, Math.ceil(props.totalCount / props.pageSize)),
}))
// Advanced Filtering Logic
const filteredContent = computed(() => {
    let data = props.content

    if (selectedCategory.value && props.filterControls.categoryFilter) {
        data = data.filter(item => item.category === selectedCategory.value)
    }

    console.log('DynamicTable | received props', {
        contentLength: props.content?.length || 0,
        filteredLength: data.length,
        totalCount: props.totalCount,
        page: props.page,
        pageSize: props.pageSize,
        firstItem: data[0] || null,
    })

    return data
})


watch(selectedDateRange, (value) => {
    emit('update:dateRange', value || { startDate: null, endDate: null })
}, { deep: true })
</script>

<style scoped>
.dynamic-table-panel {
    background: #fff;
    border: 1px solid #ccc;
    box-shadow: 0px 0px 10px #ccc !important;
    border-radius: var(--border-radius) !important;
    overflow: hidden;
}

.dynamic-table-panel__toolbar {
    padding: 16px 16px 8px;
    border-bottom: 1px solid #ccc;
    background: #fff;
}

.dynamic-table-panel__toolbar-row {
    justify-content: flex-start;
}

.dynamic-table-panel__filter-col {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}

.dynamic-table-filter :deep(.v-field) {
    border-radius: var(--border-radius);
    background: rgba(255, 255, 255, 0.96);
}

.dynamic-table-filter {
    width: 220px;
    max-width: 100%;
}

.dynamic-table {
    background: transparent;
}

.dynamic-table :deep(table) {
    border-collapse: collapse;
}

.dynamic-table :deep(.v-data-table-header th),
.dynamic-table :deep(thead th) {
    background-color: #f2f2f2 !important;
    color: #666 !important;
    font-size: 12px;
    font-weight: 700 !important;
    letter-spacing: 0;
    text-transform: none;
    border: 1px solid #ddd;
    padding: 8px 10px !important;
}

.dynamic-table :deep(.v-data-table-header__content) {
    color: #666 !important;
    font-weight: 700 !important;
    opacity: 1 !important;
}

.dynamic-table :deep(tbody td) {
    color: #666 !important;
    font-size: 14px;
    border: 1px solid #ddd;
    padding: 8px 10px !important;
}

.dynamic-table :deep(tbody tr:hover) {
    background-color: #50abca !important;
}

.dynamic-table :deep(tbody tr:hover td) {
    color: #fff !important;
}

/* Vuetify rows use specific classes; cover those too. */
.dynamic-table :deep(.v-data-table__tr:hover) {
    background-color: #50abca !important;
}

.dynamic-table :deep(.v-data-table__tr:hover td),
.dynamic-table :deep(.v-data-table__tr:hover .v-data-table__td) {
    background-color: #50abca !important;
    color: #fff !important;
}

.dynamic-table :deep(tbody tr:nth-of-type(even)) {
    background-color: #e4f8ff !important;
}

.dynamic-table :deep(tbody tr:nth-of-type(odd)) {
    background-color: #fff !important;
}



@media (max-width: 960px) {
    .dynamic-table-panel__toolbar {
        padding: 12px 12px 4px;
    }

    .dynamic-table-panel__toolbar-row {
        justify-content: flex-start;
    }

    .dynamic-table-panel__filter-col {
        justify-content: flex-start;
    }

    .dynamic-table :deep(thead th),
    .dynamic-table :deep(tbody td) {
        font-size: 13px;
        padding: 7px 8px !important;
    }
}
</style>