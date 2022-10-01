import { Field, FieldListener, ValidatableView } from "browser-state-management";
import { FieldUIConfig } from "../../CommonTypes";
export declare class RenderingEventListener {
    private view;
    private formId;
    private fieldConfig;
    private listeners;
    private subElements;
    private field;
    constructor(view: ValidatableView, field: Field, fieldConfig: FieldUIConfig, listeners: FieldListener[], subElements?: HTMLInputElement[] | null);
    processRendering(fieldElement: HTMLInputElement): string;
    handleEvent(event: Event): void;
}
