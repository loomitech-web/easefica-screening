<template>
    <v-card class="dynamic-table-panel">
        <div v-if="filterControls" class="dynamic-table-panel__toolbar">
            <v-row class="align-center" compact>
                <v-col v-if="filterControls.search" cols="12" md="4">
                    <v-text-field v-model="search" class="dynamic-table-filter" label="Search subjects..."
                        prepend-inner-icon="mdi-magnify" variant="outlined" hide-details density="compact" />
                </v-col>

                <v-col v-if="filterControls.dateFilter" cols="12" md="4">
                    <v-text-field v-model="dateRange" class="dynamic-table-filter" label="Filter by Date" type="date"
                        variant="outlined" hide-details density="compact" />
                </v-col>

                <v-col v-if="filterControls.categoryFilter" cols="12" md="4">
                    <v-select v-model="selectedCategory" class="dynamic-table-filter"
                        :items="filterControls.categoryFilters" label="Category" variant="outlined" hide-details
                        density="compact" clearable />
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
import { ref, computed } from 'vue'

const props = defineProps({
    headers: { type: Array, required: true },
    content: { type: Array, required: true },
    filterControls: {
        type: Object,
        default: () => ({
            search: false,
            dateFilter: false,
            categoryFilter: false,
            categoryFilters: []
        })
    },
    totalCount: { type: Number, required: true },
    page: { type: Number, required: true },
    pageSize: { type: Number, required: true },
})

const emit = defineEmits(['update:page', 'update:pageSize'])

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
const dateRange = ref(null)
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
</script>

<style scoped>
.dynamic-table-panel {
    background: var(--ef-surface);
    border: 1px solid rgba(230, 230, 230, 0.9);
    box-shadow: 0 6px 16px rgba(16, 54, 82, 0.08) !important;
    border-radius: 12px !important;
    overflow: hidden;
}

.dynamic-table-panel__toolbar {
    padding: 16px 16px 8px;
    border-bottom: 1px solid rgba(230, 230, 230, 0.9);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(246, 250, 253, 0.98));
}

.dynamic-table-filter :deep(.v-field) {
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.96);
}

.dynamic-table {
    background: transparent;
}

.dynamic-table :deep(table) {
    border-collapse: separate;
    border-spacing: 0;
}

.dynamic-table :deep(.v-data-table-header th),
.dynamic-table :deep(thead th) {
    background: rgba(10, 124, 185, 0.08) !important;
    color: var(--ef-secondary) !important;
    font-size: 12px;
    font-weight: 600 !important;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border-bottom: 1px solid rgba(230, 230, 230, 0.9);
}

.dynamic-table :deep(.v-data-table-header__content) {
    color: var(--ef-secondary) !important;
    font-weight: 600 !important;
    opacity: 1 !important;
}

.dynamic-table :deep(tbody td) {
    color: #173042;
    font-size: 14px;
    border-bottom: 1px solid rgba(230, 230, 230, 0.65);
}

.dynamic-table :deep(tbody tr:hover) {
    background: rgba(10, 124, 185, 0.04) !important;
}

.dynamic-table :deep(.v-data-table__tr:last-child td) {
    border-bottom: none;
}

@media (max-width: 960px) {
    .dynamic-table-panel__toolbar {
        padding: 12px 12px 4px;
    }

    .dynamic-table :deep(thead th),
    .dynamic-table :deep(tbody td) {
        font-size: 13px;
    }
}
</style>