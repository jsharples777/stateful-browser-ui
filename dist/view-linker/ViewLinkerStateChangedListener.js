import { isSameMongo } from "browser-state-management";
export class ViewLinkerStateChangedListener {
    constructor(stateManager, stateName, itemView) {
        stateManager.addChangeListenerForName(stateName, this);
        this.view = itemView;
    }
    filterResults(managerName, name, filterResults) {
    }
    foundResult(managerName, name, foundItem) {
    }
    getListenerName() {
        return "View Linker Listener";
    }
    stateChanged(managerName, name, newValue) {
    }
    stateChangedItemAdded(managerName, name, itemAdded) {
    }
    stateChangedItemRemoved(managerName, name, itemRemoved) {
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
    stateChangedItemUpdated(managerName, name, itemUpdated, itemNewValue) {
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
//# sourceMappingURL=ViewLinkerStateChangedListener.js.map