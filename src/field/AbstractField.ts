import {ValidationEventHandler} from "./event-handlers/ValidationEventHandler";

import {RenderingEventListener} from "./event-handlers/RenderingEventListener";

import debug from 'debug';
import {EditingEventListener} from "./event-handlers/EditingEventListener";
import {
    Field,
    FieldDefinition,
    FieldListener, FieldType, FieldValidator,
    ValidatableView,
    ValidationResponse,
    ViewMode
} from "browser-state-management";
import {FieldUIConfig, UIFieldType} from "../CommonTypes";

const logger = debug('abstract-field');


export class AbstractField implements Field, FieldListener {
    protected view: ValidatableView;
    protected formId: string;
    protected config: FieldUIConfig | null = null;
    protected definition: FieldDefinition;
    protected element: HTMLElement;
    protected subElements: HTMLInputElement[] = [];
    protected validationHandler: ValidationEventHandler;
    protected renderingHandler: RenderingEventListener;
    protected listeners: FieldListener[] = [];
    private hidden: boolean = false;
    private bEmitEvents: boolean;

    constructor(view: ValidatableView, config: FieldUIConfig, fieldDef: FieldDefinition, element: HTMLElement, subElements: HTMLInputElement[] | null = null) {
        this.view = view;
        this.formId = view.getId();
        this.config = config;
        this.definition = fieldDef;
        this.element = element;
        if (subElements) this.subElements = subElements;
        this.validationHandler = new ValidationEventHandler(view, config, [this], subElements);
        this.renderingHandler = new RenderingEventListener(view, this, config, [this], subElements);
        const editingHandler = new EditingEventListener(view, this, config, [this]);
        if (config.editor) { // render the value when the field gains focus
            this.element.addEventListener('focus', editingHandler.handleEditEvent);
            this.element.addEventListener('blur', editingHandler.handleEditCompletedEvent);
            this.element.addEventListener('click', editingHandler.handleEditEvent);
        }

        if (config.validator) { // is the value in the field valid
            const eventHandler = new ValidationEventHandler(this.view, config, this.listeners, subElements);
            if (subElements && subElements.length > 0) { // event for the subelements
                subElements.forEach((subElement) => {
                    subElement.addEventListener('blur', eventHandler);
                });

            } else {
                this.element.addEventListener('blur', eventHandler);
            }

        }

        // listen for our own change events
        this.handleChangeEvent = this.handleChangeEvent.bind(this);
        if (this.subElements && (this.subElements.length > 0)) {
            logger(`Adding change listeners to subelements of ${config.field.id}`)
            this.subElements.forEach((subElement) => {
                subElement.addEventListener('change', this.handleChangeEvent);
            });
        } else {
            this.element.addEventListener('change', this.handleChangeEvent);
        }

        this.bEmitEvents = true;

    }

    isHidden(): boolean {
        return this.hidden;
    }

    addFieldListener(listener: FieldListener): void {
        logger(`${this.getName()} - adding listener ${listener.getName()}`);
        // don't duplicate listeners
        let index = this.listeners.findIndex((listenerInList) => listenerInList.getName() === listener.getName());
        if (index < 0) {
            this.listeners.push(listener);
        } else {
            logger(`${this.getName()} - duplicate listener ${listener.getName()} ignored`);
        }

    }

    getFieldDefinition(): FieldDefinition {
        return this.definition;
    }

    setInvalid(message: string): void {
        this.validationHandler.setValidationStatusAndMessage(this.element, false, '', message, false);
        const value = this.getValue();
        if (value) {
            this.listeners.forEach((listener) => listener.failedValidation(this.view, this.definition, value, message));
        }
    }

    public initialise(): void {
    }

    getValue(): string | null {
        let result: string | null = null;
        if (this.config && this.element) {
            // derived values are calculated from the data object overall
            if (this.definition.derivedValue) {
                result = this.definition.derivedValue.getValue(this.view.getCurrentDataObj(), this.definition, this.view.getViewMode() === ViewMode.create);
            } else {

                switch (this.config.elementType) {
                    case (UIFieldType.radioGroup): {
                        logger(`${this.definition.id} - getting value - rbg`);

                        if (this.subElements && (this.subElements.length > 0)) {
                            this.subElements.forEach((subElement) => {
                                if (subElement.checked) {
                                    logger(`${this.definition.id} - getting value - rbg - checked ${subElement.value}`);
                                    result = subElement.value;
                                    subElement.checked = true;
                                }
                            });
                        }
                        break;
                    }
                    case (UIFieldType.checkbox): {
                        // @ts-ignore
                        result = '' + this.element.checked;
                        break;
                    }
                    default: {
                        // @ts-ignore
                        result = this.element.value;
                        break;
                    }
                }
            }
        }
        logger(`${this.definition.id} - getting value - ${result}`);
        return result;
    }

    getFormattedValue(): any | null {
        let result: any | null = null;
        if (this.config && this.element) {
            // @ts-ignore
            result = this.element.value;
            if (this.config.elementType === UIFieldType.checkbox) { // @ts-ignore
                result = '' + this.element.checked;
            }
            if (this.config.formatter) {
                result = this.config.formatter.formatValue(this.definition, result);
            }
        }
        return result;
    }

    isValid(): boolean {
        let result = true;
        if (this.config && this.element) {
            if (this.config.validator) {
                if (this.config.validator.validator) {
                    const validator: FieldValidator = this.config.validator.validator;
                    const response: ValidationResponse = validator.isValidValue(this.definition, this.getValue());
                    result = response.isValid;
                }
            }
        }
        return result;
    }

