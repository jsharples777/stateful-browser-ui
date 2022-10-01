import { ItemViewUIDefinition } from "../view/item/ItemViewUITypeDefs";
import { FieldUIConfig } from "../CommonTypes";
export declare class FormConfigHelperFunctions {
    static makeFieldHidden(field: FieldUIConfig): void;
    static makeFieldHiddenInConfig(config: ItemViewUIDefinition, fieldId: string): void;
    static reconfigureTextAreaInConfig(config: ItemViewUIDefinition, fieldId: string, columns: number, rows: number): void;
}
