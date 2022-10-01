import { CollectionViewListenerForwarder } from "./CollectionViewListenerForwarder";
import { CollectionView } from "../interface/CollectionView";
import { AlertEvent } from "../../alert/AlertListener";
import { CollectionViewEventDelegate } from "../interface/CollectionViewEventDelegate";
export declare type ItemContext = {
    itemId: string;
    dataSource: string;
};
export declare class CollectionViewEventHandlerDelegate implements CollectionViewEventDelegate {
    protected view: CollectionView;
    protected selectedItem: any | null;
    protected eventForwarder: CollectionViewListenerForwarder;
    constructor(view: CollectionView, forwarder: CollectionViewListenerForwarder);
    getDragData(event: DragEvent): any;
    eventStartDrag(event: DragEvent): void;
    eventClickItem(event: MouseEvent): void;
    eventDeleteClickItem(event: MouseEvent): void;
    eventActionClicked(event: MouseEvent): void;
    alertCompleted(event: AlertEvent): void;
    protected getItemContext(event: Event): ItemContext;
}
