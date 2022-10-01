import { ViewFieldPermissionChecker } from "../view/ViewFieldPermissionChecker";
import { DefaultItemView } from "../view/item/DefaultItemView";
import { ItemViewConfigHelper } from "../view/item/ItemViewConfigHelper";
import { DataObjectDefinition } from "browser-state-management";
export declare class BasicFormImplementation extends DefaultItemView {
    constructor(containerId: string, dataObjDef: DataObjectDefinition, configHelper: ItemViewConfigHelper, permissionChecker: ViewFieldPermissionChecker, hasExternalControl?: boolean);
}
