import {ItemEvent} from "../../ConfigurationTypes";



export interface ItemViewListener {
    itemViewEvent(name: string, event: ItemEvent, rowValues?: any): boolean; // return true to cancel the action
    itemViewHasChanged(name: string): void;

    fieldAction(name: string, event: ItemEvent): void;
}
