import {ItemViewElementFactory} from "./ItemViewElementFactory";
import {Form} from "../form/Form";
import {ItemViewListener} from "../view/item/ItemViewListener";
import {ItemViewUIDefinition} from "../view/item/ItemViewUITypeDefs";
import {FieldUIConfig, ItemEventType, UIFieldType} from "../CommonTypes";
import {
    browserUtil,
    DATA_ID_ATTRIBUTE,
    FieldListener, FieldType,
    FieldValueOptionsListener, ValidatableView,
    ValueOption
} from "browser-state-management";

export type FieldFactoryParameters = {
    form: Form,
    formConfig: ItemViewUIDefinition,
    itemListeners: ItemViewListener[],
    containerEl: HTMLElement,
    fieldConfig: FieldUIConfig,
    listeners: FieldListener[]
}

class DefaultFieldOptionsListener implements FieldValueOptionsListener {
    private formId: string;
    private parentElement: HTMLElement;
    private fieldUIConfig: FieldUIConfig;

    constructor(formId: string, parentElement: HTMLElement, fieldUIConfig: FieldUIConfig) {
        this.formId = formId;
        this.parentElement = parentElement;
        this.fieldUIConfig = fieldUIConfig;
    }

    optionsChanged(newOptions: ValueOption[]): void {
        browserUtil.removeAllChildren(this.parentElement);
        let subEls: HTMLElement[] = FieldInputElementFactory.createSubElements(this.formId, this.parentElement, this.fieldUIConfig, newOptions);

    }

}

export class FieldInputElementFactory {

    private static _instance: FieldInputElementFactory;

    private constructor() {
    }

    public static getInstance(): FieldInputElementFactory {
        if (!(FieldInputElementFactory._instance)) {
            FieldInputElementFactory._instance = new FieldInputElementFactory();
        }
        return FieldInputElementFactory._instance;
    }

    public static getElementIdForFieldId(view: ValidatableView, fieldId: string): string {
        return `${view.getId()}.field.${fieldId}`
    }


    public static initialiseFieldElementAndEventHandlers(fieldElement: HTMLElement, formId: string, fieldConfig: FieldUIConfig, listeners: FieldListener[], subElements: HTMLInputElement[] | null = null): void {
        fieldElement.setAttribute('id', `${formId}.field.${fieldConfig.field.id}`);
        fieldElement.setAttribute(DATA_ID_ATTRIBUTE, fieldConfig.field.id);
        fieldElement.setAttribute('name', fieldConfig.field.id);
        if (fieldConfig.elementAttributes) browserUtil.addAttributes(fieldElement, fieldConfig.elementAttributes);
        if (fieldConfig.elementClasses) browserUtil.addClasses(fieldElement, fieldConfig.elementClasses);

        // readonly field?
        if (fieldConfig.field.displayOnly) {
            browserUtil.addAttributes(fieldElement, [{name: 'disabled', value: 'true'}, {
                name: 'readonly',
                value: 'true'
            }])
        }
        /*
        setup event handlers
        */
        // if (fieldConfig.validator) { // is the value in the field valid
        //     const eventHandler = new ValidationEventHandler(formId, fieldConfig, listeners, subElements);
        //     if (subElements) { // event for the subelements
        //         subElements.forEach((subElement) => {
        //             subElement.addEventListener('blur', eventHandler);
        //         });
        //
        //     } else {
        //         fieldElement.addEventListener('blur', eventHandler);
        //     }
        //
        // }

        // if (fieldConfig.editor) { // render the value when the field gains focus
        //     fieldElement.addEventListener('focus', new EditingEventListener(formId, fieldConfig, listeners));
        // } // care for endless loops here, renderer needs to return null if no changes

        // date picker for date fields
        if (fieldConfig.field.type === FieldType.date) {
            $(fieldElement).datepicker();
            $(fieldElement).datepicker("option", "dateFormat", 'dd/mm/yy');
        }

    }


