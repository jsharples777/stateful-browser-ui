import { ViewListener } from "../interface/ViewListener";
import { View } from "../interface/View";
export declare class ViewListenerForwarder {
    protected viewListeners: ViewListener[];
    protected suppressEventEmits: boolean;
    constructor();
    addListener(listener: ViewListener): void;
    suppressEvents(): void;
    emitEvents(): void;
    itemDeleted(view: View, selectedItem: any, target?: EventTarget | null): void;
    documentLoaded(view: View): void;
    itemAction(view: View, actionName: string, selectedItem: any, target?: EventTarget | null): void;
    canDeleteItem(view: View, selectedItem: any): boolean;
    hideRequested(view: View): void;
    showRequested(view: View): void;
    itemDropped(view: View, droppedItem: any): void;
}
