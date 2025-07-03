<template>
    <div class="overflow-x-auto overflow-y-clip">
        <LoadingIndicator v-if="loading"/>

        <table
            v-else
            class="table-fixed w-full min-w-4xl"
        >
            <thead>
            <PivotTableHeader
                :stores="stores"
                :sort="sort"
                @sort="toggleSort"
            />
            </thead>
            <tbody>
            <tr
                v-if="!sortedCategories.length"
                class="border-t"
            >
                <td :colspan="stores.length + 1">
                    <p class="text-center py-2">Žiadne dáta</p>
                </td>
            </tr>
            <PivotTableItem
                v-else
                v-for="category in sortedCategories"
                :key="category.name"
                :category="category"
                :stores="stores"
                :sort="sort"
            />
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { PivotCategory, RawDataItem, SortState } from '../types/table';
import groupWorker from '../workers/groupWorker.ts?worker';
import LoadingIndicator from "./LoadingIndicator.vue";
import PivotTableHeader from "./PivotTableHeader.vue";
import PivotTableItem from "./PivotTableItem.vue";

// Constants
const API_URL = 'https://hiring.wdev.sk/fe-data';

// State
const categories = ref<PivotCategory[]>([]);
const stores = ref<string[]>([]);
const loading = ref(false);
const sort = ref<SortState>({ column: null, direction: null });

// Lifecycle hooks
onMounted(async () => {
    try {
        loading.value = true;
        const rawData = await fetchData();
        const processedData = await processDataWithWorker(rawData);

        categories.value = processedData.result;
        stores.value = processedData.stores;
    } catch (error) {
        console.error('Failed to load data:', error);
    } finally {
        loading.value = false;
    }
});

// Computed properties
const sortedCategories = computed<PivotCategory[]>(() => {
    if (!sort.value.column) return categories.value;

    return [...categories.value].sort((a, b) => {
        const storeColumn = sort.value.column as string;
        const sumA = a.storeSums[storeColumn] || 0;
        const sumB = b.storeSums[storeColumn] || 0;

        if (sort.value.direction === 'asc') return sumA - sumB;
        if (sort.value.direction === 'desc') return sumB - sumA;
        return 0;
    });
});

/**
 * Toggles the sorting state for the specified store column
 */
const toggleSort = (store: string) => {
    if (sort.value.column !== store) {
        sort.value = {column: store, direction: 'asc'};
    } else if (sort.value.direction === 'asc') {
        sort.value.direction = 'desc';
    } else if (sort.value.direction === 'desc') {
        sort.value = {column: null, direction: null};
    } else {
        sort.value.direction = 'asc';
    }
}

/**
 * Fetches data from the API
 */
const fetchData = async (): Promise<RawDataItem[]> => {
    const response = await fetch(API_URL);
    return await response.json();
}

/**
 * Processes data using web worker
 */
const processDataWithWorker = (rawData: RawDataItem[]): Promise<{ result: PivotCategory[]; stores: string[] }> => {
    return new Promise((resolve) => {
        const worker = new groupWorker();
        worker.postMessage(rawData);

        worker.onmessage = (e: MessageEvent<{ result: PivotCategory[]; stores: string[] }>) => {
            resolve(e.data);
            worker.terminate();
        };
    });
}
</script>