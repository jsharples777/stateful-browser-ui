import { CollectionViewListener } from "../interface/CollectionViewListener";
import { CollectionViewDOMConfig } from "../../ConfigurationTypes";
import { DataObject, StateChangeListener, StateManager } from "browser-state-management";
import { AbstractStatefulCollectionView } from "./AbstractStatefulCollectionView";
export declare class DataObjectCollectionView extends AbstractStatefulCollectionView implements StateChangeListener, CollectionViewListener {
    protected currentObjects: DataObject[];
    protected constructor(uiConfig: CollectionViewDOMConfig, stateManager: StateManager, stateName: string);
    getDataObject(id: string): DataObject | null;
    protected removeDataObject(dataObj: DataObject): void;
    protected updateDataObject(dataObj: DataObject): void;
    protected addDataObject(dataObj: DataObject): void;
    setFieldValue(objectId: string, fieldId: string, value: any): void;
    stateChangedItemAdded(managerName: string, name: string, itemAdded: any): void;
    stateChangedItemRemoved(managerName: string, name: string, itemRemoved: any): void;
    stateChangedItemUpdated(managerName: string, name: string, itemUpdated: any, itemNewValue: any): void;
    getIdForItemInNamedCollection(name: string, item: DataObject): string;
    renderDisplayForItemInNamedCollection(containerEl: HTMLElement, name: string, item: DataObject): void;
    getItemDescription(from: string, item: DataObject): string;
    updateViewForNamedCollection(name: string, newState: any): void;
}
