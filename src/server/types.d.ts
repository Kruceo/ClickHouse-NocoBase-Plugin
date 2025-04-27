interface LocalDataItem {
    key?: string;
    name: string;
    dataSourceKey?: string;
    filterTargetKey?: any[]; // substitua 'any' por um tipo mais específico se souber
    title?: string;
    fields: any[]; // substitua 'any' por um tipo mais específico se souber
}

interface LoadDataSourceOptions {
    localData: {
        [key: string]: LocalDataItem;
    };
    refresh?: boolean; // substitua 'any' se souber o tipo exato
}