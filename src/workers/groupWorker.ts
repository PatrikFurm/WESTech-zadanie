import type { PivotCategory, RawDataItem } from '../types/table';

/**
 * Message handler for the web worker
 * Processes raw data and returns categorized data with a store list
 */
self.onmessage = (e: MessageEvent<RawDataItem[]>) => {
    const rawData = e.data;
    const categorizedData = groupData(rawData);
    const uniqueStores = extractUniqueStores(rawData);

    self.postMessage({
        result: categorizedData,
        stores: uniqueStores
    });
};

/**
 * Extracts a unique list of stores from the raw data
 */
const extractUniqueStores = (data: RawDataItem[]): string[] => {
    return Array.from(new Set(data.map(item => item.store)));
}

/**
 * Initializes a category if it doesn't exist in the map
 */
const initializeCategory = (categoryMap: Record<string, PivotCategory>, categoryName: string): void => {
    if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = {
            name: categoryName,
            products: {},
            storeSums: {}
        };
    }
}

/**
 * Initializes a product if it doesn't exist in the category
 */
const initializeProduct = (category: PivotCategory, productName: string): void => {
    if (!category.products[productName]) {
        category.products[productName] = {};
    }
}

/**
 * Initializes store values in both product and category if they don't exist
 */
const initializeStoreValues = (category: PivotCategory, productName: string, storeName: string): void => {
    const product = category.products[productName];

    if (!product[storeName]) {
        product[storeName] = 0;
    }

    if (!category.storeSums[storeName]) {
        category.storeSums[storeName] = 0;
    }
}

/**
 * Groups raw data items into categories with product and store information
 */
const groupData = (data: RawDataItem[]): PivotCategory[] => {
    const categoryMap: Record<string, PivotCategory> = {};

    data.forEach(item => {
        const { category, product, store, pcs } = item;

        // Initialize data structures if they don't exist
        initializeCategory(categoryMap, category);
        initializeProduct(categoryMap[category], product);
        initializeStoreValues(categoryMap[category], product, store);

        // Update quantities
        categoryMap[category].products[product][store] += pcs;
        categoryMap[category].storeSums[store] += pcs;
    });

    return Object.values(categoryMap);
}

// Export the worker with proper typing
export default null as unknown;