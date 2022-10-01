import debug from 'debug';
import {FieldUIConfig, UIFieldType} from "../../CommonTypes";
import {
    browserUtil,
    FieldDefinition,
    FieldListener, FieldType,
    ValidatableView,
    ValidationResponse
} from "browser-state-management";


const logger = debug('validation-event-handler');

export class ValidationEventHandler {
    private view: ValidatableView;
    private formId: string;
    private fieldConfig: FieldUIConfig;
    private listeners: FieldListener[];
    private subElements: HTMLInputElement[] | null;

    constructor(view: ValidatableView, fieldConfig: FieldUIConfig, listeners: FieldListener[], subElements: HTMLInputElement[] | null = null) {
        this.view = view;
        this.formId = view.getId();
        this.fieldConfig = fieldConfig;
        this.listeners = listeners;
        this.subElements = subElements;
        this.handleEvent = this.handleEvent.bind(this);
    }

    public setValidationStatusAndMessage(fieldElement: HTMLElement, isValid: boolean, value: string, message: string | undefined = undefined, resetOnFailure: boolean = false) {
        logger(`Handling validation for field ${this.fieldConfig.field.id}: ${isValid} with message ${message}`);
        logger(this.fieldConfig);

        if (this.fieldConfig.validator && fieldElement) {
            logger(`Handling validation for field ${this.fieldConfig.field.id}: ${isValid} with message ${message} - have validator and element`)
            const field: FieldDefinition = this.fieldConfig.field;
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
            let divId = `${this.formId}.field.${this.fieldConfig.field.id}.error`
            logger(`Handling validation for field ${this.fieldConfig.field.id}: ${isValid} with message ${message} - div is ${divId}`)
            const errorMessageDiv = document.getElementById(divId);
            const errorMessageEl = document.getElementById(`${divId}.message`);

            // clear any previous message
            errorMessageDiv?.setAttribute('style', 'display:none');
            if (errorMessageEl) errorMessageEl.innerHTML = '';

            if (this.fieldConfig.validator.invalidClasses) browserUtil.removeClasses(validationElementTarget, this.fieldConfig.validator.invalidClasses);
            if (this.fieldConfig.validator.validClasses) browserUtil.addClasses(validationElementTarget, this.fieldConfig.validator.validClasses);

            if (!isValid) {
                if (this.fieldConfig.validator.invalidClasses) browserUtil.addClasses(validationElementTarget, this.fieldConfig.validator.invalidClasses);
                if (this.fieldConfig.validator.validClasses) browserUtil.removeClasses(validationElementTarget, this.fieldConfig.validator.validClasses);

                if (!message) {
                    message = `${field.displayName} does not have a valid value.`;
                }
                // show the error message
                errorMessageDiv?.setAttribute('style', 'display:block')
                if (errorMessageEl) errorMessageEl.innerHTML = message;

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

    processValidation(fieldElement: HTMLElement) {
        if (this.fieldConfig.validator && fieldElement) {
            const field: FieldDefinition = this.fieldConfig.field;
            // @ts-ignore
            let value: string = fieldElement.value;
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

            const validationResp: ValidationResponse = this.fieldConfig.validator.validator.isValidValue(field, value);
            this.setValidationStatusAndMessage(fieldElement, validationResp.isValid, value, validationResp.message, validationResp.resetOnFailure);
        }
    }

    handleEvent(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        // @ts-ignore
        const fieldElement: HTMLInputElement = event.target;

        this.processValidation(fieldElement);

    }
}
