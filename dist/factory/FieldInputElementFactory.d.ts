import { Form } from "../form/Form";
import { ItemViewListener } from "../view/item/ItemViewListener";
import { ItemViewUIDefinition } from "../view/item/ItemViewUITypeDefs";
import { FieldUIConfig } from "../CommonTypes";
import { FieldListener, ValidatableView, ValueOption } from "browser-state-management";
export declare type FieldFactoryParameters = {
    form: Form;
    formConfig: ItemViewUIDefinition;
    itemListeners: ItemViewListener[];
    containerEl: HTMLElement;
    fieldConfig: FieldUIConfig;
    listeners: FieldListener[];
};
export declare class FieldInputElementFactory {
    private static _instance;
    private constructor();
    static getInstance(): FieldInputElementFactory;
    static getElementIdForFieldId(view: ValidatableView, fieldId: string): string;
    static initialiseFieldElementAndEventHandlers(fieldElement: HTMLElement, formId: string, fieldConfig: FieldUIConfig, listeners: FieldListener[], subElements?: HTMLInputElement[] | null): void;
    static createFieldComponentsAndContainer(fieldElement: HTMLElement, formId: string, containerEl: HTMLElement, fieldConfig: FieldUIConfig, listeners: FieldListener[], form?: Form, formConfig?: ItemViewUIDefinition, itemListeners?: ItemViewListener[]): void;
    static createSubElements(formId: string, parentEl: HTMLElement, fieldConfig: FieldUIConfig, valueOptions: ValueOption[]): HTMLElement[];
    createInputFormFieldComponentElement(formId: string, containerEl: HTMLElement, fieldConfig: FieldUIConfig, listeners: FieldListener[], form?: Form, formConfig?: ItemViewUIDefinition, itemListeners?: ItemViewListener[]): HTMLInputElement;
    createTAFormFieldComponentElement(formId: string, containerEl: HTMLElement, fieldConfig: FieldUIConfig, listeners: FieldListener[], form?: Form, formConfig?: ItemViewUIDefinition, itemListeners?: ItemViewListener[]): HTMLTextAreaElement;
    createSelectFormFieldComponentElement(formId: string, containerEl: HTMLElement, fieldConfig: FieldUIConfig, listeners: FieldListener[], form?: Form, formConfig?: ItemViewUIDefinition, itemListeners?: ItemViewListener[]): HTMLSelectElement;
    createRadioGroupFormFieldComponentElement(formId: string, containerEl: HTMLElement, fieldConfig: FieldUIConfig, listeners: FieldListener[], form?: Form, formConfig?: ItemViewUIDefinition, itemListeners?: ItemViewListener[]): {
        container: HTMLElement;
        radioButtons: HTMLInputElement[];
    };
    createCompositeFormFieldComponentElement(form: Form, formConfig: ItemViewUIDefinition, itemListeners: ItemViewListener[], containerEl: HTMLElement, fieldConfig: FieldUIConfig, listeners: FieldListener[]): {
        displayElement: HTMLInputElement;
        actionButtons: HTMLButtonElement[];
    };
    createCompositeArrayFormFieldComponentElement(form: Form, formConfig: ItemViewUIDefinition, itemListeners: ItemViewListener[], containerEl: HTMLElement, fieldConfig: FieldUIConfig, listeners: FieldListener[]): {
        displayElement: HTMLUListElement;
        actionButtons: HTMLButtonElement[];
    };
    createLinkedFormFieldComponentElement(form: Form, formConfig: ItemViewUIDefinition, itemListeners: ItemViewListener[], containerEl: HTMLElement, fieldConfig: FieldUIConfig, listeners: FieldListener[]): {
        displayElement: HTMLInputElement;
        actionButtons: HTMLButtonElement[];
    };
    createLinkedArrayFormFieldComponentElement(form: Form, formConfig: ItemViewUIDefinition, itemListeners: ItemViewListener[], containerEl: HTMLElement, fieldConfig: FieldUIConfig, listeners: FieldListener[]): {
        displayElement: HTMLUListElement;
        actionButtons: HTMLButtonElement[];
    };
}
