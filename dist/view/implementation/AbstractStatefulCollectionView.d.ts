import { AbstractCollectionView } from "./AbstractCollectionView";
import { CollectionViewListener } from "../interface/CollectionViewListener";
import { View } from "../interface/View";
import { CollectionView } from "../interface/CollectionView";
import { CollectionViewDOMConfig } from "../../ConfigurationTypes";
import { DataObjectListener, StateChangeListener, StateManager } from "browser-state-management";
export declare abstract class AbstractStatefulCollectionView extends AbstractCollectionView implements StateChangeListener, CollectionViewListener {
    protected stateManager: StateManager;
    protected dataListeners: DataObjectListener[];
    protected constructor(uiConfig: CollectionViewDOMConfig, stateManager: StateManager, stateName: string);
    addDataObjectListener(listener: DataObjectListener): void;
    getItemDescription(from: string, item: any): string;
    hasActionPermission(actionName: string, from: string, item: any): boolean;
    onDocumentLoaded(): void;
    getItemInNamedCollection(name: string, compareWith: any): any;
    stateChanged(managerName: string, name: string, newValue: any): void;
    stateChangedItemAdded(managerName: string, name: string, itemAdded: any): void;
    stateChangedItemRemoved(managerName: string, name: string, itemRemoved: any): void;
    stateChangedItemUpdated(managerName: string, name: string, itemUpdated: any, itemNewValue: any): void;
    getDisplayedCollection(): any[];
    documentLoaded(view: View): void;
    hideRequested(view: View): void;
    itemDragStarted(view: View, selectedItem: any): void;
    itemDropped(view: View, droppedItem: any): void;
    showRequested(view: View): void;
    itemDeselected(view: View, selectedItem: any): void;
    itemSelected(view: View, selectedItem: any): void;
    itemAction(view: View, actionName: string, selectedItem: any): void;
    itemDeleted(view: View, selectedItem: any): void;
    canSelectItem(view: CollectionView, selectedItem: any): boolean;
    canDeleteItem(view: View, selectedItem: any): boolean;
    getListenerName(): string;
    filterResults(managerName: string, name: string, filterResults: any): void;
    foundResult(managerName: string, name: string, foundItem: any): void;
    itemNotModified(managerName: string, name: string, item: any): void;
    collectionChanged(view: CollectionView): void;
    setFieldValue(objectId: string, fieldId: string, value: any): void;
}
