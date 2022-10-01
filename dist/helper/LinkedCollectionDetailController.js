import debug from 'debug';
import { AlertType } from "../alert/AlertListener";
import { AlertManager } from "../alert/AlertManager";
import { DataObjectController } from "browser-state-management";
const logger = debug('linked-controller');
const dlogger = debug('linked-controller-detail');
class ChildViewListenerDelegate {
    constructor(controller) {
        this.controller = controller;
    }
    addView(view) {
        view.addEventListener(this);
    }
    canDeleteItem(view, selectedItem) {
        return true;
    }
    documentLoaded(view) {
    }
    hideRequested(view) {
    }
    itemAction(view, actionName, selectedItem) {
    }
    itemDeleted(view, selectedItem) {
    }
    itemDropped(view, droppedItem) {
    }
    showRequested(view) {
    }
    cancelled(view, dataObj) {
        this.controller.cancelled(view, dataObj);
    }
    deletedItem(view, dataObj) {
        this.controller.deletedItem(view, dataObj);
    }
    saveNewItem(view, dataObj) {
        this.controller.saveNewItem(view, dataObj);
    }
    updateItem(view, dataObj) {
        this.controller.updateItem(view, dataObj);
    }
}
export class ChangeDataObjectDelegate {
    constructor(callback) {
        this.callback = callback;
    }
    shouldDiscardChanges() {
        AlertManager.getInstance().startAlert(this, 'Discard Changes', 'There are unsaved changes.  Discard?', {});
    }
    alertCompleted(event) {
        if (event.outcome === AlertType.confirmed) {
            this.callback();
        }
    }
}
export class LinkedCollectionDetailController extends DataObjectController {
    constructor(typeName, parentView) {
        super(typeName);
        this.children = [];
        logger(`Starting with parent view ${parentView.getName()}`);
        this.parentView = parentView;
        this.delegate = new ChildViewListenerDelegate(this);
        this.parentView.addEventListener(this);
    }
    collectionChanged(view) {
        this.children.forEach((childView) => {
            childView.clearDisplay();
            childView.setReadOnly();
        });
    }
    addLinkedDetailView(childView) {
        logger(`Adding child view ${childView.getName()}`);
        this.children.push(childView);
        this.delegate.addView(childView); // this delegate will only pass us the unique detail view events (save, new, etc)
    }
    initialise() {
    }
    canDeleteItem(view, selectedItem) {
        logger(`Handling delete item from view ${view.getName()}`);
        dlogger(selectedItem);
        return this.parentView.hasPermissionToDeleteItemInNamedCollection('', selectedItem);
    }
    documentLoaded(view) {
        logger(`Handling document loaded view ${view.getName()}`);
        // let the children know
        this.children.forEach((childView) => {
            childView.onDocumentLoaded();
        });
    }
    hideRequested(view) {
        // let the children know
        logger(`Handling hide  from view ${view.getName()}`);
        this.children.forEach((childView) => {
            childView.hide();
        });
    }
    itemAction(view, actionName, selectedItem) {
        logger(`Handling item action ${actionName} from view ${view.getName()}`);
        dlogger(selectedItem);
        this.children.forEach((childView) => {
            childView.handleActionItem(actionName, selectedItem);
        });
    }
    itemDeleted(view, selectedItem) {
        logger(`Handling item deleted from view ${view.getName()}`);
        dlogger(selectedItem);
        this.children.forEach((childView) => {
            // clear the child display and set readonly
            childView.clearDisplay();
            childView.setReadOnly();
        });
    }
    itemDeselected(view, selectedItem) {
        logger(`Handling item deselected from view ${view.getName()}`);
        dlogger(selectedItem);
        this.children.forEach((childView) => {
            // clear the child display and set readonly
            childView.clearDisplay();
            childView.setReadOnly();
        });
    }
    itemDragStarted(view, selectedItem) {
    }
    itemDropped(view, droppedItem) {
    }
    itemSelected(view, selectedItem) {
        logger(`Handling item selected from view ${view.getName()}`);
        dlogger(selectedItem);
        this.children.forEach((childView) => {
            childView.displayItem(selectedItem);
        });
    }
    showRequested(view) {
        logger(`Handling show from view ${view.getName()}`);
        // let the children know
        this.children.forEach((childView) => {
            childView.show();
        });
    }
    canSelectItem(view, selectedItem) {
        logger(`Handling can select item from view ${view.getName()}`);
        dlogger(selectedItem);
        // are we currently in the middle of creating a new object?
        if (this.isCreatingNew)
            return false;
        // prevent selection if the children views have modified this item
        let canProceedWithSelection = true;
        this.children.forEach((childView) => {
            if (childView.hasChanged()) {
                dlogger(`child view ${childView.getName()} has changed - cancelling`);
                canProceedWithSelection = false;
            }
        });
        if (!canProceedWithSelection) {
            canProceedWithSelection = confirm(`${view.getName()} - unsaved changes.  Discard them?`);
        }
        return canProceedWithSelection;
    }
    cancelled(view, dataObj) {
        logger(`Handling cancelled from child view ${view.getName()}`);
        dlogger(dataObj);
        this.isCreatingNew = false;
    }
    deletedItem(view, dataObj) {
        logger(`Handling deleted from child view ${view.getName()}`);
        dlogger(dataObj);
        this.informListenersOfDelete(dataObj);
    }
    saveNewItem(view, dataObj) {
        logger(`Handling save new from child view ${view.getName()}`);
        dlogger(dataObj);
        this.informListenersOfCreate(dataObj);
    }
    updateItem(view, dataObj) {
        logger(`Handling update from child view ${view.getName()}`);
        dlogger(dataObj);
        this.informListenersOfUpdate(dataObj);
    }
    _startNewObject(startingDataObj) {
        logger(`Handling start new object`);
        // assume the first detail view will create the object for us
        let canProceedWithCreateNew = true;
        this.children.forEach((childView) => {
            if (childView.hasChanged()) {
                dlogger(`child view ${childView.getName()} has changed - cancelling`);
                canProceedWithCreateNew = false;
            }
        });
        if (!canProceedWithCreateNew) {
            canProceedWithCreateNew = confirm(`There are unsaved changes.  Discard them?`);
        }
        if (this.children.length > 0) {
            logger(`Handling start new object with child view ${this.children[0].getName()}`);
            let dataObj = this.children[0].createItem(startingDataObj);
            if (dataObj) {
                canProceedWithCreateNew = true;
                this.children[0].show();
            }
        }
        return canProceedWithCreateNew;
    }
}
//# sourceMappingURL=LinkedCollectionDetailController.js.map