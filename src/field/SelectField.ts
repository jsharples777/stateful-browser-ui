import {AbstractField} from "./AbstractField";
import {FieldUIConfig} from "../CommonTypes";
import {FieldDefinition, ValidatableView} from "browser-state-management";


export class SelectField extends AbstractField {

    constructor(view: ValidatableView, config: FieldUIConfig, fieldDef: FieldDefinition, element: HTMLSelectElement) {
        super(view, config, fieldDef, element);
    }
}
