import {Field, FieldDefinition, FieldListener, ValidatableView} from "browser-state-management";
import {FieldUIConfig} from "../../CommonTypes";


export class RenderingEventListener {
    private view: ValidatableView;
    private formId: string;
    private fieldConfig: FieldUIConfig;
    private listeners: FieldListener[];
    private subElements: HTMLInputElement[] | null;
    private field: Field;

    constructor(view: ValidatableView, field: Field, fieldConfig: FieldUIConfig, listeners: FieldListener[], subElements: HTMLInputElement[] | null = null) {
        this.view = view;
        this.formId = view.getId();
        this.field = field;
        this.fieldConfig = fieldConfig;
        this.listeners = listeners;
        this.subElements = subElements;
        this.handleEvent = this.handleEvent.bind(this);
    }

    processRendering(fieldElement: HTMLInputElement): string {
        let newValue: string | null = '';
        if (this.fieldConfig.renderer) {
            const fieldDef: FieldDefinition = this.fieldConfig.field;
            const value: string = fieldElement.value;
            if (this.subElements) this.fieldConfig.renderer.setSubElements(this.subElements);
            newValue = this.fieldConfig.renderer.renderValue(this.field, fieldDef, value);
            if (newValue) {
                fieldElement.value = newValue;
                this.listeners.forEach((listener) => listener.valueChanged(this.view, this.field, fieldDef, newValue));
            }
        }
        if (newValue) {
            return newValue;
        } else {
            return '';
        }
    }

    handleEvent(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        // @ts-ignore
        const fieldElement: HTMLInputElement = event.target;

        this.processRendering(fieldElement);
    }
}
