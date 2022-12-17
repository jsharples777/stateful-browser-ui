import {CollectionSortConfig, CollectionSortDirection} from "../ConfigurationTypes";

export class CollectionSorter {
    private readonly sorterConfig: CollectionSortConfig;

    protected useFieldSorter(item1: any, item2: any, fieldId: string, direction: CollectionSortDirection): number {
        let result = 0;
        const field1Value = item1[fieldId];
        const field2Value = item2[fieldId];

        if (field1Value && field2Value) {
            if (field1Value !== field2Value) {
                if (direction === CollectionSortDirection.ascending) {
                    if (field1Value > field2Value) {
                        result = 1;
                    }
                    else {
                        result = -1;
                    }
                }
                if (direction === CollectionSortDirection.descending) {
                    if (field1Value > field2Value) {
                        result = -1;
                    }
                    else {
                        result = 1;
                    }
                }
            }
        }
        else if (field1Value) {
            if (direction === CollectionSortDirection.ascending) {
                result = 1;
            }
            if (direction === CollectionSortDirection.descending) {
                result = -1;
            }
        }
        else if (field2Value) {
            if (direction === CollectionSortDirection.ascending) {
                result = 1;
            }
            if (direction === CollectionSortDirection.descending) {
                result = -1;
            }
        }


        return result;
    }

    public constructor(sorterConfig:CollectionSortConfig) {
        this.sorterConfig = sorterConfig;
        this.sort = this.sort.bind(this);
    }

    protected sort(item1: any, item2: any): number {
        let result = 0;
        if (this.sorterConfig) {
            result = this.useFieldSorter(item1, item2, this.sorterConfig.majorFieldId, this.sorterConfig.majorDirection);
            if (result === 0) {
                if (this.sorterConfig.minorFieldId) {
                    if (this.sorterConfig.minorDirection) {
                        result = this.useFieldSorter(item1, item2, this.sorterConfig.minorFieldId, this.sorterConfig.minorDirection);
                    }
                }
            }
        }
        return result;
    }

    public static sort(collection:any[],config:CollectionSortConfig):any[] {
        const sorter = new CollectionSorter(config);
        return collection.sort(sorter.sort);
    }



}
