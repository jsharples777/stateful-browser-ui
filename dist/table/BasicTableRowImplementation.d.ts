import { DefaultItemView } from "../view/item/DefaultItemView";
import { ItemViewConfigHelper } from "../view/item/ItemViewConfigHelper";
import { ViewFieldPermissionChecker } from "../view/ViewFieldPermissionChecker";
import { ItemFactoryResponse } from "../factory/ItemViewElementFactory";
import { DataObjectDefinition, Field, FieldDefinition, ValidatableView } from "browser-state-management";
export declare class BasicTableRowImplementation extends DefaultItemView {
    protected idField: string;
    constructor(idField: string, containerId: string, dataObjDef: DataObjectDefinition, configHelper: ItemViewConfigHelper, permissionChecker: ViewFieldPermissionChecker, hasExternalControl?: boolean);
    valueChanged(view: ValidatableView, field: Field, fieldDef: FieldDefinition, newValue: string | null): void;
    getRowElement(): HTMLTableRowElement | null;
    protected __buildUIElements(): void;
    protected __getFactoryElements(): ItemFactoryResponse;
    protected buildTableRowElements(): void;
    protected __preDisplayCurrentDataObject(dataObj: any): void;
    protected _hidden(): void;
}
