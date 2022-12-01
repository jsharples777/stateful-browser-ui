import { CollectionSortConfig, CollectionSortDirection } from "../ConfigurationTypes";
export declare class CollectionSorter {
    private readonly sorterConfig;
    protected useFieldSorter(item1: any, item2: any, fieldId: string, direction: CollectionSortDirection): number;
    constructor(sorterConfig: CollectionSortConfig);
    protected sort(item1: any, item2: any): number;
    static sort(collection: any[], config: CollectionSortConfig): any[];
}
