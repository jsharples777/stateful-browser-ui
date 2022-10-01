import debug from 'debug';
import {v4} from "uuid";
import {ItemView} from "./ItemView";
import {AttributeFieldMapItem, FieldUIConfig, ItemEventType, UIFieldType} from "../../CommonTypes";
import {ItemViewListener} from "./ItemViewListener";
import {AlertManager} from "../../alert/AlertManager";
import {
    BasicFieldOperations,
    browserUtil,
    ConditionResponse,
    DATA_ID_ATTRIBUTE,
    DataObjectDefinition,
    Field,
    FieldDefinition,
    FieldListener,
    FieldType,
    ObjectDefinitionRegistry,
    RuleCheck,
    ValidatableView,
    ValidationManager,
    ViewMode
} from "browser-state-management";
import {DetailViewRuntimeConfig, ItemEvent} from "../../ConfigurationTypes";
import {ItemViewUIDefinition} from "./ItemViewUITypeDefs";
import {AlertEvent, AlertListener, AlertType} from "../../alert/AlertListener";
import {ItemViewConfigHelper} from "./ItemViewConfigHelper";
import {FieldInputElementFactory} from "../../factory/FieldInputElementFactory";
import {ViewFieldPermissionChecker} from "../ViewFieldPermissionChecker";
import {ItemFactoryResponse, ItemViewElementFactory} from "../../factory/ItemViewElementFactory";

import {RadioButtonGroupField} from "../../field/RadioButtonGroupField";
import {ColourInputField} from "../../field/ColourInputField";
import {SelectField} from "../../field/SelectField";
import {TextAreaField} from "../../field/TextAreaField";
import {InputField} from "../../field/InputField";


const logger = debug('default-item-view');
const dlogger = debug('default-item-view-detail');
const vlogger = debug('default-item-view-detail-validation');
const asLogger = debug('default-item-view-auto-save');


export class DefaultItemView implements ItemView, ItemViewListener, AlertListener, FieldListener {
    protected listeners: ItemViewListener[] = [];
    protected fieldListeners: FieldListener[] = [];
    protected currentDataObj: any;
    protected dataObjDef: DataObjectDefinition;
    protected containerEl: HTMLElement | null;
    protected uiDef: ItemViewUIDefinition | null = null;
    protected isVisible: boolean = false;
    protected fields: Field[] = [];
    protected map: AttributeFieldMapItem[];
    protected isInitialised: boolean = false;
    protected hasChangedBoolean: boolean = false;
    protected id: string;
    protected configHelper: ItemViewConfigHelper;
    protected hasExternalControl: boolean;
    protected permissionChecker: ViewFieldPermissionChecker;
    protected viewMode: ViewMode;
    protected factoryElements: ItemFactoryResponse | null = null;
    protected autoSaveStarted: boolean = false;
    protected autoSaveInterval: any;

    protected constructor(containerId: string, dataObjDef: DataObjectDefinition, configHelper: ItemViewConfigHelper, permissionChecker: ViewFieldPermissionChecker, hasExternalControl: boolean = false) {
        this.containerEl = document.getElementById(containerId);
        if (!(this.containerEl)) throw new Error(`container ${containerId} for Item View ${dataObjDef.id} does not exist`);

        this.map = [];
        this.dataObjDef = dataObjDef;
        this.configHelper = configHelper;
        this.hasExternalControl = hasExternalControl;
        this.permissionChecker = permissionChecker;
        this.currentDataObj = {};
        this.id = v4();
        this.viewMode = ViewMode.unset;
        // sub-classes need to create the Item View and it's fields

        // listen to ourselves
        this.addListener(this);

        this.save = this.save.bind(this);
        this.itemViewHasChanged = this.itemViewHasChanged.bind(this);
    }


    getFields(): Field[] {
        return this.fields;
    }

    public getViewMode(): ViewMode {
        return this.viewMode;
    }

    public getCurrentDataObj(): any {
        return this.currentDataObj;
    }

    public getDataObjectDefinition(): DataObjectDefinition {
        return this.dataObjDef;
    }

    cancel(): void {
        if (this.uiDef) {
            let itemEvent: ItemEvent = {
                target: this,
                identifier: this.getId(),
                eventType: ItemEventType.CANCELLING
            }
            this.itemViewEvent(this.dataObjDef.displayName, itemEvent);
        }
    }

    delete(): void {
        if (this.uiDef && !this.isReadOnly()) {
            let itemEvent: ItemEvent = {
                target: this,
                identifier: this.getId(),
                eventType: ItemEventType.DELETING
            }
            this.itemViewEvent(this.dataObjDef.displayName, itemEvent);
        }
    }

    save(): void {
        if (this.uiDef && !this.isReadOnly()) {
            let itemEvent: ItemEvent = {
                target: this,
                identifier: this.getId(),
                eventType: ItemEventType.SAVING
            }
            this.itemViewEvent(this.dataObjDef.displayName, itemEvent);
        }
    }

    public hasChanged(): boolean {
        return this.hasChangedBoolean;
    }

    getName(): string {
        return this.dataObjDef.displayName;
    }

    valueChanged(view: ValidatableView, field: Field, fieldDef: FieldDefinition, newValue: string | null): void {
        this.hasChangedBoolean = true;
        this.setUnsavedMessage();
        logger(`Item View has changed`);
    }

    failedValidation(view: ValidatableView, field: FieldDefinition, currentValue: string, message: string): void {
        this.hasChangedBoolean = true;
        logger(`Item View has changed`);
    }

