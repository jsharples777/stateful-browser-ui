import { UIFieldType } from "../CommonTypes";
export class FormConfigHelperFunctions {
    static makeFieldHidden(field) {
        field.elementType = UIFieldType.hidden;
        field.containedBy = undefined;
        field.label = undefined;
        field.describedBy = undefined;
        field.validator = undefined;
    }
    static makeFieldHiddenInConfig(config, fieldId) {
        const foundIndex = config.fieldGroups[0].fields.findIndex((value) => value.field.id === fieldId);
        if (foundIndex >= 0) {
            let fieldDef = config.fieldGroups[0].fields[foundIndex];
            FormConfigHelperFunctions.makeFieldHidden(fieldDef);
        }
    }
    static reconfigureTextAreaInConfig(config, fieldId, columns, rows) {
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
//# sourceMappingURL=FormConfigHelperFunctions.js.map