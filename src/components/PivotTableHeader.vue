<template>
    <tr>
        <th class="px-2 py-1 w-[300px]">Kategória / Produkt</th>
        <th
            v-for="store in stores"
            :key="store"
            class="px-2 py-4 cursor-pointer hover:bg-primary-200 transition-colors"
            @click="handleSortClick(store)"
        >
            <div
                class="flex items-center justify-between select-none"
                :class="{
                    'text-primary-400': isSortedBy(store),
                }"
            >
                <span>{{ store }}</span>
                <span
                    class="sort-indicator"
                    :class="{
                        'opacity-0': !isSortedBy(store),
                    }"
                >
                    {{ sortDirectionIcon }}
                </span>
            </div>
        </th>
    </tr>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SortState } from '../types/table';

const props = defineProps<{
    stores: string[];
    sort: SortState;
}>();

const emit = defineEmits<{
    (e: 'sort', store: string): void;
}>();

// Computed properties
const sortDirectionIcon = computed(() => {
    return props.sort.direction === 'asc' ? '↑' : '↓';
});

const isSortedBy = (store: string): boolean => {
    return props.sort.column === store;
}

const handleSortClick = (store: string): void => {
    emit('sort', store);
}
</script>