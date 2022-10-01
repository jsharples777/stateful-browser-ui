import { ObjectPermissionChecker } from "../interface/ObjectPermissionChecker";
export declare class DefaultPermissionChecker implements ObjectPermissionChecker {
    hasPermissionToUpdateItem(item: any): boolean;
    hasPermissionToDeleteItem(item: any): boolean;
}
