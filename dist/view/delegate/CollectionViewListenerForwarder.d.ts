import { CollectionViewListener } from "../interface/CollectionViewListener";
import { CollectionView } from "../interface/CollectionView";
import { ViewListenerForwarder } from "./ViewListenerForwarder";
export declare class CollectionViewListenerForwarder extends ViewListenerForwarder implements CollectionViewListener {
    protected collectionViewListeners: CollectionViewListener[];
    constructor();
    addListener(listener: CollectionViewListener): void;
    itemDragStarted(view: CollectionView, selectedItem: any): void;
    itemSelected(view: CollectionView, selectedItem: any): void;
    itemDeselected(view: CollectionView, deselectedItem: any): void;
    canSelectItem(view: CollectionView, selectedItem: any): boolean;
    collectionChanged(view: CollectionView): void;
}
