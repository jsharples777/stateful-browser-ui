import {ItemViewListener} from "../view/item/ItemViewListener";
import {ItemEvent} from "../ConfigurationTypes";


export class ViewLinkerItemViewListenerHelper implements ItemViewListener {
    fieldAction(name: string, event: ItemEvent): void {
    }

    itemViewEvent(name: string, event: ItemEvent, rowValues?: any): boolean {
        return false;
    }

    itemViewHasChanged(name: string): void {
    }

}
