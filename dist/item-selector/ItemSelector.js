import debug from 'debug';
import { ItemSelectorEventType } from "./ItemSelectorListener";
import { browserUtil } from "browser-state-management";
import { KeyBindingManager } from "../key-binding-manager/KeyBindingManager";
import { DEFAULT_KEYBINDINGS_ACTION_NAMES } from "../ConfigurationTypes";
const logger = debug('item-selector');
export class ItemSelector {
    constructor() {
        this.config = null;
        this.options = [];
        this.listener = undefined;
        this.modal = document.getElementById(ItemSelector.MODAL_Window);
        this.title = document.getElementById(ItemSelector.MODAL_Title);
        this.label = document.getElementById(ItemSelector.MODAL_Label);
        this.select = document.getElementById(ItemSelector.MODAL_Select);
        this.filterEl = document.getElementById(ItemSelector.MODAL_Filter);
        this.cancelButton = document.getElementById(ItemSelector.MODAL_Cancel_Button);
        this.confirmButton = document.getElementById(ItemSelector.MODAL_Select_Button);
        this.closeButton = document.getElementById(ItemSelector.CLOSE_Button);
        this.currentOptions = [];
        this.startSelection = this.startSelection.bind(this);
        this.filterOptions = this.filterOptions.bind(this);
        this.showSelectionOptions = this.showSelectionOptions.bind(this);
        this.checkFilterValue = this.checkFilterValue.bind(this);
        this.checkFilterValue = this.checkFilterValue.bind(this);
        this.cancelHandler = this.cancelHandler.bind(this);
        this.confirmHandler = this.confirmHandler.bind(this);
        const keyBindingConfig = {
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
        };
        KeyBindingManager.getInstance().addContextKeyBindings(keyBindingConfig);
    }
    keyActionEvent(event) {
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
    static getInstance() {
        if (!(ItemSelector._instance)) {
            ItemSelector._instance = new ItemSelector();
        }
        return ItemSelector._instance;
    }
    startSelection(listener, config) {
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
        }
        else {
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
                this.filterOptions(this.options, filterValue);
            }
        });
    }
    confirmHandler(event) {
        logger(`Handling confirm event from item selector`);
        KeyBindingManager.getInstance().deactivateContext(ItemSelector.KEY_BINDING_CONTEXT);
        this.modal.classList.add(ItemSelector.MODAL_Hide_Window_Class);
        this.modal.classList.remove(ItemSelector.MODAL_Show_Window_Class);
        if (event) {
            // @ts-ignore
            event.target.removeEventListener('click', this.confirmHandler);
        }
        // collect the selected option details
        const selectedOptions = [];
        this.currentOptions.forEach((currentOption) => {
            if (currentOption.selected) {
                selectedOptions.push({ name: currentOption.innerHTML, value: currentOption.value });
            }
        });
        if (this.listener && this.config) {
            this.listener.selectionCompleted({
                name: this.config.name,
                outcome: ItemSelectorEventType.confirmed,
                context: this.config.context,
                selectedValues: selectedOptions
            });
        }
    }
    cancelHandler(event) {
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
    checkFilterValue(option, filterValue) {
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
        });
        return result;
    }
    filterOptions(options, filterValue = null) {
        browserUtil.removeAllChildren(this.select);
        this.currentOptions = [];
        options.forEach((option) => {
            if (filterValue) {
                if (this.checkFilterValue(option, filterValue)) {
                    const optionEl = document.createElement('option');
                    browserUtil.addClasses(optionEl, 'my-list-item');
                    browserUtil.addAttributes(optionEl, [{ name: 'value', value: option.value }]);
                    optionEl.innerHTML = option.name;
                    this.currentOptions.push(optionEl);
                    this.select.appendChild(optionEl);
                }
            }
            else {
                const optionEl = document.createElement('option');
                browserUtil.addClasses(optionEl, 'my-list-item');
                browserUtil.addAttributes(optionEl, [{ name: 'value', value: option.value }]);
                optionEl.innerHTML = option.name;
                this.currentOptions.push(optionEl);
                this.select.appendChild(optionEl);
            }
        });
    }
    showSelectionOptions(config) {
        browserUtil.removeAttributes(this.select, ['size', 'multiple']);
        browserUtil.addAttributes(this.select, [{ name: 'size', value: '' + config.numVisibleItems }]);
        if (config.isMultiSelect) {
            browserUtil.addAttributes(this.select, [{ name: 'multiple', value: '' + config.isMultiSelect }]);
        }
        this.filterOptions(this.options);
    }
}
ItemSelector.MODAL_Window = 'item-selector';
ItemSelector.MODAL_Title = 'item-selector-title';
ItemSelector.MODAL_Label = 'item-selector-label';
ItemSelector.MODAL_Select = 'item-selector-select';
ItemSelector.MODAL_Filter = 'item-selector-filter';
ItemSelector.MODAL_Select_Button = 'item-selector-confirm';
ItemSelector.MODAL_Cancel_Button = 'item-selector-cancel';
ItemSelector.MODAL_Hide_Window_Class = 'd-none';
ItemSelector.MODAL_Show_Window_Class = 'd-block';
ItemSelector.CLOSE_Button = 'item-selector-close';
ItemSelector.KEY_BINDING_CONTEXT = 'item-selector';
//# sourceMappingURL=ItemSelector.js.map