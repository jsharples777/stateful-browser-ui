import { ItemViewListener } from "../view/item/ItemViewListener";
import { ItemEvent } from "../ConfigurationTypes";
export declare class ViewLinkerItemViewListenerHelper implements ItemViewListener {
    fieldAction(name: string, event: ItemEvent): void;
    itemViewEvent(name: string, event: ItemEvent, rowValues?: any): boolean;
    itemViewHasChanged(name: string): void;
}
