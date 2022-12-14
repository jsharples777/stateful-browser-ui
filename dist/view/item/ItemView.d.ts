import { DataObjectDefinition, Field, FieldListener, ValidatableView } from "browser-state-management";
import { ItemViewListener } from "./ItemViewListener";
import { DetailViewRuntimeConfig } from "../../ConfigurationTypes";
export interface ItemView extends ValidatableView {
    getId(): string;
    getDataObjectDefinition(): DataObjectDefinition;
    initialise(runtimeConfig: DetailViewRuntimeConfig): void;
    setIsVisible(isVisible: boolean): void;
    reset(): void;
    startCreateNew(objectToEdit: any | null): any;
    startUpdate(objectToEdit: any): void;
    displayOnly(objectToView: any): void;
    setReadOnly(): void;
    clearReadOnly(): void;
    isReadOnly(): boolean;
    addListener(listener: ItemViewListener): void;
    addFieldListener(listener: FieldListener): void;
    getFormattedDataObject(): any;
    validateDataObject(objectToCheck: any): boolean;
    hasChanged(): boolean;
    isDisplayingItem(dataObj: any): boolean;
    save(): void;
    cancel(): void;
    delete(): void;
    getElementIdForField(fieldId: string): string | undefined;
    getFields(): Field[];
    getFieldValue(fieldId: string): string | null;
    setFieldValue(fieldId: string, newValue: string, fireChanges?: boolean): void;
    setFieldValueAndApplyFormatting(fieldId: string, newValue: string, fireChanges?: boolean): void;
    setFieldReadOnly(fieldId: string): void;
    clearFieldReadOnly(fieldId: string): void;
    setFieldInvalid(fieldId: string, message: string): void;
    clearFieldInvalid(fieldId: string): void;
    setChanged(): void;
    scrollToField(fieldId: string): void;
    scrollToTop(): void;
    getFieldElement(fieldId: string): HTMLElement | null;
    getContainerElement(): HTMLElement | null;
    isAutoScroll(): boolean;
}
