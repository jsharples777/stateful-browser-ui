import {ValueOption} from "browser-state-management";


export enum ItemSelectorEventType {
    cancelled,
    confirmed
}

export type ItemSelectorEvent = {
    name: string,
    outcome: ItemSelectorEventType,
    context?: any,
    selectedValues?: ValueOption[]
}

export interface ItemSelectorListener {
    selectionCompleted(event: ItemSelectorEvent): void;
}
