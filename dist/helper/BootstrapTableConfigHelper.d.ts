import { TableUIConfig } from "../view/renderer/TableUITypeDefs";
import { DataObjectDefinition } from "browser-state-management";
import { TableViewRuntimeConfig } from "../ConfigurationTypes";
export declare class BootstrapTableConfigHelper {
    private static _instance;
    private constructor();
    static getInstance(): BootstrapTableConfigHelper;
    generateTableConfig(dataObjDef: DataObjectDefinition, runtimeConfig: TableViewRuntimeConfig): TableUIConfig;
}
