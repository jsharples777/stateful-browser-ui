import { StateChangeListener, StateManager } from "browser-state-management";
import { ItemView } from "../view/item/ItemView";
export declare class ViewLinkerStateChangedListener implements StateChangeListener {
    private view;
    constructor(stateManager: StateManager, stateName: string, itemView: ItemView);
    filterResults(managerName: string, name: string, filterResults: any): void;
    foundResult(managerName: string, name: string, foundItem: any): void;
    getListenerName(): string;
    stateChanged(managerName: string, name: string, newValue: any): void;
    stateChangedItemAdded(managerName: string, name: string, itemAdded: any): void;
    stateChangedItemRemoved(managerName: string, name: string, itemRemoved: any): void;
    stateChangedItemUpdated(managerName: string, name: string, itemUpdated: any, itemNewValue: any): void;
}
