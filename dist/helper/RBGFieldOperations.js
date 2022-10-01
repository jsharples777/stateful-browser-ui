import debug from 'debug';
import { KeyType } from "browser-state-management";
const flogger = debug('basic-field-operations-formatter');
const vlogger = debug('basic-field-operations-validator');
const glogger = debug('basic-field-operations-generator');
const rlogger = debug('basic-field-operations-renderer');
export class RBGFieldOperations {
    constructor() {
        this.radioButtons = [];
    }
    // called when saving, change to final values
    formatValue(field, currentValue) {
        flogger(`Handling format value for RBG ${field.displayName} with value ${currentValue}`);
        let result = currentValue;
        // find the current selected radio button
        this.radioButtons.forEach((radioButton) => {
            if (radioButton.checked) {
                result = radioButton.value;
                if (field.idType === KeyType.number) {
                    result = parseInt(result);
                }
            }
        });
        flogger(`Handling format value for field ${field.displayName} with value ${currentValue} - result is ${result}`);
        return result;
    }
    isValidValue(field, currentValue) {
        vlogger(`Handling is valid value for field ${field.displayName} with value ${currentValue}`);
        let response = {
            isValid: false,
            resetOnFailure: false
        };
        // basics first, is the field mandatory?
        if (field.mandatory) {
            this.radioButtons.forEach((radioButton) => {
                if (radioButton.checked) {
                    response.isValid = true;
                }
            });
            if (!response.isValid) {
                response.message = `${field.displayName} is required. Please select one of the values.`;
                vlogger(`Handling is valid value for field ${field.displayName} with value ${currentValue} - is valid is ${response.isValid} with message ${response.message}`);
                return response;
            }
        }
        else {
            response.isValid = true;
        }
        // ok, so we have some content, we need to check if the value is a valid format with regular expressions
        vlogger(`Handling is valid value for field ${field.displayName} with value ${currentValue} - is valid is ${response.isValid} with message ${response.message}`);
        return response;
    }
    renderValue(field, fieldDef, currentValue) {
        rlogger(`Rendering value for field ${fieldDef.displayName} with new value ${currentValue}`);
        this.radioButtons.forEach((radioButton) => {
            if (radioButton.value === currentValue)
                radioButton.checked = true;
        });
        return null;
    }
    generate(field, isCreate) {
        return '';
    }
    setSubElements(elements) {
        this.radioButtons = elements;
    }
}
//# sourceMappingURL=RBGFieldOperations.js.map