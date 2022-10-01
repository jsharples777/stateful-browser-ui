import { AbstractField } from "./AbstractField";
import { FieldUIConfig } from "../CommonTypes";
import { FieldDefinition, ValidatableView } from "browser-state-management";
export declare class RadioButtonGroupField extends AbstractField {
    constructor(view: ValidatableView, config: FieldUIConfig, fieldDef: FieldDefinition, element: HTMLElement, subElements: HTMLInputElement[]);
}
