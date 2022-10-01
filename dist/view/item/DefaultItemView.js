import debug from 'debug';
import { v4 } from "uuid";
import { ItemEventType, UIFieldType } from "../../CommonTypes";
import { AlertManager } from "../../alert/AlertManager";
import { BasicFieldOperations, browserUtil, ConditionResponse, DATA_ID_ATTRIBUTE, FieldType, ObjectDefinitionRegistry, ValidationManager, ViewMode } from "browser-state-management";
import { AlertType } from "../../alert/AlertListener";
import { FieldInputElementFactory } from "../../factory/FieldInputElementFactory";
import { ItemViewElementFactory } from "../../factory/ItemViewElementFactory";
import { RadioButtonGroupField } from "../../field/RadioButtonGroupField";
import { ColourInputField } from "../../field/ColourInputField";
import { SelectField } from "../../field/SelectField";
import { TextAreaField } from "../../field/TextAreaField";
import { InputField } from "../../field/InputField";
const logger = debug('default-item-view');
const dlogger = debug('default-item-view-detail');
const vlogger = debug('default-item-view-detail-validation');
const asLogger = debug('default-item-view-auto-save');
export class DefaultItemView {
    constructor(containerId, dataObjDef, configHelper, permissionChecker, hasExternalControl = false) {
        this.listeners = [];
        this.fieldListeners = [];
        this.uiDef = null;
        this.isVisible = false;
        this.fields = [];
        this.isInitialised = false;
        this.hasChangedBoolean = false;
        this.factoryElements = null;
        this.autoSaveStarted = false;
        this.containerEl = document.getElementById(containerId);
        if (!(this.containerEl))
            throw new Error(`container ${containerId} for Item View ${dataObjDef.id} does not exist`);
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
    getFields() {
        return this.fields;
    }
    getViewMode() {
        return this.viewMode;
    }
    getCurrentDataObj() {
        return this.currentDataObj;
    }
    getDataObjectDefinition() {
        return this.dataObjDef;
    }
    cancel() {
        if (this.uiDef) {
            let itemEvent = {
                target: this,
                identifier: this.getId(),
                eventType: ItemEventType.CANCELLING
            };
            this.itemViewEvent(this.dataObjDef.displayName, itemEvent);
        }
    }
    delete() {
        if (this.uiDef && !this.isReadOnly()) {
            let itemEvent = {
                target: this,
                identifier: this.getId(),
                eventType: ItemEventType.DELETING
            };
            this.itemViewEvent(this.dataObjDef.displayName, itemEvent);
        }
    }
    save() {
        if (this.uiDef && !this.isReadOnly()) {
            let itemEvent = {
                target: this,
                identifier: this.getId(),
                eventType: ItemEventType.SAVING
            };
            this.itemViewEvent(this.dataObjDef.displayName, itemEvent);
        }
    }
    hasChanged() {
        return this.hasChangedBoolean;
    }
    getName() {
        return this.dataObjDef.displayName;
    }
    valueChanged(view, field, fieldDef, newValue) {
        this.hasChangedBoolean = true;
        this.setUnsavedMessage();
        logger(`Item View has changed`);
    }
    failedValidation(view, field, currentValue, message) {
        this.hasChangedBoolean = true;
        logger(`Item View has changed`);
    }
    initialise(runtimeConfig) {
        if (this.isInitialised)
            return;
        this.isInitialised = true;
        this._initialise(runtimeConfig);
    }
    addFieldListener(listener) {
        this.fieldListeners.push(listener);
    }
    addListener(listener) {
        this.listeners.unshift(listener);
    }
    reset() {
        logger(`Resetting Item View`);
        this.clearUnsavedMessage();
        this.viewMode = ViewMode.unset;
        this.hasChangedBoolean = false;
        // inform the listeners
        if (this.uiDef) {
            let itemEvent = {
                identifier: this.getId(),
                target: this,
                eventType: ItemEventType.RESETTING
            };
            this.informListeners(itemEvent, this.currentDataObj);
        }
        this.currentDataObj = {};
        this._reset();
        // reset all the fields
        this.fields.forEach((field) => {
            field.reset();
        });
        this.hasChangedBoolean = false;
        if (this.containerEl && this.uiDef && (this.uiDef.autoscrollOnNewContent === true))
            browserUtil.scrollSmoothTo(this.containerEl);
    }
    setIsVisible(isVisible) {
        logger(`Changing visibility to ${isVisible}`);
        this.isVisible = isVisible;
        if (this.uiDef) {
            let eventType = ItemEventType.HIDDEN;
            if (this.isVisible) {
                this._visible();
                eventType = ItemEventType.SHOWN;
            }
            else {
                this._hidden();
            }
            // inform the listeners
            let itemEvent = {
                identifier: this.getId(),
                target: this,
                eventType: eventType
            };
            this.informListeners(itemEvent, this.currentDataObj);
        }
        if (isVisible && !(this.viewMode === ViewMode.displayOnly))
            this.checkFormValidationOnDisplay();
        if (isVisible && (this.viewMode === ViewMode.displayOnly))
            this.checkForVisualValidationForDisplayOnly();
    }
    startCreateNew(objectToEdit) {
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
            let itemEvent = {
                identifier: this.getId(),
                target: this,
                eventType: eventType,
                currentDataObj: this.currentDataObj
            };
            this.informListeners(itemEvent, this.currentDataObj);
            this._startCreate();
        }
        this.clearReadOnly();
        if (this.containerEl && this.uiDef && (this.uiDef.autoscrollOnNewContent === true))
            browserUtil.scrollSmoothTo(this.containerEl);
        return this.currentDataObj;
    }
    validateDataObject(objectToCheck) {
        logger(`Checking object for validation`);
        logger(objectToCheck);
        const previousDataObj = this.currentDataObj;
        this.currentDataObj = Object.assign({}, objectToCheck); // take a copy
        this.dataObjDef.fields.forEach((fieldDef) => {
            let fieldValue = this.currentDataObj[fieldDef.id];
            this.setFieldValueFromDataObject(fieldDef, fieldValue);
            this.validateField(fieldDef);
        });
        let result = false;
        if (this.uiDef) {
            let allFieldsValid = true;
            // user attempting to save the Item View, lets check the field validation
            this.fields.forEach((field) => {
                const currentValue = field.getValue();
                if (!field.isValid()) {
                    vlogger(`Field ${field.getId()} is invalid`);
                    allFieldsValid = false;
                }
                else {
                    // does the field fulfil any rules from the Validation manager
                    const response = ValidationManager.getInstance().applyRulesToTargetField(this, ViewMode.update, field.getFieldDefinition(), ConditionResponse.invalid);
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
    startUpdate(objectToEdit) {
        this.clearUnsavedMessage();
        logger(`Starting modify existing on `);
        this.viewMode = ViewMode.update;
        this.hasChangedBoolean = false;
        logger(objectToEdit);
        this.currentDataObj = Object.assign({}, objectToEdit); // take a copy
        if (this.uiDef) {
            let eventType = ItemEventType.MODIFYING;
            // inform the listeners
            let itemEvent = {
                identifier: this.getId(),
                target: this,
                eventType: eventType,
                currentDataObj: this.currentDataObj
            };
            this.informListeners(itemEvent, this.currentDataObj);
            this._startUpdate();
        }
        this.clearReadOnly();
        if (this.containerEl && this.uiDef && (this.uiDef.autoscrollOnNewContent === true))
            browserUtil.scrollSmoothTo(this.containerEl);
    }
    displayOnly(objectToView) {
        this.clearUnsavedMessage();
        logger(`Starting display only `);
        logger(objectToView);
        this.viewMode = ViewMode.displayOnly;
        this.hasChangedBoolean = false;
        this.currentDataObj = Object.assign({}, objectToView); // take a copy
        if (this.uiDef) {
            let itemEvent = {
                target: this,
                identifier: this.getId(),
                eventType: ItemEventType.DISPLAYING_READ_ONLY,
                currentDataObj: this.currentDataObj
            };
            this.itemViewEvent(this.dataObjDef.displayName, itemEvent);
        }
        if (this.uiDef) {
            this._displayOnly();
        }
        this.setReadOnly();
        if (this.containerEl && this.uiDef && (this.uiDef.autoscrollOnNewContent === true))
            browserUtil.scrollSmoothTo(this.containerEl);
    }
    itemViewEvent(name, event, values) {
        // catch form events for user leaving the Item View
        let shouldCancelChange = false;
        switch (event.eventType) {
            case (ItemEventType.CANCELLING): {
                logger(`Item View is cancelling`);
                if (this.hasChangedBoolean && !(this.viewMode === ViewMode.displayOnly)) {
                    if (this.uiDef) {
                        AlertManager.getInstance().startAlert(this, this.uiDef.displayName, `Lose any unsaved changes?`, ItemEventType.CANCELLING);
                    }
                }
                else {
                    if (this.uiDef) {
                        let itemEvent = {
                            identifier: this.getId(),
                            target: this,
                            eventType: ItemEventType.CANCELLED
                        };
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
                    let allFieldsValid = true;
                    // user attempting to save the Item View, lets check the field validation
                    this.fields.forEach((field) => {
                        const currentValue = field.getValue();
                        if (!field.isValid()) {
                            vlogger(`Field ${field.getId()} is invalid`);
                            field.setInvalid(`${field.getName()} has an invalid format or is required.`);
                            allFieldsValid = false;
                        }
                        else {
                            // does the field fulfil any rules from the Validation manager
                            const response = ValidationManager.getInstance().applyRulesToTargetField(this, this.viewMode, field.getFieldDefinition(), ConditionResponse.invalid);
                            if (response.ruleFailed) {
                                if (response.message)
                                    field.setInvalid(response.message);
                                vlogger(`Field ${field.getId()} is invalid from validation manager with message ${response.message}`);
                                allFieldsValid = false;
                            }
                            else {
                                this.setFieldValueToDataObject(this.currentDataObj, field, currentValue);
                            }
                        }
                    });
                    // is every field valid?
                    if (!allFieldsValid) {
                        logger(`Item View is saving, checking validation - FAILED`);
                        let itemEvent = {
                            identifier: this.getId(),
                            target: this,
                            eventType: ItemEventType.SAVE_ABORTED
                        };
                        this.informListeners(itemEvent, this.currentDataObj);
                        shouldCancelChange = true;
                    }
                    else {
                        logger(`formatted data object is`);
                        const formattedDataObject = this.getFormattedDataObject();
                        let itemEvent = {
                            identifier: this.getId(),
                            target: this,
                            eventType: ItemEventType.SAVED
                        };
                        this.informListeners(itemEvent, formattedDataObject);
                    }
                }
                break;
            }
        }
        return shouldCancelChange;
    }
    getId() {
        return this.id;
    }
    getFieldFromDataFieldId(dataFieldId) {
        let result = undefined;
        dlogger(`Finding field for attribute ${dataFieldId} `);
        const mapItem = this.map.find((mapItem) => mapItem.attributeId === dataFieldId);
        if (mapItem) {
            dlogger(`Mapped attribute ${mapItem.attributeId} to field ${mapItem.fieldId}`);
            // find the field with that id
            result = this.fields.find((field) => field.getId() === mapItem.attributeId);
        }
        return result;
    }
    alertCompleted(event) {
        logger(`Handling alert completed`);
        logger(event);
        if (event.context && this.uiDef) {
            switch (event.context) {
                case (ItemEventType.CANCELLING): {
                    if (event.outcome === AlertType.confirmed) {
                        let itemEvent = {
                            identifier: this.getId(),
                            target: this,
                            eventType: ItemEventType.CANCELLED
                        };
                        this.informListeners(itemEvent, this.currentDataObj);
                    }
                    else {
                        let itemEvent = {
                            identifier: this.getId(),
                            target: this,
                            eventType: ItemEventType.CANCELLING_ABORTED
                        };
                        this.informListeners(itemEvent, this.currentDataObj);
                    }
                    break;
                }
                case (ItemEventType.DELETING): {
                    if (event.outcome === AlertType.confirmed) {
                        let itemEvent = {
                            identifier: this.getId(),
                            target: this,
                            eventType: ItemEventType.DELETED
                        };
                        this.informListeners(itemEvent, this.currentDataObj);
                    }
                    else {
                        let itemEvent = {
                            identifier: this.getId(),
                            target: this,
                            eventType: ItemEventType.DELETE_ABORTED
                        };
                        this.informListeners(itemEvent, this.currentDataObj);
                    }
                    break;
                }
            }
        }
    }
    clearReadOnly() {
        this.fields.forEach((field) => {
            if (this.currentDataObj) {
                if (this.permissionChecker.hasPermissionToEditField(this.currentDataObj, field)) {
                    field.clearReadOnly();
                }
            }
            else {
                field.clearReadOnly();
            }
        });
        this.enableButtons();
    }
    setReadOnly() {
        this.fields.forEach((field) => {
            field.setReadOnly();
        });
        this.disableButtons();
    }
    isDisplayingItem(dataObj) {
        if (this.currentDataObj) {
            return this._isSameObjectAsDisplayed(dataObj);
        }
        return false;
    }
    isReadOnly() {
        return (this.viewMode === ViewMode.displayOnly);
    }
    getElementIdForField(fieldId) {
        return FieldInputElementFactory.getElementIdForFieldId(this, fieldId);
    }
    getFormattedDataObject() {
        logger(`Getting current formatted data`);
        let formattedResult = {};
        this.dataObjDef.fields.forEach((fieldDef) => {
            let fieldValue = this.currentDataObj[fieldDef.id];
            if (fieldDef.derivedValue) {
                if (!fieldDef.derivedValue.onlyForDisplay()) {
                    formattedResult[fieldDef.id] = this.getFormattedFieldValue(fieldDef);
                }
            }
            else {
                formattedResult[fieldDef.id] = this.getFormattedFieldValue(fieldDef);
            }
        });
        logger(formattedResult);
        return formattedResult;
    }
    getFieldValue(fieldId) {
        let result = null;
        const field = this.getFieldFromDataFieldId(fieldId);
        if (field) {
            result = field.getValue();
        }
        return result;
    }
    setFieldValue(fieldId, newValue, fireChanges = true) {
        const field = this.getFieldFromDataFieldId(fieldId);
        if (field) {
            if (fireChanges)
                this.setChanged();
            field.setValue(newValue);
        }
    }
    setFieldValueAndApplyFormatting(fieldId, newValue, fireChanges = true) {
        const field = this.getFieldFromDataFieldId(fieldId);
        if (field) {
            if (fireChanges)
                this.setChanged();
            const fieldDef = ObjectDefinitionRegistry.getInstance().getFieldInDefinition(this.dataObjDef.id, fieldId);
            if (fieldDef) {
                const renderedValue = BasicFieldOperations.getInstance().renderValue(field, fieldDef, '' + newValue);
                if (renderedValue)
                    field.setValue(renderedValue);
            }
            else {
                field.setValue(newValue);
            }
        }
    }
    clearFieldReadOnly(fieldId) {
        const field = this.getFieldFromDataFieldId(fieldId);
        if (field) {
            field.clearReadOnly();
        }
    }
    setFieldReadOnly(fieldId) {
        const field = this.getFieldFromDataFieldId(fieldId);
        if (field) {
            field.setReadOnly();
        }
    }
    clearFieldInvalid(fieldId) {
        const field = this.getFieldFromDataFieldId(fieldId);
        if (field) {
            field.setValid();
        }
    }
    setFieldInvalid(fieldId, message) {
        const field = this.getFieldFromDataFieldId(fieldId);
        if (field) {
            field.setInvalid(message);
        }
    }
    itemViewHasChanged(name) {
        asLogger('View changed');
        this.startAutoSave();
    }
    setChanged() {
        this.hasChangedBoolean = true;
        this.setUnsavedMessage();
    }
    fieldAction(name, event) {
    }
    scrollToField(fieldId) {
        const el = this.getFieldElement(fieldId);
        if (el) {
            if (this.containerEl)
                browserUtil.scrollToElementInContainer(this.containerEl, el);
        }
    }
    scrollToTop() {
        if (this.containerEl) {
            $(this.containerEl).animate({ scrollTop: 0 }, "fast");
        }
    }
    /* methods to be implemented in the subclass */
    isAutoScroll() {
        let result = false;
        if (this.uiDef) {
            dlogger(`${this.uiDef.displayName} - Autoscroll is set to ${this.uiDef.autoscrollOnNewContent}`);
            if (this.uiDef.autoscrollOnNewContent === true)
                result = true;
        }
        return result;
    }
    getFieldElement(fieldId) {
        let result = null;
        const elId = this.getElementIdForField(fieldId);
        if (elId) {
            result = document.getElementById(elId);
        }
        return result;
    }
    getContainerElement() {
        return this.containerEl;
    }
    informListeners(event, dataObj) {
        this.listeners.forEach((listener) => listener.itemViewEvent(this.dataObjDef.displayName, event, dataObj));
    }
    findFieldUiConfig(fieldDef) {
        dlogger(`Finding field UI Config for field ${fieldDef.displayName}`);
        let result = null;
        if (this.uiDef) {
            let index = 0;
            while (index < this.uiDef.fieldGroups.length) {
                const fieldGroup = this.uiDef.fieldGroups[index];
                result = fieldGroup.fields.find((uiConfig) => uiConfig.field.id === fieldDef.id);
                if (result) {
                    dlogger(`Finding field UI Config for field ${fieldDef.displayName} - Found`);
                    break;
                }
                index++;
            }
        }
        return result;
    }
    checkForVisualValidationForDisplayOnly() {
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
    checkFormValidationOnDisplay() {
        logger(`Checking display validation`);
        this.fields.forEach((field) => {
            field.show();
            const currentValue = field.getValue();
            if (!field.isValid()) {
                logger(`Field ${field.getId()} is invalid`);
                field.setInvalid(`${field.getName()} has an invalid format or is required.`);
            }
            else {
                // does the field fulfil any rules from the Validation manager
                let response = ValidationManager.getInstance().applyRulesToTargetField(this, this.viewMode, field.getFieldDefinition(), ConditionResponse.invalid);
                if (response.ruleFailed) {
                    if (response.message)
                        field.setInvalid(response.message);
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
    __getFactoryElements() {
        // @ts-ignore
        return ItemViewElementFactory.getInstance().createFormElements(this, this.listeners, this.uiDef, this.fieldListeners);
    }
    __buildUIElements() {
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
    _initialise(runtimeConfig) {
        logger(`Initialising`);
        // ok, so given a Data Object definition we are going to create the Item View ui config
        this.uiDef = this.configHelper.generateConfig(this.dataObjDef, runtimeConfig);
        logger(this.uiDef);
        this.__buildUIElements();
    }
    _reset() {
        this.clearUnsavedMessage();
    }
    validateField(fieldDef) {
        const field = this.getFieldFromDataFieldId(fieldDef.id);
        if (field) {
            field.validate();
            if (this.currentDataObj) {
                if (!this.permissionChecker.hasPermissionToEditField(this.currentDataObj, field)) {
                    field.setReadOnly();
                }
                else {
                    field.clearReadOnly();
                }
            }
        }
    }
    renderField(fieldDef, currentValue) {
        let result = currentValue;
        const field = this.getFieldFromDataFieldId(fieldDef.id);
        if (field) {
            result = field.render(result);
        }
        return result;
    }
    __preDisplayCurrentDataObject(dataObj) {
    }
    _startCreate() {
        var _a, _b, _c, _d;
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
        if (this.factoryElements && ((_a = this.factoryElements.buttons) === null || _a === void 0 ? void 0 : _a.deleteButton))
            browserUtil.addAttributes((_b = this.factoryElements.buttons) === null || _b === void 0 ? void 0 : _b.deleteButton, [{
                    name: 'style',
                    value: 'display:none'
                }]);
        if (this.factoryElements && ((_c = this.factoryElements.buttons) === null || _c === void 0 ? void 0 : _c.saveButton))
            browserUtil.removeAttributes((_d = this.factoryElements.buttons) === null || _d === void 0 ? void 0 : _d.saveButton, ['style']);
    }
    _startUpdate() {
        var _a, _b, _c, _d, _e, _f;
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
            if (fieldValue)
                fieldValue = this.renderField(fieldDef, fieldValue);
            this.setFieldValueFromDataObject(fieldDef, fieldValue);
            this.validateField(fieldDef);
        });
        // delete button make visible again
        if (this.factoryElements && this.permissionChecker.hasPermissionToDeleteItem(this.currentDataObj) && ((_a = this.factoryElements.buttons) === null || _a === void 0 ? void 0 : _a.deleteButton)) {
            browserUtil.removeAttributes((_b = this.factoryElements.buttons) === null || _b === void 0 ? void 0 : _b.deleteButton, ['style']);
        }
        else {
            // delete button can go
            if (this.factoryElements && ((_c = this.factoryElements.buttons) === null || _c === void 0 ? void 0 : _c.deleteButton))
                browserUtil.addAttributes((_d = this.factoryElements.buttons) === null || _d === void 0 ? void 0 : _d.deleteButton, [{
                        name: 'style',
                        value: 'display:none'
                    }]);
        }
        if (this.factoryElements && ((_e = this.factoryElements.buttons) === null || _e === void 0 ? void 0 : _e.saveButton))
            browserUtil.removeAttributes((_f = this.factoryElements.buttons) === null || _f === void 0 ? void 0 : _f.saveButton, ['style']);
    }
    _displayOnly() {
        var _a, _b, _c, _d;
        this.clearUnsavedMessage();
        // we have an existing object, there might be some values to generate
        logger(this.currentDataObj);
        this.__preDisplayCurrentDataObject(this.currentDataObj);
        this.dataObjDef.fields.forEach((fieldDef) => {
            let fieldValue = this.currentDataObj[fieldDef.id];
            if (fieldValue)
                fieldValue = this.renderField(fieldDef, fieldValue);
            if (fieldDef.derivedValue) {
            }
            this.setFieldValueFromDataObject(fieldDef, fieldValue);
        });
        // delete button can go
        if (this.factoryElements && ((_a = this.factoryElements.buttons) === null || _a === void 0 ? void 0 : _a.deleteButton))
            if (this.factoryElements)
                browserUtil.addAttributes((_b = this.factoryElements.buttons) === null || _b === void 0 ? void 0 : _b.deleteButton, [{
                        name: 'style',
                        value: 'display:none'
                    }]);
        // save button can go
        if (this.factoryElements && ((_c = this.factoryElements.buttons) === null || _c === void 0 ? void 0 : _c.saveButton))
            if (this.factoryElements)
                browserUtil.addAttributes((_d = this.factoryElements.buttons) === null || _d === void 0 ? void 0 : _d.saveButton, [{
                        name: 'style',
                        value: 'display:none'
                    }]);
    }
    _visible() {
        var _a;
        if (this.factoryElements)
            (_a = this.containerEl) === null || _a === void 0 ? void 0 : _a.appendChild(this.factoryElements.top);
    }
    setFieldValueToDataObject(dataObj, field, currentValue) {
        // find the attribute id from the map
        const mapItem = this.map.find((mapItem) => mapItem.attributeId === field.getId());
        if (mapItem) {
            dlogger(`Mapped field ${mapItem.fieldId} to attribute ${mapItem.attributeId} with value ${currentValue}`);
            this.currentDataObj[mapItem.attributeId] = currentValue;
        }
        else {
            logger(`Mapped field ${field.getId()} to attribute NOT FOUND`);
        }
    }
    setFieldValueFromDataObject(fieldDef, currentValue) {
        const field = this.getFieldFromDataFieldId(fieldDef.id);
        // find the field id from the map
        if (field) {
            if (currentValue) {
                field.setValue(currentValue);
            }
            else {
                if (fieldDef.derivedValue) {
                    field.setValue('');
                }
                else {
                    field.clearValue();
                }
            }
        }
    }
    getFormattedFieldValue(fieldDef) {
        let result = null;
        const mapItem = this.map.find((mapItem) => mapItem.attributeId === fieldDef.id);
        if (mapItem) {
            dlogger(`Mapped attribute ${mapItem.attributeId} to field ${mapItem.fieldId} with for getting formatted value`);
            // find the field with that id
            const field = this.fields.find((field) => field.getId() === mapItem.attributeId);
            if (field) {
                result = field.getFormattedValue();
            }
        }
        return result;
    }
    _isSameObjectAsDisplayed(dataObj) {
        // we can only be sure for objects with keys
        let isSameObject = false;
        dlogger(`is same object as current`);
        dlogger(dataObj);
        dlogger(this.currentDataObj);
        this.dataObjDef.fields.every((field) => {
            var _a;
            if (field.isKey) {
                const currentObjId = (_a = this.getFieldFromDataFieldId(field.id)) === null || _a === void 0 ? void 0 : _a.getValue();
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
    enableButtons() {
        var _a, _b, _c, _d;
        if (this.factoryElements && this.uiDef) {
            if ((_a = this.factoryElements.buttons) === null || _a === void 0 ? void 0 : _a.deleteButton) {
                (_b = this.factoryElements.buttons) === null || _b === void 0 ? void 0 : _b.deleteButton.removeAttribute('disabled');
            }
            //if (this.factoryElements.buttons?.cancelButton) this.factoryElements.buttons?.cancelButton.removeAttribute('disabled');
            if ((_c = this.factoryElements.buttons) === null || _c === void 0 ? void 0 : _c.saveButton) {
                (_d = this.factoryElements.buttons) === null || _d === void 0 ? void 0 : _d.saveButton.removeAttribute('disabled');
                // if (this.uiDef.submitButton) { // @ts-ignore
                //     this.factoryElements.submitButton.innerText = this.uiDef.submitButton.text;
                // }
            }
        }
    }
    disableButtons() {
        var _a, _b;
        if (this.factoryElements) {
            if ((_a = this.factoryElements.buttons) === null || _a === void 0 ? void 0 : _a.deleteButton) {
                this.factoryElements.buttons.deleteButton.setAttribute('disabled', 'true');
            }
            //if (this.factoryElements.buttons?.cancelButton) this.factoryElements.buttons.cancelButton.setAttribute('disabled', 'true');
            if ((_b = this.factoryElements.buttons) === null || _b === void 0 ? void 0 : _b.saveButton)
                this.factoryElements.buttons.saveButton.setAttribute('disabled', 'true');
        }
    }
    _saveFinishedOrAborted() {
        dlogger(`save is finished or aborted`);
        this.enableButtons();
        this.clearUnsavedMessage();
    }
    _saveIsActive() {
        var _a;
        dlogger(`save is active`);
        this.disableButtons();
        if (this.factoryElements && this.uiDef) {
            if (this.uiDef.activeSave && this.uiDef.saveButton && ((_a = this.factoryElements.buttons) === null || _a === void 0 ? void 0 : _a.saveButton)) {
                dlogger(`save is active ${this.uiDef.activeSave}`);
                // this.factoryElements.submitButton.innerHTML = this.uiDef.activeSave + this.uiDef.submitButton.text;
            }
        }
    }
    _hidden() {
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
    setupFieldObject(fieldEl, subElements = []) {
        // get the data-id field from the field element
        const dataId = fieldEl.getAttribute(DATA_ID_ATTRIBUTE);
        const fieldId = fieldEl.getAttribute('id');
        dlogger(`Converting field input element ${fieldId} with data-id of ${dataId}`);
        if (dataId && fieldId) {
            // find the corresponding field definition
            const index = this.dataObjDef.fields.findIndex((value) => value.id === dataId);
            const fieldDef = this.dataObjDef.fields.find((value) => value.id === dataId);
            if (fieldDef) {
                dlogger(`Converting field input element ${fieldId} with data-id of ${dataId} field definition is`);
                logger(fieldDef);
                // find the corresponding ui definition
                const fieldUIConfig = this.findFieldUiConfig(fieldDef);
                dlogger(`Converting field input element ${fieldId} with data-id of ${dataId} field ui config is`);
                logger(fieldUIConfig);
                if (fieldUIConfig) {
                    if (this.uiDef) {
                        let field;
                        switch (fieldUIConfig.elementType) {
                            case UIFieldType.textarea: {
                                field = new TextAreaField(this, fieldUIConfig, fieldDef, fieldEl);
                                break;
                            }
                            case UIFieldType.radioGroup: {
                                field = new RadioButtonGroupField(this, fieldUIConfig, fieldDef, fieldEl, subElements);
                                break;
                            }
                            case UIFieldType.select: {
                                field = new SelectField(this, fieldUIConfig, fieldDef, fieldEl);
                                break;
                            }
                            case UIFieldType.composite: {
                                field = new SelectField(this, fieldUIConfig, fieldDef, fieldEl);
                                break;
                            }
                            case UIFieldType.list: {
                                field = new SelectField(this, fieldUIConfig, fieldDef, fieldEl);
                                break;
                            }
                            case UIFieldType.linked: {
                                field = new SelectField(this, fieldUIConfig, fieldDef, fieldEl);
                                break;
                            }
                            case UIFieldType.linkedList: {
                                field = new SelectField(this, fieldUIConfig, fieldDef, fieldEl);
                                break;
                            }
                            default: {
                                if (fieldDef.type === FieldType.colour) {
                                    field = new ColourInputField(this, fieldUIConfig, fieldDef, fieldEl);
                                }
                                else {
                                    field = new InputField(this, fieldUIConfig, fieldDef, fieldEl);
                                }
                                break;
                            }
                        }
                        this.fields.push(field);
                        field.addFieldListener(this);
                        this.map.push({ attributeId: dataId, fieldId: fieldId });
                    }
                }
            }
            else {
                dlogger(`Converting field input element ${fieldId} with data-id of ${dataId} field definition is NOT FOUND`);
            }
        }
    }
    clearUnsavedMessage() {
        if (this.factoryElements && this.factoryElements.unsavedMessage)
            this.factoryElements.unsavedMessage.innerHTML = '';
    }
    setUnsavedMessage() {
        if (this.factoryElements && this.uiDef && this.uiDef.unsavedChanges && this.uiDef.unsavedChanges.innerHTML) {
            if (this.factoryElements.unsavedMessage)
                this.factoryElements.unsavedMessage.innerHTML = this.uiDef.unsavedChanges.innerHTML;
        }
        else if (this.factoryElements) {
            if (this.factoryElements.unsavedMessage)
                this.factoryElements.unsavedMessage.innerHTML = 'Pending changes to save';
        }
        this.listeners.forEach((listener) => listener.itemViewHasChanged(this.dataObjDef.displayName));
    }
    startAutoSave() {
        if (this.uiDef) {
            if (this.uiDef.autoSave) {
                if (!this.autoSaveStarted) {
                    asLogger('Starting auto save');
                    this.autoSaveStarted = true;
                    this.autoSaveInterval = setInterval(() => {
                        this.save();
                    }, 10000);
                }
            }
        }
    }
    stopAutoSave() {
        if (this.uiDef) {
            if (this.uiDef.autoSave) {
                if (this.autoSaveStarted) {
                    this.autoSaveStarted = false;
                    clearInterval(this.autoSaveInterval);
                    asLogger('Ending autosave');
                }
            }
        }
    }
}
//# sourceMappingURL=DefaultItemView.js.map