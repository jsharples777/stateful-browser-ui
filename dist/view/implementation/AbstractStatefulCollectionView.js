import { AbstractCollectionView } from "./AbstractCollectionView";
import debug from 'debug';
import { ObjectDefinitionRegistry } from "browser-state-management";
const logger = debug('ab-stateful-collection-view');
const loggerEvent = debug('ab-stateful-collection-view-event');
export class AbstractStatefulCollectionView extends AbstractCollectionView {
    constructor(uiConfig, stateManager, stateName) {
        super(uiConfig, stateName);
        this.dataListeners = [];
        this.stateManager = stateManager;
        // state change listening
        this.stateChanged = this.stateChanged.bind(this);
        // setup state listener
        this.stateManager.addChangeListenerForName(this.collectionName, this);
    }
    addDataObjectListener(listener) {
        this.dataListeners.push(listener);
    }
    getItemDescription(from, item) {
        return "";
    }
    hasActionPermission(actionName, from, item) {
        return true;
    }
    onDocumentLoaded() {
        super.onDocumentLoaded();
        this.addEventCollectionListener(this);
    }
    getItemInNamedCollection(name, compareWith) {
        return this.stateManager.findItemInState(name, compareWith);
    }
    stateChanged(managerName, name, newValue) {
        logger(`handling state ${name} changed`);
        logger(newValue);
        (this.eventForwarder).collectionChanged(this);
        logger('buffering state on state changed');
        this.setBufferForName(name, newValue);
        this.updateViewForNamedCollection(name, newValue);
    }
    stateChangedItemAdded(managerName, name, itemAdded) {
        var _a;
        logger(`handling state ${name} new item added`);
        logger(itemAdded);
        if (this.stateManager && this.collectionName && this.viewEl) {
            try {
                (_a = this.renderer) === null || _a === void 0 ? void 0 : _a.insertDisplayElementForCollectionItem(this.viewEl, name, itemAdded);
                if (this.hasFilter()) {
                    const filter = this.getCurrentFilter();
                    if (filter)
                        this.applyFilter(filter);
                }
            }
            catch (err) {
                logger(err);
                this.updateViewForNamedCollection(name, this.stateManager.getStateByName(name));
            }
        }
    }
    stateChangedItemRemoved(managerName, name, itemRemoved) {
        var _a;
        logger(`handling state ${name} new item removed`);
        logger(itemRemoved);
        if (this.stateManager && this.collectionName && this.viewEl) {
            try {
                (_a = this.renderer) === null || _a === void 0 ? void 0 : _a.removeDisplayElementForCollectionItem(this.viewEl, name, itemRemoved);
            }
            catch (err) {
                logger(err);
                this.updateViewForNamedCollection(name, this.stateManager.getStateByName(name));
            }
        }
    }
    stateChangedItemUpdated(managerName, name, itemUpdated, itemNewValue) {
        var _a;
        logger(`handling state ${name} new item updated`);
        logger(itemNewValue);
        if (this.stateManager && this.collectionName && this.viewEl) {
            try {
                (_a = this.renderer) === null || _a === void 0 ? void 0 : _a.updateDisplayElementForCollectionItem(this.viewEl, name, itemNewValue);
                if (this.hasFilter()) {
                    const filter = this.getCurrentFilter();
                    if (filter)
                        this.applyFilter(filter);
                }
            }
            catch (err) {
                logger(err);
                this.updateViewForNamedCollection(name, this.stateManager.getStateByName(name));
            }
        }
    }
    getDisplayedCollection() {
        const currentFullState = this.stateManager.getStateByName(this.collectionName);
        return this.getFilteredState(currentFullState);
    }
    documentLoaded(view) {
    }
    hideRequested(view) {
    }
    itemDragStarted(view, selectedItem) {
    }
    itemDropped(view, droppedItem) {
    }
    showRequested(view) {
    }
    itemDeselected(view, selectedItem) {
    }
    itemSelected(view, selectedItem) {
    }
    itemAction(view, actionName, selectedItem) {
    }
    itemDeleted(view, selectedItem) {
        loggerEvent(`Deleting item from state`);
        loggerEvent(selectedItem);
        this.stateManager.removeItemFromState(this.collectionName, selectedItem, false);
    }
    canSelectItem(view, selectedItem) {
        return true;
    }
    canDeleteItem(view, selectedItem) {
        return true;
    }
    getListenerName() {
        return this.getName();
    }
    filterResults(managerName, name, filterResults) {
    }
    foundResult(managerName, name, foundItem) {
    }
    itemNotModified(managerName, name, item) {
    }
    collectionChanged(view) {
    }
    setFieldValue(objectId, fieldId, value) {
        loggerEvent(`handling set field value for object ${objectId} with field ${fieldId} and value ${value}`);
        const def = ObjectDefinitionRegistry.getInstance().findDefinition(this.collectionName);
        if (def) {
            let foundIndex = def.fields.findIndex((field) => field.isKey === true);
            if (foundIndex >= 0) {
                const field = def.fields[foundIndex];
                loggerEvent(`handling set field value for object ${objectId} with field ${fieldId} and value ${value}, key field is ${field.id}`);
                let searchObj = {};
                // @ts-ignore
                searchObj[field.id] = objectId;
                const dataObj = this.stateManager.findItemInState(this.collectionName, searchObj);
                if (dataObj) {
                    dataObj[fieldId] = value;
                    this.dataListeners.forEach((listener) => listener.update(null, this.collectionName, dataObj));
                }
            }
        }
    }
}
//# sourceMappingURL=AbstractStatefulCollectionView.js.map