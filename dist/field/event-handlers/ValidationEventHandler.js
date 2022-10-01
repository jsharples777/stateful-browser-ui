import debug from 'debug';
import { UIFieldType } from "../../CommonTypes";
import { browserUtil, FieldType } from "browser-state-management";
const logger = debug('validation-event-handler');
export class ValidationEventHandler {
    constructor(view, fieldConfig, listeners, subElements = null) {
        this.view = view;
        this.formId = view.getId();
        this.fieldConfig = fieldConfig;
        this.listeners = listeners;
        this.subElements = subElements;
        this.handleEvent = this.handleEvent.bind(this);
    }
    setValidationStatusAndMessage(fieldElement, isValid, value, message = undefined, resetOnFailure = false) {
        logger(`Handling validation for field ${this.fieldConfig.field.id}: ${isValid} with message ${message}`);
        logger(this.fieldConfig);
        if (this.fieldConfig.validator && fieldElement) {
            logger(`Handling validation for field ${this.fieldConfig.field.id}: ${isValid} with message ${message} - have validator and element`);
            const field = this.fieldConfig.field;
            let validationElementTarget = fieldElement; // we are providing user feedback on the field element, unless...
            if (this.subElements) { // sub elements change the validation target
                this.fieldConfig.validator.validator.setSubElements(this.subElements);
                if (this.fieldConfig.subElement) { // should be targeting the parent element
                    let parentEl = fieldElement.parentElement;
                    if (parentEl) {
                        validationElementTarget = parentEl;
                        if (this.fieldConfig.subElement.container) { // another layer up required
                            parentEl = parentEl.parentElement;
                            if (parentEl) {
                                validationElementTarget = parentEl;
                            }
                        }
                    }
                }
            }
            // let divId = `${this.view.getDataObjectDefinition().id}.field.${this.fieldConfig.field.id}.error`
            let divId = `${this.formId}.field.${this.fieldConfig.field.id}.error`;
            logger(`Handling validation for field ${this.fieldConfig.field.id}: ${isValid} with message ${message} - div is ${divId}`);
            const errorMessageDiv = document.getElementById(divId);
            const errorMessageEl = document.getElementById(`${divId}.message`);
            // clear any previous message
            errorMessageDiv === null || errorMessageDiv === void 0 ? void 0 : errorMessageDiv.setAttribute('style', 'display:none');
            if (errorMessageEl)
                errorMessageEl.innerHTML = '';
            if (this.fieldConfig.validator.invalidClasses)
                browserUtil.removeClasses(validationElementTarget, this.fieldConfig.validator.invalidClasses);
            if (this.fieldConfig.validator.validClasses)
                browserUtil.addClasses(validationElementTarget, this.fieldConfig.validator.validClasses);
            if (!isValid) {
                if (this.fieldConfig.validator.invalidClasses)
                    browserUtil.addClasses(validationElementTarget, this.fieldConfig.validator.invalidClasses);
                if (this.fieldConfig.validator.validClasses)
                    browserUtil.removeClasses(validationElementTarget, this.fieldConfig.validator.validClasses);
                if (!message) {
                    message = `${field.displayName} does not have a valid value.`;
                }
                // show the error message
                errorMessageDiv === null || errorMessageDiv === void 0 ? void 0 : errorMessageDiv.setAttribute('style', 'display:block');
                if (errorMessageEl)
                    errorMessageEl.innerHTML = message;
                if (resetOnFailure) {
                    switch (field.type) {
                        case (FieldType.boolean): {
                            // @ts-ignore
                            fieldElement.checked = false;
                            break;
                        }
                        case (FieldType.integer): {
                            // @ts-ignore
                            fieldElement.value = '0';
                            break;
                        }
                        case (FieldType.float): {
                            // @ts-ignore
                            fieldElement.value = '0.0';
                            break;
                        }
                        default: {
                            // @ts-ignore
                            fieldElement.value = '';
                            break;
                        }
                    }
                }
                // @ts-ignore
                this.listeners.forEach((listener) => listener.failedValidation(this.formId, field, value, message));
            }
        }
    }
    processValidation(fieldElement) {
        if (this.fieldConfig.validator && fieldElement) {
            const field = this.fieldConfig.field;
            // @ts-ignore
            let value = fieldElement.value;
            // checkboxes store values differently
            if (this.fieldConfig.elementType === UIFieldType.checkbox) { // @ts-ignore
                value = '' + fieldElement.checked;
            }
            if (this.subElements) {
                value = '';
                this.subElements.forEach((subElement) => {
                    if (subElement.checked) {
                        value = subElement.value;
                    }
                });
            }
            const validationResp = this.fieldConfig.validator.validator.isValidValue(field, value);
            this.setValidationStatusAndMessage(fieldElement, validationResp.isValid, value, validationResp.message, validationResp.resetOnFailure);
        }
    }
    handleEvent(event) {
        event.preventDefault();
        event.stopPropagation();
        // @ts-ignore
        const fieldElement = event.target;
        this.processValidation(fieldElement);
    }
}
//# sourceMappingURL=ValidationEventHandler.js.map