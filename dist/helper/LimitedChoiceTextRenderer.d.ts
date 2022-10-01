import { Field, FieldDefinition, FieldRenderer } from "browser-state-management";
export declare class LimitedChoiceTextRenderer implements FieldRenderer {
    constructor();
    renderValue(field: Field | null, fieldDef: FieldDefinition, currentValue: string): string | null;
    generate(field: FieldDefinition, isCreate: boolean): string;
    setSubElements(elements: HTMLInputElement[]): void;
}
