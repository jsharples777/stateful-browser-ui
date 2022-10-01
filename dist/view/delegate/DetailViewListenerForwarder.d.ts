import { ViewListenerForwarder } from "./ViewListenerForwarder";
import { DetailViewListener } from "../interface/DetailViewListener";
import { DetailView } from "../interface/DetailView";
export declare class DetailViewListenerForwarder extends ViewListenerForwarder implements DetailViewListener {
    protected detailViewListeners: DetailViewListener[];
    constructor();
    addListener(listener: DetailViewListener): void;
    saveNewItem(view: DetailView, dataObj: any): void;
    updateItem(view: DetailView, dataObj: any): void;
    deletedItem(view: DetailView, dataObj: any): void;
    cancelled(view: DetailView, dataObj: any): void;
}