    public initialise(runtimeConfig: DetailViewRuntimeConfig): void {
        if (this.isInitialised) return;
        this.isInitialised = true;
        this._initialise(runtimeConfig);
    }

    public addFieldListener(listener: FieldListener): void {
        this.fieldListeners.push(listener);
    }

    public addListener(listener: ItemViewListener): void {
        this.listeners.unshift(listener);
    }

    public reset(): void {
        logger(`Resetting Item View`);
        this.clearUnsavedMessage();
        this.viewMode = ViewMode.unset;
        this.hasChangedBoolean = false;

        // inform the listeners
        if (this.uiDef) {
            let itemEvent: ItemEvent = {
                identifier: this.getId(),
                target: this,
                eventType: ItemEventType.RESETTING
            }
            this.informListeners(itemEvent, this.currentDataObj);
        }
        this.currentDataObj = {};
        this._reset();
        // reset all the fields
        this.fields.forEach((field) => {
            field.reset();
        });
        this.hasChangedBoolean = false;

        if (this.containerEl && this.uiDef && (this.uiDef.autoscrollOnNewContent === true)) browserUtil.scrollSmoothTo(this.containerEl);
    }

    public setIsVisible(isVisible: boolean): void {
        logger(`Changing visibility to ${isVisible}`);
        this.isVisible = isVisible;
        if (this.uiDef) {
            let eventType = ItemEventType.HIDDEN;
            if (this.isVisible) {
                this._visible();
                eventType = ItemEventType.SHOWN;
            } else {
                this._hidden();
            }
            // inform the listeners
            let itemEvent: ItemEvent = {
                identifier: this.getId(),
                target: this,
                eventType: eventType
            }
            this.informListeners(itemEvent, this.currentDataObj);
        }
        if (isVisible && !(this.viewMode === ViewMode.displayOnly)) this.checkFormValidationOnDisplay();
        if (isVisible && (this.viewMode === ViewMode.displayOnly)) this.checkForVisualValidationForDisplayOnly();
    }

    public startCreateNew(objectToEdit: any | null): any {
        this.clearUnsavedMessage();
        logger(`Starting create new`);
        this.reset();
        this.currentDataObj = {};
        if (objectToEdit) {
            this.currentDataObj = objectToEdit;
        }
        this.viewMode = ViewMode.create;
        this.hasChangedBoolean = false;
        if (this.uiDef) {
            let eventType = ItemEventType.CREATING;
            // inform the listeners
            let itemEvent: ItemEvent = {
                identifier: this.getId(),
                target: this,
                eventType: eventType,
                currentDataObj: this.currentDataObj
            }
            this.informListeners(itemEvent, this.currentDataObj);
            this._startCreate();
        }
        this.clearReadOnly();
        if (this.containerEl && this.uiDef && (this.uiDef.autoscrollOnNewContent === true)) browserUtil.scrollSmoothTo(this.containerEl);
        return this.currentDataObj;
    }

    public validateDataObject(objectToCheck: any): boolean {
        logger(`Checking object for validation`);
        logger(objectToCheck);
        const previousDataObj = this.currentDataObj;
        this.currentDataObj = {...objectToCheck}; // take a copy
        this.dataObjDef.fields.forEach((fieldDef) => {
            let fieldValue = this.currentDataObj[fieldDef.id];
            this.setFieldValueFromDataObject(fieldDef, fieldValue);
            this.validateField(fieldDef);
        });


        let result = false;
        if (this.uiDef) {
            let allFieldsValid: boolean = true;

            // user attempting to save the Item View, lets check the field validation
            this.fields.forEach((field) => {
                const currentValue = field.getValue();
                if (!field.isValid()) {
                    vlogger(`Field ${field.getId()} is invalid`);
                    allFieldsValid = false;
                } else {
                    // does the field fulfil any rules from the Validation manager
                    const response: RuleCheck = ValidationManager.getInstance().applyRulesToTargetField(this, ViewMode.update, field.getFieldDefinition(), ConditionResponse.invalid);
                    if (response.ruleFailed) {
                        vlogger(`Field ${field.getId()} is invalid from validation manager with message ${response.message}`);
                        allFieldsValid = false;
                    }
                }
            });

            // is every field valid?
            if (allFieldsValid) {
                result = true;
            }
        }

        switch (this.viewMode) {
            case ViewMode.create:
            case ViewMode.update: {
                this.startUpdate(previousDataObj);
                break;
            }
            case ViewMode.displayOnly: {
                this.displayOnly(previousDataObj);
                break;
            }

        }


        return result;

    }

    public startUpdate(objectToEdit: any): void {
        this.clearUnsavedMessage();
        logger(`Starting modify existing on `);
        this.viewMode = ViewMode.update;
        this.hasChangedBoolean = false;
        logger(objectToEdit);
        this.currentDataObj = {...objectToEdit}; // take a copy

        if (this.uiDef) {
            let eventType = ItemEventType.MODIFYING;
            // inform the listeners
            let itemEvent: ItemEvent = {
                identifier: this.getId(),
                target: this,
                eventType: eventType,
                currentDataObj: this.currentDataObj
            }
            this.informListeners(itemEvent, this.currentDataObj);
            this._startUpdate();
        }
        this.clearReadOnly();
        if (this.containerEl && this.uiDef && (this.uiDef.autoscrollOnNewContent === true)) browserUtil.scrollSmoothTo(this.containerEl);
    }

