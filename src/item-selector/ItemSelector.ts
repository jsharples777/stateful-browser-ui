import debug from 'debug';
import {ItemSelectorEventType, ItemSelectorListener} from "./ItemSelectorListener";

import {browserUtil, ValueOption} from "browser-state-management";
import {
    KeyActionEvent,
    KeyActionEventReceiver,
    KeyActionReceiverConfig
} from "../key-binding-manager/KeyActionEventReceiver";
import {KeyBindingManager} from "../key-binding-manager/KeyBindingManager";
import {DEFAULT_KEYBINDINGS_ACTION_NAMES} from "../ConfigurationTypes";


const logger = debug('item-selector');

export interface ItemSelectorSupplier {
    getAvailableSelectionItems(config: ItemSelectorConfig): ValueOption[];
}


export type ItemSelectorConfig = {
    name: string,
    title: string,
    label?: string,
    context?: any,
    supplier: ItemSelectorSupplier,
    numVisibleItems: number,
    isMultiSelect: boolean,
    useFilter: boolean
}


export class ItemSelector implements KeyActionEventReceiver{
    private static MODAL_Window = 'item-selector';
    private static MODAL_Title = 'item-selector-title';
    private static MODAL_Label = 'item-selector-label';
    private static MODAL_Select = 'item-selector-select';
    private static MODAL_Filter = 'item-selector-filter';
    private static MODAL_Select_Button = 'item-selector-confirm';
    private static MODAL_Cancel_Button = 'item-selector-cancel';

    private static MODAL_Hide_Window_Class = 'd-none';
    private static MODAL_Show_Window_Class = 'd-block';

    private static CLOSE_Button = 'item-selector-close';
    private static KEY_BINDING_CONTEXT = 'item-selector';


    private static _instance: ItemSelector;
    private modal: HTMLDivElement;
    private title: HTMLHeadingElement;
    private label: HTMLLabelElement;
    private select: HTMLSelectElement;
    private filterEl: HTMLInputElement;
    private cancelButton: HTMLButtonElement;
    private confirmButton: HTMLButtonElement;
    private closeButton: HTMLButtonElement;
    private currentOptions: HTMLOptionElement[];
    private config: ItemSelectorConfig | null = null;
    private options: ValueOption[] = [];
    private listener: ItemSelectorListener|undefined = undefined;

    private constructor() {
        this.modal = <HTMLDivElement>document.getElementById(ItemSelector.MODAL_Window);
        this.title = <HTMLHeadingElement>document.getElementById(ItemSelector.MODAL_Title);
        this.label = <HTMLLabelElement>document.getElementById(ItemSelector.MODAL_Label);
        this.select = <HTMLSelectElement>document.getElementById(ItemSelector.MODAL_Select);
        this.filterEl = <HTMLInputElement>document.getElementById(ItemSelector.MODAL_Filter);
        this.cancelButton = <HTMLButtonElement>document.getElementById(ItemSelector.MODAL_Cancel_Button);
        this.confirmButton = <HTMLButtonElement>document.getElementById(ItemSelector.MODAL_Select_Button);
        this.closeButton = <HTMLButtonElement>document.getElementById(ItemSelector.CLOSE_Button);
        this.currentOptions = [];
        this.startSelection = this.startSelection.bind(this);
        this.filterOptions = this.filterOptions.bind(this);
        this.showSelectionOptions = this.showSelectionOptions.bind(this);
        this.checkFilterValue = this.checkFilterValue.bind(this);
        this.checkFilterValue = this.checkFilterValue.bind(this);
        this.cancelHandler = this.cancelHandler.bind(this);
        this.confirmHandler = this.confirmHandler.bind(this);

        const keyBindingConfig: KeyActionReceiverConfig = {
            contextName: ItemSelector.KEY_BINDING_CONTEXT,
            receiver: this,
            keyBindings: [
                {
                    controlKeyRequired: false,
                    metaKeyRequired: false,
                    shiftKeyRequired: false,
                    altKeyRequired: false,
                    keyCode: 'Enter',
                    actionName: DEFAULT_KEYBINDINGS_ACTION_NAMES.ok
                },
                {
                    controlKeyRequired: false,
                    metaKeyRequired: false,
                    shiftKeyRequired: false,
                    altKeyRequired: false,
                    keyCode: 'NumpadEnter',
                    actionName: DEFAULT_KEYBINDINGS_ACTION_NAMES.ok
                },
                {
                    controlKeyRequired: false,
                    metaKeyRequired: false,
                    shiftKeyRequired: false,
                    altKeyRequired: false,
                    keyCode: 'Escape',
                    actionName: DEFAULT_KEYBINDINGS_ACTION_NAMES.cancel
                }
            ]
        }
        KeyBindingManager.getInstance().addContextKeyBindings(keyBindingConfig);

    }

    keyActionEvent(event: KeyActionEvent): void {

        switch (event.actionName) {
            case DEFAULT_KEYBINDINGS_ACTION_NAMES.ok: {
                this.confirmHandler(null);
                break;
            }
            case DEFAULT_KEYBINDINGS_ACTION_NAMES.cancel: {
                this.cancelHandler(null);
                break;
            }
        }
    }

