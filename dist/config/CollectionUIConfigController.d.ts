import { RESTApiStateManager, StateManager } from "browser-state-management";
import { CollectionViewDOMConfig } from "../ConfigurationTypes";
export declare class CollectionUIConfigController {
    static STATE_NAME_UI_CONFIG: string;
    static API_UI_CONFIG: string;
    private static _instance;
    private stateManager;
    private constructor();
    static getInstance(): CollectionUIConfigController;
    addUIConfigToRESTStateManager(applicationSM: StateManager, restSM: RESTApiStateManager): void;
    getUIConfig(viewId: string): CollectionViewDOMConfig | null;
}