    displayOnly(objectToView: any): void {
        this.clearUnsavedMessage();
        logger(`Starting display only `);
        logger(objectToView);
        this.viewMode = ViewMode.displayOnly;
        this.hasChangedBoolean = false;
        this.currentDataObj = {...objectToView}; // take a copy
        if (this.uiDef) {
            let itemEvent: ItemEvent = {
                target: this,
                identifier: this.getId(),
                eventType: ItemEventType.DISPLAYING_READ_ONLY,
                currentDataObj: this.currentDataObj
            }
            this.itemViewEvent(this.dataObjDef.displayName, itemEvent);
        }

        if (this.uiDef) {
            this._displayOnly();
        }
        this.setReadOnly();
        if (this.containerEl && this.uiDef && (this.uiDef.autoscrollOnNewContent === true)) browserUtil.scrollSmoothTo(this.containerEl);
    }

    public itemViewEvent(name: string, event: ItemEvent, values?: any): boolean {
        // catch form events for user leaving the Item View
        let shouldCancelChange = false;
        switch (event.eventType) {
            case (ItemEventType.CANCELLING): {
                logger(`Item View is cancelling`);
                if (this.hasChangedBoolean && !(this.viewMode === ViewMode.displayOnly)) {
                    if (this.uiDef) {
                        AlertManager.getInstance().startAlert(this, this.uiDef.displayName, `Lose any unsaved changes?`, ItemEventType.CANCELLING);
                    }
                } else {
                    if (this.uiDef) {
                        let itemEvent: ItemEvent = {
                            identifier: this.getId(),
                            target: this,
                            eventType: ItemEventType.CANCELLED
                        }
                        this.informListeners(itemEvent, this.currentDataObj);
                    }
                }
                break;
            }
            case (ItemEventType.CANCELLING_ABORTED): {
                logger(`Item View is cancelling - aborted`);
                break;
            }
            case (ItemEventType.CANCELLED): {
                logger(`Item View is cancelled - resetting`);
                // user cancelled the Item View, will become invisible
                this.viewMode = ViewMode.displayOnly;
                this.reset(); // reset the Item View state
                this.setReadOnly();
                break;
            }
            case (ItemEventType.DELETING): {
                logger(`Item View is deleting`);
                if (this.uiDef) {
                    AlertManager.getInstance().startAlert(this, this.uiDef.displayName, `Are you sure you want to delete this information?`, ItemEventType.DELETING);
                }
                break;
            }
            case (ItemEventType.DELETE_ABORTED): {
                logger(`Item View is deleting - aborted`);
                break;
            }
            case (ItemEventType.DELETED): {
                logger(`Item View is deleted - resetting`);
                // user is deleting the object, will become invisible
                this.reset();
                break;
            }
            case (ItemEventType.SAVE_ABORTED): {
                this._saveFinishedOrAborted();
                logger(`Item View save cancelled`);
                break;
            }
            case (ItemEventType.SAVED): {
                this._saveFinishedOrAborted();
                logger(`Item View is saved with data`);
                logger(values);
                this.stopAutoSave();
                this.viewMode = ViewMode.update;
                this.hasChangedBoolean = false;
                this.startUpdate(values);
                break;
            }
            case (ItemEventType.SAVING): {
                logger(`Item View is saving, checking validation and storing values`);
                this._saveIsActive();
                if (this.uiDef) {
                    let allFieldsValid: boolean = true;

                    // user attempting to save the Item View, lets check the field validation
                    this.fields.forEach((field) => {
                        const currentValue = field.getValue();
                        if (!field.isValid()) {
                            vlogger(`Field ${field.getId()} is invalid`);
                            field.setInvalid(`${field.getName()} has an invalid format or is required.`);
                            allFieldsValid = false;
                        } else {
                            // does the field fulfil any rules from the Validation manager
                            const response: RuleCheck = ValidationManager.getInstance().applyRulesToTargetField(this, this.viewMode, field.getFieldDefinition(), ConditionResponse.invalid);
                            if (response.ruleFailed) {
                                if (response.message) field.setInvalid(response.message);
                                vlogger(`Field ${field.getId()} is invalid from validation manager with message ${response.message}`);
                                allFieldsValid = false;
                            } else {
                                this.setFieldValueToDataObject(this.currentDataObj, field, currentValue);
                            }
                        }
                    });

                    // is every field valid?
                    if (!allFieldsValid) {
                        logger(`Item View is saving, checking validation - FAILED`);
                        let itemEvent: ItemEvent = {
                            identifier: this.getId(),
                            target: this,
                            eventType: ItemEventType.SAVE_ABORTED
                        }
                        this.informListeners(itemEvent, this.currentDataObj);
                        shouldCancelChange = true;
                    } else {
                        logger(`formatted data object is`);
                        const formattedDataObject = this.getFormattedDataObject();
                        let itemEvent: ItemEvent = {
                            identifier: this.getId(),
                            target: this,
                            eventType: ItemEventType.SAVED
                        }
                        this.informListeners(itemEvent, formattedDataObject);
                    }
                }
                break;
            }
        }
        return shouldCancelChange;
    }

    getId(): string {
        return this.id;
    }

    getFieldFromDataFieldId(dataFieldId: string): Field | undefined {
        let result: Field | undefined = undefined;
        dlogger(`Finding field for attribute ${dataFieldId} `);

        const mapItem: AttributeFieldMapItem | undefined = this.map.find((mapItem) => mapItem.attributeId === dataFieldId);
        if (mapItem) {
            dlogger(`Mapped attribute ${mapItem.attributeId} to field ${mapItem.fieldId}`);
            // find the field with that id
            result = this.fields.find((field) => field.getId() === mapItem.attributeId);
        }

        return result;
    }

