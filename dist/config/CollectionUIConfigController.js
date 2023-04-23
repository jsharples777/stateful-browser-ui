import { ObjectDefinitionRegistry } from "browser-state-management";
export class CollectionUIConfigController {
    constructor() {
        this.stateManager = null;
        ObjectDefinitionRegistry.getInstance().addDefinition(CollectionUIConfigController.STATE_NAME_UI_CONFIG, 'UI Config', true, false, false, "_id");
    }
    static getInstance() {
        if (!(CollectionUIConfigController._instance)) {
            CollectionUIConfigController._instance = new CollectionUIConfigController();
        }
        return CollectionUIConfigController._instance;
    }
    addUIConfigToRESTStateManager(applicationSM, restSM) {
        restSM.addConfig({
            stateName: CollectionUIConfigController.STATE_NAME_UI_CONFIG,
            serverURL: '',
            api: CollectionUIConfigController.API_UI_CONFIG,
            isActive: true,
            find: false,
            findAll: true,
            create: true,
            update: true,
            destroy: true,
            lastModified: false,
            getFindAllEachTimeIsCalled: false
        });
        this.stateManager = applicationSM;
    }
    getUIConfig(viewId) {
        let result = null;
        if (this.stateManager) {
            result = this.stateManager.findItemInState(CollectionUIConfigController.STATE_NAME_UI_CONFIG, { _id: viewId });
        }
        return result;
    }
}
CollectionUIConfigController.STATE_NAME_UI_CONFIG = 'ui-config';
CollectionUIConfigController.API_UI_CONFIG = '/api/ui-config';
//# sourceMappingURL=CollectionUIConfigController.js.map