    public static createFieldComponentsAndContainer(fieldElement: HTMLElement, formId: string, containerEl: HTMLElement, fieldConfig: FieldUIConfig, listeners: FieldListener[], form?: Form, formConfig?: ItemViewUIDefinition, itemListeners?: ItemViewListener[]): void {

        // if the field has a validator, then we need a div for error messages
        let errorMessageDivEl: HTMLElement | null = null;

        if (fieldConfig.validator && fieldConfig.validator.messageDisplay) {
            errorMessageDivEl = document.createElement('div');
            errorMessageDivEl.setAttribute('id', `${formId}.field.${fieldConfig.field.id}.error`);
            errorMessageDivEl.setAttribute('style', 'display: none'); // default to not visible
            browserUtil.addClasses(errorMessageDivEl, fieldConfig.validator.messageDisplay.classes);
            let messageEl = document.createElement(fieldConfig.validator.messageDisplay.type);
            if (messageEl) {
                messageEl.setAttribute('id', `${formId}.field.${fieldConfig.field.id}.error.message`);
                if (fieldConfig.validator.messageDisplay.attributes) browserUtil.addAttributes(messageEl, fieldConfig.validator.messageDisplay.attributes);
                errorMessageDivEl.appendChild(messageEl);
            }
        }


        // ok, so is the field contained?
        if (fieldConfig.containedBy) {
            // we need to create a container for the field and option label and description text
            let containedByEl = document.createElement(fieldConfig.containedBy.type);
            if (containedByEl) {
                browserUtil.addClasses(containedByEl, fieldConfig.containedBy.classes);
                containedByEl.setAttribute('id', `${formId}.field.${fieldConfig.field.id}.container`);

                if (fieldConfig.containedBy.attributes) browserUtil.addAttributes(containerEl, fieldConfig.containedBy.attributes);
                // do we have a label also?
                if (fieldConfig.label) {
                    let labelEl: HTMLLabelElement = document.createElement('label');
                    labelEl.setAttribute('for', `${formId}.field.${fieldConfig.field.id}`);
                    labelEl.innerHTML = fieldConfig.field.displayName;
                    if (fieldConfig.label.attributes) browserUtil.addAttributes(labelEl, fieldConfig.label.attributes);
                    if (fieldConfig.label.classes) browserUtil.addClasses(labelEl, fieldConfig.label.classes);
                    containedByEl.appendChild(labelEl);
                }
                if (fieldConfig.describedBy) {
                    let descEl: HTMLElement = document.createElement(fieldConfig.describedBy.elementType);
                    if (descEl) {
                        // link the field and the description
                        descEl.setAttribute('id', `${formId}.field.${fieldConfig.field.id}.desc`);
                        if (fieldConfig.field.description) descEl.innerHTML = fieldConfig.field.description;
                        fieldElement.setAttribute('aria-describedby', `${formId}.field.${fieldConfig.field.id}.desc`);
                        if (fieldConfig.describedBy.elementClasses) browserUtil.addClasses(descEl, fieldConfig.describedBy.elementClasses);
                        containedByEl.appendChild(fieldElement);
                        containedByEl.appendChild(descEl);
                        if (errorMessageDivEl) containedByEl.appendChild(errorMessageDivEl);
                    } else { // description failure, add the field
                        containedByEl.appendChild(fieldElement);
                        if (errorMessageDivEl) containedByEl.appendChild(errorMessageDivEl);
                    }
                } else { // no description, add field to container
                    containedByEl.appendChild(fieldElement);
                    if (errorMessageDivEl) containedByEl.appendChild(errorMessageDivEl);
                }
                containerEl.appendChild(containedByEl);

                // does the field have extra actions?
                if (form) {
                    if (formConfig) {
                        if (itemListeners) {
                            if (fieldConfig.extraActions) {
                                fieldConfig.extraActions.forEach((extraAction) => {
                                    const buttonEl = ItemViewElementFactory.getInstance().createButton(form, formConfig, itemListeners, extraAction.button, ItemEventType.FIELD_ACTION, fieldConfig.field.id, extraAction.name);
                                    containedByEl.appendChild(buttonEl);
                                });
                            }

                        }
                    }
                }
            } else { // errors should keep making something!
                containerEl.appendChild(fieldElement);
                if (errorMessageDivEl) containerEl.appendChild(errorMessageDivEl);
            }
        } else {
            containerEl.appendChild(fieldElement);
            if (errorMessageDivEl) containerEl.appendChild(errorMessageDivEl);
        }

    }

