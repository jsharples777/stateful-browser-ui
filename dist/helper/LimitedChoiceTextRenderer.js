import debug from 'debug';
const rlogger = debug('limited-choice-text-renderer');
export class LimitedChoiceTextRenderer {
    constructor() {
    }
    renderValue(field, fieldDef, currentValue) {
        rlogger(`Rendering value for field ${fieldDef.displayName} with new value ${currentValue}`);
        // find the current value in the data source and convert to text for display
        let result = currentValue;
        if (fieldDef.dataSource) {
            const valueOptions = fieldDef.dataSource.getOptions();
            const foundIndex = valueOptions.findIndex((option) => option.value === currentValue);
            if (foundIndex >= 0) {
                result = valueOptions[foundIndex].name;
            }
        }
        return result;
    }
    generate(field, isCreate) {
        return '';
    }
    setSubElements(elements) {
    }
}
//# sourceMappingURL=LimitedChoiceTextRenderer.js.map