    alertCompleted(event: AlertEvent): void {
        logger(`Handling alert completed`);
        logger(event);
        if (event.context && this.uiDef) {
            switch (event.context) {
                case (ItemEventType.CANCELLING): {
                    if (event.outcome === AlertType.confirmed) {
                        let itemEvent: ItemEvent = {
                            identifier: this.getId(),
                            target: this,
                            eventType: ItemEventType.CANCELLED
                        }
                        this.informListeners(itemEvent, this.currentDataObj);
                    } else {
                        let itemEvent: ItemEvent = {
                            identifier: this.getId(),
                            target: this,
                            eventType: ItemEventType.CANCELLING_ABORTED
                        }
                        this.informListeners(itemEvent, this.currentDataObj);
                    }
                    break;
                }
                case (ItemEventType.DELETING): {
                    if (event.outcome === AlertType.confirmed) {
                        let itemEvent: ItemEvent = {
                            identifier: this.getId(),
                            target: this,
                            eventType: ItemEventType.DELETED
                        }
                        this.informListeners(itemEvent, this.currentDataObj);
                    } else {
                        let itemEvent: ItemEvent = {
                            identifier: this.getId(),
                            target: this,
                            eventType: ItemEventType.DELETE_ABORTED
                        }
                        this.informListeners(itemEvent, this.currentDataObj);
                    }
                    break;
                }
            }

        }
    }

    clearReadOnly(): void {
        this.fields.forEach((field) => {
            if (this.currentDataObj) {
                if (this.permissionChecker.hasPermissionToEditField(this.currentDataObj, field)) {
                    field.clearReadOnly();
                }
            } else {
                field.clearReadOnly();
            }
        });
        this.enableButtons();
    }

    setReadOnly(): void {
        this.fields.forEach((field) => {
            field.setReadOnly();
        });
        this.disableButtons();
    }

    isDisplayingItem(dataObj: any): boolean {
        if (this.currentDataObj) {
            return this._isSameObjectAsDisplayed(dataObj);
        }
        return false;
    }

    isReadOnly(): boolean {
        return (this.viewMode === ViewMode.displayOnly);
    }

    getElementIdForField(fieldId: string): string | undefined {
        return FieldInputElementFactory.getElementIdForFieldId(this, fieldId);
    }

    getFormattedDataObject(): any {
        logger(`Getting current formatted data`);
        let formattedResult: any = {};
        this.dataObjDef.fields.forEach((fieldDef) => {
            let fieldValue = this.currentDataObj[fieldDef.id];
            if (fieldDef.derivedValue) {
                if (!fieldDef.derivedValue.onlyForDisplay()) {
                    formattedResult[fieldDef.id] = this.getFormattedFieldValue(fieldDef);
                }
            } else {
                formattedResult[fieldDef.id] = this.getFormattedFieldValue(fieldDef);
            }

        });
        logger(formattedResult);
        return formattedResult;
    }

    getFieldValue(fieldId: string): string | null {
        let result: string | null = null;
        const field = this.getFieldFromDataFieldId(fieldId);
        if (field) {
            result = field.getValue();
        }
        return result;
    }

    setFieldValue(fieldId: string, newValue: string, fireChanges: boolean | undefined = true): void {
        const field = this.getFieldFromDataFieldId(fieldId);
        if (field) {
            if (fireChanges) this.setChanged();
            field.setValue(newValue);
        }
    }


    setFieldValueAndApplyFormatting(fieldId: string, newValue: string, fireChanges: boolean | undefined = true): void {
        const field = this.getFieldFromDataFieldId(fieldId);
        if (field) {
            if (fireChanges) this.setChanged();
            const fieldDef = ObjectDefinitionRegistry.getInstance().getFieldInDefinition(this.dataObjDef.id, fieldId);
            if (fieldDef) {
                const renderedValue = BasicFieldOperations.getInstance().renderValue(field, fieldDef, '' + newValue);
                if (renderedValue) field.setValue(renderedValue);
            } else {
                field.setValue(newValue);
            }

        }
    }

    clearFieldReadOnly(fieldId: string): void {
        const field = this.getFieldFromDataFieldId(fieldId);
        if (field) {
            field.clearReadOnly();
        }
    }

    setFieldReadOnly(fieldId: string): void {
        const field = this.getFieldFromDataFieldId(fieldId);
        if (field) {
            field.setReadOnly();
        }
    }

    clearFieldInvalid(fieldId: string): void {
        const field = this.getFieldFromDataFieldId(fieldId);
        if (field) {
            field.setValid();
        }
    }

    setFieldInvalid(fieldId: string, message: string): void {
        const field = this.getFieldFromDataFieldId(fieldId);
        if (field) {
            field.setInvalid(message);
        }
    }

    itemViewHasChanged(name: string): void {
        asLogger('View changed');
        this.startAutoSave();
    }

    setChanged(): void {
        this.hasChangedBoolean = true;
        this.setUnsavedMessage();
    }

    fieldAction(name: string, event: ItemEvent): void {
    }

    scrollToField(fieldId: string): void {
        const el = this.getFieldElement(fieldId);
        if (el) {
            if (this.containerEl) browserUtil.scrollToElementInContainer(this.containerEl, el);
        }
    }