    public static createSubElements(formId: string, parentEl: HTMLElement, fieldConfig: FieldUIConfig, valueOptions: ValueOption[]): HTMLElement[] {
        let results: HTMLElement[] = [];

        valueOptions.forEach((valueOption, index) => {
            if (fieldConfig.subElement) {
                let containerEl: HTMLElement = parentEl;
                // is there a container?
                if (fieldConfig.subElement.container) {
                    containerEl = document.createElement(fieldConfig.subElement.container.type);
                    browserUtil.addClasses(containerEl, fieldConfig.subElement.container.classes);
                    if (fieldConfig.subElement.container.attributes) browserUtil.addAttributes(containerEl, fieldConfig.subElement.container.attributes);
                    parentEl.appendChild(containerEl);
                }
                let valueEl: HTMLElement = document.createElement(fieldConfig.subElement.element.type);
                valueEl.setAttribute('value', valueOption.value);
                valueEl.setAttribute('id', `${formId}.field.${fieldConfig.field.id}.${index}`);
                valueEl.setAttribute('name', `${formId}.field.${fieldConfig.field.id}`);

                browserUtil.addClasses(valueEl, fieldConfig.subElement.element.classes);
                if (fieldConfig.subElement.element.attributes) browserUtil.addAttributes(valueEl, fieldConfig.subElement.element.attributes);

                containerEl.appendChild(valueEl);

                if (fieldConfig.subElement.label) {
                    let labelEl = document.createElement('label');
                    if (fieldConfig.subElement.label.classes) browserUtil.addClasses(labelEl, fieldConfig.subElement.label.classes);
                    if (fieldConfig.subElement.label.attributes) browserUtil.addAttributes(labelEl, fieldConfig.subElement.label.attributes);
                    labelEl.innerHTML = valueOption.name;
                    containerEl.appendChild(labelEl);
                } else {
                    if (fieldConfig.elementType === UIFieldType.radioGroup) {
                        containerEl.innerHTML += valueOption.name;
                    } else if (fieldConfig.elementType === UIFieldType.select) {
                        valueEl.innerText = valueOption.name;

                    }
                }
                results.push(valueEl);
            }
        });
        return results;
    }

    public createInputFormFieldComponentElement(formId: string, containerEl: HTMLElement, fieldConfig: FieldUIConfig, listeners: FieldListener[], form?: Form, formConfig?: ItemViewUIDefinition, itemListeners?: ItemViewListener[]): HTMLInputElement { // return the input element
        let fieldElement: HTMLInputElement = document.createElement('input');

        switch (fieldConfig.elementType) {
            case UIFieldType.checkbox: {
                fieldElement.setAttribute('type', 'checkbox');
                fieldElement.setAttribute('value', fieldConfig.field.id);
                break;
            }
            case UIFieldType.email: {
                fieldElement.setAttribute('type', 'email');
                break;
            }
            case UIFieldType.hidden: {
                fieldElement.setAttribute('type', 'hidden');
                break;
            }
            case UIFieldType.number: {
                fieldElement.setAttribute('type', 'number');
                break;
            }
            case UIFieldType.password: {
                fieldElement.setAttribute('type', 'password');
                break;
            }
            case UIFieldType.text: {
                fieldElement.setAttribute('type', 'text');
                break;
            }
            case UIFieldType.linkedList:
            case UIFieldType.linked:
            case UIFieldType.composite:
            case UIFieldType.list: {
                fieldElement.setAttribute('type', 'hidden');
                break;
            }
        }
        FieldInputElementFactory.initialiseFieldElementAndEventHandlers(fieldElement, formId, fieldConfig, listeners);
        FieldInputElementFactory.createFieldComponentsAndContainer(fieldElement, formId, containerEl, fieldConfig, listeners, form, formConfig, itemListeners);
        return fieldElement;
    }

    public createTAFormFieldComponentElement(formId: string, containerEl: HTMLElement, fieldConfig: FieldUIConfig, listeners: FieldListener[], form?: Form, formConfig?: ItemViewUIDefinition, itemListeners?: ItemViewListener[]): HTMLTextAreaElement { // return the input element
        let fieldElement: HTMLTextAreaElement = document.createElement('textarea');
        if (fieldConfig.textarea) {
            fieldElement.setAttribute('rows', `${fieldConfig.textarea.rows}`);
            fieldElement.setAttribute('cols', `${fieldConfig.textarea.cols}`);
        }
        FieldInputElementFactory.initialiseFieldElementAndEventHandlers(fieldElement, formId, fieldConfig, listeners);
        FieldInputElementFactory.createFieldComponentsAndContainer(fieldElement, formId, containerEl, fieldConfig, listeners, form, formConfig, itemListeners);
        return fieldElement;
    }

