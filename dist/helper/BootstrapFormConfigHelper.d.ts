import { ItemViewConfigHelper } from "../view/item/ItemViewConfigHelper";
import { ItemViewUIDefinition } from "../view/item/ItemViewUITypeDefs";
import { FieldUIConfig } from "../CommonTypes";
import { DataObjectDefinition } from "browser-state-management";
import { DetailViewRuntimeConfig } from "../ConfigurationTypes";
export declare class BootstrapFormConfigHelper implements ItemViewConfigHelper {
    static COLOUR_PICKER_CONTAINER: string;
    static SLIDE_BAR_CONTAINER: string;
    private static _instance;
    private constructor();
    static getInstance(): BootstrapFormConfigHelper;
    generateConfig(dataObjDef: DataObjectDefinition, runtimeConfig: DetailViewRuntimeConfig): ItemViewUIDefinition;
    getElementIdForDataFieldId(fieldId: string): string | undefined;
    protected isFieldInCurrentFieldGroups(formConfig: ItemViewUIDefinition, field: FieldUIConfig): boolean;
}