    scrollToTop(): void {
        if (this.containerEl) {
            $(this.containerEl).animate({scrollTop: 0}, "fast");
        }
    }

    /* methods to be implemented in the subclass */

    isAutoScroll(): boolean {
        let result = false;
        if (this.uiDef) {
            dlogger(`${this.uiDef.displayName} - Autoscroll is set to ${this.uiDef.autoscrollOnNewContent}`);
            if (this.uiDef.autoscrollOnNewContent === true) result = true;
        }
        return result;
    }

    getFieldElement(fieldId: string): HTMLElement | null {
        let result: HTMLElement | null = null;
        const elId = this.getElementIdForField(fieldId);
        if (elId) {
            result = document.getElementById(elId);
        }
        return result;
    }

    getContainerElement(): HTMLElement | null {
        return this.containerEl;
    }

    protected informListeners(event: ItemEvent, dataObj?: any) {
        this.listeners.forEach((listener) => listener.itemViewEvent(this.dataObjDef.displayName, event, dataObj));
    }

    protected findFieldUiConfig(fieldDef: FieldDefinition): FieldUIConfig | null | undefined {
        dlogger(`Finding field UI Config for field ${fieldDef.displayName}`);
        let result: FieldUIConfig | null | undefined = null;
        if (this.uiDef) {
            let index = 0;
            while (index < this.uiDef.fieldGroups.length) {
                const fieldGroup = this.uiDef.fieldGroups[index];
                result = fieldGroup.fields.find((uiConfig: any) => uiConfig.field.id === fieldDef.id);
                if (result) {
                    dlogger(`Finding field UI Config for field ${fieldDef.displayName} - Found`);
                    break;
                }
                index++;
            }
        }
        return result;
    }

    protected checkForVisualValidationForDisplayOnly() {
        logger(`Checking display validation for display only`);
        this.fields.forEach((field) => {
            field.show();
            let response = ValidationManager.getInstance().applyRulesToTargetField(this, this.viewMode, field.getFieldDefinition(), ConditionResponse.hide);
            if (response.ruleFailed) {
                field.hide();
                vlogger(`Field ${field.getId()} is hidden from validation manager with message ${response.message}`);
            }

        });
    }

    protected checkFormValidationOnDisplay() {
        logger(`Checking display validation`);

        this.fields.forEach((field) => {
            field.show();
            const currentValue = field.getValue();
            if (!field.isValid()) {
                logger(`Field ${field.getId()} is invalid`);
                field.setInvalid(`${field.getName()} has an invalid format or is required.`);
            } else {
                // does the field fulfil any rules from the Validation manager
                let response: RuleCheck = ValidationManager.getInstance().applyRulesToTargetField(this, this.viewMode, field.getFieldDefinition(), ConditionResponse.invalid);
                if (response.ruleFailed) {
                    if (response.message) field.setInvalid(response.message);
                    vlogger(`Field ${field.getId()} is invalid from validation manager with message ${response.message}`);
                }
                response = ValidationManager.getInstance().applyRulesToTargetField(this, this.viewMode, field.getFieldDefinition(), ConditionResponse.hide);
                if (response.ruleFailed) {
                    field.hide();
                    vlogger(`Field ${field.getId()} is hidden from validation manager with message ${response.message}`);
                }
            }
        });

    }

    protected __getFactoryElements(): ItemFactoryResponse {
        // @ts-ignore
        return ItemViewElementFactory.getInstance().createFormElements(this, this.listeners, this.uiDef, this.fieldListeners);
    }

    protected __buildUIElements(): void {
        // now we need to create all the Item View elements from the ui definition
        this.factoryElements = this.__getFactoryElements();
        logger(this.factoryElements);
        // create field elements for each field element, and the basic map
        logger(`Converting field input elements to Field objects`);
        this.factoryElements.fields.forEach((fieldEl) => {
            fieldEl.addEventListener('keyup', (event) => {
                dlogger(`key up in Item View ${this.getName()}`);
                this.hasChangedBoolean = true;
                this.setUnsavedMessage();
            });
            this.setupFieldObject(fieldEl);
        });

        logger(`Converting field text area elements to Field objects`);
        this.factoryElements.textFields.forEach((fieldEl) => {
            fieldEl.addEventListener('keyup', (event) => {
                dlogger(`key up in Item View ${this.getName()}`);
                this.hasChangedBoolean = true;
                this.setUnsavedMessage();
            });
            this.setupFieldObject(fieldEl);
        });

        logger(`Converting field select elements to Field objects`);
        this.factoryElements.selectFields.forEach((fieldEl) => {
            fieldEl.addEventListener('change', (event) => {
                dlogger(`change in Item View ${this.getName()}`);
                this.hasChangedBoolean = true;
                this.setUnsavedMessage();
            });
            this.setupFieldObject(fieldEl);
        });

        logger(`Converting field rbg elements to Field objects`);
        this.factoryElements.radioButtonGroups.forEach((rbg) => {
            this.setupFieldObject(rbg.container, rbg.radioButtons);
            rbg.radioButtons.forEach((radioButton) => {
                radioButton.addEventListener('change', (event) => {
                    dlogger(`radio button change in Item View ${this.getName()}`);
                    this.hasChangedBoolean = true;
                    this.setUnsavedMessage();
                });
            });
        });


        logger(`Converting field composite elements to Field objects`);
        if (this.factoryElements.compositeFields) {
            this.factoryElements.compositeFields.forEach((composite) => {
                this.setupFieldObject(composite.displayElement);
                composite.actionButtons.forEach((button) => {
                    button.addEventListener('change', (event) => {
                        dlogger(`button change in Item View ${this.getName()}`);
                        this.hasChangedBoolean = true;
                        this.setUnsavedMessage();
                    });
                });
            });

        }

        logger(`Converting field composite array elements to Field objects`);
        if (this.factoryElements.compositeArrayFields) {
            this.factoryElements.compositeArrayFields.forEach((composite) => {
                this.setupFieldObject(composite.displayElement);
                composite.actionButtons.forEach((button) => {
                    button.addEventListener('change', (event) => {
                        dlogger(`button change in Item View ${this.getName()}`);
                        this.hasChangedBoolean = true;
                        this.setUnsavedMessage();
                    });
                });
            });

        }
        logger(`Converting field linked elements to Field objects`);
        if (this.factoryElements.linkedFields) {
            this.factoryElements.linkedFields.forEach((linked) => {
                this.setupFieldObject(linked.displayElement);
                linked.actionButtons.forEach((button) => {
                    button.addEventListener('change', (event) => {
                        dlogger(`button change in Item View ${this.getName()}`);
                        this.hasChangedBoolean = true;
                        this.setUnsavedMessage();
                    });
                });
            });

        }
        logger(`Converting field linked array elements to Field objects`);
        if (this.factoryElements.linkedArrayFields) {
            this.factoryElements.linkedArrayFields.forEach((linked) => {
                this.setupFieldObject(linked.displayElement);
                linked.actionButtons.forEach((button) => {
                    button.addEventListener('change', (event) => {
                        dlogger(`button change in Item View ${this.getName()}`);
                        this.hasChangedBoolean = true;
                        this.setUnsavedMessage();
                    });
                });
            });

        }


        logger(`field/data map is `);
        logger(this.map);
        logger('fields are');
        logger(this.fields);

    }

