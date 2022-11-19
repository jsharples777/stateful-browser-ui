import {AbstractCollectionView} from "./AbstractCollectionView";
import {CollectionViewListener} from "../interface/CollectionViewListener";
import {View} from "../interface/View";
import {CollectionView} from "../interface/CollectionView";

import debug from 'debug';
import {CollectionViewListenerForwarder} from "../delegate/CollectionViewListenerForwarder";
import {CollectionViewDOMConfig} from "../../ConfigurationTypes";
import {
    DataObjectListener,
    ObjectDefinitionRegistry,
    StateChangeListener,
    StateManager
} from "browser-state-management";


const logger = debug('ab-stateful-collection-view');
const loggerEvent = debug('ab-stateful-collection-view-event');

export abstract class AbstractStatefulCollectionView extends AbstractCollectionView implements StateChangeListener, CollectionViewListener {

    protected stateManager: StateManager;
    protected dataListeners: DataObjectListener[] = [];

    protected constructor(uiConfig: CollectionViewDOMConfig, stateManager: StateManager, stateName: string) {
        super(uiConfig, stateName);
        this.stateManager = stateManager;

        // state change listening
        this.stateChanged = this.stateChanged.bind(this);

        // setup state listener
        this.stateManager.addChangeListenerForName(this.collectionName, this);
    }

    public addDataObjectListener(listener: DataObjectListener): void {
        this.dataListeners.push(listener);
    }


    public getItemDescription(from: string, item: any): string {
        return "";
    }

    public hasActionPermission(actionName: string, from: string, item: any): boolean {
        return true;
    }


    public onDocumentLoaded() {
        super.onDocumentLoaded();
        this.addEventCollectionListener(this);
    }

    public getItemInNamedCollection(name: string, compareWith: any): any {
        return this.stateManager.findItemInState(name, compareWith);
    }

    public stateChanged(managerName: string, name: string, newValue: any): void {
        logger(`handling state ${name} changed`);
        logger(newValue);
        (<CollectionViewListenerForwarder>(this.eventForwarder)).collectionChanged(this);
        logger('buffering state on state changed');
        this.setBufferForName(name, newValue);

        this.updateViewForNamedCollection(name, newValue);
    }

    stateChangedItemAdded(managerName: string, name: string, itemAdded: any): void {
        logger(`handling state ${name} new item added`);
        logger(itemAdded);
        if (this.stateManager && this.collectionName && this.viewEl) {
            try {
                this.renderer?.insertDisplayElementForCollectionItem(this.viewEl, name, itemAdded);
                if (this.hasFilter()) {
                    const filter = this.getCurrentFilter();
                    if (filter) this.applyFilter(filter);
                }
            } catch (err) {
                logger(err);
                this.updateViewForNamedCollection(name, this.stateManager.getStateByName(name));
            }
        }
    }

    stateChangedItemRemoved(managerName: string, name: string, itemRemoved: any): void {
        logger(`handling state ${name} new item removed`);
        logger(itemRemoved);
        if (this.stateManager && this.collectionName && this.viewEl) {
            try {
                this.renderer?.removeDisplayElementForCollectionItem(this.viewEl, name, itemRemoved);
            } catch (err) {
                logger(err);
                this.updateViewForNamedCollection(name, this.stateManager.getStateByName(name));
            }
        }
    }

    stateChangedItemUpdated(managerName: string, name: string, itemUpdated: any, itemNewValue: any): void {
        logger(`handling state ${name} new item updated`);
        logger(itemNewValue);
        if (this.stateManager && this.collectionName && this.viewEl) {
            try {
                this.renderer?.updateDisplayElementForCollectionItem(this.viewEl, name, itemNewValue);
                if (this.hasFilter()) {
                    const filter = this.getCurrentFilter();
                    if (filter) this.applyFilter(filter);
                }
            } catch (err) {
                logger(err);
                this.updateViewForNamedCollection(name, this.stateManager.getStateByName(name));
            }
        }
    }

    public getDisplayedCollection(): any[] {
        const currentFullState = this.stateManager.getStateByName(this.collectionName);
        return this.getFilteredState(currentFullState);
    }


    documentLoaded(view: View): void {
    }

    hideRequested(view: View): void {
    }

    itemDragStarted(view: View, selectedItem: any): void {
    }

    itemDropped(view: View, droppedItem: any): void {
    }

    showRequested(view: View): void {
    }

    itemDeselected(view: View, selectedItem: any): void {
    }

    itemSelected(view: View, selectedItem: any): void {
    }

    itemAction(view: View, actionName: string, selectedItem: any): void {
    }

    itemDeleted(view: View, selectedItem: any): void {
        loggerEvent(`Deleting item from state`);
        loggerEvent(selectedItem);
        this.stateManager.removeItemFromState(this.collectionName, selectedItem, false);
    }


    canSelectItem(view: CollectionView, selectedItem: any): boolean {
        return true;
    }

    canDeleteItem(view: View, selectedItem: any): boolean {
        return true;
    }

    getListenerName(): string {
        return this.getName();
    }

    filterResults(managerName: string, name: string, filterResults: any): void {
    }

    foundResult(managerName: string, name: string, foundItem: any): void {
    }

    itemNotModified(managerName: string, name: string, item: any) {
    }

    collectionChanged(view: CollectionView): void {
    }

    setFieldValue(objectId: string, fieldId: string, value: any): void {
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
                    this.dataListeners.forEach((listener) => listener.update(null, this.collectionName, dataObj))
                }
            }
        }

    }


}
