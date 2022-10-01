import debug from 'debug';
import {CollectionView} from "../interface/CollectionView";
import {CollectionViewListener} from "../interface/CollectionViewListener";
import {AbstractCollectionView} from "./AbstractCollectionView";
import {CollectionViewListenerForwarder} from "../delegate/CollectionViewListenerForwarder";
import {View} from "../interface/View";
import {CollectionViewDOMConfig} from "../../ConfigurationTypes";
import {DataObject, StateChangeListener, StateManager} from "browser-state-management";
import {DataObjectFactory} from "browser-state-management/dist/model/DataObjectFactory";


const logger = debug('data-object-collection-view');

export class DataObjectCollectionView extends AbstractCollectionView implements StateChangeListener, CollectionViewListener {
    protected stateManager: StateManager;

    protected constructor(uiConfig: CollectionViewDOMConfig, stateManager: StateManager, stateName: string) {
        super(uiConfig, stateName);
        this.stateManager = stateManager;

        // state change listening
        this.stateChanged = this.stateChanged.bind(this);

        // setup state listener
        this.stateManager.addChangeListenerForName(this.collectionName, this);
    }

    setFieldValue(objectId: string, fieldId: string, value: any): void {
        throw new Error('Method not implemented.');
    }

    public getDisplayedCollection(): any[] {
        return [];
        //TODO
    }

    getIdForItemInNamedCollection(name: string, item: DataObject): string {
        return item.getUniqueId();
    }

    renderDisplayForItemInNamedCollection(containerEl: HTMLElement, name: string, item: DataObject): void {
        throw item.getDescription();
    }

    public getItemDescription(from: string, item: DataObject): string {
        return item.getDescription();
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
        this.updateViewForNamedCollection(name, newValue);
    }

    stateChangedItemAdded(managerName: string, name: string, itemAdded: any): void {
        logger(`handling state ${name} new item added`);
        logger(itemAdded);
        if (this.stateManager && this.collectionName) this.updateViewForNamedCollection(name, this.stateManager.getStateByName(name));
    }

    stateChangedItemRemoved(managerName: string, name: string, itemRemoved: any): void {
        logger(`handling state ${name} new item removed`);
        logger(itemRemoved);
        if (this.stateManager && this.collectionName) this.updateViewForNamedCollection(name, this.stateManager.getStateByName(name));
    }

    stateChangedItemUpdated(managerName: string, name: string, itemUpdated: any, itemNewValue: any): void {
        logger(`handling state ${name} new item updated`);
        logger(itemNewValue);
        if (this.stateManager && this.collectionName) this.updateViewForNamedCollection(name, this.stateManager.getStateByName(name));
    }

    render(): void {
        this.updateViewForNamedCollection(this.collectionName, this.stateManager.getStateByName(this.collectionName))
    }

    show(): void {
    }

    hide(): void {
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

    collectionChanged(view: CollectionView): void {
    }

    updateViewForNamedCollection(name: string, newState: any) {
        /*
        Convert the state into data objects
         */
        const dataObjs: DataObject[] = DataObjectFactory.getInstance().createDataObjectsFromStateNameAndData(name, newState, true);

        super.updateViewForNamedCollection(name, dataObjs);
    }


}