    protected _initialise(runtimeConfig: DetailViewRuntimeConfig): void {
        logger(`Initialising`);


        // ok, so given a Data Object definition we are going to create the Item View ui config
        this.uiDef = this.configHelper.generateConfig(this.dataObjDef, runtimeConfig);
        logger(this.uiDef);

        this.__buildUIElements();
    }

    protected _reset(): void {
        this.clearUnsavedMessage();
    }

    protected validateField(fieldDef: FieldDefinition) {
        const field: Field | undefined = this.getFieldFromDataFieldId(fieldDef.id);
        if (field) {
            field.validate();
            if (this.currentDataObj) {
                if (!this.permissionChecker.hasPermissionToEditField(this.currentDataObj, field)) {
                    field.setReadOnly();
                } else {
                    field.clearReadOnly();
                }
            }
        }
    }

    protected renderField(fieldDef: FieldDefinition, currentValue: string): string {
        let result: string = currentValue;
        const field: Field | undefined = this.getFieldFromDataFieldId(fieldDef.id);

        if (field) {
            result = field.render(result);
        }
        return result;
    }

    protected __preDisplayCurrentDataObject(dataObj: any): void {
    }

    protected _startCreate(): void {
        this.clearUnsavedMessage();

        // we have a new object, there might be some values to generate
        this.dataObjDef.fields.forEach((fieldDef) => {
            if (fieldDef.generator && fieldDef.generator.onCreation) {
                let fieldValue = fieldDef.generator.generator.generate(fieldDef, true);
                dlogger(`Setting default values for ${fieldDef.displayName} to ${fieldValue}`);
                this.currentDataObj[fieldDef.id] = fieldValue;
            }
        });
        this.__preDisplayCurrentDataObject(this.currentDataObj);
        this.dataObjDef.fields.forEach((fieldDef) => {
            let fieldValue = this.currentDataObj[fieldDef.id];
            if (fieldValue) {
                fieldValue = this.renderField(fieldDef, fieldValue);
            }

            this.setFieldValueFromDataObject(fieldDef, fieldValue);
            // run the validation to let the user know what is required
            this.validateField(fieldDef);
        });

        // delete button can go
        if (this.factoryElements && this.factoryElements.buttons?.deleteButton) browserUtil.addAttributes(this.factoryElements.buttons?.deleteButton, [{
            name: 'style',
            value: 'display:none'
        }]);
        if (this.factoryElements && this.factoryElements.buttons?.saveButton) browserUtil.removeAttributes(this.factoryElements.buttons?.saveButton, ['style']);


    }

    protected _startUpdate(): void {
        this.clearUnsavedMessage();

        // we have an existing object, there might be some values to generate
        logger(this.currentDataObj);
        this.__preDisplayCurrentDataObject(this.currentDataObj);
        this.dataObjDef.fields.forEach((fieldDef) => {
            if (fieldDef.generator && fieldDef.generator.onModify) {
                let fieldValue = fieldDef.generator.generator.generate(fieldDef, false);
                dlogger(`Setting default modified values for ${fieldDef.displayName} to ${fieldValue}`);
                this.currentDataObj[fieldDef.id] = fieldValue;
            }
            let fieldValue = this.currentDataObj[fieldDef.id];
            if (fieldValue) fieldValue = this.renderField(fieldDef, fieldValue);
            this.setFieldValueFromDataObject(fieldDef, fieldValue);
            this.validateField(fieldDef);
        });
        // delete button make visible again
        if (this.factoryElements && this.permissionChecker.hasPermissionToDeleteItem(this.currentDataObj) && this.factoryElements.buttons?.deleteButton) {
            browserUtil.removeAttributes(this.factoryElements.buttons?.deleteButton, ['style']);
        } else {
            // delete button can go
            if (this.factoryElements && this.factoryElements.buttons?.deleteButton) browserUtil.addAttributes(this.factoryElements.buttons?.deleteButton, [{
                name: 'style',
                value: 'display:none'
            }]);
        }
        if (this.factoryElements && this.factoryElements.buttons?.saveButton) browserUtil.removeAttributes(this.factoryElements.buttons?.saveButton, ['style']);
    }

