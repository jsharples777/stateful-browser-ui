import debug from 'debug';
import { AbstractCollectionView } from "./AbstractCollectionView";
import { DataObjectFactory } from "browser-state-management/dist/model/DataObjectFactory";
const logger = debug('data-object-collection-view');
export class DataObjectCollectionView extends AbstractCollectionView {
    constructor(uiConfig, stateManager, stateName) {
        super(uiConfig, stateName);
        this.stateManager = stateManager;
        // state change listening
        this.stateChanged = this.stateChanged.bind(this);
        // setup state listener
        this.stateManager.addChangeListenerForName(this.collectionName, this);
    }
    setFieldValue(objectId, fieldId, value) {
        throw new Error('Method not implemented.');
    }
    getDisplayedCollection() {
        return [];
        //TODO
    }
    getIdForItemInNamedCollection(name, item) {
        return item.getUniqueId();
    }
    renderDisplayForItemInNamedCollection(containerEl, name, item) {
        throw item.getDescription();
    }
    getItemDescription(from, item) {
        return item.getDescription();
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
        this.updateViewForNamedCollection(name, newValue);
    }
    stateChangedItemAdded(managerName, name, itemAdded) {
        logger(`handling state ${name} new item added`);
        logger(itemAdded);
        if (this.stateManager && this.collectionName)
            this.updateViewForNamedCollection(name, this.stateManager.getStateByName(name));
    }
    stateChangedItemRemoved(managerName, name, itemRemoved) {
        logger(`handling state ${name} new item removed`);
        logger(itemRemoved);
        if (this.stateManager && this.collectionName)
            this.updateViewForNamedCollection(name, this.stateManager.getStateByName(name));
    }
    stateChangedItemUpdated(managerName, name, itemUpdated, itemNewValue) {
        logger(`handling state ${name} new item updated`);
        logger(itemNewValue);
        if (this.stateManager && this.collectionName)
            this.updateViewForNamedCollection(name, this.stateManager.getStateByName(name));
    }
    render() {
        this.updateViewForNamedCollection(this.collectionName, this.stateManager.getStateByName(this.collectionName));
    }
    show() {
    }
    hide() {
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
    collectionChanged(view) {
    }
    updateViewForNamedCollection(name, newState) {
        /*
        Convert the state into data objects
         */
        const dataObjs = DataObjectFactory.getInstance().createDataObjectsFromStateNameAndData(name, newState, true);
        super.updateViewForNamedCollection(name, dataObjs);
    }
}
//# sourceMappingURL=DataObjectCollectionView.js.map