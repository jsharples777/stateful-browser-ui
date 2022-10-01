import { Form } from "../form/Form";
import { ItemViewUIDefinition } from "../view/item/ItemViewUITypeDefs";
import { ItemViewListener } from "../view/item/ItemViewListener";
import { ItemView } from "../view/item/ItemView";
import { BasicButtonElement, ItemEventType } from "../CommonTypes";
import { FieldListener } from "browser-state-management";
export declare type ItemFactoryResponse = {
    top: HTMLElement;
    unsavedMessage?: HTMLElement;
    fields: HTMLInputElement[];
    textFields: HTMLTextAreaElement[];
    selectFields: HTMLSelectElement[];
    radioButtonGroups: {
        container: HTMLElement;
        radioButtons: HTMLInputElement[];
    }[];
    compositeFields?: {
        displayElement: HTMLInputElement;
        actionButtons: HTMLButtonElement[];
    }[];
    compositeArrayFields?: {
        displayElement: HTMLUListElement;
        actionButtons: HTMLButtonElement[];
    }[];
    linkedFields?: {
        displayElement: HTMLInputElement;
        actionButtons: HTMLButtonElement[];
    }[];
    linkedArrayFields?: {
        displayElement: HTMLUListElement;
        actionButtons: HTMLButtonElement[];
    }[];
    buttons?: ItemViewButtonElements;
};
export declare type ItemViewButtonElements = {
    deleteButton?: HTMLButtonElement;
    cancelButton?: HTMLButtonElement;
    saveButton?: HTMLButtonElement;
};
export declare class ItemViewElementFactory {
    private static _instance;
    private constructor();
    static getInstance(): ItemViewElementFactory;
    createFormElements(form: Form, listeners: ItemViewListener[], formConfig: ItemViewUIDefinition, fieldListeners: FieldListener[]): ItemFactoryResponse;
    createTableRowElements(itemId: string, view: ItemView, listeners: ItemViewListener[], config: ItemViewUIDefinition, fieldListeners: FieldListener[]): ItemFactoryResponse;
    createButton(form: Form, formConfig: ItemViewUIDefinition, listeners: ItemViewListener[], buttonDef: BasicButtonElement, eventType: ItemEventType, fieldId?: string, actionName?: string): HTMLButtonElement;
    protected createButtons(formConfig: ItemViewUIDefinition, formEl: HTMLFormElement, form: Form, listeners: ItemViewListener[]): ItemViewButtonElements;
}