    public createSelectFormFieldComponentElement(formId: string, containerEl: HTMLElement, fieldConfig: FieldUIConfig, listeners: FieldListener[], form?: Form, formConfig?: ItemViewUIDefinition, itemListeners?: ItemViewListener[]): HTMLSelectElement { // return the input element
        let fieldElement: HTMLSelectElement = document.createElement('select');
        // create the options from the data source
        if (fieldConfig.datasource) {
            FieldInputElementFactory.createSubElements(formId, fieldElement, fieldConfig, fieldConfig.datasource.getOptions());
            // listen for data source changes
            fieldConfig.datasource.addListener(new DefaultFieldOptionsListener(formId, fieldElement, fieldConfig));
        }

        FieldInputElementFactory.initialiseFieldElementAndEventHandlers(fieldElement, formId, fieldConfig, listeners);
        FieldInputElementFactory.createFieldComponentsAndContainer(fieldElement, formId, containerEl, fieldConfig, listeners, form, formConfig, itemListeners);
        return fieldElement;
    }

    public createRadioGroupFormFieldComponentElement(formId: string, containerEl: HTMLElement, fieldConfig: FieldUIConfig, listeners: FieldListener[], form?: Form, formConfig?: ItemViewUIDefinition, itemListeners?: ItemViewListener[]):
        {
            container: HTMLElement,
            radioButtons: HTMLInputElement[]
        } {
        // create a div for each option in the source
        // create the div for the radio group
        let radioGroupElement: HTMLDivElement = document.createElement('div');
        if (fieldConfig.elementAttributes) browserUtil.addAttributes(radioGroupElement, fieldConfig.elementAttributes);
        if (fieldConfig.elementClasses) browserUtil.addClasses(radioGroupElement, fieldConfig.elementClasses);

        let subElements: HTMLInputElement[] = [];
        // create the options from the data source
        if (fieldConfig.datasource) {
            // we should get the radio buttons back
            subElements = <HTMLInputElement[]>FieldInputElementFactory.createSubElements(formId, radioGroupElement, fieldConfig, fieldConfig.datasource.getOptions());
            // listen for data source changes
            fieldConfig.datasource.addListener(new DefaultFieldOptionsListener(formId, radioGroupElement, fieldConfig));
            // setup the subelements for the validator, formatter, and renderer
            if (fieldConfig.validator) fieldConfig.validator.validator.setSubElements(subElements);
            if (fieldConfig.renderer) fieldConfig.renderer.setSubElements(subElements);
            if (fieldConfig.formatter) fieldConfig.formatter.setSubElements(subElements);
        }

        FieldInputElementFactory.initialiseFieldElementAndEventHandlers(radioGroupElement, formId, fieldConfig, listeners, subElements);
        FieldInputElementFactory.createFieldComponentsAndContainer(radioGroupElement, formId, containerEl, fieldConfig, listeners, form, formConfig, itemListeners);
        return {
            container: radioGroupElement,
            radioButtons: subElements
        };

    }

    public createCompositeFormFieldComponentElement(form: Form, formConfig: ItemViewUIDefinition, itemListeners: ItemViewListener[], containerEl: HTMLElement, fieldConfig: FieldUIConfig, listeners: FieldListener[]):
        {
            displayElement: HTMLInputElement,
            actionButtons: HTMLButtonElement[]
        } {
        const formId = form.getId();

        const displayElement: HTMLInputElement = document.createElement('input');
        displayElement.setAttribute('type', 'text');
        browserUtil.addAttributes(displayElement, [{name: 'disabled', value: 'true'}, {
            name: 'readonly',
            value: 'true'
        }])

        if (fieldConfig.elementAttributes) browserUtil.addAttributes(displayElement, fieldConfig.elementAttributes);
        if (fieldConfig.elementClasses) browserUtil.addClasses(displayElement, fieldConfig.elementClasses);

        let buttonElements: HTMLButtonElement[] = [];
        // create the options from the data source
        if (fieldConfig.extraActions) {
            fieldConfig.extraActions.forEach((extraAction) => {
                const buttonEl = ItemViewElementFactory.getInstance().createButton(form, formConfig, itemListeners, extraAction.button, ItemEventType.COMPOSITE_EDIT, fieldConfig.field.id);
                buttonElements.push(buttonEl);
            });
        }

        FieldInputElementFactory.initialiseFieldElementAndEventHandlers(displayElement, formId, fieldConfig, listeners);
        FieldInputElementFactory.createFieldComponentsAndContainer(displayElement, formId, containerEl, fieldConfig, listeners, form, formConfig, itemListeners);
        return {
            displayElement: displayElement,
            actionButtons: buttonElements
        };

    }

