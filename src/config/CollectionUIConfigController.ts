import {ObjectDefinitionRegistry, RESTApiStateManager, StateManager} from "browser-state-management";
import {CollectionViewDOMConfig} from "../ConfigurationTypes";


export class CollectionUIConfigController {
    public static STATE_NAME_UI_CONFIG = 'ui-config';
    public static API_UI_CONFIG = '/api/ui-config';
    private static _instance: CollectionUIConfigController;
    private stateManager: StateManager | null;

    private constructor() {
        this.stateManager = null;
        ObjectDefinitionRegistry.getInstance().addDefinition(CollectionUIConfigController.STATE_NAME_UI_CONFIG, 'UI Config', true, false, false, "_id");
    }

    public static getInstance(): CollectionUIConfigController {
        if (!(CollectionUIConfigController._instance)) {
            CollectionUIConfigController._instance = new CollectionUIConfigController();
        }
        return CollectionUIConfigController._instance;
    }

    public addUIConfigToRESTStateManager(applicationSM: StateManager, restSM: RESTApiStateManager) {
        restSM.addConfig(
            {
                stateName: CollectionUIConfigController.STATE_NAME_UI_CONFIG,
                serverURL: '',
                api: CollectionUIConfigController.API_UI_CONFIG,
                isActive: true,
                find: false,
                findAll: true,
                create: true,
                update: true,
                destroy: true
            }
        );
        this.stateManager = applicationSM;

    }


    public getUIConfig(viewId: string): CollectionViewDOMConfig | null {
        let result: CollectionViewDOMConfig | null = null;

        if (this.stateManager) {
            result = this.stateManager.findItemInState(CollectionUIConfigController.STATE_NAME_UI_CONFIG, {_id: viewId})
        }

        return result;

    }
}
