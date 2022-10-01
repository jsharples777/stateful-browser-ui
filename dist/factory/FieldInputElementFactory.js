import { ItemViewElementFactory } from "./ItemViewElementFactory";
import { ItemEventType, UIFieldType } from "../CommonTypes";
import { browserUtil, DATA_ID_ATTRIBUTE, FieldType } from "browser-state-management";
class DefaultFieldOptionsListener {
    constructor(formId, parentElement, fieldUIConfig) {
        this.formId = formId;
        this.parentElement = parentElement;
        this.fieldUIConfig = fieldUIConfig;
    }
    optionsChanged(newOptions) {
        browserUtil.removeAllChildren(this.parentElement);
        let subEls = FieldInputElementFactory.createSubElements(this.formId, this.parentElement, this.fieldUIConfig, newOptions);
    }
}
export class FieldInputElementFactory {
    constructor() {
    }
    static getInstance() {
        if (!(FieldInputElementFactory._instance)) {
            FieldInputElementFactory._instance = new FieldInputElementFactory();
        }
        return FieldInputElementFactory._instance;
    }
    static getElementIdForFieldId(view, fieldId) {
        return `${view.getId()}.field.${fieldId}`;
    }
    static initialiseFieldElementAndEventHandlers(fieldElement, formId, fieldConfig, listeners, subElements = null) {
        fieldElement.setAttribute('id', `${formId}.field.${fieldConfig.field.id}`);
        fieldElement.setAttribute(DATA_ID_ATTRIBUTE, fieldConfig.field.id);
        fieldElement.setAttribute('name', fieldConfig.field.id);
        if (fieldConfig.elementAttributes)
            browserUtil.addAttributes(fieldElement, fieldConfig.elementAttributes);
        if (fieldConfig.elementClasses)
            browserUtil.addClasses(fieldElement, fieldConfig.elementClasses);
        // readonly field?
        if (fieldConfig.field.displayOnly) {
            browserUtil.addAttributes(fieldElement, [{ name: 'disabled', value: 'true' }, {
                    name: 'readonly',
                    value: 'true'
                }]);
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
    static createFieldComponentsAndContainer(fieldElement, formId, containerEl, fieldConfig, listeners, form, formConfig, itemListeners) {
        // if the field has a validator, then we need a div for error messages
        let errorMessageDivEl = null;
        if (fieldConfig.validator && fieldConfig.validator.messageDisplay) {
            errorMessageDivEl = document.createElement('div');
            errorMessageDivEl.setAttribute('id', `${formId}.field.${fieldConfig.field.id}.error`);
            errorMessageDivEl.setAttribute('style', 'display: none'); // default to not visible
            browserUtil.addClasses(errorMessageDivEl, fieldConfig.validator.messageDisplay.classes);
            let messageEl = document.createElement(fieldConfig.validator.messageDisplay.type);
            if (messageEl) {
                messageEl.setAttribute('id', `${formId}.field.${fieldConfig.field.id}.error.message`);
                if (fieldConfig.validator.messageDisplay.attributes)
                    browserUtil.addAttributes(messageEl, fieldConfig.validator.messageDisplay.attributes);
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
                if (fieldConfig.containedBy.attributes)
                    browserUtil.addAttributes(containerEl, fieldConfig.containedBy.attributes);
                // do we have a label also?
                if (fieldConfig.label) {
                    let labelEl = document.createElement('label');
                    labelEl.setAttribute('for', `${formId}.field.${fieldConfig.field.id}`);
                    labelEl.innerHTML = fieldConfig.field.displayName;
                    if (fieldConfig.label.attributes)
                        browserUtil.addAttributes(labelEl, fieldConfig.label.attributes);
                    if (fieldConfig.label.classes)
                        browserUtil.addClasses(labelEl, fieldConfig.label.classes);
                    containedByEl.appendChild(labelEl);
                }
                if (fieldConfig.describedBy) {
                    let descEl = document.createElement(fieldConfig.describedBy.elementType);
                    if (descEl) {
                        // link the field and the description
                        descEl.setAttribute('id', `${formId}.field.${fieldConfig.field.id}.desc`);
                        if (fieldConfig.field.description)
                            descEl.innerHTML = fieldConfig.field.description;
                        fieldElement.setAttribute('aria-describedby', `${formId}.field.${fieldConfig.field.id}.desc`);
                        if (fieldConfig.describedBy.elementClasses)
                            browserUtil.addClasses(descEl, fieldConfig.describedBy.elementClasses);
                        containedByEl.appendChild(fieldElement);
                        containedByEl.appendChild(descEl);
                        if (errorMessageDivEl)
                            containedByEl.appendChild(errorMessageDivEl);
                    }
                    else { // description failure, add the field
                        containedByEl.appendChild(fieldElement);
                        if (errorMessageDivEl)
                            containedByEl.appendChild(errorMessageDivEl);
                    }
                }
                else { // no description, add field to container
                    containedByEl.appendChild(fieldElement);
                    if (errorMessageDivEl)
                        containedByEl.appendChild(errorMessageDivEl);
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
            }
            else { // errors should keep making something!
                containerEl.appendChild(fieldElement);
                if (errorMessageDivEl)
                    containerEl.appendChild(errorMessageDivEl);
            }
        }
        else {
            containerEl.appendChild(fieldElement);
            if (errorMessageDivEl)
                containerEl.appendChild(errorMessageDivEl);
        }
    }
    static createSubElements(formId, parentEl, fieldConfig, valueOptions) {
        let results = [];
        valueOptions.forEach((valueOption, index) => {
            if (fieldConfig.subElement) {
                let containerEl = parentEl;
                // is there a container?
                if (fieldConfig.subElement.container) {
                    containerEl = document.createElement(fieldConfig.subElement.container.type);
                    browserUtil.addClasses(containerEl, fieldConfig.subElement.container.classes);
                    if (fieldConfig.subElement.container.attributes)
                        browserUtil.addAttributes(containerEl, fieldConfig.subElement.container.attributes);
                    parentEl.appendChild(containerEl);
                }
                let valueEl = document.createElement(fieldConfig.subElement.element.type);
                valueEl.setAttribute('value', valueOption.value);
                valueEl.setAttribute('id', `${formId}.field.${fieldConfig.field.id}.${index}`);
                valueEl.setAttribute('name', `${formId}.field.${fieldConfig.field.id}`);
                browserUtil.addClasses(valueEl, fieldConfig.subElement.element.classes);
                if (fieldConfig.subElement.element.attributes)
                    browserUtil.addAttributes(valueEl, fieldConfig.subElement.element.attributes);
                containerEl.appendChild(valueEl);
                if (fieldConfig.subElement.label) {
                    let labelEl = document.createElement('label');
                    if (fieldConfig.subElement.label.classes)
                        browserUtil.addClasses(labelEl, fieldConfig.subElement.label.classes);
                    if (fieldConfig.subElement.label.attributes)
                        browserUtil.addAttributes(labelEl, fieldConfig.subElement.label.attributes);
                    labelEl.innerHTML = valueOption.name;
                    containerEl.appendChild(labelEl);
                }
                else {
                    if (fieldConfig.elementType === UIFieldType.radioGroup) {
                        containerEl.innerHTML += valueOption.name;
                    }
                    else if (fieldConfig.elementType === UIFieldType.select) {
                        valueEl.innerText = valueOption.name;
                    }
                }
                results.push(valueEl);
            }
        });
        return results;
    }
    createInputFormFieldComponentElement(formId, containerEl, fieldConfig, listeners, form, formConfig, itemListeners) {
        let fieldElement = document.createElement('input');
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
    createTAFormFieldComponentElement(formId, containerEl, fieldConfig, listeners, form, formConfig, itemListeners) {
        let fieldElement = document.createElement('textarea');
        if (fieldConfig.textarea) {
            fieldElement.setAttribute('rows', `${fieldConfig.textarea.rows}`);
            fieldElement.setAttribute('cols', `${fieldConfig.textarea.cols}`);
        }
        FieldInputElementFactory.initialiseFieldElementAndEventHandlers(fieldElement, formId, fieldConfig, listeners);
        FieldInputElementFactory.createFieldComponentsAndContainer(fieldElement, formId, containerEl, fieldConfig, listeners, form, formConfig, itemListeners);
        return fieldElement;
    }
    createSelectFormFieldComponentElement(formId, containerEl, fieldConfig, listeners, form, formConfig, itemListeners) {
        let fieldElement = document.createElement('select');
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
    createRadioGroupFormFieldComponentElement(formId, containerEl, fieldConfig, listeners, form, formConfig, itemListeners) {
        // create a div for each option in the source
        // create the div for the radio group
        let radioGroupElement = document.createElement('div');
        if (fieldConfig.elementAttributes)
            browserUtil.addAttributes(radioGroupElement, fieldConfig.elementAttributes);
        if (fieldConfig.elementClasses)
            browserUtil.addClasses(radioGroupElement, fieldConfig.elementClasses);
        let subElements = [];
        // create the options from the data source
        if (fieldConfig.datasource) {
            // we should get the radio buttons back
            subElements = FieldInputElementFactory.createSubElements(formId, radioGroupElement, fieldConfig, fieldConfig.datasource.getOptions());
            // listen for data source changes
            fieldConfig.datasource.addListener(new DefaultFieldOptionsListener(formId, radioGroupElement, fieldConfig));
            // setup the subelements for the validator, formatter, and renderer
            if (fieldConfig.validator)
                fieldConfig.validator.validator.setSubElements(subElements);
            if (fieldConfig.renderer)
                fieldConfig.renderer.setSubElements(subElements);
            if (fieldConfig.formatter)
                fieldConfig.formatter.setSubElements(subElements);
        }
        FieldInputElementFactory.initialiseFieldElementAndEventHandlers(radioGroupElement, formId, fieldConfig, listeners, subElements);
        FieldInputElementFactory.createFieldComponentsAndContainer(radioGroupElement, formId, containerEl, fieldConfig, listeners, form, formConfig, itemListeners);
        return {
            container: radioGroupElement,
            radioButtons: subElements
        };
    }
    createCompositeFormFieldComponentElement(form, formConfig, itemListeners, containerEl, fieldConfig, listeners) {
        const formId = form.getId();
        const displayElement = document.createElement('input');
        displayElement.setAttribute('type', 'text');
        browserUtil.addAttributes(displayElement, [{ name: 'disabled', value: 'true' }, {
                name: 'readonly',
                value: 'true'
            }]);
        if (fieldConfig.elementAttributes)
            browserUtil.addAttributes(displayElement, fieldConfig.elementAttributes);
        if (fieldConfig.elementClasses)
            browserUtil.addClasses(displayElement, fieldConfig.elementClasses);
        let buttonElements = [];
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
    createCompositeArrayFormFieldComponentElement(form, formConfig, itemListeners, containerEl, fieldConfig, listeners) {
        const formId = form.getId();
        const displayElement = document.createElement('ul');
        browserUtil.addAttributes(displayElement, [{ name: 'disabled', value: 'true' }, {
                name: 'readonly',
                value: 'true'
            }]);
        if (fieldConfig.elementAttributes)
            browserUtil.addAttributes(displayElement, fieldConfig.elementAttributes);
        if (fieldConfig.elementClasses)
            browserUtil.addClasses(displayElement, fieldConfig.elementClasses);
        let buttonElements = [];
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
    createLinkedFormFieldComponentElement(form, formConfig, itemListeners, containerEl, fieldConfig, listeners) {
        const formId = form.getId();
        const displayElement = document.createElement('input');
        displayElement.setAttribute('type', 'text');
        browserUtil.addAttributes(displayElement, [{ name: 'disabled', value: 'true' }, {
                name: 'readonly',
                value: 'true'
            }]);
        if (fieldConfig.elementAttributes)
            browserUtil.addAttributes(displayElement, fieldConfig.elementAttributes);
        if (fieldConfig.elementClasses)
            browserUtil.addClasses(displayElement, fieldConfig.elementClasses);
        let buttonElements = [];
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
    createLinkedArrayFormFieldComponentElement(form, formConfig, itemListeners, containerEl, fieldConfig, listeners) {
        const formId = form.getId();
        const displayElement = document.createElement('ul');
        browserUtil.addAttributes(displayElement, [{ name: 'disabled', value: 'true' }, {
                name: 'readonly',
                value: 'true'
            }]);
        if (fieldConfig.elementAttributes)
            browserUtil.addAttributes(displayElement, fieldConfig.elementAttributes);
        if (fieldConfig.elementClasses)
            browserUtil.addClasses(displayElement, fieldConfig.elementClasses);
        let buttonElements = [];
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
//# sourceMappingURL=FieldInputElementFactory.js.map