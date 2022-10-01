import { FieldInputElementFactory } from "./FieldInputElementFactory";
import { ElementLocation, ItemEventType, UIFieldType } from "../CommonTypes";
import { browserUtil } from "browser-state-management";
export class ItemViewElementFactory {
    constructor() {
    }
    static getInstance() {
        if (!(ItemViewElementFactory._instance)) {
            ItemViewElementFactory._instance = new ItemViewElementFactory();
        }
        return ItemViewElementFactory._instance;
    }
    createFormElements(form, listeners, formConfig, fieldListeners) {
        const formId = form.getId();
        let formEl = document.createElement('form');
        formEl.setAttribute('id', formId);
        formEl.setAttribute('name', formConfig.displayName);
        if (formConfig.classes)
            browserUtil.addClasses(formEl, formConfig.classes);
        // create each of the fields and collect them
        let formInputElements = [];
        let formTAElements = [];
        let formRBGElements = [];
        let formSelectElements = [];
        let formCompositeElements = [];
        let formCompositeArrayElements = [];
        let formLinkedElements = [];
        let formLinkedArrayElements = [];
        let unsavedMessage = undefined;
        if (formConfig.unsavedChanges) {
            unsavedMessage = document.createElement(formConfig.unsavedChanges.type);
            browserUtil.addClasses(unsavedMessage, formConfig.unsavedChanges.classes);
            if (formConfig.unsavedChanges.attributes)
                browserUtil.addAttributes(unsavedMessage, formConfig.unsavedChanges.attributes);
            formEl.appendChild(unsavedMessage);
        }
        let buttons = {
            deleteButton: undefined,
            cancelButton: undefined,
            saveButton: undefined
        };
        if (formConfig.buttonPosition === ElementLocation.top) {
            buttons = this.createButtons(formConfig, formEl, form, listeners);
        }
        formConfig.fieldGroups.forEach((group) => {
            // if the group has a container make that, otherwise the form is the container
            let containerEl = formEl;
            if (group.containedBy) {
                // @ts-ignore
                containerEl = document.createElement(group.containedBy.type);
                if (containerEl) {
                    if (group.containedBy.attributes)
                        browserUtil.addAttributes(containerEl, group.containedBy.attributes);
                    if (group.containedBy.classes)
                        browserUtil.addClasses(containerEl, group.containedBy.classes);
                    formEl.appendChild(containerEl);
                }
            }
            group.fields.forEach((field) => {
                switch (field.elementType) {
                    case (UIFieldType.textarea): {
                        const fieldEl = FieldInputElementFactory.getInstance().createTAFormFieldComponentElement(formId, containerEl, field, fieldListeners, form, formConfig, listeners);
                        formTAElements.push(fieldEl);
                        break;
                    }
                    case (UIFieldType.select): {
                        const fieldEl = FieldInputElementFactory.getInstance().createSelectFormFieldComponentElement(formId, containerEl, field, fieldListeners, form, formConfig, listeners);
                        formSelectElements.push(fieldEl);
                        break;
                    }
                    case (UIFieldType.radioGroup): {
                        const fieldEl = FieldInputElementFactory.getInstance().createRadioGroupFormFieldComponentElement(formId, containerEl, field, fieldListeners, form, formConfig, listeners);
                        formRBGElements.push(fieldEl);
                        break;
                    }
                    case (UIFieldType.composite):
                    case (UIFieldType.list):
                    case (UIFieldType.linked):
                    case (UIFieldType.linkedList):
                    default: {
                        const fieldEl = FieldInputElementFactory.getInstance().createInputFormFieldComponentElement(formId, containerEl, field, fieldListeners, form, formConfig, listeners);
                        formInputElements.push(fieldEl);
                    }
                }
            });
            if (group.subGroups) {
                group.subGroups.forEach((subGroup) => {
                    let subContainerEl = containerEl;
                    if (subGroup.containedBy) {
                        // @ts-ignore
                        subContainerEl = document.createElement(subGroup.containedBy.type);
                        if (subContainerEl) {
                            if (subGroup.containedBy.attributes)
                                browserUtil.addAttributes(subContainerEl, subGroup.containedBy.attributes);
                            if (subGroup.containedBy.classes)
                                browserUtil.addClasses(subContainerEl, subGroup.containedBy.classes);
                            containerEl.appendChild(subContainerEl);
                        }
                    }
                    subGroup.fields.forEach((field) => {
                        switch (field.elementType) {
                            case (UIFieldType.textarea): {
                                const fieldEl = FieldInputElementFactory.getInstance().createTAFormFieldComponentElement(formId, subContainerEl, field, fieldListeners, form, formConfig, listeners);
                                formTAElements.push(fieldEl);
                                break;
                            }
                            case (UIFieldType.select): {
                                const fieldEl = FieldInputElementFactory.getInstance().createSelectFormFieldComponentElement(formId, subContainerEl, field, fieldListeners, form, formConfig, listeners);
                                formSelectElements.push(fieldEl);
                                break;
                            }
                            case (UIFieldType.radioGroup): {
                                const fieldEl = FieldInputElementFactory.getInstance().createRadioGroupFormFieldComponentElement(formId, subContainerEl, field, fieldListeners, form, formConfig, listeners);
                                formRBGElements.push(fieldEl);
                                break;
                            }
                            case (UIFieldType.composite):
                            case (UIFieldType.list):
                            case (UIFieldType.linked):
                            case (UIFieldType.linkedList):
                            default: {
                                const fieldEl = FieldInputElementFactory.getInstance().createInputFormFieldComponentElement(formId, subContainerEl, field, fieldListeners, form, formConfig, listeners);
                                formInputElements.push(fieldEl);
                            }
                        }
                    });
                });
            }
        });
        if (formConfig.buttonPosition === ElementLocation.bottom) {
            buttons = this.createButtons(formConfig, formEl, form, listeners);
        }
        let result = {
            top: formEl,
            unsavedMessage: unsavedMessage,
            fields: formInputElements,
            selectFields: formSelectElements,
            radioButtonGroups: formRBGElements,
            compositeFields: formCompositeElements,
            compositeArrayFields: formCompositeArrayElements,
            linkedFields: formLinkedElements,
            linkedArrayFields: formLinkedArrayElements,
            textFields: formTAElements,
            buttons: buttons
        };
        return result;
    }
    createTableRowElements(itemId, view, listeners, config, fieldListeners) {
        let rowEl = document.createElement('tr');
        // create each of the fields and collect them
        let rowInputElements = [];
        let rowSelectElements = [];
        let rowTAElements = [];
        let rowRBGElements = [];
        let rowCompositeElements = [];
        config.fieldGroups.forEach((group) => {
            // if the group has a container make that, otherwise the form is the container
            let containerEl = rowEl;
            group.fields.forEach((field) => {
                switch (field.elementType) {
                    case (UIFieldType.select): {
                        const fieldEl = FieldInputElementFactory.getInstance().createSelectFormFieldComponentElement(itemId, containerEl, field, fieldListeners);
                        rowSelectElements.push(fieldEl);
                        break;
                    }
                    default: {
                        const fieldEl = FieldInputElementFactory.getInstance().createInputFormFieldComponentElement(itemId, containerEl, field, fieldListeners);
                        rowInputElements.push(fieldEl);
                    }
                }
            });
        });
        let result = {
            top: rowEl,
            fields: rowInputElements,
            selectFields: rowSelectElements,
            textFields: rowTAElements,
            radioButtonGroups: rowRBGElements,
            compositeFields: rowCompositeElements
        };
        return result;
    }
    createButton(form, formConfig, listeners, buttonDef, eventType, fieldId, actionName) {
        const formId = form.getId();
        let buttonEl = document.createElement('button');
        browserUtil.addClasses(buttonEl, buttonDef.classes);
        buttonEl.setAttribute('id', `${formId}.${eventType}`);
        if (buttonDef.text) {
            buttonEl.innerText = buttonDef.text;
        }
        if (buttonDef.iconClasses) {
            let iconEl = document.createElement('i');
            if (iconEl) {
                browserUtil.addClasses(iconEl, buttonDef.iconClasses);
                buttonEl.appendChild(iconEl);
            }
        }
        /* setup the event handler for the button */
        buttonEl.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            let itemEvent = {
                target: form,
                identifier: formConfig.id,
                fieldId: fieldId,
                eventType: eventType,
                actionName: actionName,
                currentDataObj: form.getCurrentDataObj()
            };
            if (eventType === ItemEventType.FIELD_ACTION) {
                listeners.forEach((listener) => listener.fieldAction(formConfig.displayName, itemEvent));
            }
            else {
                listeners.forEach((listener) => listener.itemViewEvent(formConfig.displayName, itemEvent));
            }
        });
        return buttonEl;
    }
    createButtons(formConfig, formEl, form, listeners) {
        let buttons = {
            deleteButton: undefined,
            cancelButton: undefined,
            saveButton: undefined
        };
        /* setup the buttons */
        let buttonContainer = formEl;
        if (formConfig.buttonsContainedBy) {
            buttonContainer = document.createElement(formConfig.buttonsContainedBy.type);
            if (buttonContainer) {
                if (formConfig.buttonsContainedBy.attributes)
                    browserUtil.addAttributes(buttonContainer, formConfig.buttonsContainedBy.attributes);
                browserUtil.addClasses(buttonContainer, formConfig.buttonsContainedBy.classes);
                formEl.appendChild(buttonContainer);
            }
            else {
                buttonContainer = formEl; // couldn't create the button container, use the form
            }
        }
        if (formConfig.deleteButton) {
            buttons.deleteButton = this.createButton(form, formConfig, listeners, formConfig.deleteButton, ItemEventType.DELETING);
            buttonContainer.appendChild(buttons.deleteButton);
        }
        if (formConfig.cancelButton) {
            buttons.cancelButton = this.createButton(form, formConfig, listeners, formConfig.cancelButton, ItemEventType.CANCELLING);
            buttonContainer.appendChild(buttons.cancelButton);
        }
        if (formConfig.saveButton) {
            buttons.saveButton = this.createButton(form, formConfig, listeners, formConfig.saveButton, ItemEventType.SAVING);
            buttonContainer.appendChild(buttons.saveButton);
        }
        return buttons;
    }
}
//# sourceMappingURL=ItemViewElementFactory.js.map