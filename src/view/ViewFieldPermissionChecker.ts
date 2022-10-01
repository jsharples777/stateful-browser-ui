import {ObjectPermissionChecker} from "./interface/ObjectPermissionChecker";
import {Field} from "browser-state-management";

export interface ViewFieldPermissionChecker extends ObjectPermissionChecker {
    hasPermissionToEditField(dataObj: any, field: Field): boolean;
}