    protected _displayOnly(): void {
        this.clearUnsavedMessage();

        // we have an existing object, there might be some values to generate
        logger(this.currentDataObj);
        this.__preDisplayCurrentDataObject(this.currentDataObj);
        this.dataObjDef.fields.forEach((fieldDef) => {
            let fieldValue = this.currentDataObj[fieldDef.id];
            if (fieldValue) fieldValue = this.renderField(fieldDef, fieldValue);
            if (fieldDef.derivedValue) {

            }
            this.setFieldValueFromDataObject(fieldDef, fieldValue);
        });
        // delete button can go
        if (this.factoryElements && this.factoryElements.buttons?.deleteButton) if (this.factoryElements) browserUtil.addAttributes(this.factoryElements.buttons?.deleteButton, [{
            name: 'style',
            value: 'display:none'
        }]);
        // save button can go
        if (this.factoryElements && this.factoryElements.buttons?.saveButton) if (this.factoryElements) browserUtil.addAttributes(this.factoryElements.buttons?.saveButton, [{
            name: 'style',
            value: 'display:none'
        }]);
    }

    protected _visible(): void {
        if (this.factoryElements) this.containerEl?.appendChild(this.factoryElements.top);
    }

    protected setFieldValueToDataObject(dataObj: any, field: Field, currentValue: string | null): void {
        // find the attribute id from the map
        const mapItem: AttributeFieldMapItem | undefined = this.map.find((mapItem) => mapItem.attributeId === field.getId());
        if (mapItem) {
            dlogger(`Mapped field ${mapItem.fieldId} to attribute ${mapItem.attributeId} with value ${currentValue}`);
            this.currentDataObj[mapItem.attributeId] = currentValue;
        } else {
            logger(`Mapped field ${field.getId()} to attribute NOT FOUND`);

        }
    }

    protected setFieldValueFromDataObject(fieldDef: FieldDefinition, currentValue: string | null): void {
        const field: Field | undefined = this.getFieldFromDataFieldId(fieldDef.id);
        // find the field id from the map
        if (field) {
            if (currentValue) {
                field.setValue(currentValue);
            } else {
                if (fieldDef.derivedValue) {
                    field.setValue('');
                } else {
                    field.clearValue();
                }
            }
        }
    }

    protected getFormattedFieldValue(fieldDef: FieldDefinition): any | null {
        let result: any | null = null;

        const mapItem: AttributeFieldMapItem | undefined = this.map.find((mapItem) => mapItem.attributeId === fieldDef.id);
        if (mapItem) {
            dlogger(`Mapped attribute ${mapItem.attributeId} to field ${mapItem.fieldId} with for getting formatted value`);
            // find the field with that id
            const field: Field | undefined = this.fields.find((field) => field.getId() === mapItem.attributeId);
            if (field) {
                result = field.getFormattedValue();
            }
        }
        return result;
    }

    protected _isSameObjectAsDisplayed(dataObj: any): boolean {
        // we can only be sure for objects with keys
        let isSameObject = false;
        dlogger(`is same object as current`);
        dlogger(dataObj);
        dlogger(this.currentDataObj);

        this.dataObjDef.fields.every((field) => {
            if (field.isKey) {
                const currentObjId = this.getFieldFromDataFieldId(field.id)?.getValue();
                const suppliedObjId = dataObj[field.id];
                dlogger(`is same object id ${suppliedObjId} as current ${currentObjId}`);
                if ((currentObjId && !suppliedObjId) || (currentObjId && !suppliedObjId)) {
                    isSameObject = false;
                }
                if ((currentObjId && suppliedObjId) && (currentObjId == suppliedObjId)) {
                    isSameObject = true;
                }
                return false;
            }
            return true;
        });
        return isSameObject;
    }

    protected enableButtons() {
        if (this.factoryElements && this.uiDef) {
            if (this.factoryElements.buttons?.deleteButton) {
                this.factoryElements.buttons?.deleteButton.removeAttribute('disabled');
            }
            //if (this.factoryElements.buttons?.cancelButton) this.factoryElements.buttons?.cancelButton.removeAttribute('disabled');
            if (this.factoryElements.buttons?.saveButton) {
                this.factoryElements.buttons?.saveButton.removeAttribute('disabled');

                // if (this.uiDef.submitButton) { // @ts-ignore
                //     this.factoryElements.submitButton.innerText = this.uiDef.submitButton.text;
                // }
            }

        }
    }

    protected disableButtons() {
        if (this.factoryElements) {
            if (this.factoryElements.buttons?.deleteButton) {
                this.factoryElements.buttons.deleteButton.setAttribute('disabled', 'true');
            }
            //if (this.factoryElements.buttons?.cancelButton) this.factoryElements.buttons.cancelButton.setAttribute('disabled', 'true');
            if (this.factoryElements.buttons?.saveButton) this.factoryElements.buttons.saveButton.setAttribute('disabled', 'true');
        }
    }

