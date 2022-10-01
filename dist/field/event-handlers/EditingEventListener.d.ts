import { Field, FieldListener, ValidatableView } from "browser-state-management";
import { FieldUIConfig } from "../../CommonTypes";
export declare class EditingEventListener {
    private view;
    private formId;
    private fieldConfig;
    private listeners;
    private field;
    constructor(view: ValidatableView, field: Field, fieldConfig: FieldUIConfig, listeners: FieldListener[]);
    handleEditEvent(event: Event): void;
    handleEditCompletedEvent(event: Event): void;
}
