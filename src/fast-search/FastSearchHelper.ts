import debug from 'debug';
import {
    browserUtil,
    CollectionFilter, CollectionFilterProcessor,
    FieldValueOptionsListener,
    StateChangeListener,
    StateManager,
    ValueOption
} from "browser-state-management";
import {Form} from "../form/Form";
import {SimpleValueDataSource} from "../helper/SimpleValueDataSource";


const logger = debug('fast-search-helper');

export type labelGenerator = (item: any) => string;
export type valueGenerator = (item: any) => string;
export type eventHandler = (label: string, value: string) => void;

export type FastSearchConfig = {
    linkedForm?: Form,
    linkedFormFieldId?: string,
    linkedElementId?: string,
    sourceState: string,
    sourceStateManager: StateManager,
    sourceStateFilter?: CollectionFilter,
    labelGenerator: labelGenerator,
    valueGenerator: valueGenerator,
    minLength: number,
    eventHandler: eventHandler
}

class FastSearchHelperSMListener implements StateChangeListener {
    private config: FastSearchConfig;

    constructor(config: FastSearchConfig) {
        this.config = config;
        this.config.sourceStateManager.addChangeListenerForName(this.config.sourceState, this);
    }

    filterResults(managerName: string, name: string, filterResults: any): void {
    }

    foundResult(managerName: string, name: string, foundItem: any): void {
    }

    itemNotModified(managerName: string, name: string, item: any) {
    }

    getListenerName(): string {
        return "";
    }

    setup() {
        let items = this.config.sourceStateManager.getStateByName(this.config.sourceState);
        if (this.config.sourceStateFilter) {
            items = CollectionFilterProcessor.getFilteredState(this.config.sourceState, items, this.config.sourceStateFilter, false);
        }
        const fastSearchValues: any = [];
        items.forEach((item: any) => {
            const searchValue = {
                label: this.config.labelGenerator(item),
                value: this.config.valueGenerator(item),
            };
            fastSearchValues.push(searchValue);
        });

        let el: HTMLElement | null = null;
        if (this.config.linkedForm && this.config.linkedFormFieldId) {
            const formFieldElementId = this.config.linkedForm.getElementIdForField(this.config.linkedFormFieldId);
            if (formFieldElementId) el = document.getElementById(formFieldElementId);
        } else if (this.config.linkedElementId) {
            el = document.getElementById(this.config.linkedElementId);
        }

        if (el) {
            const jQueryEl = $(el);
            // @ts-ignore
            jQueryEl.on('autocompleteselect', (event: Event, ui: any) => {
                event.preventDefault();
                event.stopPropagation();
                logger(`${this.config.sourceState} selected ${ui.item.label} with id ${ui.item.value} selected`);
                this.config.eventHandler(ui.item.label, ui.item.value);
            });
            jQueryEl.autocomplete({source: fastSearchValues});
            jQueryEl.autocomplete('option', {disabled: false, minLength: this.config.minLength});
        }

    }

    stateChanged(managerName: string, name: string, newValue: any): void {
        this.setup();
    }

    stateChangedItemAdded(managerName: string, name: string, itemAdded: any): void {
        this.setup();
    }

    stateChangedItemRemoved(managerName: string, name: string, itemRemoved: any): void {
        this.setup();
    }

    stateChangedItemUpdated(managerName: string, name: string, itemUpdated: any, itemNewValue: any): void {
        this.setup();
    }

}


export class FastSearchHelper {

    public static addNewDataSourceToSelectElement(element: HTMLSelectElement, source: SimpleValueDataSource) {
        source.getOptions().forEach((valueOption) => {
            const optionEl = <HTMLOptionElement>document.createElement('option');
            optionEl.value = valueOption.value;
            optionEl.label = valueOption.name;
            element.appendChild(optionEl);
        });

        source.addListener(new class implements FieldValueOptionsListener {
            optionsChanged(newOptions: ValueOption[]): void {
                browserUtil.removeAllChildren(element);
                newOptions.forEach((valueOption) => {
                    const optionEl = <HTMLOptionElement>document.createElement('option');
                    optionEl.value = valueOption.value;
                    optionEl.label = valueOption.name;
                    element.appendChild(optionEl);
                });
            }
        })


    }

    public static addNewFastSearch(config: FastSearchConfig) {
        logger(`Setting up fast search for form field ${config.linkedFormFieldId} or element ${config.linkedElementId}`);
        new FastSearchHelperSMListener(config).setup();
    }

    itemNotModified(managerName: string, name: string, item: any) {
    }


}
