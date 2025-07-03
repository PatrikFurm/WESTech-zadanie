<template>
    <tr
        @click="toggle"
        class="cursor-pointer hover:bg-primary-200 transition-colors"
        :class="{ 'bg-primary-200': expanded }"
    >
        <td
            class="pivot-table-row p-2 font-bold"
            :class="{ 'expanded-row': expanded }"
        >
            <span class="mr-2">{{ category.name }}</span>
            <span>{{ expanded ? '▼' : '▶' }}</span>
        </td>
        <td
            v-for="store in stores"
            :key="store"
            class="pivot-table-row px-2 py-3"
        >
            {{ category.storeSums[store] || 0 }}
        </td>
    </tr>
    <tr
        v-if="expanded"
        v-for="(product, productIndex) in sortedProducts"
        :key="product.name"
        :class="{ 'bg-primary-200': expanded }"
    >
        <td
            class="pivot-table-row px-2 py-1 pl-6"
            :class="{
                'expanded-row': expanded,
                'border-b border-b-primary-400': isLastProduct(productIndex)
            }"
        >
            {{ product.name }}
        </td>
        <td
            v-for="store in stores"
            :key="store"
            class="pivot-table-row px-2 py-1"
            :class="{ 'border-b border-b-primary-400': isLastProduct(productIndex) }"
        >
            {{ product.data[store] || 0 }}
        </td>
    </tr>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import type {PivotCategory, PivotProduct, SortState} from '../types/table';

interface SortedProduct {
    name: string;
    data: PivotProduct;
}

const props = defineProps<{
    category: PivotCategory;
    stores: string[];
    sort: SortState;
}>();

// State
const expanded = ref(false);

/**
 * Toggles the state of a value between true and false.
 */
const toggle = (): void => {
    expanded.value = !expanded.value;
}

/**
 * Determines whether the given index corresponds to the last product in the sortedProducts list.
 */
const isLastProduct = (index: number): boolean => {
    return index === sortedProducts.value.length - 1;
}

// Computed properties
const sortedProducts = computed<SortedProduct[]>(() => {
    const products: SortedProduct[] = Object.entries(props.category.products)
        .map(([name, data]) => ({name, data}));

    if (!props.sort.column) {
        return products;
    }

    return [...products].sort((a, b) => {
        const column = props.sort.column as string;
        const aVal = a.data[column] || 0;
        const bVal = b.data[column] || 0;

        if (props.sort.direction === 'asc') return aVal - bVal;
        if (props.sort.direction === 'desc') return bVal - aVal;
        return 0;
    });
});
</script>

<style scoped>
@reference "../style.css";
.expanded-row {
    @apply border-l border-l-primary-400
}

.pivot-table-row {
    @apply border-t border-t-primary-300;
}
</style>