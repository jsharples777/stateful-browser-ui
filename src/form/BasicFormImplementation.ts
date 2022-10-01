import {ViewFieldPermissionChecker} from "../view/ViewFieldPermissionChecker";
import {DefaultItemView} from "../view/item/DefaultItemView";
import {ItemViewConfigHelper} from "../view/item/ItemViewConfigHelper";
import {DataObjectDefinition} from "browser-state-management";

export class BasicFormImplementation extends DefaultItemView {

    public constructor(containerId: string, dataObjDef: DataObjectDefinition, configHelper: ItemViewConfigHelper, permissionChecker: ViewFieldPermissionChecker, hasExternalControl: boolean = false) {
        super(containerId, dataObjDef, configHelper, permissionChecker, hasExternalControl);
    }

}
