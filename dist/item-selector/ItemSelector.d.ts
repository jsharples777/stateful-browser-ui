import { ItemSelectorListener } from "./ItemSelectorListener";
import { ValueOption } from "browser-state-management";
import { KeyActionEvent, KeyActionEventReceiver } from "../key-binding-manager/KeyActionEventReceiver";
export interface ItemSelectorSupplier {
    getAvailableSelectionItems(config: ItemSelectorConfig): ValueOption[];
}
export declare type ItemSelectorConfig = {
    name: string;
    title: string;
    label?: string;
    context?: any;
    supplier: ItemSelectorSupplier;
    numVisibleItems: number;
    isMultiSelect: boolean;
    useFilter: boolean;
};
export declare class ItemSelector implements KeyActionEventReceiver {
    private static MODAL_Window;
    private static MODAL_Title;
    private static MODAL_Label;
    private static MODAL_Select;
    private static MODAL_Filter;
    private static MODAL_Select_Button;
    private static MODAL_Cancel_Button;
    private static MODAL_Hide_Window_Class;
    private static MODAL_Show_Window_Class;
    private static CLOSE_Button;
    private static KEY_BINDING_CONTEXT;
    private static _instance;
    private modal;
    private title;
    private label;
    private select;
    private filterEl;
    private cancelButton;
    private confirmButton;
    private closeButton;
    private currentOptions;
    private config;
    private options;
    private listener;
    private constructor();
    keyActionEvent(event: KeyActionEvent): void;
    static getInstance(): ItemSelector;
    startSelection(listener: ItemSelectorListener, config: ItemSelectorConfig): void;
    protected confirmHandler(event: MouseEvent | null): void;
    protected cancelHandler(event: MouseEvent | null): void;
    protected checkFilterValue(option: ValueOption, filterValue: string): boolean;
    protected filterOptions(options: ValueOption[], filterValue?: string | null): void;
    protected showSelectionOptions(config: ItemSelectorConfig): void;
}
