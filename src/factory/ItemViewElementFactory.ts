import {FieldInputElementFactory} from "./FieldInputElementFactory";

import {Form} from "../form/Form";
import {ItemViewUIDefinition} from "../view/item/ItemViewUITypeDefs";
import {ItemViewListener} from "../view/item/ItemViewListener";
import {ItemView} from "../view/item/ItemView";
import {
    BasicButtonElement,
    ElementLocation,
    FieldGroup,
    FieldUIConfig,
    ItemEventType,
    UIFieldType
} from "../CommonTypes";
import {browserUtil, FieldListener} from "browser-state-management";
import {ItemEvent} from "../ConfigurationTypes";

export type ItemFactoryResponse = {
    top: HTMLElement,
    unsavedMessage?: HTMLElement,
    fields: HTMLInputElement[],
    textFields: HTMLTextAreaElement[],
    selectFields: HTMLSelectElement[],
    radioButtonGroups: {
        container: HTMLElement,
        radioButtons: HTMLInputElement[]
    }[],
    compositeFields?: {
        displayElement: HTMLInputElement,
        actionButtons: HTMLButtonElement[]
    }[],
    compositeArrayFields?: {
        displayElement: HTMLUListElement,
        actionButtons: HTMLButtonElement[]
    }[],
    linkedFields?: {
        displayElement: HTMLInputElement,
        actionButtons: HTMLButtonElement[]
    }[],
    linkedArrayFields?: {
        displayElement: HTMLUListElement,
        actionButtons: HTMLButtonElement[]
    }[],
    buttons?: ItemViewButtonElements
}

export type ItemViewButtonElements = {
    deleteButton?: HTMLButtonElement,
    cancelButton?: HTMLButtonElement,
    saveButton?: HTMLButtonElement,
}

export class ItemViewElementFactory {

    private static _instance: ItemViewElementFactory;

    private constructor() {
    }

    public static getInstance(): ItemViewElementFactory {
        if (!(ItemViewElementFactory._instance)) {
            ItemViewElementFactory._instance = new ItemViewElementFactory();
        }
        return ItemViewElementFactory._instance;
    }

