import { CollectionView } from "../view/interface/CollectionView";
import { DetailView } from "../view/interface/DetailView";
import { CollectionViewListener } from "../view/interface/CollectionViewListener";
import { View } from "../view/interface/View";
import { DetailViewListener } from "../view/interface/DetailViewListener";
import { AlertEvent, AlertListener } from "../alert/AlertListener";
import { DataObjectController } from "browser-state-management";
declare class ChildViewListenerDelegate implements DetailViewListener {
    protected controller: DetailViewListener;
    constructor(controller: DetailViewListener);
    addView(view: DetailView): void;
    canDeleteItem(view: View, selectedItem: any): boolean;
    documentLoaded(view: View): void;
    hideRequested(view: View): void;
    itemAction(view: View, actionName: string, selectedItem: any): void;
    itemDeleted(view: View, selectedItem: any): void;
    itemDropped(view: View, droppedItem: any): void;
    showRequested(view: View): void;
    cancelled(view: DetailView, dataObj: any): void;
    deletedItem(view: DetailView, dataObj: any): void;
    saveNewItem(view: DetailView, dataObj: any): void;
    updateItem(view: DetailView, dataObj: any): void;
}
export declare class ChangeDataObjectDelegate implements AlertListener {
    protected callback: any;
    constructor(callback: any);
    shouldDiscardChanges(): void;
    alertCompleted(event: AlertEvent): void;
}
export declare class LinkedCollectionDetailController extends DataObjectController implements CollectionViewListener, DetailViewListener {
    protected parentView: CollectionView;
    protected children: DetailView[];
    protected delegate: ChildViewListenerDelegate;
    constructor(typeName: string, parentView: CollectionView);
    collectionChanged(view: CollectionView): void;
    addLinkedDetailView(childView: DetailView): void;
    initialise(): void;
    canDeleteItem(view: View, selectedItem: any): boolean;
    documentLoaded(view: View): void;
    hideRequested(view: View): void;
    itemAction(view: View, actionName: string, selectedItem: any): void;
    itemDeleted(view: View, selectedItem: any): void;
    itemDeselected(view: View, selectedItem: any): void;
    itemDragStarted(view: View, selectedItem: any): void;
    itemDropped(view: View, droppedItem: any): void;
    itemSelected(view: View, selectedItem: any): void;
    showRequested(view: View): void;
    canSelectItem(view: CollectionView, selectedItem: any): boolean;
    cancelled(view: DetailView, dataObj: any): void;
    deletedItem(view: DetailView, dataObj: any): void;
    saveNewItem(view: DetailView, dataObj: any): void;
    updateItem(view: DetailView, dataObj: any): void;
    protected _startNewObject(startingDataObj: any | null): boolean;
}
export {};
