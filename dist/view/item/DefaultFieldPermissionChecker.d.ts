import { ViewFieldPermissionChecker } from "../ViewFieldPermissionChecker";
import { Field } from "browser-state-management";
export declare class DefaultFieldPermissionChecker implements ViewFieldPermissionChecker {
    hasPermissionToDeleteItem(item: any): boolean;
    hasPermissionToEditField(dataObj: any, field: Field): boolean;
    hasPermissionToUpdateItem(item: any): boolean;
}
