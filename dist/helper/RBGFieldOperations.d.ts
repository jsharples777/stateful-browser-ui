import { Field, FieldDefinition, FieldFormatter, FieldRenderer, FieldValidator, FieldValueGenerator, ValidationResponse } from "browser-state-management";
export declare class RBGFieldOperations implements FieldFormatter, FieldValidator, FieldValueGenerator, FieldRenderer {
    private radioButtons;
    constructor();
    formatValue(field: FieldDefinition, currentValue: string): any;
    isValidValue(field: FieldDefinition, currentValue: string | null): ValidationResponse;
    renderValue(field: Field | null, fieldDef: FieldDefinition, currentValue: string): string | null;
    generate(field: FieldDefinition, isCreate: boolean): string;
    setSubElements(elements: HTMLInputElement[]): void;
}
