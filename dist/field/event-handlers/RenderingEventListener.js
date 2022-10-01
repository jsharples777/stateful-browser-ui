export class RenderingEventListener {
    constructor(view, field, fieldConfig, listeners, subElements = null) {
        this.view = view;
        this.formId = view.getId();
        this.field = field;
        this.fieldConfig = fieldConfig;
        this.listeners = listeners;
        this.subElements = subElements;
        this.handleEvent = this.handleEvent.bind(this);
    }
    processRendering(fieldElement) {
        let newValue = '';
        if (this.fieldConfig.renderer) {
            const fieldDef = this.fieldConfig.field;
            const value = fieldElement.value;
            if (this.subElements)
                this.fieldConfig.renderer.setSubElements(this.subElements);
            newValue = this.fieldConfig.renderer.renderValue(this.field, fieldDef, value);
            if (newValue) {
                fieldElement.value = newValue;
                this.listeners.forEach((listener) => listener.valueChanged(this.view, this.field, fieldDef, newValue));
            }
        }
        if (newValue) {
            return newValue;
        }
        else {
            return '';
        }
    }
    handleEvent(event) {
        event.preventDefault();
        event.stopPropagation();
        // @ts-ignore
        const fieldElement = event.target;
        this.processRendering(fieldElement);
    }
}
//# sourceMappingURL=RenderingEventListener.js.map