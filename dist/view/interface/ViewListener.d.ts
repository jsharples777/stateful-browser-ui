import { View } from "./View";
export interface ViewListener {
    documentLoaded(view: View): void;
    hideRequested(view: View): void;
    showRequested(view: View): void;
    itemDropped(view: View, droppedItem: any): void;
    canDeleteItem(view: View, selectedItem: any): boolean;
    itemDeleted(view: View, selectedItem: any, target?: EventTarget | null): void;
    itemAction(view: View, actionName: string, selectedItem: any, target?: EventTarget | null): void;
}
