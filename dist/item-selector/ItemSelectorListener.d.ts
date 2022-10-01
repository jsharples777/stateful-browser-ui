import { ValueOption } from "browser-state-management";
export declare enum ItemSelectorEventType {
    cancelled = 0,
    confirmed = 1
}
export declare type ItemSelectorEvent = {
    name: string;
    outcome: ItemSelectorEventType;
    context?: any;
    selectedValues?: ValueOption[];
};
export interface ItemSelectorListener {
    selectionCompleted(event: ItemSelectorEvent): void;
}
