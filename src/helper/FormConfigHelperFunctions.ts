
import {ItemViewUIDefinition} from "../view/item/ItemViewUITypeDefs";
import {FieldUIConfig, UIFieldType} from "../CommonTypes";

export class FormConfigHelperFunctions {
    public static makeFieldHidden(field: FieldUIConfig) {
        field.elementType = UIFieldType.hidden;
        field.containedBy = undefined;
        field.label = undefined;
        field.describedBy = undefined;
        field.validator = undefined;
    }

    public static makeFieldHiddenInConfig(config: ItemViewUIDefinition, fieldId: string) {
        const foundIndex = config.fieldGroups[0].fields.findIndex((value) => value.field.id === fieldId);
        if (foundIndex >= 0) {
            let fieldDef = config.fieldGroups[0].fields[foundIndex];
            FormConfigHelperFunctions.makeFieldHidden(fieldDef);
        }
    }

    public static reconfigureTextAreaInConfig(config: ItemViewUIDefinition, fieldId: string, columns: number, rows: number) {
        const foundIndex = config.fieldGroups[0].fields.findIndex((value) => value.field.id === fieldId);
        if (foundIndex >= 0) {
            let fieldDef = config.fieldGroups[0].fields[foundIndex];
            if (fieldDef.elementType === UIFieldType.textarea) {
                if (fieldDef.textarea) {
                    fieldDef.textarea.cols = columns;
                    fieldDef.textarea.rows = rows;
                }

            }
        }

    }

}
