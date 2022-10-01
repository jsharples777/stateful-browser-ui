import { AbstractField } from "./AbstractField";
import debug from 'debug';
import { browserUtil, isHexValueDark } from "browser-state-management";
const logger = debug('colour-input-field');
export class ColourInputField extends AbstractField {
    constructor(view, config, fieldDef, element) {
        super(view, config, fieldDef, element);
        this.setValue = this.setValue.bind(this);
    }
    setValue(newValue) {
        logger(`Setting background style to colour ${newValue}`);
        super.setValue(newValue);
        // special case of colour types
        browserUtil.removeAttributes(this.element, ["style"]);
        let styleOptions = [{ name: "style", value: `background-color:${newValue};colour:black` }];
        if (isHexValueDark(newValue)) {
            styleOptions = [{ name: "style", value: `background-color:${newValue};color:white` }];
        }
        browserUtil.addAttributes(this.element, styleOptions);
    }
}
//# sourceMappingURL=ColourInputField.js.map