    public static getInstance(): ItemSelector {
        if (!(ItemSelector._instance)) {
            ItemSelector._instance = new ItemSelector();
        }
        return ItemSelector._instance;
    }

    public startSelection(listener: ItemSelectorListener, config: ItemSelectorConfig) {
        KeyBindingManager.getInstance().activateContext(ItemSelector.KEY_BINDING_CONTEXT);
        this.config = config;
        this.listener = listener;
        this.options = config.supplier.getAvailableSelectionItems(config);

        this.title.innerHTML = config.title;
        if (config.label) {
            this.label.innerHTML = config.label;
        }
        this.modal.classList.remove(ItemSelector.MODAL_Hide_Window_Class);
        this.modal.classList.add(ItemSelector.MODAL_Show_Window_Class);

        if (config.useFilter) {
            browserUtil.removeClasses(this.filterEl, ItemSelector.MODAL_Hide_Window_Class);
        } else {
            browserUtil.addClasses(this.filterEl, ItemSelector.MODAL_Hide_Window_Class);
        }





        this.confirmButton.addEventListener('click', this.confirmHandler);
        this.cancelButton.addEventListener('click', this.cancelHandler);
        this.closeButton.addEventListener('click', this.cancelHandler);

        this.showSelectionOptions(config);

        this.filterEl.addEventListener('keyup', (event) => {
            if (event.isComposing || event.keyCode === 229) {
                return;
            }
            const filterValue = this.filterEl.value.trim();
            if (filterValue.length >= 3) {
                this.filterOptions(this.options,filterValue);
            }
        });
    }

    protected confirmHandler(event: MouseEvent|null):void {
        logger(`Handling confirm event from item selector`);
        KeyBindingManager.getInstance().deactivateContext(ItemSelector.KEY_BINDING_CONTEXT);
        this.modal.classList.add(ItemSelector.MODAL_Hide_Window_Class);
        this.modal.classList.remove(ItemSelector.MODAL_Show_Window_Class);
        if (event) {
            // @ts-ignore
            event.target.removeEventListener('click', this.confirmHandler);
        }

        // collect the selected option details
        const selectedOptions: ValueOption[] = [];
        this.currentOptions.forEach((currentOption) => {
            if (currentOption.selected) {
                selectedOptions.push({name: currentOption.innerHTML, value: currentOption.value});
            }
        })


        if (this.listener && this.config) {
            this.listener.selectionCompleted({
                name: this.config.name,
                outcome: ItemSelectorEventType.confirmed,
                context: this.config.context,
                selectedValues: selectedOptions
            });
        }
    }

    protected cancelHandler(event: MouseEvent|null):void {
        logger(`Handling cancel event from alert`);
        KeyBindingManager.getInstance().deactivateContext(ItemSelector.KEY_BINDING_CONTEXT);
        if (this.listener && this.config) {
            this.listener.selectionCompleted({
                name: this.config.name,
                outcome: ItemSelectorEventType.cancelled,
                context: this.config.context
            });
            this.modal.classList.add(ItemSelector.MODAL_Hide_Window_Class);
            this.modal.classList.remove(ItemSelector.MODAL_Show_Window_Class);
            if (event) { // @ts-ignore
                event.target.removeEventListener('click', this.cancelHandler);
            }
        }
    }

    protected checkFilterValue(option:ValueOption,filterValue:string):boolean {
        let result = true;
        const lcFilterValue = filterValue.toLowerCase();
        const lcOptionName = option.name.toLowerCase();

        const filterComponents = lcFilterValue.split(' ');
        filterComponents.forEach((value) => {
            if (lcOptionName.includes(value)) {
                result = result && true;
            }
            else {
                result = false;
            }
        })

        return result;
    }

    protected filterOptions(options: ValueOption[],filterValue:string|null = null): void {
        browserUtil.removeAllChildren(this.select);
        this.currentOptions = [];

        options.forEach((option) => {
            if (filterValue) {

                if (this.checkFilterValue(option,filterValue)) {
                    const optionEl = document.createElement('option');
                    browserUtil.addClasses(optionEl, 'my-list-item');
                    browserUtil.addAttributes(optionEl, [{name: 'value', value: option.value}]);
                    optionEl.innerHTML = option.name;
                    this.currentOptions.push(optionEl);
                    this.select.appendChild(optionEl);
                }
            }
            else {
                const optionEl = document.createElement('option');
                browserUtil.addClasses(optionEl, 'my-list-item');
                browserUtil.addAttributes(optionEl, [{name: 'value', value: option.value}]);
                optionEl.innerHTML = option.name;
                this.currentOptions.push(optionEl);
                this.select.appendChild(optionEl);
            }

        });

    }

    protected showSelectionOptions(config: ItemSelectorConfig): void {
        browserUtil.removeAttributes(this.select, ['size', 'multiple']);
        browserUtil.addAttributes(this.select, [{name: 'size', value: '' + config.numVisibleItems}]);
        if (config.isMultiSelect) {
            browserUtil.addAttributes(this.select, [{name: 'multiple', value: '' + config.isMultiSelect}]);
        }

        this.filterOptions(this.options);

    }

}