    protected _saveFinishedOrAborted(): void {
        dlogger(`save is finished or aborted`);
        this.enableButtons();
        this.clearUnsavedMessage();
    }

    protected _saveIsActive(): void {
        dlogger(`save is active`);
        this.disableButtons();
        if (this.factoryElements && this.uiDef) {
            if (this.uiDef.activeSave && this.uiDef.saveButton && this.factoryElements.buttons?.saveButton) {
                dlogger(`save is active ${this.uiDef.activeSave}`);
                // this.factoryElements.submitButton.innerHTML = this.uiDef.activeSave + this.uiDef.submitButton.text;
            }
        }
    }

    protected _hidden(): void {
        if (this.factoryElements) {
            if (this.containerEl) {
                if (this.isInitialised) {
                    if (this.containerEl.contains(this.factoryElements.top)) {
                        this.containerEl.removeChild(this.factoryElements.top);
                    }
                }
            }
        }
    }

    protected setupFieldObject(fieldEl: HTMLElement, subElements: HTMLInputElement[] = []) {
        // get the data-id field from the field element
        const dataId: string | null = fieldEl.getAttribute(DATA_ID_ATTRIBUTE);
        const fieldId: string | null = fieldEl.getAttribute('id');
        dlogger(`Converting field input element ${fieldId} with data-id of ${dataId}`);
        if (dataId && fieldId) {
            // find the corresponding field definition
            const index = this.dataObjDef.fields.findIndex((value) => value.id === dataId);
            const fieldDef: FieldDefinition | undefined = this.dataObjDef.fields.find((value) => value.id === dataId);
            if (fieldDef) {
                dlogger(`Converting field input element ${fieldId} with data-id of ${dataId} field definition is`);
                logger(fieldDef);

                // find the corresponding ui definition
                const fieldUIConfig: FieldUIConfig | null | undefined = this.findFieldUiConfig(fieldDef);
                dlogger(`Converting field input element ${fieldId} with data-id of ${dataId} field ui config is`);
                logger(fieldUIConfig);
                if (fieldUIConfig) {
                    if (this.uiDef) {
                        let field: Field;
                        switch (fieldUIConfig.elementType) {
                            case UIFieldType.textarea: {
                                field = new TextAreaField(this, fieldUIConfig, fieldDef, <HTMLTextAreaElement>fieldEl);
                                break;
                            }
                            case UIFieldType.radioGroup: {
                                field = new RadioButtonGroupField(this, fieldUIConfig, fieldDef, fieldEl, subElements);
                                break;
                            }
                            case UIFieldType.select: {
                                field = new SelectField(this, fieldUIConfig, fieldDef, <HTMLSelectElement>fieldEl);
                                break;
                            }
                            case UIFieldType.composite: {
                                field = new SelectField(this, fieldUIConfig, fieldDef, <HTMLSelectElement>fieldEl);
                                break;
                            }
                            case UIFieldType.list: {
                                field = new SelectField(this, fieldUIConfig, fieldDef, <HTMLSelectElement>fieldEl);
                                break;
                            }
                            case UIFieldType.linked: {
                                field = new SelectField(this, fieldUIConfig, fieldDef, <HTMLSelectElement>fieldEl);
                                break;
                            }
                            case UIFieldType.linkedList: {
                                field = new SelectField(this, fieldUIConfig, fieldDef, <HTMLSelectElement>fieldEl);
                                break;
                            }
                            default: {
                                if (fieldDef.type === FieldType.colour) {
                                    field = new ColourInputField(this, fieldUIConfig, fieldDef, <HTMLInputElement>fieldEl);
                                } else {
                                    field = new InputField(this, fieldUIConfig, fieldDef, <HTMLInputElement>fieldEl);
                                }
                                break;
                            }
                        }
                        this.fields.push(field);
                        field.addFieldListener(this);
                        this.map.push({attributeId: dataId, fieldId: fieldId});
                    }
                }
            } else {
                dlogger(`Converting field input element ${fieldId} with data-id of ${dataId} field definition is NOT FOUND`);

            }
        }
    }

    protected clearUnsavedMessage() {
        if (this.factoryElements && this.factoryElements.unsavedMessage) this.factoryElements.unsavedMessage.innerHTML = '';
    }

    protected setUnsavedMessage() {
        if (this.factoryElements && this.uiDef && this.uiDef.unsavedChanges && this.uiDef.unsavedChanges.innerHTML) {
            if (this.factoryElements.unsavedMessage) this.factoryElements.unsavedMessage.innerHTML = this.uiDef.unsavedChanges.innerHTML;
        } else if (this.factoryElements) {
            if (this.factoryElements.unsavedMessage) this.factoryElements.unsavedMessage.innerHTML = 'Pending changes to save';
        }
        this.listeners.forEach((listener) => listener.itemViewHasChanged(this.dataObjDef.displayName));
    }

    protected startAutoSave(): void {
        if (this.uiDef) {
            if (this.uiDef.autoSave) {
                if (!this.autoSaveStarted) {
                    asLogger('Starting auto save')
                    this.autoSaveStarted = true;
                    this.autoSaveInterval = setInterval(() => {
                        this.save();
                    }, 10000);
                }
            }
        }
    }

    protected stopAutoSave(): void {
        if (this.uiDef) {
            if (this.uiDef.autoSave) {
                if (this.autoSaveStarted) {
                    this.autoSaveStarted = false;
                    clearInterval(this.autoSaveInterval);
                    asLogger('Ending autosave')
                }
            }
        }
    }

}
