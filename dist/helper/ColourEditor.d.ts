import { Field, FieldDefinition, FieldEditor } from "browser-state-management";
export declare class ColourEditor implements FieldEditor {
    protected colourPickerContainerId: string;
    protected field: Field | null;
    protected container: HTMLElement | null;
    constructor(colourPickerContainerId: string);
    editCompleted(field: Field, fieldDef: FieldDefinition): void;
    editValue(field: Field, fieldDef: FieldDefinition, currentValue: string): string;
    cbColourChange(colour: string): void;
}
