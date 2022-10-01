import {AbstractField} from "./AbstractField";
import debug from 'debug';
import {FieldUIConfig} from "../CommonTypes";
import {browserUtil, FieldDefinition, isHexValueDark, ValidatableView} from "browser-state-management";


const logger = debug('colour-input-field');


export class ColourInputField extends AbstractField {

    constructor(view: ValidatableView, config: FieldUIConfig, fieldDef: FieldDefinition, element: HTMLInputElement) {
        super(view, config, fieldDef, element);
        this.setValue = this.setValue.bind(this);
    }


    setValue(newValue: string): void {
        logger(`Setting background style to colour ${newValue}`);
        super.setValue(newValue);
        // special case of colour types
        browserUtil.removeAttributes(this.element, ["style"]);
        let styleOptions = [{name: "style", value: `background-color:${newValue};colour:black`}];
        if (isHexValueDark(newValue)) {
            styleOptions = [{name: "style", value: `background-color:${newValue};color:white`}];
        }
        browserUtil.addAttributes(this.element, styleOptions);
    }

}


