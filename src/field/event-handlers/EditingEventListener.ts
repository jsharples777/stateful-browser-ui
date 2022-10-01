
import debug from 'debug';
import {Field, FieldDefinition, FieldListener, ValidatableView} from "browser-state-management";
import {FieldUIConfig} from "../../CommonTypes";

const logger = debug('editing-event-listener');

export class EditingEventListener {
    private view: ValidatableView;
    private formId: string;
    private fieldConfig: FieldUIConfig;
    private listeners: FieldListener[];
    private field: Field;

    constructor(view: ValidatableView, field: Field, fieldConfig: FieldUIConfig, listeners: FieldListener[]) {
        this.view = view;
        this.formId = view.getId();
        this.field = field;
        this.fieldConfig = fieldConfig;
        this.listeners = listeners;
        this.handleEditEvent = this.handleEditEvent.bind(this);
        this.handleEditCompletedEvent = this.handleEditCompletedEvent.bind(this);
    }

    handleEditEvent(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        // @ts-ignore
        const fieldElement: HTMLInputElement = event.target;

        if (this.fieldConfig.editor) {
            const fieldDef: FieldDefinition = this.fieldConfig.field;
            logger(fieldDef);
            const value: string = fieldElement.value;
            logger(value)
            const newValue: string = this.fieldConfig.editor.editValue(this.field, fieldDef, value);
            if (newValue && (newValue !== value)) {
                fieldElement.value = newValue;
                this.listeners.forEach((listener) => listener.valueChanged(this.view, this.field, fieldDef, newValue));

            }
        }
    }

    handleEditCompletedEvent(event: Event) {
        event.preventDefault();
        event.stopPropagation();

        if (this.fieldConfig.editor) {
            const fieldDef: FieldDefinition = this.fieldConfig.field;
            this.fieldConfig.editor.editCompleted(this.field, fieldDef);
        }

    }
}