    getId(): string {
        return this.definition.id;
    }

    setValue(newValue: string): void {

        if (this.element && this.config) {
            // derived fields have no "setter"
            if (this.definition.derivedValue) {
                newValue = this.definition.derivedValue.setValue(this.view.getCurrentDataObj(), this.definition, this.view.getViewMode() === ViewMode.create, newValue);
            }

            // @ts-ignore
            switch (this.config.elementType) {
                case (UIFieldType.radioGroup): {
                    newValue = '' + newValue;
                    if (this.subElements && (this.subElements.length > 0)) {
                        this.subElements.forEach((subElement) => {
                            if (subElement.value === newValue) {
                                subElement.checked = true;
                            }
                        });
                    }
                    break;
                }
                case (UIFieldType.checkbox): {
                    newValue = '' + newValue;
                    // @ts-ignore
                    this.element.checked = (newValue.toLowerCase() === 'true');
                    break;
                }
                case (UIFieldType.select): {
                    newValue = '' + newValue;
                    logger(`${this.definition.id} - setting value - ${newValue}`);
                    const selectEl: HTMLSelectElement = <HTMLSelectElement>this.element;
                    let selectedIndex = -1;
                    for (let index = 0; index < selectEl.options.length; index++) {
                        // @ts-ignore
                        const option: HTMLOptionElement = selectEl.options.item(index);
                        logger(`${this.definition.id} - option value - ${option.value}`);
                        if (option.value === newValue) {
                            logger(`${this.definition.id} - option value - ${option.value} - SELECTED`);
                            option.selected = true;
                            selectedIndex = index;
                        }
                    }
                    logger(`${this.definition.id} - selected index ${selectedIndex}`);
                    selectEl.selectedIndex = selectedIndex;
                    break;
                }
                default: {
                    logger(`${this.definition.id} - setting value - ${newValue}`);
                    newValue = '' + newValue;
                    // @ts-ignore
                    this.element.value = newValue;
                    break;
                }
            }
        }
    }

    reset(): void {
        if (this.element) {
            switch (this.definition.type) {
                case (FieldType.boolean): {
                    // @ts-ignore
                    this.element.checked = false;
                    break;
                }
                case (FieldType.integer): {
                    // @ts-ignore
                    this.element.value = '0';
                    break;
                }
                case (FieldType.float): {
                    // @ts-ignore
                    this.element.value = '0.0';
                    break;
                }
                case (FieldType.limitedChoice): {
                    if (this.subElements && (this.subElements.length > 0)) {
                        this.subElements.forEach((subElement) => {
                            subElement.checked = false;
                        });
                    }
                    break;
                }
                default: {
                    // @ts-ignore
                    this.element.value = '';
                    break;
                }
            }
        }
        this.show();
    }

    clearValue(): void {
        this.reset();
    }

    validate(): void {
        if (this.element) {
            this.validationHandler.processValidation(this.element);
        }
    }

    render(currentValue: string): string {
        let result = currentValue;
        if (this.config?.renderer) {
            let value = this.config.renderer.renderValue(this, this.definition, currentValue);
            if (value) result = value;
        }
        return result;
    }

    failedValidation(view: ValidatableView, field: FieldDefinition, currentValue: string, message: string): void {
    }

    valueChanged(view: ValidatableView, field: Field, fieldDef: FieldDefinition, newValue: string | null): void {
    }

    getName(): string {
        return this.definition.displayName;
    }

    hide(): void {
        /*
          if we have an enclosing container (per the config) then we can hide
          otherwise we become readonly and disabled
         */
        if (this.config) {
            if (this.config.containedBy) {
                const parentEl = this.element.parentElement;
                if (parentEl) {
                    parentEl.setAttribute('style', 'display:none');
                }

            } else {
                this.setReadOnly();
            }
        }
        this.hidden = true;
    }

    setValid(): void {
        this.validationHandler.setValidationStatusAndMessage(this.element, true, '');
    }

    show(): void {
        /*
          if we have an enclosing container (per the config) then we can hide
          otherwise we become readonly and disabled
         */
        if (this.config) {
            if (this.config.containedBy) {
                const parentEl = this.element.parentElement;
                if (parentEl) {
                    parentEl.removeAttribute('style');
                }

            } else {
                this.clearReadOnly();
            }
        }
        this.hidden = true;
    }

    clearReadOnly(): void {
        if (this.definition.displayOnly) return;
        this.element.removeAttribute('readonly');
        this.element.removeAttribute('disabled');
        // do the same for subelements
        if (this.subElements && (this.subElements.length > 0)) {
            this.subElements.forEach((subElement) => {
                subElement.removeAttribute('readonly');
                subElement.removeAttribute('disabled');
            });
        }

    }

    setReadOnly(): void {
        this.element.setAttribute('readonly', 'true');
        this.element.setAttribute('disabled', 'true');
        // do the same for subelements
        if (this.subElements && (this.subElements.length > 0)) {
            this.subElements.forEach((subElement) => {
                subElement.setAttribute('readonly', 'true');
                subElement.setAttribute('disabled', 'true');
            });
        }
    }

    getElement(): HTMLElement {
        return this.element;
    }

    emitEvents() {
        this.bEmitEvents = true;
    }

    suppressEvents() {
        this.bEmitEvents = false;
    }

    protected handleChangeEvent(event: Event) {
        logger(`Handling change event`);
        if (this.config && this.bEmitEvents) {
            let value: string | null = this.getValue();
            logger(`Handling change event - informing listeners`);
            this.listeners.forEach((listener) => listener.valueChanged(this.view, this, this.definition, value));
        }
    }
}

