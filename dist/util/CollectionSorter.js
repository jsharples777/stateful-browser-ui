import { CollectionSortDirection } from "../ConfigurationTypes";
export class CollectionSorter {
    constructor(sorterConfig) {
        this.sorterConfig = sorterConfig;
        this.sort = this.sort.bind(this);
    }
    useFieldSorter(item1, item2, fieldId, direction) {
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
    sort(item1, item2) {
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
    static sort(collection, config) {
        const sorter = new CollectionSorter(config);
        return collection.sort(sorter.sort);
    }
}
//# sourceMappingURL=CollectionSorter.js.map