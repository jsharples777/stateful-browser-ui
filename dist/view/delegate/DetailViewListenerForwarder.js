import { ViewListenerForwarder } from "./ViewListenerForwarder";
export class DetailViewListenerForwarder extends ViewListenerForwarder {
    constructor() {
        super();
        this.detailViewListeners = [];
    }
    addListener(listener) {
        super.addListener(listener);
        this.detailViewListeners.push(listener);
    }
    saveNewItem(view, dataObj) {
        if (!this.suppressEventEmits) {
            this.detailViewListeners.forEach((listener) => listener.saveNewItem(view, dataObj));
        }
    }
    updateItem(view, dataObj) {
        if (!this.suppressEventEmits) {
            this.detailViewListeners.forEach((listener) => listener.updateItem(view, dataObj));
        }
    }
    deletedItem(view, dataObj) {
        if (!this.suppressEventEmits) {
            this.detailViewListeners.forEach((listener) => listener.deletedItem(view, dataObj));
        }
    }
    cancelled(view, dataObj) {
        if (!this.suppressEventEmits) {
            this.detailViewListeners.forEach((listener) => listener.cancelled(view, dataObj));
        }
    }
}
//# sourceMappingURL=DetailViewListenerForwarder.js.map