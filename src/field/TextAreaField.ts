import {AbstractField} from "./AbstractField";
import {FieldUIConfig} from "../CommonTypes";
import {FieldDefinition, ValidatableView} from "browser-state-management";


export class TextAreaField extends AbstractField {

    constructor(view: ValidatableView, config: FieldUIConfig, fieldDef: FieldDefinition, element: HTMLTextAreaElement) {
        super(view, config, fieldDef, element);
    }
}

