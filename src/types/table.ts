export interface RawDataItem {
    category: string;
    product: string;
    store: string;
    pcs: number;
}

export interface PivotProduct {
    [store: string]: number;
}

export interface PivotCategory {
    name: string;
    products: {
        [product: string]: PivotProduct;
    };
    storeSums: {
        [store: string]: number;
    };
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
    column: string | null;
    direction: SortDirection;
}