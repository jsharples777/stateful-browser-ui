export class ViewListenerForwarder {
    constructor() {
        this.suppressEventEmits = false;
        this.viewListeners = [];
    }
    addListener(listener) {
        this.viewListeners.push(listener);
    }
    suppressEvents() {
        this.suppressEventEmits = true;
    }
    emitEvents() {
        this.suppressEventEmits = false;
    }
    itemDeleted(view, selectedItem, target) {
        if (!this.suppressEventEmits) {
            this.viewListeners.forEach((listener) => listener.itemDeleted(view, selectedItem, target));
        }
    }
    documentLoaded(view) {
        if (!this.suppressEventEmits) {
            this.viewListeners.forEach((listener) => listener.documentLoaded(view));
        }
    }
    itemAction(view, actionName, selectedItem, target) {
        if (!this.suppressEventEmits) {
            this.viewListeners.forEach((listener) => listener.itemAction(view, actionName, selectedItem, target));
        }
    }
    canDeleteItem(view, selectedItem) {
        let result = true; // return false if cancelling delete
        if (!this.suppressEventEmits) {
            this.viewListeners.forEach((listener) => {
                if (!(listener.canDeleteItem(view, selectedItem))) {
                    result = false;
                }
            });
        }
        return result;
    }
    hideRequested(view) {
        if (!this.suppressEventEmits) {
            this.viewListeners.forEach((listener) => listener.hideRequested(view));
        }
    }
    showRequested(view) {
        if (!this.suppressEventEmits) {
            this.viewListeners.forEach((listener) => listener.showRequested(view));
        }
    }
    itemDropped(view, droppedItem) {
        if (!this.suppressEventEmits) {
            this.viewListeners.forEach((listener) => listener.itemDropped(view, droppedItem));
        }
    }
}
//# sourceMappingURL=ViewListenerForwarder.js.map