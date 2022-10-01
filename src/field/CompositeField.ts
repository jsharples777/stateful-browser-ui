import {AbstractField} from "./AbstractField";
import {FieldUIConfig} from "../CommonTypes";
import {FieldDefinition, ValidatableView} from "browser-state-management";



export class InputField extends AbstractField {

    constructor(view: ValidatableView, config: FieldUIConfig, fieldDef: FieldDefinition, element: HTMLInputElement) {
        super(view, config, fieldDef, element);
    }
}


