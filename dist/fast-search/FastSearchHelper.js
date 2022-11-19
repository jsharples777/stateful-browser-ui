import debug from 'debug';
import { browserUtil, CollectionFilterProcessor } from "browser-state-management";
const logger = debug('fast-search-helper');
class FastSearchHelperSMListener {
    constructor(config) {
        this.config = config;
        this.config.sourceStateManager.addChangeListenerForName(this.config.sourceState, this);
    }
    filterResults(managerName, name, filterResults) {
    }
    foundResult(managerName, name, foundItem) {
    }
    itemNotModified(managerName, name, item) {
    }
    getListenerName() {
        return "";
    }
    setup() {
        let items = this.config.sourceStateManager.getStateByName(this.config.sourceState);
        if (this.config.sourceStateFilter) {
            items = CollectionFilterProcessor.getFilteredState(this.config.sourceState, items, this.config.sourceStateFilter, false);
        }
        const fastSearchValues = [];
        items.forEach((item) => {
            const searchValue = {
                label: this.config.labelGenerator(item),
                value: this.config.valueGenerator(item),
            };
            fastSearchValues.push(searchValue);
        });
        let el = null;
        if (this.config.linkedForm && this.config.linkedFormFieldId) {
            const formFieldElementId = this.config.linkedForm.getElementIdForField(this.config.linkedFormFieldId);
            if (formFieldElementId)
                el = document.getElementById(formFieldElementId);
        }
        else if (this.config.linkedElementId) {
            el = document.getElementById(this.config.linkedElementId);
        }
        if (el) {
            const jQueryEl = $(el);
            // @ts-ignore
            jQueryEl.on('autocompleteselect', (event, ui) => {
                event.preventDefault();
                event.stopPropagation();
                logger(`${this.config.sourceState} selected ${ui.item.label} with id ${ui.item.value} selected`);
                this.config.eventHandler(ui.item.label, ui.item.value);
            });
            jQueryEl.autocomplete({ source: fastSearchValues });
            jQueryEl.autocomplete('option', { disabled: false, minLength: this.config.minLength });
        }
    }
    stateChanged(managerName, name, newValue) {
        this.setup();
    }
    stateChangedItemAdded(managerName, name, itemAdded) {
        this.setup();
    }
    stateChangedItemRemoved(managerName, name, itemRemoved) {
        this.setup();
    }
    stateChangedItemUpdated(managerName, name, itemUpdated, itemNewValue) {
        this.setup();
    }
}
export class FastSearchHelper {
    static addNewDataSourceToSelectElement(element, source) {
        source.getOptions().forEach((valueOption) => {
            const optionEl = document.createElement('option');
            optionEl.value = valueOption.value;
            optionEl.label = valueOption.name;
            element.appendChild(optionEl);
        });
        source.addListener(new class {
            optionsChanged(newOptions) {
                browserUtil.removeAllChildren(element);
                newOptions.forEach((valueOption) => {
                    const optionEl = document.createElement('option');
                    optionEl.value = valueOption.value;
                    optionEl.label = valueOption.name;
                    element.appendChild(optionEl);
                });
            }
        });
    }
    static addNewFastSearch(config) {
        logger(`Setting up fast search for form field ${config.linkedFormFieldId} or element ${config.linkedElementId}`);
        new FastSearchHelperSMListener(config).setup();
    }
    itemNotModified(managerName, name, item) {
    }
}
//# sourceMappingURL=FastSearchHelper.js.map