import {isSameMongo, StateChangeListener, StateManager} from "browser-state-management";
import {ItemView} from "../view/item/ItemView";



export class ViewLinkerStateChangedListener implements StateChangeListener {
    private view: ItemView;

    constructor(stateManager: StateManager, stateName: string, itemView: ItemView) {
        stateManager.addChangeListenerForName(stateName, this);
        this.view = itemView;
    }

    filterResults(managerName: string, name: string, filterResults: any): void {
    }

    foundResult(managerName: string, name: string, foundItem: any): void {
    }

    getListenerName(): string {
        return "View Linker Listener";
    }

    stateChanged(managerName: string, name: string, newValue: any): void {
    }

    stateChangedItemAdded(managerName: string, name: string, itemAdded: any): void {
    }

    stateChangedItemRemoved(managerName: string, name: string, itemRemoved: any): void {
        const dataObj = this.view.getCurrentDataObj();
        if (dataObj) {
            if (dataObj._id) {
                if (isSameMongo(dataObj, itemRemoved)) {
                    this.view.reset();
                    this.view.setReadOnly();
                }
            }
        }
    }

    stateChangedItemUpdated(managerName: string, name: string, itemUpdated: any, itemNewValue: any): void {
        const dataObj = this.view.getCurrentDataObj();
        if (dataObj) {
            if (dataObj._id) {
                if (isSameMongo(dataObj, itemUpdated)) {
                    this.view.startUpdate(itemNewValue);
                }
            }
        }
    }
}
