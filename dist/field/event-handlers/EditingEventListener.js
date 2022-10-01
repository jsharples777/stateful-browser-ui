import debug from 'debug';
const logger = debug('editing-event-listener');
export class EditingEventListener {
    constructor(view, field, fieldConfig, listeners) {
        this.view = view;
        this.formId = view.getId();
        this.field = field;
        this.fieldConfig = fieldConfig;
        this.listeners = listeners;
        this.handleEditEvent = this.handleEditEvent.bind(this);
        this.handleEditCompletedEvent = this.handleEditCompletedEvent.bind(this);
    }
    handleEditEvent(event) {
        event.preventDefault();
        event.stopPropagation();
        // @ts-ignore
        const fieldElement = event.target;
        if (this.fieldConfig.editor) {
            const fieldDef = this.fieldConfig.field;
            logger(fieldDef);
            const value = fieldElement.value;
            logger(value);
            const newValue = this.fieldConfig.editor.editValue(this.field, fieldDef, value);
            if (newValue && (newValue !== value)) {
                fieldElement.value = newValue;
                this.listeners.forEach((listener) => listener.valueChanged(this.view, this.field, fieldDef, newValue));
            }
        }
    }
    handleEditCompletedEvent(event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.fieldConfig.editor) {
            const fieldDef = this.fieldConfig.field;
            this.fieldConfig.editor.editCompleted(this.field, fieldDef);
        }
    }
}
//# sourceMappingURL=EditingEventListener.js.map