    public createCompositeArrayFormFieldComponentElement(form: Form, formConfig: ItemViewUIDefinition, itemListeners: ItemViewListener[], containerEl: HTMLElement, fieldConfig: FieldUIConfig, listeners: FieldListener[]):
        {
            displayElement: HTMLUListElement,
            actionButtons: HTMLButtonElement[]
        } {
        const formId = form.getId();

        const displayElement: HTMLUListElement = document.createElement('ul');
        browserUtil.addAttributes(displayElement, [{name: 'disabled', value: 'true'}, {
            name: 'readonly',
            value: 'true'
        }])

        if (fieldConfig.elementAttributes) browserUtil.addAttributes(displayElement, fieldConfig.elementAttributes);
        if (fieldConfig.elementClasses) browserUtil.addClasses(displayElement, fieldConfig.elementClasses);

        let buttonElements: HTMLButtonElement[] = [];
        // create the options from the data source
        if (fieldConfig.extraActions) {
            fieldConfig.extraActions.forEach((extraAction) => {
                const buttonEl = ItemViewElementFactory.getInstance().createButton(form, formConfig, itemListeners, extraAction.button, ItemEventType.COMPOSITE_ARRAY_EDIT, fieldConfig.field.id);
                buttonElements.push(buttonEl);
            });
        }

        FieldInputElementFactory.initialiseFieldElementAndEventHandlers(displayElement, formId, fieldConfig, listeners);
        FieldInputElementFactory.createFieldComponentsAndContainer(displayElement, formId, containerEl, fieldConfig, listeners);
        return {
            displayElement: displayElement,
            actionButtons: buttonElements
        };

    }

    public createLinkedFormFieldComponentElement(form: Form, formConfig: ItemViewUIDefinition, itemListeners: ItemViewListener[], containerEl: HTMLElement, fieldConfig: FieldUIConfig, listeners: FieldListener[]):
        {
            displayElement: HTMLInputElement,
            actionButtons: HTMLButtonElement[]
        } {
        const formId = form.getId();

        const displayElement: HTMLInputElement = document.createElement('input');
        displayElement.setAttribute('type', 'text');
        browserUtil.addAttributes(displayElement, [{name: 'disabled', value: 'true'}, {
            name: 'readonly',
            value: 'true'
        }])

        if (fieldConfig.elementAttributes) browserUtil.addAttributes(displayElement, fieldConfig.elementAttributes);
        if (fieldConfig.elementClasses) browserUtil.addClasses(displayElement, fieldConfig.elementClasses);

        let buttonElements: HTMLButtonElement[] = [];
        // create the options from the data source
        if (fieldConfig.extraActions) {
            fieldConfig.extraActions.forEach((extraAction) => {
                const buttonEl = ItemViewElementFactory.getInstance().createButton(form, formConfig, itemListeners, extraAction.button, ItemEventType.LINKED_EDIT, fieldConfig.field.id);
                buttonElements.push(buttonEl);
            });
        }

        FieldInputElementFactory.initialiseFieldElementAndEventHandlers(displayElement, formId, fieldConfig, listeners);
        FieldInputElementFactory.createFieldComponentsAndContainer(displayElement, formId, containerEl, fieldConfig, listeners);
        return {
            displayElement: displayElement,
            actionButtons: buttonElements
        };

    }

    public createLinkedArrayFormFieldComponentElement(form: Form, formConfig: ItemViewUIDefinition, itemListeners: ItemViewListener[], containerEl: HTMLElement, fieldConfig: FieldUIConfig, listeners: FieldListener[]):
        {
            displayElement: HTMLUListElement,
            actionButtons: HTMLButtonElement[]
        } {
        const formId = form.getId();

        const displayElement: HTMLUListElement = document.createElement('ul');
        browserUtil.addAttributes(displayElement, [{name: 'disabled', value: 'true'}, {
            name: 'readonly',
            value: 'true'
        }])

        if (fieldConfig.elementAttributes) browserUtil.addAttributes(displayElement, fieldConfig.elementAttributes);
        if (fieldConfig.elementClasses) browserUtil.addClasses(displayElement, fieldConfig.elementClasses);

        let buttonElements: HTMLButtonElement[] = [];
        // create the options from the data source
        if (fieldConfig.extraActions) {
            fieldConfig.extraActions.forEach((extraAction) => {
                const buttonEl = ItemViewElementFactory.getInstance().createButton(form, formConfig, itemListeners, extraAction.button, ItemEventType.LINKED_ARRAY_EDIT, fieldConfig.field.id);
                buttonElements.push(buttonEl);
            });
        }

        FieldInputElementFactory.initialiseFieldElementAndEventHandlers(displayElement, formId, fieldConfig, listeners);
        FieldInputElementFactory.createFieldComponentsAndContainer(displayElement, formId, containerEl, fieldConfig, listeners);
        return {
            displayElement: displayElement,
            actionButtons: buttonElements
        };

    }
}
