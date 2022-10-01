import { ViewListenerForwarder } from "./ViewListenerForwarder";
export class CollectionViewListenerForwarder extends ViewListenerForwarder {
    constructor() {
        super();
        this.collectionViewListeners = [];
    }
    addListener(listener) {
        super.addListener(listener);
        this.collectionViewListeners.push(listener);
    }
    itemDragStarted(view, selectedItem) {
        if (!this.suppressEventEmits) {
            this.collectionViewListeners.forEach((listener) => listener.itemDragStarted(view, selectedItem));
        }
    }
    itemSelected(view, selectedItem) {
        if (!this.suppressEventEmits) {
            this.collectionViewListeners.forEach((listener) => listener.itemSelected(view, selectedItem));
        }
    }
    itemDeselected(view, deselectedItem) {
        if (!this.suppressEventEmits) {
            this.collectionViewListeners.forEach((listener) => listener.itemDeselected(view, deselectedItem));
        }
    }
    canSelectItem(view, selectedItem) {
        let result = true; // return false if cancelling delete
        if (!this.suppressEventEmits) {
            this.collectionViewListeners.forEach((listener) => {
                if (!(listener.canSelectItem(view, selectedItem))) {
                    result = false;
                }
            });
        }
        return result;
    }
    collectionChanged(view) {
        if (!this.suppressEventEmits) {
            this.collectionViewListeners.forEach((listener) => listener.collectionChanged(view));
        }
    }
}
//# sourceMappingURL=CollectionViewListenerForwarder.js.map