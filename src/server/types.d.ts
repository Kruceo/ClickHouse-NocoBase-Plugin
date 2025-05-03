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

type FilterOperators =
    | "$gt"
    | "$lt"
    | "$lte"
    | "$gte"
    | "$eq"
    | "$ne"
    | "$includes"
    | "$notIncludes"
    | "$empty"
    | "$notEmpty"
    | "$dateOn"
    | "$dateNotOn"
    | "$dateBefore"
    | "$dateAfter"
    | "$dateNotBefore"
    | "$dateNotAfter"
    | "$in"
    | "$notIn"
    | "$isTruly"
    | "$isFalsy"
    | "$dateBetween";


interface Filter {
    [key: "$AND" | "$OR"]: {
        [key: string]: {
            [key: FilterOperators]: string | number
        }
    } | Filter
}

interface QueryOptions {
    limit: number, offset: number, sort?: string[], filter: Filter
}

interface SpecificTargetQueryOptions {
    filterByTk: Record<string, string | string[]> | Record<string, string | string[]>[]
}