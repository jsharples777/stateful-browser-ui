import { FieldDefinition } from "browser-state-management";
import { CollectionSortDirection } from "../../ConfigurationTypes";
import { BasicElement, FieldUIConfig } from "../../CommonTypes";
export declare type TableHeaderConfig = {
    field?: FieldDefinition;
    element: BasicElement;
    displayOrder: number;
    sortDirection: CollectionSortDirection;
};
export declare type TableUIConfig = {
    id: string;
    displayName: string;
    container?: BasicElement;
    table: BasicElement;
    header: BasicElement;
    body: BasicElement;
    headerColumns: TableHeaderConfig[];
    columns: FieldUIConfig[];
    itemDetailColumn: number;
    actionColumn?: TableHeaderConfig;
    editableFields?: string[];
    lazyLoadPageSize?: number;
    sortableTableHeaders?: string[];
};
