import { View } from "./View";
import { DetailViewRuntimeConfig } from "../../ConfigurationTypes";
export interface DetailView extends View {
    createItem(dataObj: any | null): any;
    displayItem(dataObj: any): void;
    hasPermissionToDeleteItem(dataObj: any): boolean;
    hasPermissionToUpdateItem(dataObj: any): boolean;
    setReadOnly(): void;
    clearReadOnly(): void;
    isReadOnly(): boolean;
    handleActionItem(actionName: string, selectedItem: any): void;
    isDisplayingItem(dataObj: any): boolean;
    initialise(runtimeConfig: DetailViewRuntimeConfig): void;
}
