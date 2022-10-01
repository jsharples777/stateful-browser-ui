import { FieldUIConfig } from "../../CommonTypes";
import { FieldListener, ValidatableView } from "browser-state-management";
export declare class ValidationEventHandler {
    private view;
    private formId;
    private fieldConfig;
    private listeners;
    private subElements;
    constructor(view: ValidatableView, fieldConfig: FieldUIConfig, listeners: FieldListener[], subElements?: HTMLInputElement[] | null);
    setValidationStatusAndMessage(fieldElement: HTMLElement, isValid: boolean, value: string, message?: string | undefined, resetOnFailure?: boolean): void;
    processValidation(fieldElement: HTMLElement): void;
    handleEvent(event: Event): void;
}
