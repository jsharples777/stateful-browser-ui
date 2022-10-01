import { CollectionViewListenerForwarder } from "./CollectionViewListenerForwarder";
import { CollectionView } from "../interface/CollectionView";
import { CollectionViewEventHandlerDelegate, ItemContext } from "./CollectionViewEventHandlerDelegate";
export declare class CollectionViewEventHandlerDelegateUsingContext extends CollectionViewEventHandlerDelegate {
    constructor(view: CollectionView, forwarder: CollectionViewListenerForwarder);
    protected getItemContext(event: Event): ItemContext;
}
