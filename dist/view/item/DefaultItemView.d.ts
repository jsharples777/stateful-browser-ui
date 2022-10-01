import { ItemView } from "./ItemView";
import { AttributeFieldMapItem, FieldUIConfig } from "../../CommonTypes";
import { ItemViewListener } from "./ItemViewListener";
import { DataObjectDefinition, Field, FieldDefinition, FieldListener, ValidatableView, ViewMode } from "browser-state-management";
import { DetailViewRuntimeConfig, ItemEvent } from "../../ConfigurationTypes";
import { ItemViewUIDefinition } from "./ItemViewUITypeDefs";
import { AlertEvent, AlertListener } from "../../alert/AlertListener";
import { ItemViewConfigHelper } from "./ItemViewConfigHelper";
import { ViewFieldPermissionChecker } from "../ViewFieldPermissionChecker";
import { ItemFactoryResponse } from "../../factory/ItemViewElementFactory";
export declare class DefaultItemView implements ItemView, ItemViewListener, AlertListener, FieldListener {
    protected listeners: ItemViewListener[];
    protected fieldListeners: FieldListener[];
    protected currentDataObj: any;
    protected dataObjDef: DataObjectDefinition;
    protected containerEl: HTMLElement | null;
    protected uiDef: ItemViewUIDefinition | null;
    protected isVisible: boolean;
    protected fields: Field[];
    protected map: AttributeFieldMapItem[];
    protected isInitialised: boolean;
    protected hasChangedBoolean: boolean;
    protected id: string;
    protected configHelper: ItemViewConfigHelper;
    protected hasExternalControl: boolean;
    protected permissionChecker: ViewFieldPermissionChecker;
    protected viewMode: ViewMode;
    protected factoryElements: ItemFactoryResponse | null;
    protected autoSaveStarted: boolean;
    protected autoSaveInterval: any;
    protected constructor(containerId: string, dataObjDef: DataObjectDefinition, configHelper: ItemViewConfigHelper, permissionChecker: ViewFieldPermissionChecker, hasExternalControl?: boolean);
    getFields(): Field[];
    getViewMode(): ViewMode;
    getCurrentDataObj(): any;
    getDataObjectDefinition(): DataObjectDefinition;
    cancel(): void;
    delete(): void;
    save(): void;
    hasChanged(): boolean;
    getName(): string;
    valueChanged(view: ValidatableView, field: Field, fieldDef: FieldDefinition, newValue: string | null): void;
    failedValidation(view: ValidatableView, field: FieldDefinition, currentValue: string, message: string): void;
    initialise(runtimeConfig: DetailViewRuntimeConfig): void;
    addFieldListener(listener: FieldListener): void;
    addListener(listener: ItemViewListener): void;
    reset(): void;
    setIsVisible(isVisible: boolean): void;
    startCreateNew(objectToEdit: any | null): any;
    validateDataObject(objectToCheck: any): boolean;
    startUpdate(objectToEdit: any): void;
    displayOnly(objectToView: any): void;
    itemViewEvent(name: string, event: ItemEvent, values?: any): boolean;
    getId(): string;
    getFieldFromDataFieldId(dataFieldId: string): Field | undefined;
    alertCompleted(event: AlertEvent): void;
    clearReadOnly(): void;
    setReadOnly(): void;
    isDisplayingItem(dataObj: any): boolean;
    isReadOnly(): boolean;
    getElementIdForField(fieldId: string): string | undefined;
    getFormattedDataObject(): any;
    getFieldValue(fieldId: string): string | null;
    setFieldValue(fieldId: string, newValue: string, fireChanges?: boolean | undefined): void;
    setFieldValueAndApplyFormatting(fieldId: string, newValue: string, fireChanges?: boolean | undefined): void;
    clearFieldReadOnly(fieldId: string): void;
    setFieldReadOnly(fieldId: string): void;
    clearFieldInvalid(fieldId: string): void;
    setFieldInvalid(fieldId: string, message: string): void;
    itemViewHasChanged(name: string): void;
    setChanged(): void;
    fieldAction(name: string, event: ItemEvent): void;
    scrollToField(fieldId: string): void;
    scrollToTop(): void;
    isAutoScroll(): boolean;
    getFieldElement(fieldId: string): HTMLElement | null;
    getContainerElement(): HTMLElement | null;
    protected informListeners(event: ItemEvent, dataObj?: any): void;
    protected findFieldUiConfig(fieldDef: FieldDefinition): FieldUIConfig | null | undefined;
    protected checkForVisualValidationForDisplayOnly(): void;
    protected checkFormValidationOnDisplay(): void;
    protected __getFactoryElements(): ItemFactoryResponse;
    protected __buildUIElements(): void;
    protected _initialise(runtimeConfig: DetailViewRuntimeConfig): void;
    protected _reset(): void;
    protected validateField(fieldDef: FieldDefinition): void;
    protected renderField(fieldDef: FieldDefinition, currentValue: string): string;
    protected __preDisplayCurrentDataObject(dataObj: any): void;
    protected _startCreate(): void;
    protected _startUpdate(): void;
    protected _displayOnly(): void;
    protected _visible(): void;
    protected setFieldValueToDataObject(dataObj: any, field: Field, currentValue: string | null): void;
    protected setFieldValueFromDataObject(fieldDef: FieldDefinition, currentValue: string | null): void;
    protected getFormattedFieldValue(fieldDef: FieldDefinition): any | null;
    protected _isSameObjectAsDisplayed(dataObj: any): boolean;
    protected enableButtons(): void;
    protected disableButtons(): void;
    protected _saveFinishedOrAborted(): void;
    protected _saveIsActive(): void;
    protected _hidden(): void;
    protected setupFieldObject(fieldEl: HTMLElement, subElements?: HTMLInputElement[]): void;
    protected clearUnsavedMessage(): void;
    protected setUnsavedMessage(): void;
    protected startAutoSave(): void;
    protected stopAutoSave(): void;
}