import { ItemViewUIDefinition } from "./ItemViewUITypeDefs";
import { DataObjectDefinition } from "browser-state-management";
import { DetailViewRuntimeConfig } from "../../ConfigurationTypes";
export interface ItemViewConfigHelper {
    generateConfig(dataObjDef: DataObjectDefinition, runtimeConfig: DetailViewRuntimeConfig): ItemViewUIDefinition;
}