    public createFormElements(form: Form, listeners: ItemViewListener[], formConfig: ItemViewUIDefinition, fieldListeners: FieldListener[]): ItemFactoryResponse {
        const formId = form.getId();

        let formEl: HTMLFormElement = document.createElement('form');
        formEl.setAttribute('id', formId);
        formEl.setAttribute('name', formConfig.displayName);

        if (formConfig.classes) browserUtil.addClasses(formEl, formConfig.classes);
        // create each of the fields and collect them
        let formInputElements: HTMLInputElement[] = [];
        let formTAElements: HTMLTextAreaElement[] = [];
        let formRBGElements: {
            container: HTMLElement,
            radioButtons: HTMLInputElement[]
        }[] = [];
        let formSelectElements: HTMLSelectElement[] = [];
        let formCompositeElements: {
            displayElement: HTMLInputElement,
            actionButtons: HTMLButtonElement[]
        }[] = [];
        let formCompositeArrayElements: {
            displayElement: HTMLUListElement,
            actionButtons: HTMLButtonElement[]
        }[] = [];
        let formLinkedElements: {
            displayElement: HTMLInputElement,
            actionButtons: HTMLButtonElement[]
        }[] = [];
        let formLinkedArrayElements: {
            displayElement: HTMLUListElement,
            actionButtons: HTMLButtonElement[]
        }[] = [];
        let unsavedMessage: HTMLElement | undefined = undefined;

        if (formConfig.unsavedChanges) {
            unsavedMessage = document.createElement(formConfig.unsavedChanges.type);
            browserUtil.addClasses(unsavedMessage, formConfig.unsavedChanges.classes);
            if (formConfig.unsavedChanges.attributes) browserUtil.addAttributes(unsavedMessage, formConfig.unsavedChanges.attributes);

            formEl.appendChild(unsavedMessage);
        }

        let buttons: ItemViewButtonElements = {
            deleteButton: undefined,
            cancelButton: undefined,
            saveButton: undefined
        }

        if (formConfig.buttonPosition === ElementLocation.top) {
            buttons = this.createButtons(formConfig, formEl, form, listeners);
        }

        formConfig.fieldGroups.forEach((group: FieldGroup) => {
            // if the group has a container make that, otherwise the form is the container
            let containerEl = formEl;
            if (group.containedBy) {
                // @ts-ignore
                containerEl = document.createElement(group.containedBy.type);
                if (containerEl) {
                    if (group.containedBy.attributes) browserUtil.addAttributes(containerEl, group.containedBy.attributes);
                    if (group.containedBy.classes) browserUtil.addClasses(containerEl, group.containedBy.classes);
                    formEl.appendChild(containerEl);
                }
            }
            group.fields.forEach((field: FieldUIConfig) => {
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
                            if (subGroup.containedBy.attributes) browserUtil.addAttributes(subContainerEl, subGroup.containedBy.attributes);
                            if (subGroup.containedBy.classes) browserUtil.addClasses(subContainerEl, subGroup.containedBy.classes);
                            containerEl.appendChild(subContainerEl);
                        }
                    }
                    subGroup.fields.forEach((field: FieldUIConfig) => {
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


        let result: ItemFactoryResponse = {
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
        }

        return result;
    }

    public createTableRowElements(itemId: string, view: ItemView, listeners: ItemViewListener[], config: ItemViewUIDefinition, fieldListeners: FieldListener[]): ItemFactoryResponse {
        let rowEl: HTMLTableRowElement = document.createElement('tr');

        // create each of the fields and collect them
        let rowInputElements: HTMLInputElement[] = [];
        let rowSelectElements: HTMLSelectElement[] = [];

        let rowTAElements: HTMLTextAreaElement[] = [];
        let rowRBGElements: {
            container: HTMLElement,
            radioButtons: HTMLInputElement[]
        }[] = [];
        let rowCompositeElements: {
            displayElement: HTMLInputElement,
            actionButtons: HTMLButtonElement[]
        }[] = [];


        config.fieldGroups.forEach((group: FieldGroup) => {
            // if the group has a container make that, otherwise the form is the container
            let containerEl = rowEl;
            group.fields.forEach((field: FieldUIConfig) => {
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


        let result: ItemFactoryResponse = {
            top: rowEl,
            fields: rowInputElements,
            selectFields: rowSelectElements,
            textFields: rowTAElements,
            radioButtonGroups: rowRBGElements,
            compositeFields: rowCompositeElements
        }

        return result;
    }

    public createButton(form: Form, formConfig: ItemViewUIDefinition, listeners: ItemViewListener[], buttonDef: BasicButtonElement, eventType: ItemEventType, fieldId?: string, actionName?: string): HTMLButtonElement {
        const formId = form.getId();

        let buttonEl: HTMLButtonElement = document.createElement('button');
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
            let itemEvent: ItemEvent = {
                target: form,
                identifier: formConfig.id,
                fieldId: fieldId,
                eventType: eventType,
                actionName: actionName,
                currentDataObj: form.getCurrentDataObj()
            }
            if (eventType === ItemEventType.FIELD_ACTION) {
                listeners.forEach((listener) => listener.fieldAction(formConfig.displayName, itemEvent));
            } else {
                listeners.forEach((listener) => listener.itemViewEvent(formConfig.displayName, itemEvent));
            }

        });
        return buttonEl;
    }

    protected createButtons(formConfig: ItemViewUIDefinition, formEl: HTMLFormElement, form: Form, listeners: ItemViewListener[]): ItemViewButtonElements {
        let buttons: ItemViewButtonElements = {
            deleteButton: undefined,
            cancelButton: undefined,
            saveButton: undefined
        }
        /* setup the buttons */
        let buttonContainer: HTMLElement = formEl;

        if (formConfig.buttonsContainedBy) {
            buttonContainer = document.createElement(formConfig.buttonsContainedBy.type);
            if (buttonContainer) {
                if (formConfig.buttonsContainedBy.attributes) browserUtil.addAttributes(buttonContainer, formConfig.buttonsContainedBy.attributes);
                browserUtil.addClasses(buttonContainer, formConfig.buttonsContainedBy.classes);
                formEl.appendChild(buttonContainer);
            } else {
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
