import {ViewFieldPermissionChecker} from "../ViewFieldPermissionChecker";
import {Field} from "browser-state-management";


export class DefaultFieldPermissionChecker implements ViewFieldPermissionChecker {
    hasPermissionToDeleteItem(item: any): boolean {
        return true;
    }

    hasPermissionToEditField(dataObj: any, field: Field): boolean {
        return true;
    }

    hasPermissionToUpdateItem(item: any): boolean {
        return true;
    }

}
